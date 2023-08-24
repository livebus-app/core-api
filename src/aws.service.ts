import { Injectable } from '@nestjs/common';
import { KinesisVideo } from '@aws-sdk/client-kinesis-video';
import { SNS } from '@aws-sdk/client-sns';
import { Rekognition } from '@aws-sdk/client-rekognition';
import { S3 } from '@aws-sdk/client-s3';
import { Lambda } from '@aws-sdk/client-lambda';

@Injectable()
export class AWSService {
  region: string = 'us-east-1';
  kinesisVideo = new KinesisVideo({ region: this.region });
  sns = new SNS({ region: this.region });
  rekognition = new Rekognition({ region: this.region });
  s3 = new S3({ region: this.region });
  lambda = new Lambda({ region: this.region });
}
