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

  findOne() {
    return this.emergencyContactModel.findOne().exec()
  }

  async update(input: EmergencyContactInput) {
    const emergencyContact = await this.emergencyContactModel
      .findOneAndUpdate({}, input, { new: true })
      .exec()

    if (!emergencyContact) {
      throw new NotFoundException('Emergency contact not found')
    }

    return emergencyContact
  }

  async clear() {
    const emergencyContact = await this.emergencyContactModel
      .findOneAndUpdate(
        {},
        { name: '', relation: '', phone: '' },
        { new: true },
      )
      .exec()

    if (!emergencyContact) {
      throw new NotFoundException('Emergency contact not found')
    }

    return emergencyContact
  }
}
