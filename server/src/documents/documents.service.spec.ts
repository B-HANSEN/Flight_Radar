import {
  BadRequestException,
  ConflictException,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { getModelToken } from '@nestjs/mongoose'
import { Readable } from 'node:stream'
import { BlobStorageService } from '../common/blob-storage.service'
import { Instructor } from '../instructors/schemas/instructor.schema'
import { DocumentsService } from './documents.service'
import { DocumentFolder } from './schemas/document-folder.schema'

const FOLDER_ID = '64b000000000000000000010'
const INSTRUCTOR_ID = '64b000000000000000000003'

function resolving(value: unknown) {
  return { exec: jest.fn().mockResolvedValue(value) }
}

describe('DocumentsService', () => {
  let service: DocumentsService

  const documentFolderModel = {
    find: jest.fn(),
    findById: jest.fn(),
    findOneAndUpdate: jest.fn(),
  }
  const instructorModel = { findById: jest.fn() }
  const blobStorage = {
    upload: jest.fn(),
    download: jest.fn(),
    remove: jest.fn(),
  }

  beforeEach(async () => {
    jest.clearAllMocks()

    const app: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsService,
        {
          provide: getModelToken(DocumentFolder.name),
          useValue: documentFolderModel,
        },
        { provide: getModelToken(Instructor.name), useValue: instructorModel },
        { provide: BlobStorageService, useValue: blobStorage },
      ],
    }).compile()

    service = app.get<DocumentsService>(DocumentsService)
  })

  describe('findAll', () => {
    it('excludes file bytes and blob keys from the folder listing', async () => {
      const select = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([{ name: 'EC-ERV', files: [] }]),
      })
      documentFolderModel.find.mockReturnValue({ select })

      const result = await service.findAll()

      expect(select).toHaveBeenCalledWith('-files.data -files.blobPathname')
      expect(result).toEqual([{ name: 'EC-ERV', files: [] }])
    })
  })

  describe('findFile', () => {
    it('returns the matching file, bytes included', async () => {
      const file = {
        name: 'checklist.pdf',
        ext: 'PDF',
        mimeType: 'application/pdf',
        data: Buffer.from('bytes'),
      }
      documentFolderModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ name: 'EC-ERV', files: [file] }),
      })

      const result = await service.findFile(FOLDER_ID, 'checklist.pdf')

      expect(documentFolderModel.findById).toHaveBeenCalledWith(FOLDER_ID)
      expect(result).toBe(file)
    })

    it('throws when the folder has no file with that name', async () => {
      documentFolderModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ name: 'EC-ERV', files: [] }),
      })

      await expect(
        service.findFile(FOLDER_ID, 'missing.pdf'),
      ).rejects.toBeInstanceOf(NotFoundException)
    })

    it('throws when the folder does not exist', async () => {
      documentFolderModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      })

      await expect(
        service.findFile(FOLDER_ID, 'checklist.pdf'),
      ).rejects.toBeInstanceOf(NotFoundException)
    })

    it('treats a malformed folder id as not found without querying', async () => {
      await expect(
        service.findFile('not-an-id', 'checklist.pdf'),
      ).rejects.toBeInstanceOf(NotFoundException)
      expect(documentFolderModel.findById).not.toHaveBeenCalled()
    })
  })

  describe('openDownload', () => {
    function folderWith(file: Record<string, unknown>) {
      documentFolderModel.findById.mockReturnValue(
        resolving({ name: 'EC-ERV', files: [{ name: 'a.pdf', ...file }] }),
      )
    }

    it('serves a seeded file from its inline bytes', async () => {
      const data = Buffer.from('bytes')
      folderWith({ data })

      const { body } = await service.openDownload(FOLDER_ID, 'a.pdf')

      expect(body).toBe(data)
      expect(blobStorage.download).not.toHaveBeenCalled()
    })

    it('streams an uploaded file from its blob', async () => {
      const stream = Readable.from(['bytes'])
      blobStorage.download.mockResolvedValue(stream)
      folderWith({ blobPathname: 'documents/f/a-x1.pdf' })

      const { body } = await service.openDownload(FOLDER_ID, 'a.pdf')

      expect(blobStorage.download).toHaveBeenCalledWith('documents/f/a-x1.pdf')
      expect(body).toBe(stream)
    })

    it('throws when a file has neither bytes nor a blob', async () => {
      folderWith({})

      await expect(
        service.openDownload(FOLDER_ID, 'a.pdf'),
      ).rejects.toBeInstanceOf(NotFoundException)
    })
  })

  describe('upload', () => {
    const file = {
      originalname: 'Normal/Checklist.pdf',
      mimetype: 'application/pdf',
      size: 2048,
      buffer: Buffer.from('pdf'),
    }
    const updatedFolder = { name: 'EC-ERV', files: [] }

    beforeEach(() => {
      documentFolderModel.findById.mockReturnValue(
        resolving({ name: 'EC-ERV', files: [{ name: 'Existing.pdf' }] }),
      )
      instructorModel.findById.mockReturnValue(resolving({ id: INSTRUCTOR_ID }))
      blobStorage.upload.mockResolvedValue(
        'documents/f/Normal_Checklist-x1.pdf',
      )
      documentFolderModel.findOneAndUpdate.mockReturnValue(
        resolving(updatedFolder),
      )
    })

    it('stores the file in blob storage and appends it to the folder', async () => {
      const result = await service.upload(FOLDER_ID, file, INSTRUCTOR_ID)

      expect(blobStorage.upload).toHaveBeenCalledWith(
        `documents/${FOLDER_ID}/Normal_Checklist.pdf`,
        file.buffer,
        'application/pdf',
      )
      const [filter, update] = documentFolderModel.findOneAndUpdate.mock
        .calls[0] as [unknown, { $push: { files: Record<string, unknown> } }]
      expect(filter).toEqual({
        _id: FOLDER_ID,
        'files.name': { $ne: 'Normal_Checklist.pdf' },
      })
      expect(update.$push.files).toMatchObject({
        name: 'Normal_Checklist.pdf',
        ext: 'PDF',
        mimeType: 'application/pdf',
        blobPathname: 'documents/f/Normal_Checklist-x1.pdf',
        uploadedBy: INSTRUCTOR_ID,
      })
      expect(result).toBe(updatedFolder)
    })

    it('rejects a missing file', async () => {
      await expect(
        service.upload(FOLDER_ID, undefined, INSTRUCTOR_ID),
      ).rejects.toBeInstanceOf(BadRequestException)
    })

    it('rejects an unsupported file type', async () => {
      await expect(
        service.upload(
          FOLDER_ID,
          { ...file, mimetype: 'text/plain' },
          INSTRUCTOR_ID,
        ),
      ).rejects.toBeInstanceOf(BadRequestException)
      expect(blobStorage.upload).not.toHaveBeenCalled()
    })

    it('rejects an unknown folder', async () => {
      await expect(
        service.upload('not-an-id', file, INSTRUCTOR_ID),
      ).rejects.toThrow('Folder not-an-id not found')
    })

    it('rejects an unknown uploader', async () => {
      instructorModel.findById.mockReturnValue(resolving(null))

      await expect(
        service.upload(FOLDER_ID, file, INSTRUCTOR_ID),
      ).rejects.toThrow(`Instructor ${INSTRUCTOR_ID} not found`)
    })

    it('rejects a name that already exists in the folder', async () => {
      await expect(
        service.upload(
          FOLDER_ID,
          { ...file, originalname: 'Existing.pdf' },
          INSTRUCTOR_ID,
        ),
      ).rejects.toBeInstanceOf(ConflictException)
      expect(blobStorage.upload).not.toHaveBeenCalled()
    })

    it('removes the blob again when a concurrent upload took the name', async () => {
      documentFolderModel.findOneAndUpdate.mockReturnValue(resolving(null))

      await expect(
        service.upload(FOLDER_ID, file, INSTRUCTOR_ID),
      ).rejects.toBeInstanceOf(ConflictException)
      expect(blobStorage.remove).toHaveBeenCalledWith(
        'documents/f/Normal_Checklist-x1.pdf',
      )
    })
  })

  describe('deleteFile', () => {
    const updatedFolder = { name: 'EC-ERV', files: [] }

    function folderWith(file: Record<string, unknown>) {
      documentFolderModel.findById.mockReturnValue(
        resolving({ name: 'EC-ERV', files: [{ name: 'a.pdf', ...file }] }),
      )
    }

    beforeEach(() => {
      documentFolderModel.findOneAndUpdate.mockReturnValue(
        resolving(updatedFolder),
      )
      blobStorage.remove.mockResolvedValue(undefined)
    })

    it('pulls an uploaded file from its folder and removes its blob', async () => {
      folderWith({ blobPathname: 'documents/f/a-x1.pdf' })

      const result = await service.deleteFile(FOLDER_ID, 'a.pdf')

      expect(documentFolderModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: FOLDER_ID, 'files.name': 'a.pdf' },
        { $pull: { files: { name: 'a.pdf' } } },
        expect.objectContaining({ returnDocument: 'after' }),
      )
      expect(blobStorage.remove).toHaveBeenCalledWith('documents/f/a-x1.pdf')
      expect(result).toBe(updatedFolder)
    })

    it('deletes a seeded file without touching blob storage', async () => {
      folderWith({ data: Buffer.from('bytes') })

      await service.deleteFile(FOLDER_ID, 'a.pdf')

      expect(blobStorage.remove).not.toHaveBeenCalled()
    })

    it('still succeeds when the blob cannot be removed', async () => {
      folderWith({ blobPathname: 'documents/f/a-x1.pdf' })
      blobStorage.remove.mockRejectedValue(new Error('blob down'))
      const warn = jest
        .spyOn(Logger.prototype, 'warn')
        .mockImplementation(() => undefined)

      await expect(service.deleteFile(FOLDER_ID, 'a.pdf')).resolves.toBe(
        updatedFolder,
      )
      expect(warn).toHaveBeenCalled()
      warn.mockRestore()
    })

    it('throws when a concurrent delete already removed the file', async () => {
      folderWith({ blobPathname: 'documents/f/a-x1.pdf' })
      documentFolderModel.findOneAndUpdate.mockReturnValue(resolving(null))

      await expect(
        service.deleteFile(FOLDER_ID, 'a.pdf'),
      ).rejects.toBeInstanceOf(NotFoundException)
      expect(blobStorage.remove).not.toHaveBeenCalled()
    })
  })
})
