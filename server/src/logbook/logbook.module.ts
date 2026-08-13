import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { LogbookController } from './logbook.controller'
import { LogbookService } from './logbook.service'
import {
  LogbookEntry,
  LogbookEntrySchema,
} from './schemas/logbook-entry.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LogbookEntry.name, schema: LogbookEntrySchema },
    ]),
  ],
  controllers: [LogbookController],
  providers: [LogbookService],
})
export class LogbookModule {}
