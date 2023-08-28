import { Module } from '@nestjs/common';
import { DeviceService } from './device.service';
import { deviceController } from './device.controller';
import { PrismaService } from 'src/prisma.service';
import { AWSService } from 'src/aws.service';

@Module({
  controllers: [deviceController],
  providers: [DeviceService, PrismaService, AWSService],
})
export class deviceModule {}
