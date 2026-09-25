import { BadRequestException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { Readable } from 'node:stream'
import { getModelToken } from '@nestjs/mongoose'
import { BlobStorageService } from './blob-storage.service'
import { StudentFilesService, safeFileName } from './student-files.service'
import { StudentFile } from './schemas/student-file.schema'
import { Student } from '../students/schemas/student.schema'

const STUDENT_ID = '64b000000000000000000001'
const FILE_ID = '64b000000000000000000002'

describe('StudentFilesService', () => {
  let service: StudentFilesService

  const studentFileModel = {
    find: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
  }
  const studentModel = { findById: jest.fn() }
  const blobStorage = { upload: jest.fn(), download: jest.fn() }

  const file = {
    originalname: 'C152 checklist.pdf',
    mimetype: 'application/pdf',
    size: 2048,
    buffer: Buffer.from('pdf'),
  }
  const input = {
    studentId: STUDENT_ID,
    label: '  Updated checklist  ',
    category: 'checklist',
    expiresAt: '',
    uploadedBy: 'instructor-1',
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    studentModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ name: 'Jamie Torres' }),
    })
    blobStorage.upload.mockResolvedValue('student-files/s1/c152-abc.pdf')
    studentFileModel.create.mockImplementation((doc: unknown) =>
      Promise.resolve(doc),
    )

    const app: TestingModule = await Test.createTestingModule({
      providers: [
        StudentFilesService,
        {
          provide: getModelToken(StudentFile.name),
          useValue: studentFileModel,
        },
        { provide: getModelToken(Student.name), useValue: studentModel },
        { provide: BlobStorageService, useValue: blobStorage },
      ],
    }).compile()

    service = app.get<StudentFilesService>(StudentFilesService)
  })

  it('lists a student’s files newest first', async () => {
    const exec = jest.fn().mockResolvedValue([])
    const sort = jest.fn().mockReturnValue({ exec })
    studentFileModel.find.mockReturnValue({ sort })

    await service.findByStudent(STUDENT_ID)

    expect(studentFileModel.find).toHaveBeenCalledWith({
      studentId: STUDENT_ID,
    })
    expect(sort).toHaveBeenCalledWith({ uploadedAt: -1 })
  })

  describe('upload', () => {
    it('stores the bytes in blob storage and saves the metadata', async () => {
      const result = await service.upload(file, input)

      expect(blobStorage.upload).toHaveBeenCalledWith(
        `student-files/${STUDENT_ID}/C152 checklist.pdf`,
        file.buffer,
        'application/pdf',
      )
      expect(result).toEqual({
        label: 'Updated checklist',
        category: 'checklist',
        uploadedBy: 'instructor-1',
        studentId: STUDENT_ID,
        fileName: 'C152 checklist.pdf',
        mimeType: 'application/pdf',
        size: 2048,
        blobPathname: 'student-files/s1/c152-abc.pdf',
      })
    })

    it('keeps a valid expiry date', async () => {
      await service.upload(file, { ...input, expiresAt: '2027-03-31' })

      expect(studentFileModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ expiresAt: '2027-03-31' }),
      )
    })

    it.each([
      ['no file', undefined, input],
      ['a disallowed type', { ...file, mimetype: 'text/html' }, input],
      ['a blank label', file, { ...input, label: '   ' }],
      ['an unknown category', file, { ...input, category: 'secret' }],
      ['an impossible date', file, { ...input, expiresAt: '2027-02-30' }],
    ])('rejects %s before touching storage', async (_case, f, i) => {
      await expect(service.upload(f, i)).rejects.toBeInstanceOf(
        BadRequestException,
      )
      expect(blobStorage.upload).not.toHaveBeenCalled()
    })

    it('rejects an unknown student', async () => {
      studentModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      })

      await expect(service.upload(file, input)).rejects.toBeInstanceOf(
        NotFoundException,
      )
      expect(blobStorage.upload).not.toHaveBeenCalled()
    })

    it('rejects a malformed student id without querying', async () => {
      await expect(
        service.upload(file, { ...input, studentId: 'nope' }),
      ).rejects.toBeInstanceOf(NotFoundException)
      expect(studentModel.findById).not.toHaveBeenCalled()
    })
  })

  describe('openDownload', () => {
    it('returns the file record and its blob stream', async () => {
      const record = { blobPathname: 'student-files/s1/c152-abc.pdf' }
      const stream = Readable.from(['x'])
      studentFileModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(record),
      })
      blobStorage.download.mockResolvedValue(stream)

      await expect(service.openDownload(FILE_ID)).resolves.toEqual({
        file: record,
        stream,
      })
      expect(blobStorage.download).toHaveBeenCalledWith(record.blobPathname)
    })

    it('throws for a malformed id', async () => {
      await expect(service.openDownload('nope')).rejects.toBeInstanceOf(
        NotFoundException,
      )
    })
  })

  it('sanitizes characters that would break a path or header', () => {
    expect(safeFileName('a/b"c\\d\r\n.pdf')).toBe('a_b_c_d_.pdf')
    expect(safeFileName('   ')).toBe('file')
  })
})
