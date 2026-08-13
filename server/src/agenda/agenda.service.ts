import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import {
  CalendarEvent,
  CalendarEventDocument,
} from './schemas/calendar-event.schema'

@Injectable()
export class AgendaService {
  constructor(
    @InjectModel(CalendarEvent.name)
    private readonly calendarEventModel: Model<CalendarEventDocument>,
  ) {}

  findAll() {
    return this.calendarEventModel.find().exec()
  }
}
