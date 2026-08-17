import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { EmergencyContactController } from './emergency-contact.controller'
import { EmergencyContactService } from './emergency-contact.service'
import {
  EmergencyContact,
  EmergencyContactSchema,
} from './schemas/emergency-contact.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EmergencyContact.name, schema: EmergencyContactSchema },
    ]),
  ],
  controllers: [EmergencyContactController],
  providers: [EmergencyContactService],
})
export class EmergencyContactModule {}
