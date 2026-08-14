import { Controller, Get, Param, Patch } from '@nestjs/common'
import { FlightEvaluationsService } from './flight-evaluations.service'

@Controller('flight-evaluations')
export class FlightEvaluationsController {
  constructor(
    private readonly flightEvaluationsService: FlightEvaluationsService,
  ) {}

  @Get()
  findAll() {
    return this.flightEvaluationsService.findAll()
  }

  @Patch(':id/sign')
  sign(@Param('id') id: string) {
    return this.flightEvaluationsService.sign(id)
  }
}
