export type LogbookEntry = {
  id: string
  date: string
  depPlace: string
  depTime: string
  arrPlace: string
  arrTime: string
  model: string
  reg: string
  se?: string
  xcDual?: string
  total: string
  pic: string
  landingsDay: number
  landingsNight?: number
  night?: boolean
  remarks?: string
}
