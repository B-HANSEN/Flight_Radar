import { Body, Controller, Delete, Get, Put, Query } from '@nestjs/common'
import { EmergencyContactService } from './emergency-contact.service'
import type { EmergencyContactInput } from './emergency-contact.service'

@Controller('emergency-contact')
export class EmergencyContactController {
  constructor(
    private readonly emergencyContactService: EmergencyContactService,
  ) {}

  @Get()
  findOne(@Query('personId') personId: string) {
    return this.emergencyContactService.findByPerson(personId)
  }

  @Put()
  update(
    @Query('personId') personId: string,
    @Body() body: EmergencyContactInput,
  ) {
    return this.emergencyContactService.update(personId, body)
  }

  @Delete()
  clear(@Query('personId') personId: string) {
    return this.emergencyContactService.clear(personId)
  }
}
