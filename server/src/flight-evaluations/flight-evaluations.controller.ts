import { Controller, Get, Param, Patch, Query } from '@nestjs/common'
import { FlightEvaluationsService } from './flight-evaluations.service'

@Controller('flight-evaluations')
export class FlightEvaluationsController {
  constructor(
    private readonly flightEvaluationsService: FlightEvaluationsService,
  ) {}

  // `studentId` scopes the list to one student's evaluations (the homepage
  // passes it so a student only sees their own pending signatures);
  // omitted, it returns every evaluation.
  @Get()
  findAll(@Query('studentId') studentId?: string) {
    return this.flightEvaluationsService.findAll(studentId)
  }

  @Patch(':id/sign')
  sign(@Param('id') id: string) {
    return this.flightEvaluationsService.sign(id)
  }
}
