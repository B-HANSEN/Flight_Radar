import { Controller, Get } from '@nestjs/common'
import { InjectConnection } from '@nestjs/mongoose'
import { Connection, ConnectionStates } from 'mongoose'

@Controller('health')
export class HealthController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  @Get()
  check() {
    return {
      status: 'ok',
      mongo:
        this.connection.readyState === ConnectionStates.connected
          ? 'connected'
          : 'disconnected',
    }
  }
}
