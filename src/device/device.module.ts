import { Module } from '@nestjs/common';
import { deviceService } from './device.service';
import { deviceController } from './device.controller';
import { PrismaService } from 'src/prisma.service';
import { AWSService } from 'src/aws.service';

@Module({
  controllers: [deviceController],
  providers: [deviceService, PrismaService, AWSService],
})
export class deviceModule {}
