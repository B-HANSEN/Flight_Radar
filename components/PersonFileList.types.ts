// Personal documents only. Checklists are shared aircraft documents and
// belong in /documents, not with a person.
export const PERSON_FILE_CATEGORIES = [
  'license',
  'rating',
  'radiotelephony',
  'medical',
  'other',
] as const

export type PersonFileCategory = (typeof PERSON_FILE_CATEGORIES)[number]

export type PersonFile = {
  id: string
  label: string
  category: PersonFileCategory
  // ISO date (YYYY-MM-DD).
  expiresAt?: string
  fileName: string
  mimeType: string
  size: number
  personId: string
  uploadedBy: string
  // ISO timestamp.
  uploadedAt: string
}
