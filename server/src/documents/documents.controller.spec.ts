import { Test, TestingModule } from '@nestjs/testing'
import { PassThrough, Readable } from 'node:stream'
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
    openDownload: jest.fn(),
    upload: jest.fn(),
    deleteFile: jest.fn(),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    documentsService.findAll.mockResolvedValue(folders)
    documentsService.openDownload.mockResolvedValue({ file, body: file.data })

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

  it('passes an upload through to the service', async () => {
    const upload = {
      originalname: 'a.pdf',
      mimetype: 'application/pdf',
      size: 3,
      buffer: Buffer.from('pdf'),
    }
    documentsService.upload.mockResolvedValue(folders[0])

    await expect(
      controller.upload('folder-1', upload, 'instructor-1'),
    ).resolves.toBe(folders[0])
    expect(documentsService.upload).toHaveBeenCalledWith(
      'folder-1',
      upload,
      'instructor-1',
    )
  })

  it('passes a delete through to the service', async () => {
    documentsService.deleteFile.mockResolvedValue(folders[0])

    await expect(controller.deleteFile('folder-1', 'a.pdf')).resolves.toBe(
      folders[0],
    )
    expect(documentsService.deleteFile).toHaveBeenCalledWith(
      'folder-1',
      'a.pdf',
    )
  })

  it('pipes an uploaded file’s blob stream into the response', async () => {
    documentsService.openDownload.mockResolvedValue({
      file,
      body: Readable.from([Buffer.from('blob bytes')]),
    })
    const res = new PassThrough() as PassThrough & { set: jest.Mock }
    res.set = jest.fn().mockReturnThis()
    const chunks: Buffer[] = []
    res.on('data', (chunk: Buffer) => chunks.push(chunk))

    await controller.downloadFile(
      'folder-1',
      file.name,
      res as unknown as import('express').Response,
    )

    expect(Buffer.concat(chunks).toString()).toBe('blob bytes')
  })

  it('sends a seeded file’s bytes with the right content headers', async () => {
    const set = jest.fn().mockReturnThis()
    const send = jest.fn()
    const res = { set, send } as unknown as import('express').Response

    await controller.downloadFile('folder-1', file.name, res)

    expect(documentsService.openDownload).toHaveBeenCalledWith(
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
