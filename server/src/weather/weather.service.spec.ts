import { Test, TestingModule } from '@nestjs/testing'
import { WeatherService } from './weather.service'

function jsonResponse(body: unknown, ok = true) {
  return { ok, status: ok ? 200 : 500, json: () => Promise.resolve(body) }
}

describe('WeatherService', () => {
  let service: WeatherService
  let fetchMock: jest.Mock

  beforeEach(async () => {
    fetchMock = jest.fn()
    global.fetch = fetchMock

    const app: TestingModule = await Test.createTestingModule({
      providers: [WeatherService],
    }).compile()

    service = app.get<WeatherService>(WeatherService)
  })

  it('fetches METAR/TAF for each station, strips the report-type prefix, and uses the METAR observation time', async () => {
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse([
          {
            icaoId: 'LEDA',
            rawOb: 'METAR LEDA 181600Z 23008KT CAVOK 35/13 Q1014',
            reportTime: '2026-08-18T16:00:00.000Z',
          },
          {
            icaoId: 'LEGE',
            rawOb: 'METAR LEGE 181600Z 18013KT CAVOK 28/18 Q1014',
            reportTime: '2026-08-18T15:55:00.000Z',
          },
        ]),
      )
      .mockResolvedValueOnce(
        jsonResponse([
          {
            icaoId: 'LEDA',
            rawTAF: 'TAF LEDA 181400Z 1815/1915 26009KT CAVOK',
          },
          {
            icaoId: 'LEGE',
            rawTAF: 'TAF LEGE 181100Z 1812/1912 VRB04KT 9999 FEW030',
          },
        ]),
      )

    const result = await service.findAll()

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(result).toEqual([
      {
        code: 'LEDA',
        metar: '181600Z 23008KT CAVOK 35/13 Q1014',
        taf: '181400Z 1815/1915 26009KT CAVOK',
        observedAt: '2026-08-18T16:00:00.000Z',
      },
      {
        code: 'LEGE',
        metar: '181600Z 18013KT CAVOK 28/18 Q1014',
        taf: '181100Z 1812/1912 VRB04KT 9999 FEW030',
        observedAt: '2026-08-18T15:55:00.000Z',
      },
    ])
  })

  it('omits a station missing either a METAR or a TAF', async () => {
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse([
          {
            icaoId: 'LEDA',
            rawOb: 'METAR LEDA 181600Z 23008KT CAVOK 35/13 Q1014',
          },
        ]),
      )
      .mockResolvedValueOnce(jsonResponse([]))

    const result = await service.findAll()

    expect(result).toEqual([])
  })

  it('returns an empty list when the upstream API is unreachable', async () => {
    fetchMock.mockRejectedValue(new Error('network down'))

    const result = await service.findAll()

    expect(result).toEqual([])
  })

  it('serves cached data on a later call instead of refetching', async () => {
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse([
          {
            icaoId: 'LEDA',
            rawOb: 'METAR LEDA 181600Z 23008KT CAVOK 35/13 Q1014',
          },
        ]),
      )
      .mockResolvedValueOnce(
        jsonResponse([
          {
            icaoId: 'LEDA',
            rawTAF: 'TAF LEDA 181400Z 1815/1915 26009KT CAVOK',
          },
        ]),
      )

    const first = await service.findAll()
    const second = await service.findAll()

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(second).toEqual(first)
  })
})
