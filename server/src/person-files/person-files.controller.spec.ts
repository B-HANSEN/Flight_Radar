import { Test, TestingModule } from '@nestjs/testing'
import { PassThrough, Readable } from 'node:stream'
import type { Response } from 'express'
import { PersonFilesController } from './person-files.controller'
import { PersonFilesService } from './person-files.service'
import { PersonFile } from './schemas/person-file.schema'

describe('PersonFilesController', () => {
  let controller: PersonFilesController
  const files: PersonFile[] = [
    {
      label: 'Night rating',
      category: 'rating',
      fileName: 'night-rating.pdf',
      mimeType: 'application/pdf',
      size: 1024,
      blobPathname: 'person-files/p1/night-rating-abc.pdf',
      personId: 'p1',
      uploadedBy: 'i1',
    },
  ]
  const personFilesService = {
    findByPerson: jest.fn().mockResolvedValue(files),
    upload: jest.fn().mockResolvedValue(files[0]),
    openDownload: jest.fn(),
  }

  beforeEach(async () => {
    jest.clearAllMocks()

    const app: TestingModule = await Test.createTestingModule({
      controllers: [PersonFilesController],
      providers: [
        { provide: PersonFilesService, useValue: personFilesService },
      ],
    }).compile()

    controller = app.get<PersonFilesController>(PersonFilesController)
  })

  it("returns the person's files from the service", async () => {
    await expect(controller.findByPerson('p1')).resolves.toBe(files)
    expect(personFilesService.findByPerson).toHaveBeenCalledWith('p1')
  })

  it('passes the uploaded file and form fields to the service', async () => {
    const file = {
      originalname: 'night-rating.pdf',
      mimetype: 'application/pdf',
      size: 1024,
      buffer: Buffer.from('pdf'),
    }
    const body = {
      personId: 'p1',
      label: 'Night rating',
      category: 'rating',
      uploadedBy: 'i1',
    }

    await expect(controller.upload(file, body)).resolves.toBe(files[0])
    expect(personFilesService.upload).toHaveBeenCalledWith(file, body)
  })

  it('streams the blob with the right content headers', async () => {
    personFilesService.openDownload.mockResolvedValue({
      file: files[0],
      stream: Readable.from([Buffer.from('pdf bytes')]),
    })
    const res = new PassThrough() as PassThrough & { set: jest.Mock }
    res.set = jest.fn().mockReturnValue(res)
    const chunks: Buffer[] = []
    res.on('data', (chunk: Buffer) => chunks.push(chunk))
    const finished = new Promise((resolve) => res.on('end', resolve))

    await controller.download('file-1', res as unknown as Response)
    await finished

    expect(personFilesService.openDownload).toHaveBeenCalledWith('file-1')
    expect(res.set).toHaveBeenCalledWith({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="night-rating.pdf"',
    })
    expect(Buffer.concat(chunks).toString()).toBe('pdf bytes')
  })
})
