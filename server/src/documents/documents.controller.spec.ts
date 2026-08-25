import { Test, TestingModule } from '@nestjs/testing'
import { DocumentsController } from './documents.controller'
import { DocumentsService } from './documents.service'
import { DocumentFile, DocumentFolder } from './schemas/document-folder.schema'

describe('DocumentsController', () => {
  let controller: DocumentsController
  const folders: DocumentFolder[] = [
    {
      name: 'EC-ERV',
      files: [
        {
          name: '11_CARGA Y CENTRADO C152 EC-ERV v.2.pdf',
          ext: 'PDF',
          mimeType: 'application/pdf',
          data: Buffer.from('pdf bytes'),
        },
      ],
    },
  ]
  const file: DocumentFile = folders[0].files[0]
  const documentsService = {
    findAll: jest.fn().mockResolvedValue(folders),
    findFile: jest.fn().mockResolvedValue(file),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    documentsService.findAll.mockResolvedValue(folders)
    documentsService.findFile.mockResolvedValue(file)

    const app: TestingModule = await Test.createTestingModule({
      controllers: [DocumentsController],
      providers: [{ provide: DocumentsService, useValue: documentsService }],
    }).compile()

    controller = app.get<DocumentsController>(DocumentsController)
  })

  it('returns the document folders from the service', async () => {
    await expect(controller.findAll()).resolves.toBe(folders)
    expect(documentsService.findAll).toHaveBeenCalled()
  })

  it('streams the file bytes with the right content headers', async () => {
    const set = jest.fn().mockReturnThis()
    const send = jest.fn()
    const res = { set, send } as unknown as import('express').Response

    await controller.downloadFile('folder-1', file.name, res)

    expect(documentsService.findFile).toHaveBeenCalledWith(
      'folder-1',
      file.name,
    )
    expect(set).toHaveBeenCalledWith({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${file.name}"`,
    })
    expect(send).toHaveBeenCalledWith(file.data)
  })
})
