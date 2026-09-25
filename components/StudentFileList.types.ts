export const STUDENT_FILE_CATEGORIES = [
  'checklist',
  'license',
  'medical',
  'other',
] as const

export type StudentFileCategory = (typeof STUDENT_FILE_CATEGORIES)[number]

export type StudentFile = {
  id: string
  label: string
  category: StudentFileCategory
  // ISO date (YYYY-MM-DD).
  expiresAt?: string
  fileName: string
  mimeType: string
  size: number
  studentId: string
  uploadedBy?: string
  // ISO timestamp.
  uploadedAt: string
}
