export type StudentTrack = 'PPL' | 'CPL' | 'IR'

export type Student = {
  id: string
  name: string
  initials: string
  color: string
  track: StudentTrack
  email: string
  phone: string
  birthday: string
  info: string
  photoSrc?: string
}

export type Instructor = {
  id: string
  name: string
  initials: string
  color: string
  email: string
  phone: string
  birthday: string
  info: string
  photoSrc?: string
  // The Chief Flight Instructor can assign either instructor to a lesson;
  // a Deputy can only assign themselves (see ScheduleFlightModal).
  isChief?: boolean
}
