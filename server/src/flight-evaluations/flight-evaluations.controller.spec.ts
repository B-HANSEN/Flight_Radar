import { Test, TestingModule } from '@nestjs/testing'
import { FlightEvaluationsController } from './flight-evaluations.controller'
import { FlightEvaluationsService } from './flight-evaluations.service'
import { FlightEvaluation } from './schemas/flight-evaluation.schema'

describe('FlightEvaluationsController', () => {
  let controller: FlightEvaluationsController
  const evaluations: FlightEvaluation[] = [
    {
      sessionId: '4041369',
      date: '07/08/2026',
      type: 'Instruction',
      signed: false,
      student: 'Jamie Torres',
      instructor: 'Jane Smith',
      course: 'PPL Flight Phase (A_1_PPL(A)_v2_FLT)',
      sessionTitle: 'Final check before solo flight',
      aircraft: 'EC-ERV',
      role: 'DUAL',
      route: 'LELL - LELL',
      flightTimeDual: '00:54',
      flightTimeSolo: '00:00',
      landingsDual: 4,
      landingsSolo: 0,
      maneuvers: [
        { title: 'VBD15 - Final check before solo flight', score: '4' },
      ],
      observations: 'Very good session.',
      scorePreparation: 4,
      scoreTechnique: 3,
      scoreInitiative: 4,
      scoreInterest: 4,
      scoreAssimilation: 3,
      finalScore: 3,
      finalNote: 'APTO, pasa a la siguiente fase',
      studentId: 'student-1',
    },
  ]
  const signedEvaluation = { ...evaluations[0], signed: true }
  const flightEvaluationsService = {
    findAll: jest.fn().mockResolvedValue(evaluations),
    sign: jest.fn().mockResolvedValue(signedEvaluation),
  }

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [FlightEvaluationsController],
      providers: [
        {
          provide: FlightEvaluationsService,
          useValue: flightEvaluationsService,
        },
      ],
    }).compile()

    controller = app.get<FlightEvaluationsController>(
      FlightEvaluationsController,
    )
  })

  it('returns the flight evaluations from the service', async () => {
    await expect(controller.findAll()).resolves.toBe(evaluations)
    expect(flightEvaluationsService.findAll).toHaveBeenCalled()
  })

  it('signs a flight evaluation via the service', async () => {
    await expect(controller.sign('evaluation-1')).resolves.toBe(
      signedEvaluation,
    )
    expect(flightEvaluationsService.sign).toHaveBeenCalledWith('evaluation-1')
  })
})
