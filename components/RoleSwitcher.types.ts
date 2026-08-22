export type StudentTrack = 'PPL' | 'CPL'

export type Student = {
  id: string
  name: string
  initials: string
  color: string
  track: StudentTrack
}
