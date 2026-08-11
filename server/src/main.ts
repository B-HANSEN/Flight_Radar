import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import helmet from 'helmet'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const config = app.get(ConfigService)

  app.use(helmet())
  app.enableCors({ origin: config.get<string>('CORS_ORIGIN') })
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))

  await app.listen(config.get<string>('PORT') ?? 4000)
}
void bootstrap()
