export type CourseHoursValues = {
  vfrDual?: string
  vfrPic?: string
  vfrSpic?: string
  vfrPicus?: string
  vfrNight?: string
  vfrXc?: string
  ifrDual?: string
  ifrPic?: string
  ifrSpic?: string
  ifrPicus?: string
  ifrNight?: string
  ifrXc?: string
  mccPf?: string
  mccPm?: string
  acSe?: string
  acMe?: string
  acAb?: string
  acFstd?: string
}

export type CourseHoursRowKey = 'syllabus' | 'actual' | 'remaining'
export type CourseHoursGroupKey = 'currentLesson' | 'fullCourse'

export type CourseHoursRow = {
  key: CourseHoursRowKey
  tone?: 'positive' | 'negative'
  values: CourseHoursValues
}

export type CourseHoursGroup = {
  key: CourseHoursGroupKey
  rows: CourseHoursRow[]
}

export type CoursePhase = {
  number: number
  actualHours: string
  targetHours: string
  pct: number
  detail: string
}

export type CourseProgress = {
  overallActualHours: string
  overallTargetHours: string
  overallPct: number
  vfrTotalHours: string
  ifrTotalHours: string
  mccTotalHours: string
  groups: CourseHoursGroup[]
  phases: CoursePhase[]
}
