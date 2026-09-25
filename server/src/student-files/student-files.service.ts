import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, isValidObjectId } from 'mongoose'
import { Student, StudentDocument } from '../students/schemas/student.schema'
import { BlobStorageService } from './blob-storage.service'
import {
  STUDENT_FILE_CATEGORIES,
  StudentFile,
  StudentFileCategory,
  StudentFileDocument,
} from './schemas/student-file.schema'

// Multipart form fields arrive as plain strings; an empty optional field is
// sent as ''.
export type UploadStudentFileInput = {
  studentId: string
  label: string
  category: string
  expiresAt?: string
  uploadedBy?: string
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

function isCategory(value: string): value is StudentFileCategory {
  return (STUDENT_FILE_CATEGORIES as readonly string[]).includes(value)
}

// Keeps the stored name readable while dropping anything that could break
// a blob path or the quoted Content-Disposition header on download.
export function safeFileName(name: string): string {
  return name.replace(/["\\/\r\n]+/g, '_').trim() || 'file'
}

@Injectable()
export class StudentFilesService {
  constructor(
    @InjectModel(StudentFile.name)
    private readonly studentFileModel: Model<StudentFileDocument>,
    @InjectModel(Student.name)
    private readonly studentModel: Model<StudentDocument>,
    private readonly blobStorage: BlobStorageService,
  ) {}

  findByStudent(studentId: string) {
    return this.studentFileModel
      .find({ studentId })
      .sort({ uploadedAt: -1 })
      .exec()
  }

  async findById(id: string): Promise<StudentFileDocument> {
    // A malformed id would make findById throw a CastError (→ 500); treat
    // anything that isn't a valid ObjectId as simply not found.
    const file = isValidObjectId(id)
      ? await this.studentFileModel.findById(id).exec()
      : null

    if (!file) {
      throw new NotFoundException(`Student file ${id} not found`)
    }

    return file
  }

  async upload(file: IncomingFile | undefined, input: UploadStudentFileInput) {
    if (!file) {
      throw new BadRequestException('A file is required')
    }
    const fields = this.validate(file, input)
    await this.assertStudentExists(input.studentId)

    const fileName = safeFileName(file.originalname)
    const blobPathname = await this.blobStorage.upload(
      `student-files/${input.studentId}/${fileName}`,
      file.buffer,
      file.mimetype,
    )

    return this.studentFileModel.create({
      ...fields,
      studentId: input.studentId,
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

  private validate(file: IncomingFile, input: UploadStudentFileInput) {
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

    return {
      label,
      category: input.category,
      ...(expiresAt ? { expiresAt } : {}),
      ...(input.uploadedBy ? { uploadedBy: input.uploadedBy } : {}),
    }
  }

  private async assertStudentExists(studentId: string) {
    const student = isValidObjectId(studentId)
      ? await this.studentModel.findById(studentId).exec()
      : null
    if (!student) {
      throw new NotFoundException(`Student ${studentId} not found`)
    }
  }
}
