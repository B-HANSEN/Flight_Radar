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
import { startOfCurrentMonth } from '../common/date'

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
// ObjectId ref once the Users module exists. Callers that know the persona
// (the /me pages) pass a real student id; the default keeps older callers
// and tests working.
const DEFAULT_STUDENT_ID = 'student-1'

const DMY_PATTERN = /^(\d{2})\/(\d{2})\/(\d{4})$/

// The last calendar day an entry covers (`toDate` for a range, `onDate`
// otherwise). Unparseable dates are treated as "keep" so a malformed entry
// is never silently hidden.
function entryEndDate(entry: AvailabilityEntryDocument): Date | null {
  const raw = entry.dateMode === 'range' ? entry.toDate : entry.onDate
  const match = raw?.match(DMY_PATTERN)
  if (!match) return null
  const [, day, month, year] = match
  return new Date(Number(year), Number(month) - 1, Number(day))
}

// Hides availability that belongs entirely to a past month — a past date in
// the current month is still shown (see TODO.md).
export function isEntryInOrAfterMonth(
  entry: AvailabilityEntryDocument,
  monthStart: Date,
): boolean {
  const end = entryEndDate(entry)
  return end === null || end >= monthStart
}

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectModel(AvailabilityEntry.name)
    private readonly availabilityEntryModel: Model<AvailabilityEntryDocument>,
  ) {}

  async findAll(studentId: string = DEFAULT_STUDENT_ID) {
    const entries = await this.availabilityEntryModel.find({ studentId }).exec()
    const monthStart = startOfCurrentMonth()
    return entries.filter((entry) => isEntryInOrAfterMonth(entry, monthStart))
  }

  create(
    input: CreateAvailabilityEntryInput,
    studentId: string = DEFAULT_STUDENT_ID,
  ) {
    return this.availabilityEntryModel.create({ ...input, studentId })
  }

  async update(id: string, input: UpdateAvailabilityEntryInput) {
    const entry = await this.availabilityEntryModel
      .findByIdAndUpdate(id, input, { returnDocument: 'after' })
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
