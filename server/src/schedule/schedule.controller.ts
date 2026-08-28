import { Controller, Get, Query } from '@nestjs/common'
import { ScheduleService } from './schedule.service'

@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get()
  findAll() {
    return this.scheduleService.findAll()
  }

  @Get('availability')
  findAvailability(
    @Query('date') date: string,
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
  ) {
    return this.scheduleService.findBusyAircraft(date, startTime, endTime)
  }

  @Get('student-flights')
  findStudentFlights(
    @Query('studentId') studentId: string,
    @Query('date') date: string,
  ) {
    return this.scheduleService.findStudentFlights(studentId, date)
  }
}
