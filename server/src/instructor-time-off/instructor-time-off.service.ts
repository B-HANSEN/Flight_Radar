import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import {
  InstructorTimeOff,
  InstructorTimeOffDocument,
  InstructorTimeOffType,
} from './schemas/instructor-time-off.schema'
import {
  Instructor,
  InstructorDocument,
} from '../instructors/schemas/instructor.schema'
import { formatISODate, startOfCurrentMonth } from '../common/date'
import { withErrorLogging } from '../common/logging'

export type CreateInstructorTimeOffInput = {
  instructorId: string
  date: string
  type: InstructorTimeOffType
  reason?: string
}

@Injectable()
export class InstructorTimeOffService {
  private readonly logger = new Logger(InstructorTimeOffService.name)

  constructor(
    @InjectModel(InstructorTimeOff.name)
    private readonly instructorTimeOffModel: Model<InstructorTimeOffDocument>,
    @InjectModel(Instructor.name)
    private readonly instructorModel: Model<InstructorDocument>,
  ) {}

  // Only the current and next calendar month are planned here — anything
  // further out is noise on the /availability page (and the CFI's review
  // queue). Dates are ISO 'YYYY-MM-DD' strings, so a lexical range works.
  findAll(instructorId?: string) {
    const from = startOfCurrentMonth()
    const until = new Date(from.getFullYear(), from.getMonth() + 2, 1)
    return this.instructorTimeOffModel
      .find({
        ...(instructorId ? { instructorId } : {}),
        date: { $gte: formatISODate(from), $lt: formatISODate(until) },
      })
      .exec()
  }

  // A regular day off is granted immediately; personal leave needs the
  // Chief Flight Instructor's approval, unless the CFI is the one asking.
  async create(input: CreateInstructorTimeOffInput) {
    let status: 'approved' | 'pending' = 'approved'
    if (input.type === 'personal') {
      const instructor = await this.instructorModel
        .findById(input.instructorId)
        .exec()
      status = instructor?.isChief ? 'approved' : 'pending'
    }
    return withErrorLogging(
      this.logger,
      `Create time off for instructor ${input.instructorId}`,
      () => this.instructorTimeOffModel.create({ ...input, status }),
    )
  }

  async setStatus(id: string, status: 'approved' | 'denied') {
    const entry = await withErrorLogging(
      this.logger,
      `Set instructor time off ${id} to ${status}`,
      () =>
        this.instructorTimeOffModel
          .findByIdAndUpdate(id, { status }, { returnDocument: 'after' })
          .exec(),
    )

    if (!entry) {
      throw new NotFoundException(`Instructor time off ${id} not found`)
    }

    return entry
  }

  async remove(id: string) {
    const entry = await withErrorLogging(
      this.logger,
      `Delete instructor time off ${id}`,
      () => this.instructorTimeOffModel.findByIdAndDelete(id).exec(),
    )

    if (!entry) {
      throw new NotFoundException(`Instructor time off ${id} not found`)
    }

    return entry
  }
}
