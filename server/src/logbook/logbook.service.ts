import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import {
  LogbookEntry,
  LogbookEntryDocument,
} from './schemas/logbook-entry.schema'

@Injectable()
export class LogbookService {
  constructor(
    @InjectModel(LogbookEntry.name)
    private readonly logbookEntryModel: Model<LogbookEntryDocument>,
  ) {}

  findAll(studentId?: string) {
    return this.logbookEntryModel.find(studentId ? { studentId } : {}).exec()
  }
}
