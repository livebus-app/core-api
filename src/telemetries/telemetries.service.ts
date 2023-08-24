import { Injectable } from '@nestjs/common';
import { AWSService } from 'src/aws.service';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class TelemetriesService {
  constructor(private prismaService: PrismaService) {}

  async getLatestNonExpiredTelemetry(deviceId: number) {
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
}
