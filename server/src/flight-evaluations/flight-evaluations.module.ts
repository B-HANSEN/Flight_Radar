import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { FlightEvaluationsController } from './flight-evaluations.controller'
import { FlightEvaluationsService } from './flight-evaluations.service'
import {
  FlightEvaluation,
  FlightEvaluationSchema,
} from './schemas/flight-evaluation.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FlightEvaluation.name, schema: FlightEvaluationSchema },
    ]),
  ],
  controllers: [FlightEvaluationsController],
  providers: [FlightEvaluationsService],
})
export class FlightEvaluationsModule {}
