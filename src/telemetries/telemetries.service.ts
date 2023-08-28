import { Injectable } from '@nestjs/common';
import { AWSService } from 'src/aws.service';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class TelemetriesService {
  constructor(private prismaService: PrismaService) {}

  async getLatestNonExpiredTelemetry(deviceId: string) {
    const telemetry = await this.prismaService.telemetry.findFirst({
      where: {
        deviceId,
        createdAt: {
          gte: new Date(new Date().getTime() - 1000 * 30),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return telemetry;
  }

  async getTelemetryHistory({ deviceId, startTime, endTime }: { deviceId: string; startTime: Date; endTime: Date }) {
    const telemetry = await this.prismaService.telemetry.findMany({
      where: {
        deviceId,
        timestamp: {
          gte: startTime,
          lte: endTime,
        },
      },
      take: 20,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return telemetry;
  }
}
