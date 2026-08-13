import { Test, TestingModule } from '@nestjs/testing'
import { DocumentsController } from './documents.controller'
import { DocumentsService } from './documents.service'
import { DocumentFolder } from './schemas/document-folder.schema'

describe('DocumentsController', () => {
  let controller: DocumentsController
  const folders: DocumentFolder[] = [
    {
      name: 'EC-ERV',
      files: [{ name: '11_CARGA Y CENTRADO C152 EC-ERV v.2.pdf', ext: 'PDF' }],
    },
  ]
  const documentsService = { findAll: jest.fn().mockResolvedValue(folders) }

  beforeEach(async () => {
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
})
