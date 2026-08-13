export type WeatherReport = {
  code: string
  metar: string
  taf: string
}

export type Booking = {
  id: string
  type: string
  date: string
  tail: string
  person: string
  time: string
}

export type MissingSignature = {
  id: string
  date: string
  label: string
}

export type NewsTag = 'operations' | 'fuel' | 'atc'

export type NewsItem = {
  id: string
  tag: NewsTag
  date: string
  title: string
  summary: string
}
