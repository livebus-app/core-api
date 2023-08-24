import { Module } from '@nestjs/common';
import { VehicleService } from './vehicle.service';
import { VehicleController } from './vehicle.controller';
import { PrismaService } from 'src/prisma.service';
import { TelemetriesService } from 'src/telemetries/telemetries.service';
import { AlertsService } from 'src/alerts/alerts.service';

@Module({
  controllers: [VehicleController],
  providers: [VehicleService, PrismaService, TelemetriesService, AlertsService],
})
export class VehicleModule {}
