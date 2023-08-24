import { KinesisVideo } from '@aws-sdk/client-kinesis-video';
import { Kinesis } from '@aws-sdk/client-kinesis';
import { SNS } from '@aws-sdk/client-sns';
import { S3 } from '@aws-sdk/client-s3';
import { Rekognition } from '@aws-sdk/client-rekognition';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { deviceService } from './device.service';

@Controller('device')
export class deviceController {
  constructor(private readonly deviceService: deviceService) {}

  @Get('/:id')
  async findOne(@Param('id') id: string) {
    return this.deviceService.findOne(parseInt(id));
  }

  @Get()
  async findAll() {
    return this.deviceService.findAll();
  }

  @Delete('/:id')
  async delete(@Param('id') id: string) {
    return this.deviceService.delete(parseInt(id));
  }

  @Get('/:id/streaming-data')
  async getMetadata(@Param('id') id: string) {
    return this.deviceService.getStreamingData(parseInt(id));
  }

  @Post()
  async create(@Body() data: any) {
    return this.deviceService.create(data);
  }

  @Get('/:id/livestream')
  async getStreamEndpoint(@Param('id') id: string) {
    const livestream = await this.deviceService.getStreamEndpoint(parseInt(id));

    return livestream;
  }

  @Get('/:id/stream-processor')
  async getStreamProcessor(@Param('id') id: string) {
    return this.deviceService.getStreamProcessor(parseInt(id));
  }

  @Post('/:id/stream-processor/start')
  async startStreamProcessor(@Param('id') id: string) {
    return this.deviceService.startStreamProcessor(parseInt(id));
  }

  @Get('/:id/image-generation')
  async getImageGeneration(@Param('id') id: string) {
    return this.deviceService.getImageGenerationConfiguration(parseInt(id));
  }

  @Put('/:id/image-generation')
  async updateImageGeneration(@Param('id') id: string, @Body() data: any) {
    return this.deviceService.updateImageGenerationConfiguration(
      parseInt(id),
      data,
    );
  }
}
