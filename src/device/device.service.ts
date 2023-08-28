import { Injectable } from '@nestjs/common';
import { AWSService } from 'src/aws.service';
import { PrismaService } from 'src/prisma.service';
import {
  getLiveStream,
  getStreamProcessor,
  startStreamProcessor,
} from 'utils/stream.utils';

@Injectable()
export class DeviceService {
  constructor(private prismaService: PrismaService, private aws: AWSService) { }

  findAll(args?: Parameters<typeof this.prismaService.device.findMany>[0]) {
    return this.prismaService.device.findMany(args);
  }

  findOne(id: string) {
    return this.prismaService.device.findUnique({
      where: {
        id,
      },
    });
  }

  async create(data: any) {
    const device = await this.prismaService.device.create({
      data,
    });

    await this.aws.kinesisVideo.createStream({
      StreamName: device.id,
      DeviceName: device.id,
      DataRetentionInHours: 24,
    });

    const response =
      await this.aws.kinesisVideo.updateImageGenerationConfiguration({
        StreamName: device.id,
        ImageGenerationConfiguration: {
          Status: 'ENABLED',
          DestinationConfig: {
            DestinationRegion: 'us-east-1',
            Uri: `s3://${process.env.KVS_OUTPUT_BUCKET_NAME}/` + device.id,
          },
          SamplingInterval: 2000,
          ImageSelectorType: 'PRODUCER_TIMESTAMP',
          Format: 'JPEG',
          FormatConfig: {
            JPEGQuality: '80',
          },
          WidthPixels: 720,
          HeightPixels: 1280,
        },
      });

    const ingestFunction = await this.aws.lambda.getFunction({
      FunctionName: process.env.LAMBDA_INGEST_NAME,
    });

    console.info(ingestFunction)
    this.aws.lambda.addPermission({
      FunctionName: ingestFunction.Configuration.FunctionName,
      StatementId: `AllowS3Invoke${device.id}`,

      Action: 'lambda:InvokeFunction',
      Principal: 's3.amazonaws.com',
      SourceArn: `arn:aws:s3:::${process.env.KVS_OUTPUT_BUCKET_NAME}`,
    });

    this.aws.s3.putBucketNotificationConfiguration({
      Bucket: process.env.KVS_OUTPUT_BUCKET_NAME,
      NotificationConfiguration: {
        LambdaFunctionConfigurations: [
          {
            Events: ['s3:ObjectCreated:*'],
            LambdaFunctionArn: ingestFunction.Configuration.FunctionArn,
          },
        ],
      },
    });

    return device;
  }

  async delete(id: string) {
    const device = await this.findOne(id);

    try {
      await this.aws.s3.deleteBucket({
        Bucket: device.id,
      });
    } catch { }

    try {
      const stream = await this.aws.kinesisVideo.describeStream({
        StreamName: device.id,
      });

      if (stream?.StreamInfo?.StreamARN) {
        await this.aws.kinesisVideo.deleteStream({
          StreamARN: stream.StreamInfo.StreamARN,
        });
      }
    } catch { }

    return this.prismaService.device.delete({
      where: {
        id,
      },
    });
  }

  async getStreamingData(id: string) {
    const streamEndpoint = await this.getStreamEndpoint(id).catch(() => ({
      url: null,
    }));
    const streamProcessor = await this.getStreamProcessor(id).catch(() => ({
      Status: 'FAILED',
      StatusMessage: '(Internal) Cannot fetch stream processor',
    }));

    return {
      livestream: streamEndpoint,
      streamProcessor: {
        status: streamProcessor.Status,
        statusMessage: streamProcessor.StatusMessage,
      },
    };
  }

  protected getStreamName(deviceCode: string) {
    return `${deviceCode}`;
  }

  async getStreamEndpoint(id: string) {
    const device = await this.findOne(id);

    try {
      const endpoint = await getLiveStream(this.getStreamName(device.id));

      return endpoint;
    } catch {
      return { url: null };
    }
  }

  async getStreamProcessor(id: string) {
    const device = await this.findOne(id);
    const identifier = this.getStreamName(device.id);

    return getStreamProcessor(identifier);
  }

  async startStreamProcessor(id: string) {
    const device = await this.findOne(id);
    const identifier = this.getStreamName(device.id);

    return startStreamProcessor(identifier);
  }

  async getImageGenerationConfiguration(id: string) {
    const device = await this.findOne(id);

    return this.aws.kinesisVideo.describeImageGenerationConfiguration({
      StreamName: device.id,
    });
  }

  async updateImageGenerationConfiguration(id: string, data: any) {
    const device = await this.findOne(id);

    const imageGeneration =
      await this.aws.kinesisVideo.describeImageGenerationConfiguration({
        StreamName: device.id,
      });

    return this.aws.kinesisVideo.updateImageGenerationConfiguration({
      StreamName: device.id,
      ImageGenerationConfiguration: {
        ...imageGeneration.ImageGenerationConfiguration,
        ...data,
      },
    });
  }

  async getFrames(id: string) {
    return this.aws.s3.listObjectsV2({
      Bucket: "lvb-frames-storage",
      Prefix: id,
      MaxKeys: 10,
    })
  }
}
