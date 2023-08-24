import { Module } from '@nestjs/common';
import { TelemetriesService } from './telemetries.service';
import { TelemetriesController } from './telemetries.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [TelemetriesController],
  providers: [TelemetriesService, PrismaService],
})
export class TelemetriesModule {}
