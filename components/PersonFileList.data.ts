import type { PersonFile } from './PersonFileList.types'

export const DUMMY_PERSON_FILES: PersonFile[] = [
  {
    id: 'file-1',
    label: 'Updated C152 checklist',
    category: 'checklist',
    fileName: 'c152-checklist.pdf',
    mimeType: 'application/pdf',
    size: 184_320,
    personId: 'student-1',
    uploadedBy: 'instructor-1',
    uploadedAt: '2026-09-20T10:15:00.000Z',
  },
  {
    id: 'file-2',
    label: 'Student pilot licence',
    category: 'license',
    expiresAt: '2028-03-31',
    fileName: 'student-licence.pdf',
    mimeType: 'application/pdf',
    size: 96_256,
    personId: 'student-1',
    uploadedBy: 'instructor-1',
    uploadedAt: '2026-09-12T08:00:00.000Z',
  },
  {
    id: 'file-3',
    label: 'Class 2 medical scan',
    category: 'medical',
    expiresAt: '2026-06-30',
    fileName: 'medical.jpg',
    mimeType: 'image/jpeg',
    size: 512_000,
    personId: 'student-1',
    uploadedBy: 'instructor-1',
    uploadedAt: '2025-07-01T09:30:00.000Z',
  },
]
