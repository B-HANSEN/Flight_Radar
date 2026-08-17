import { Body, Controller, Delete, Get, Put } from '@nestjs/common'
import { EmergencyContactService } from './emergency-contact.service'
import type { EmergencyContactInput } from './emergency-contact.service'

@Controller('emergency-contact')
export class EmergencyContactController {
  constructor(
    private readonly emergencyContactService: EmergencyContactService,
  ) {}

  @Get()
  findOne() {
    return this.emergencyContactService.findOne()
  }

  @Put()
  update(@Body() body: EmergencyContactInput) {
    return this.emergencyContactService.update(body)
  }

  @Delete()
  clear() {
    return this.emergencyContactService.clear()
  }
}
