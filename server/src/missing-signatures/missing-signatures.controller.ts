import { Controller, Get } from '@nestjs/common'
import { MissingSignaturesService } from './missing-signatures.service'

@Controller('missing-signatures')
export class MissingSignaturesController {
  constructor(
    private readonly missingSignaturesService: MissingSignaturesService,
  ) {}

  @Get()
  findAll() {
    return this.missingSignaturesService.findAll()
  }
}
