import { Test, TestingModule } from '@nestjs/testing'
import { AircraftController } from './aircraft.controller'
import { AircraftService } from './aircraft.service'
import { Aircraft } from './schemas/aircraft.schema'

describe('AircraftController', () => {
  let controller: AircraftController
  const aircraft: Aircraft[] = [
    {
      arcid: 'EC-GV8',
      type: 'Aeroprakt A-22 LS',
      photoSrc: '/aircraft/aeroprakt-a-22-ls.webp',
    },
  ]
  const aircraftService = {
    findAll: jest.fn().mockResolvedValue(aircraft),
  }

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AircraftController],
      providers: [{ provide: AircraftService, useValue: aircraftService }],
    }).compile()

    controller = app.get<AircraftController>(AircraftController)
  })

  it('returns the aircraft from the service', async () => {
    await expect(controller.findAll()).resolves.toBe(aircraft)
    expect(aircraftService.findAll).toHaveBeenCalled()
  })
})
