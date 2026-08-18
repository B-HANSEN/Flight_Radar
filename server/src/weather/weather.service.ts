import { Injectable, Logger } from '@nestjs/common'
import { WeatherReport } from './weather.types'

const STATION_CODES = ['LEDA', 'LEGE', 'LELL', 'LERS']
const AVIATION_WEATHER_API = 'https://aviationweather.gov/api/data'
const CACHE_TTL_MS = 10 * 60 * 1000
const USER_AGENT = 'FlightRadarAcademy/1.0 (https://github.com/flight-radar)'

type RawMetar = { icaoId: string; rawOb: string; reportTime: string }
type RawTaf = { icaoId: string; rawTAF: string }

function stripPrefix(raw: string, kind: 'METAR' | 'TAF', code: string) {
  return raw.replace(new RegExp(`^${kind}\\s+${code}\\s+`), '')
}

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name)
  private cache: { expiresAt: number; reports: WeatherReport[] } | null = null

  async findAll(): Promise<WeatherReport[]> {
    if (this.cache && this.cache.expiresAt > Date.now()) {
      return this.cache.reports
    }

    try {
      const reports = await this.fetchReports()
      this.cache = { expiresAt: Date.now() + CACHE_TTL_MS, reports }
      return reports
    } catch (error) {
      this.logger.warn(
        `Failed to fetch live weather data: ${error instanceof Error ? error.message : String(error)}`,
      )
      return this.cache?.reports ?? []
    }
  }

  private async fetchReports(): Promise<WeatherReport[]> {
    const ids = STATION_CODES.join(',')
    const [metars, tafs] = await Promise.all([
      this.fetchJson<RawMetar[]>(
        `${AVIATION_WEATHER_API}/metar?ids=${ids}&format=json`,
      ),
      this.fetchJson<RawTaf[]>(
        `${AVIATION_WEATHER_API}/taf?ids=${ids}&format=json`,
      ),
    ])

    const metarByCode = new Map(metars.map((m) => [m.icaoId, m.rawOb]))
    const tafByCode = new Map(tafs.map((t) => [t.icaoId, t.rawTAF]))
    const reportTimeByCode = new Map(
      metars.map((m) => [m.icaoId, m.reportTime]),
    )

    return STATION_CODES.filter(
      (code) => metarByCode.has(code) && tafByCode.has(code),
    ).map((code) => ({
      code,
      metar: stripPrefix(metarByCode.get(code)!, 'METAR', code),
      taf: stripPrefix(tafByCode.get(code)!, 'TAF', code),
      observedAt: reportTimeByCode.get(code)!,
    }))
  }

  private async fetchJson<T>(url: string): Promise<T> {
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
    })
    if (!res.ok) {
      throw new Error(`${url} responded with ${res.status}`)
    }
    return res.json() as Promise<T>
  }
}
