import { Module } from '@nestjs/common';
import { VehicleService } from './vehicle.service';
import { VehicleController } from './vehicle.controller';
import { PrismaService } from 'src/prisma.service';
import { TelemetriesService } from 'src/telemetries/telemetries.service';
import { AlertsService } from 'src/alerts/alerts.service';
import { DeviceService } from 'src/device/device.service';
import { AWSService } from 'src/aws.service';

@Module({
  controllers: [VehicleController],
  providers: [VehicleService, PrismaService, TelemetriesService, AlertsService, DeviceService, AWSService],
})
export class VehicleModule {}
