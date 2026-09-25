import { BadRequestException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { Readable } from 'node:stream'
import { getModelToken } from '@nestjs/mongoose'
import { BlobStorageService } from './blob-storage.service'
import { PersonFilesService, safeFileName } from './person-files.service'
import { PersonFile } from './schemas/person-file.schema'
import { Instructor } from '../instructors/schemas/instructor.schema'
import { Student } from '../students/schemas/student.schema'

const STUDENT_ID = '64b000000000000000000001'
const FILE_ID = '64b000000000000000000002'
const INSTRUCTOR_ID = '64b000000000000000000003'
const OTHER_INSTRUCTOR_ID = '64b000000000000000000004'

function findByIdAmong(ids: string[]) {
  return (id: string) => ({
    exec: jest.fn().mockResolvedValue(ids.includes(id) ? { id } : null),
  })
}

describe('PersonFilesService', () => {
  let service: PersonFilesService

  const personFileModel = {
    find: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
  }
  const studentModel = { findById: jest.fn() }
  const instructorModel = { findById: jest.fn() }
  const blobStorage = { upload: jest.fn(), download: jest.fn() }

  const file = {
    originalname: 'C152 checklist.pdf',
    mimetype: 'application/pdf',
    size: 2048,
    buffer: Buffer.from('pdf'),
  }
  const input = {
    personId: STUDENT_ID,
    label: '  Updated checklist  ',
    category: 'checklist',
    expiresAt: '',
    uploadedBy: INSTRUCTOR_ID,
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    studentModel.findById.mockImplementation(findByIdAmong([STUDENT_ID]))
    instructorModel.findById.mockImplementation(
      findByIdAmong([INSTRUCTOR_ID, OTHER_INSTRUCTOR_ID]),
    )
    blobStorage.upload.mockResolvedValue('person-files/p1/c152-abc.pdf')
    personFileModel.create.mockImplementation((doc: unknown) =>
      Promise.resolve(doc),
    )

    const app: TestingModule = await Test.createTestingModule({
      providers: [
        PersonFilesService,
        { provide: getModelToken(PersonFile.name), useValue: personFileModel },
        { provide: getModelToken(Student.name), useValue: studentModel },
        { provide: getModelToken(Instructor.name), useValue: instructorModel },
        { provide: BlobStorageService, useValue: blobStorage },
      ],
    }).compile()

    service = app.get<PersonFilesService>(PersonFilesService)
  })

  it('lists a person’s files newest first', async () => {
    const exec = jest.fn().mockResolvedValue([])
    const sort = jest.fn().mockReturnValue({ exec })
    personFileModel.find.mockReturnValue({ sort })

    await service.findByPerson(STUDENT_ID)

    expect(personFileModel.find).toHaveBeenCalledWith({ personId: STUDENT_ID })
    expect(sort).toHaveBeenCalledWith({ uploadedAt: -1 })
  })

  describe('upload', () => {
    it('stores the bytes in blob storage and saves the metadata', async () => {
      const result = await service.upload(file, input)

      expect(blobStorage.upload).toHaveBeenCalledWith(
        `person-files/${STUDENT_ID}/C152 checklist.pdf`,
        file.buffer,
        'application/pdf',
      )
      expect(result).toEqual({
        label: 'Updated checklist',
        category: 'checklist',
        personId: STUDENT_ID,
        uploadedBy: INSTRUCTOR_ID,
        fileName: 'C152 checklist.pdf',
        mimeType: 'application/pdf',
        size: 2048,
        blobPathname: 'person-files/p1/c152-abc.pdf',
      })
    })

    it('keeps a valid expiry date', async () => {
      await service.upload(file, { ...input, expiresAt: '2027-03-31' })

      expect(personFileModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ expiresAt: '2027-03-31' }),
      )
    })

    it('lets an instructor upload for another instructor', async () => {
      await service.upload(file, { ...input, personId: OTHER_INSTRUCTOR_ID })

      expect(personFileModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          personId: OTHER_INSTRUCTOR_ID,
          uploadedBy: INSTRUCTOR_ID,
        }),
      )
    })

    it.each([
      ['no file', undefined, input],
      ['a disallowed type', { ...file, mimetype: 'text/html' }, input],
      ['a blank label', file, { ...input, label: '   ' }],
      ['an unknown category', file, { ...input, category: 'secret' }],
      ['an impossible date', file, { ...input, expiresAt: '2027-02-30' }],
      [
        'an instructor uploading their own documents',
        file,
        { ...input, personId: INSTRUCTOR_ID },
      ],
    ])('rejects %s before touching storage', async (_case, f, i) => {
      await expect(service.upload(f, i)).rejects.toBeInstanceOf(
        BadRequestException,
      )
      expect(blobStorage.upload).not.toHaveBeenCalled()
    })

    it.each([
      ['an unknown recipient', { ...input, personId: FILE_ID }],
      ['a malformed recipient id', { ...input, personId: 'nope' }],
      [
        'an uploader who is not an instructor',
        { ...input, personId: OTHER_INSTRUCTOR_ID, uploadedBy: STUDENT_ID },
      ],
      ['a missing uploader', { ...input, uploadedBy: '' }],
    ])('rejects %s', async (_case, i) => {
      await expect(service.upload(file, i)).rejects.toBeInstanceOf(
        NotFoundException,
      )
      expect(blobStorage.upload).not.toHaveBeenCalled()
    })
  })

  describe('openDownload', () => {
    it('returns the file record and its blob stream', async () => {
      const record = { blobPathname: 'person-files/p1/c152-abc.pdf' }
      const stream = Readable.from(['x'])
      personFileModel.findById.mockReturnValue({
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
