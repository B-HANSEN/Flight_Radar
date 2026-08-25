import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { getModelToken } from '@nestjs/mongoose'
import { DocumentsService } from './documents.service'
import { DocumentFolder } from './schemas/document-folder.schema'

describe('DocumentsService', () => {
  let service: DocumentsService

  const documentFolderModel = { find: jest.fn(), findById: jest.fn() }

  beforeEach(async () => {
    jest.clearAllMocks()

    const app: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsService,
        {
          provide: getModelToken(DocumentFolder.name),
          useValue: documentFolderModel,
        },
      ],
    }).compile()

    service = app.get<DocumentsService>(DocumentsService)
  })

  describe('findAll', () => {
    it('excludes file bytes from the folder listing', async () => {
      const select = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([{ name: 'EC-ERV', files: [] }]),
      })
      documentFolderModel.find.mockReturnValue({ select })

      const result = await service.findAll()

      expect(select).toHaveBeenCalledWith('-files.data')
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

      const result = await service.findFile('folder-1', 'checklist.pdf')

      expect(documentFolderModel.findById).toHaveBeenCalledWith('folder-1')
      expect(result).toBe(file)
    })

    it('throws when the folder has no file with that name', async () => {
      documentFolderModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ name: 'EC-ERV', files: [] }),
      })

      await expect(
        service.findFile('folder-1', 'missing.pdf'),
      ).rejects.toBeInstanceOf(NotFoundException)
    })

    it('throws when the folder does not exist', async () => {
      documentFolderModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      })

      await expect(
        service.findFile('missing-folder', 'checklist.pdf'),
      ).rejects.toBeInstanceOf(NotFoundException)
    })
  })
})
