export type ManeuverAssessment = {
  title: string
  score?: string
}

export type FlightEvaluation = {
  id: string
  sessionId: string
  date: string
  type: string
  signed: boolean
  student: string
  instructor: string
  course: string
  sessionTitle: string
  aircraft: string
  role: string
  route: string
  flightTimeDual: string
  flightTimeSolo: string
  landingsDual: number
  landingsSolo: number
  maneuvers: ManeuverAssessment[]
  observations: string
  scorePreparation: number
  scoreTechnique: number
  scoreInitiative: number
  scoreInterest: number
  scoreAssimilation: number
  finalScore: number
  finalNote: string
}
