import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { ScheduleController } from './schedule.controller'
import { ScheduleService } from './schedule.service'
import {
  ScheduleBlock,
  ScheduleBlockSchema,
} from './schemas/schedule-block.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ScheduleBlock.name, schema: ScheduleBlockSchema },
    ]),
  ],
  controllers: [ScheduleController],
  providers: [ScheduleService],
})
export class ScheduleModule {}
