import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { CertificatesModule } from './certificates/certificates.module'
import { validate } from './config/env.validation'
import { HealthModule } from './health/health.module'
import { MailboxModule } from './mailbox/mailbox.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI'),
      }),
    }),
    HealthModule,
    CertificatesModule,
    MailboxModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
