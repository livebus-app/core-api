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
import { DeviceService } from './device.service';

@Controller('device')
export class deviceController {
  constructor(private readonly deviceService: DeviceService) { }

  @Get('/:id')
  async findOne(@Param('id') id: string) {
    return this.deviceService.findOne(id);
  }

  @Get()
  async findAll() {
    return this.deviceService.findAll();
  }

  @Delete('/:id')
  async delete(@Param('id') id: string) {
    return this.deviceService.delete(id);
  }

  @Get('/:id/streaming-data')
  async getMetadata(@Param('id') id: string) {
    return this.deviceService.getStreamingData(id);
  }

  @Post()
  async create(@Body() data: any) {
    return this.deviceService.create(data);
  }

  @Get('/:id/livestream')
  async getStreamEndpoint(@Param('id') id: string) {
    const livestream = await this.deviceService.getStreamEndpoint(id);

    return livestream;
  }

  @Get('/:id/stream-processor')
  async getStreamProcessor(@Param('id') id: string) {
    return this.deviceService.getStreamProcessor(id);
  }

  @Post('/:id/stream-processor/start')
  async startStreamProcessor(@Param('id') id: string) {
    return this.deviceService.startStreamProcessor(id);
  }

  @Get('/:id/image-generation')
  async getImageGeneration(@Param('id') id: string) {
    return this.deviceService.getImageGenerationConfiguration(id);
  }

  @Put('/:id/image-generation')
  async updateImageGeneration(@Param('id') id: string, @Body() data: any) {
    return this.deviceService.updateImageGenerationConfiguration(
      id,
      data,
    );
  }

  @Get('/:id/frames')
  async getFrames(@Param('id') id: string) {
    return this.deviceService.getFrames(id);
  }
}
