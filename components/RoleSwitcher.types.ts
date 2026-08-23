export type StudentTrack = 'PPL' | 'CPL'

export type Student = {
  id: string
  name: string
  initials: string
  color: string
  track: StudentTrack
  photoSrc?: string
}

export type Instructor = {
  id: string
  name: string
  initials: string
  color: string
  photoSrc?: string
}
