import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, isValidObjectId } from 'mongoose'
import type { Readable } from 'node:stream'
import {
  BlobStorageService,
  safeFileName,
} from '../common/blob-storage.service'
import {
  Instructor,
  InstructorDocument,
} from '../instructors/schemas/instructor.schema'
import {
  DocumentFile,
  DocumentFolder,
  DocumentFolderDocument,
} from './schemas/document-folder.schema'

// The subset of multer's in-memory file the service relies on.
export type IncomingFile = {
  originalname: string
  mimetype: string
  size: number
  buffer: Buffer
}

export const MAX_FILE_BYTES = 10 * 1024 * 1024

// Allowed upload types, mapped to the badge shown in the documents browser.
export const EXT_BY_MIME_TYPE: Record<string, string> = {
  'application/pdf': 'PDF',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
  'image/png': 'PNG',
  'image/jpeg': 'JPG',
  'image/webp': 'WEBP',
}

// Neither the bytes nor the storage key leave the API in a listing.
const LISTING_PROJECTION = '-files.data -files.blobPathname'

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name)

  constructor(
    @InjectModel(DocumentFolder.name)
    private readonly documentFolderModel: Model<DocumentFolderDocument>,
    @InjectModel(Instructor.name)
    private readonly instructorModel: Model<InstructorDocument>,
    private readonly blobStorage: BlobStorageService,
  ) {}

  findAll() {
    return this.documentFolderModel.find().select(LISTING_PROJECTION).exec()
  }

  async findFile(folderId: string, fileName: string): Promise<DocumentFile> {
    // A malformed id would make findById throw a CastError (→ 500); treat
    // anything that isn't a valid ObjectId as simply not found.
    const folder = isValidObjectId(folderId)
      ? await this.documentFolderModel.findById(folderId).exec()
      : null
    const file = folder?.files.find((candidate) => candidate.name === fileName)

    if (!file) {
      throw new NotFoundException(
        `File ${fileName} not found in folder ${folderId}`,
      )
    }

    return file
  }

  // Seeded files carry their bytes inline; uploaded ones are streamed from
  // the private blob.
  async openDownload(
    folderId: string,
    fileName: string,
  ): Promise<{ file: DocumentFile; body: Buffer | Readable }> {
    const file = await this.findFile(folderId, fileName)
    if (file.blobPathname) {
      return { file, body: await this.blobStorage.download(file.blobPathname) }
    }
    if (file.data) {
      return { file, body: file.data }
    }
    throw new NotFoundException(`File ${fileName} has no stored content`)
  }

  async upload(
    folderId: string,
    file: IncomingFile | undefined,
    uploadedBy: string,
  ) {
    if (!file) {
      throw new BadRequestException('A file is required')
    }
    const ext = EXT_BY_MIME_TYPE[file.mimetype]
    if (!ext) {
      throw new BadRequestException(
        'Only PDF, Excel (XLSX) and image files can be uploaded',
      )
    }
    const name = safeFileName(file.originalname)
    await this.assertCanUpload(folderId, name, uploadedBy)

    const blobPathname = await this.blobStorage.upload(
      `documents/${folderId}/${name}`,
      file.buffer,
      file.mimetype,
    )
    return this.appendFile(folderId, {
      name,
      ext,
      mimeType: file.mimetype,
      blobPathname,
      uploadedBy,
      uploadedAt: new Date(),
    })
  }

  // Seeded and uploaded files alike can be removed; only an uploaded one has
  // a blob to clean up. Responds with the updated folder.
  async deleteFile(folderId: string, fileName: string) {
    const file = await this.findFile(folderId, fileName)
    const folder = await this.documentFolderModel
      .findOneAndUpdate(
        { _id: folderId, 'files.name': fileName },
        { $pull: { files: { name: fileName } } },
        { returnDocument: 'after', projection: LISTING_PROJECTION },
      )
      .exec()

    // A concurrent delete got there first.
    if (!folder) {
      throw new NotFoundException(
        `File ${fileName} not found in folder ${folderId}`,
      )
    }
    if (file.blobPathname) {
      await this.removeBlob(file.blobPathname)
    }
    return folder
  }

  // The file is already gone from its folder, so a failed blob delete only
  // leaves an unreachable blob behind — log it rather than fail the request.
  private async removeBlob(pathname: string) {
    try {
      await this.blobStorage.remove(pathname)
    } catch (error) {
      this.logger.warn(
        `Removing blob ${pathname} failed`,
        error instanceof Error ? error.stack : String(error),
      )
    }
  }

  // File names are the download key, so they must be unique per folder.
  // Replacing a file is a separate (not yet built) operation.
  private async assertCanUpload(
    folderId: string,
    name: string,
    uploadedBy: string,
  ) {
    const [folder, uploader] = await Promise.all([
      isValidObjectId(folderId)
        ? this.documentFolderModel.findById(folderId).exec()
        : null,
      uploadedBy && isValidObjectId(uploadedBy)
        ? this.instructorModel.findById(uploadedBy).exec()
        : null,
    ])
    if (!folder) {
      throw new NotFoundException(`Folder ${folderId} not found`)
    }
    if (!uploader) {
      throw new NotFoundException(`Instructor ${uploadedBy} not found`)
    }
    if (folder.files.some((existing) => existing.name === name)) {
      throw new ConflictException(`${name} already exists in ${folder.name}`)
    }
  }

  // The name filter makes the push atomic: a concurrent upload of the same
  // name that won the race leaves nothing to match, and the blob just
  // written is removed again.
  private async appendFile(
    folderId: string,
    entry: DocumentFile & { blobPathname: string },
  ) {
    const folder = await this.documentFolderModel
      .findOneAndUpdate(
        { _id: folderId, 'files.name': { $ne: entry.name } },
        { $push: { files: entry } },
        { returnDocument: 'after', projection: LISTING_PROJECTION },
      )
      .exec()

    if (!folder) {
      await this.blobStorage.remove(entry.blobPathname)
      throw new ConflictException(`${entry.name} already exists`)
    }
    return folder
  }
}
