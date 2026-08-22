import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import {
  AvailabilityDateMode,
  AvailabilityEntry,
  AvailabilityEntryDocument,
  AvailabilityRecurrenceMode,
  AvailabilityTimeMode,
  AvailabilityWeekday,
} from './schemas/availability-entry.schema'

export type AvailabilityEntryInput = {
  dateLabel: string
  dateMode: AvailabilityDateMode
  onDate?: string
  fromDate?: string
  toDate?: string
  timeLabel: string
  timeMode: AvailabilityTimeMode
  startTime?: string
  endTime?: string
  recurrence: string
  recurrenceMode: AvailabilityRecurrenceMode
  recurrenceDays?: AvailabilityWeekday[]
}

export type CreateAvailabilityEntryInput = AvailabilityEntryInput
export type UpdateAvailabilityEntryInput = AvailabilityEntryInput

// No Users module yet (no auth) — plain id for now, becomes a real
// ObjectId ref once the Users module exists.
const studentId = 'student-1'

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectModel(AvailabilityEntry.name)
    private readonly availabilityEntryModel: Model<AvailabilityEntryDocument>,
  ) {}

  findAll() {
    return this.availabilityEntryModel.find({ studentId }).exec()
  }

  create(input: CreateAvailabilityEntryInput) {
    return this.availabilityEntryModel.create({ ...input, studentId })
  }

  async update(id: string, input: UpdateAvailabilityEntryInput) {
    const entry = await this.availabilityEntryModel
      .findByIdAndUpdate(id, input, { new: true })
      .exec()

    if (!entry) {
      throw new NotFoundException(`Availability entry ${id} not found`)
    }

    return entry
  }

  async remove(id: string) {
    const entry = await this.availabilityEntryModel.findByIdAndDelete(id).exec()

    if (!entry) {
      throw new NotFoundException(`Availability entry ${id} not found`)
    }

    return entry
  }
}
