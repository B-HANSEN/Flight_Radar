import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import {
  FlightEvaluation,
  FlightEvaluationDocument,
} from './schemas/flight-evaluation.schema'

@Injectable()
export class FlightEvaluationsService {
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
    const evaluation = await this.flightEvaluationModel
      .findByIdAndUpdate(id, { signed: true }, { returnDocument: 'after' })
      .exec()

    if (!evaluation) {
      throw new NotFoundException(`Flight evaluation ${id} not found`)
    }

    return evaluation
  }
}
