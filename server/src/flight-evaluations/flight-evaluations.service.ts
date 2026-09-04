import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import {
  FlightEvaluation,
  FlightEvaluationDocument,
} from './schemas/flight-evaluation.schema'
import { withErrorLogging } from '../common/logging'

@Injectable()
export class FlightEvaluationsService {
  private readonly logger = new Logger(FlightEvaluationsService.name)

  constructor(
    @InjectModel(FlightEvaluation.name)
    private readonly flightEvaluationModel: Model<FlightEvaluationDocument>,
  ) {}

  findAll(studentId?: string) {
    return this.flightEvaluationModel
      .find(studentId ? { studentId } : {})
      .exec()
  }

  async sign(id: string) {
    const evaluation = await withErrorLogging(
      this.logger,
      `Sign flight evaluation ${id}`,
      () =>
        this.flightEvaluationModel
          .findByIdAndUpdate(id, { signed: true }, { returnDocument: 'after' })
          .exec(),
    )

    if (!evaluation) {
      throw new NotFoundException(`Flight evaluation ${id} not found`)
    }

    return evaluation
  }
}
