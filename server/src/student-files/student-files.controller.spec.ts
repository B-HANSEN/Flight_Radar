import { Test, TestingModule } from '@nestjs/testing'
import { PassThrough, Readable } from 'node:stream'
import type { Response } from 'express'
import { StudentFilesController } from './student-files.controller'
import { StudentFilesService } from './student-files.service'
import { StudentFile } from './schemas/student-file.schema'

describe('StudentFilesController', () => {
  let controller: StudentFilesController
  const files: StudentFile[] = [
    {
      label: 'Updated C152 checklist',
      category: 'checklist',
      fileName: 'c152-checklist.pdf',
      mimeType: 'application/pdf',
      size: 1024,
      blobPathname: 'student-files/s1/c152-checklist-abc.pdf',
      studentId: 's1',
    },
  ]
  const studentFilesService = {
    findByStudent: jest.fn().mockResolvedValue(files),
    upload: jest.fn().mockResolvedValue(files[0]),
    openDownload: jest.fn(),
  }

  beforeEach(async () => {
    jest.clearAllMocks()

    const app: TestingModule = await Test.createTestingModule({
      controllers: [StudentFilesController],
      providers: [
        { provide: StudentFilesService, useValue: studentFilesService },
      ],
    }).compile()

    controller = app.get<StudentFilesController>(StudentFilesController)
  })

  it("returns the student's files from the service", async () => {
    await expect(controller.findByStudent('s1')).resolves.toBe(files)
    expect(studentFilesService.findByStudent).toHaveBeenCalledWith('s1')
  })

  it('passes the uploaded file and form fields to the service', async () => {
    const file = {
      originalname: 'c152-checklist.pdf',
      mimetype: 'application/pdf',
      size: 1024,
      buffer: Buffer.from('pdf'),
    }
    const body = { studentId: 's1', label: 'Checklist', category: 'checklist' }

    await expect(controller.upload(file, body)).resolves.toBe(files[0])
    expect(studentFilesService.upload).toHaveBeenCalledWith(file, body)
  })

  it('streams the blob with the right content headers', async () => {
    studentFilesService.openDownload.mockResolvedValue({
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

    expect(studentFilesService.openDownload).toHaveBeenCalledWith('file-1')
    expect(res.set).toHaveBeenCalledWith({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="c152-checklist.pdf"',
    })
    expect(Buffer.concat(chunks).toString()).toBe('pdf bytes')
  })
})
