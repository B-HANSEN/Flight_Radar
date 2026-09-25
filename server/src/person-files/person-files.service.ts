import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, isValidObjectId } from 'mongoose'
import {
  Instructor,
  InstructorDocument,
} from '../instructors/schemas/instructor.schema'
import { Student, StudentDocument } from '../students/schemas/student.schema'
import { BlobStorageService } from './blob-storage.service'
import {
  PERSON_FILE_CATEGORIES,
  PersonFile,
  PersonFileCategory,
  PersonFileDocument,
} from './schemas/person-file.schema'

// Multipart form fields arrive as plain strings; an empty optional field is
// sent as ''.
export type UploadPersonFileInput = {
  personId: string
  label: string
  category: string
  expiresAt?: string
  uploadedBy: string
}

// The subset of multer's in-memory file the service relies on.
export type IncomingFile = {
  originalname: string
  mimetype: string
  size: number
  buffer: Buffer
}

export const MAX_FILE_BYTES = 10 * 1024 * 1024
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
]
const MAX_LABEL_LENGTH = 120

function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value)
}

function isCategory(value: string): value is PersonFileCategory {
  return (PERSON_FILE_CATEGORIES as readonly string[]).includes(value)
}

type FindableById = {
  findById(id: string): { exec(): Promise<unknown> }
}

// A malformed id would make findById throw a CastError (→ 500); treat
// anything that isn't a valid ObjectId as simply not found.
async function exists(model: FindableById, id: string): Promise<boolean> {
  return Boolean(id && isValidObjectId(id) && (await model.findById(id).exec()))
}

// Keeps the stored name readable while dropping anything that could break
// a blob path or the quoted Content-Disposition header on download.
export function safeFileName(name: string): string {
  return name.replace(/["\\/\r\n]+/g, '_').trim() || 'file'
}

@Injectable()
export class PersonFilesService {
  constructor(
    @InjectModel(PersonFile.name)
    private readonly personFileModel: Model<PersonFileDocument>,
    @InjectModel(Student.name)
    private readonly studentModel: Model<StudentDocument>,
    @InjectModel(Instructor.name)
    private readonly instructorModel: Model<InstructorDocument>,
    private readonly blobStorage: BlobStorageService,
  ) {}

  findByPerson(personId: string) {
    return this.personFileModel
      .find({ personId })
      .sort({ uploadedAt: -1 })
      .exec()
  }

  async findById(id: string): Promise<PersonFileDocument> {
    // A malformed id would make findById throw a CastError (→ 500); treat
    // anything that isn't a valid ObjectId as simply not found.
    const file = isValidObjectId(id)
      ? await this.personFileModel.findById(id).exec()
      : null

    if (!file) {
      throw new NotFoundException(`File ${id} not found`)
    }

    return file
  }

  async upload(file: IncomingFile | undefined, input: UploadPersonFileInput) {
    if (!file) {
      throw new BadRequestException('A file is required')
    }
    const fields = this.validate(file, input)
    await this.assertParticipantsExist(input.personId, input.uploadedBy)

    const fileName = safeFileName(file.originalname)
    const blobPathname = await this.blobStorage.upload(
      `person-files/${input.personId}/${fileName}`,
      file.buffer,
      file.mimetype,
    )

    return this.personFileModel.create({
      ...fields,
      personId: input.personId,
      uploadedBy: input.uploadedBy,
      fileName,
      mimeType: file.mimetype,
      size: file.size,
      blobPathname,
    })
  }

  async openDownload(id: string) {
    const file = await this.findById(id)
    const stream = await this.blobStorage.download(file.blobPathname)
    return { file, stream }
  }

  private validate(file: IncomingFile, input: UploadPersonFileInput) {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('Only PDF and image files can be uploaded')
    }

    const label = input.label?.trim() ?? ''
    if (!label || label.length > MAX_LABEL_LENGTH) {
      throw new BadRequestException(
        `A label of 1–${MAX_LABEL_LENGTH} characters is required`,
      )
    }
    if (!isCategory(input.category)) {
      throw new BadRequestException(`Unknown category ${input.category}`)
    }

    const expiresAt = input.expiresAt || undefined
    if (expiresAt && !isIsoDate(expiresAt)) {
      throw new BadRequestException('Expiry date must be YYYY-MM-DD')
    }

    // Four-eyes principle: an instructor's own documents are uploaded by a
    // different instructor.
    if (input.uploadedBy && input.uploadedBy === input.personId) {
      throw new BadRequestException(
        'Your own documents must be uploaded by another instructor',
      )
    }

    return {
      label,
      category: input.category,
      ...(expiresAt ? { expiresAt } : {}),
    }
  }

  // The recipient may be a student or an instructor; the uploader must be
  // an instructor.
  private async assertParticipantsExist(personId: string, uploadedBy: string) {
    const [isStudent, isInstructor, uploaderExists] = await Promise.all([
      exists(this.studentModel, personId),
      exists(this.instructorModel, personId),
      exists(this.instructorModel, uploadedBy),
    ])
    if (!isStudent && !isInstructor) {
      throw new NotFoundException(`Person ${personId} not found`)
    }
    if (!uploaderExists) {
      throw new NotFoundException(`Instructor ${uploadedBy} not found`)
    }
  }
}
