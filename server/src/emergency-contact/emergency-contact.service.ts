import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import {
  EmergencyContact,
  EmergencyContactDocument,
} from './schemas/emergency-contact.schema'

export type EmergencyContactInput = {
  name: string
  relation: string
  phone: string
}

@Injectable()
export class EmergencyContactService {
  constructor(
    @InjectModel(EmergencyContact.name)
    private readonly emergencyContactModel: Model<EmergencyContactDocument>,
  ) {}

  async findByPerson(personId: string) {
    const emergencyContact = await this.emergencyContactModel
      .findOne({ personId })
      .exec()

    return emergencyContact ?? { name: '', relation: '', phone: '', personId }
  }

  async update(personId: string, input: EmergencyContactInput) {
    return this.emergencyContactModel
      .findOneAndUpdate(
        { personId },
        { ...input, personId },
        { returnDocument: 'after', upsert: true },
      )
      .exec()
  }

  async clear(personId: string) {
    const emergencyContact = await this.emergencyContactModel
      .findOneAndUpdate(
        { personId },
        { name: '', relation: '', phone: '' },
        { returnDocument: 'after' },
      )
      .exec()

    if (!emergencyContact) {
      throw new NotFoundException(`Emergency contact for ${personId} not found`)
    }

    return emergencyContact
  }
}
