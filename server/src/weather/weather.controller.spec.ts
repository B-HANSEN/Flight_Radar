import { Test, TestingModule } from '@nestjs/testing'
import { WeatherController } from './weather.controller'
import { WeatherService } from './weather.service'
import { WeatherReport } from './weather.types'

describe('WeatherController', () => {
  let controller: WeatherController
  const reports: WeatherReport[] = [
    {
      code: 'LELL',
      metar: '081630Z 11008KT 060V150 CAVOK 31/23 Q1015',
      taf: '081400Z 0815/0915 14008KT CAVOK TX38/0913Z TN21/0905Z',
      observedAt: '2026-08-08T16:30:00.000Z',
    },
  ]
  const weatherService = { findAll: jest.fn().mockResolvedValue(reports) }

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [WeatherController],
      providers: [{ provide: WeatherService, useValue: weatherService }],
    }).compile()

    controller = app.get<WeatherController>(WeatherController)
  })

  it('returns the weather reports from the service', async () => {
    await expect(controller.findAll()).resolves.toBe(reports)
    expect(weatherService.findAll).toHaveBeenCalled()
  })
})
