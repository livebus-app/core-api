import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { CompanyModule } from './company/company.module';
import { VehicleModule } from './vehicle/vehicle.module';
import { deviceModule } from './device/device.module';
import { AWSService } from 'src/aws.service';
import { TelemetriesModule } from './telemetries/telemetries.module';
import { AlertsModule } from './alerts/alerts.module';

@Module({
  imports: [CompanyModule, VehicleModule, deviceModule, TelemetriesModule, AlertsModule],
  controllers: [AppController],
  providers: [AppService, AWSService, PrismaService],
})
export class AppModule {}
