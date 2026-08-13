import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AgendaModule } from './agenda/agenda.module'
import { AircraftModule } from './aircraft/aircraft.module'
import { AvailabilityModule } from './availability/availability.module'
import { BookingsModule } from './bookings/bookings.module'
import { CertificatesModule } from './certificates/certificates.module'
import { validate } from './config/env.validation'
import { CoursesModule } from './courses/courses.module'
import { DocumentsModule } from './documents/documents.module'
import { HealthModule } from './health/health.module'
import { LogbookModule } from './logbook/logbook.module'
import { MailboxModule } from './mailbox/mailbox.module'
import { MissingSignaturesModule } from './missing-signatures/missing-signatures.module'
import { NewsModule } from './news/news.module'
import { ScheduleModule } from './schedule/schedule.module'
import { WeatherModule } from './weather/weather.module'

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
    AgendaModule,
    AircraftModule,
    AvailabilityModule,
    BookingsModule,
    CertificatesModule,
    CoursesModule,
    DocumentsModule,
    LogbookModule,
    MailboxModule,
    MissingSignaturesModule,
    NewsModule,
    ScheduleModule,
    WeatherModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
