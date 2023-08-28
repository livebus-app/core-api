import { Injectable } from '@nestjs/common';
import { AlertsService } from 'src/alerts/alerts.service';
import { PrismaService } from 'src/prisma.service';
import { TelemetriesService } from 'src/telemetries/telemetries.service';

@Injectable()
export class VehicleService {
  constructor(
    private prismaService: PrismaService,
    private telemetryService: TelemetriesService,
    private alertService: AlertsService,
  ) { }

  create(data: any) {
    return this.prismaService.vehicle.create({
      data,
    });
  }

  findAll() {
    return this.prismaService.vehicle.findMany();
  }

  findOne(id: number) {
    return this.prismaService.vehicle.findUnique({
      where: {
        id,
      },
      include: {
        Device: true,
      },
    });
  }

  async getTelemetry(id: number) {
    const devices = await this.prismaService.device.findMany({
      where: {
        vehicleId: id,
      },
    });
    
    const telemetryList = (await Promise.all(
      devices.map((device) =>
        this.telemetryService.getLatestNonExpiredTelemetry(device.id),
      ),
    )).filter(Boolean);

    const alerts = (await Promise.all(
      devices.map((device) => this.alertService.getLastNonExpiredAlert(device.id)),
    )).filter(Boolean);

    const deviceTelemetry = {
      passengerCount: telemetryList.reduce((passengerCountReducer, telemetry) => telemetry.passengerCount + passengerCountReducer, 0),
      alerts,
    }

    return deviceTelemetry;
  }

  async getTelemetryHistory(id: number) {
    const devices = await this.prismaService.device.findMany({
      where: {
        vehicleId: id,
      },
    });

    console.info(devices, { startTime: new Date(new Date().getTime() - 1000 * 60 * 2), endTime: new Date() })

    const telemetryList = (await Promise.all(
      devices.map((device) =>
        this.telemetryService.getTelemetryHistory({ deviceId: device.id, startTime: new Date(new Date().getTime() - 1000 * 60 * 60 * 500), endTime: new Date() }),
      ),
    )).filter(Boolean).flat();

    return telemetryList;
  }
}
