import { Injectable } from '@nestjs/common';
import { AWSService } from 'src/aws.service';
import { PrismaService } from 'src/prisma.service';
import {
  getLiveStream,
  getStreamProcessor,
  startStreamProcessor,
} from 'utils/stream.utils';

@Injectable()
export class deviceService {
  constructor(private prismaService: PrismaService, private aws: AWSService) {}

  findAll() {
    return this.prismaService.device.findMany();
  }

  findOne(id: number) {
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
      StreamName: device.code,
      DeviceName: device.code,
      DataRetentionInHours: 24,
    });

    const response =
      await this.aws.kinesisVideo.updateImageGenerationConfiguration({
        StreamName: device.code,
        ImageGenerationConfiguration: {
          Status: 'ENABLED',
          DestinationConfig: {
            DestinationRegion: 'us-east-1',
            Uri: 's3://' + device.code,
          },
          SamplingInterval: 20000,
          ImageSelectorType: 'PRODUCER_TIMESTAMP',
          Format: 'JPEG',
          FormatConfig: {
            JPEGQuality: '80',
          },
          WidthPixels: 720,
          HeightPixels: 1280,
        },
      });

    await this.aws.s3.createBucket({
      Bucket: device.code,
    });

    const ingestFunction = await this.aws.lambda.getFunction({
      FunctionName: process.env.LAMBDA_INGEST_NAME,
    });

    this.aws.lambda.addPermission({
      FunctionName: ingestFunction.Configuration.FunctionName,
      StatementId: `AllowS3Invoke${device.code}`,

      Action: 'lambda:InvokeFunction',
      Principal: 's3.amazonaws.com',
      SourceArn: `arn:aws:s3:::${device.code}`,
    });

    this.aws.s3.putBucketNotificationConfiguration({
      Bucket: device.code,
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

  async delete(id: number) {
    const device = await this.findOne(id);

    try {
      await this.aws.s3.deleteBucket({
        Bucket: device.code,
      });
    } catch {}

    try {
      const stream = await this.aws.kinesisVideo.describeStream({
        StreamName: device.code,
      });

      if (stream?.StreamInfo?.StreamARN) {
        await this.aws.kinesisVideo.deleteStream({
          StreamARN: stream.StreamInfo.StreamARN,
        });
      }
    } catch {}

    return this.prismaService.device.delete({
      where: {
        id,
      },
    });
  }

  async getStreamingData(id: number) {
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

  async getStreamEndpoint(id: number) {
    const device = await this.findOne(id);

    try {
      const endpoint = await getLiveStream(this.getStreamName(device.code));

      return endpoint;
    } catch {
      return { url: null };
    }
  }

  async getStreamProcessor(id: number) {
    const device = await this.findOne(id);
    const identifier = this.getStreamName(device.code);

    return getStreamProcessor(identifier);
  }

  async startStreamProcessor(id: number) {
    const device = await this.findOne(id);
    const identifier = this.getStreamName(device.code);

    return startStreamProcessor(identifier);
  }

  async getImageGenerationConfiguration(id: number) {
    const device = await this.findOne(id);

    return this.aws.kinesisVideo.describeImageGenerationConfiguration({
      StreamName: device.code,
    });
  }

  async updateImageGenerationConfiguration(id: number, data: any) {
    const device = await this.findOne(id);

    const imageGeneration =
      await this.aws.kinesisVideo.describeImageGenerationConfiguration({
        StreamName: device.code,
      });

    return this.aws.kinesisVideo.updateImageGenerationConfiguration({
      StreamName: device.code,
      ImageGenerationConfiguration: {
        ...imageGeneration.ImageGenerationConfiguration,
        ...data,
      },
    });
  }
}
