import { KinesisVideo } from '@aws-sdk/client-kinesis-video';
import { KinesisVideoArchivedMedia, GetHLSStreamingSessionURLCommandInput } from "@aws-sdk/client-kinesis-video-archived-media";
import { Rekognition } from '@aws-sdk/client-rekognition';

const kinesisVideo = new KinesisVideo({ region: 'us-east-1' });
const rekognition = new Rekognition({ region: 'us-east-1' });

const STREAM_SESSION_OPTIONS: Partial<GetHLSStreamingSessionURLCommandInput> = {
    PlaybackMode: 'LIVE',
    DisplayFragmentTimestamp: 'ALWAYS',
    Expires: 600,
    ContainerFormat: 'FRAGMENTED_MP4',
    DiscontinuityMode: 'ALWAYS',
    HLSFragmentSelector: {
        FragmentSelectorType: 'SERVER_TIMESTAMP',
    },
}

export async function getLiveStream(streamName: string) {
    const endpointObject = await kinesisVideo.getDataEndpoint({
        StreamName: streamName,
        APIName: 'GET_HLS_STREAMING_SESSION_URL',
    });

    if (endpointObject.DataEndpoint) {
        const data = {
            url: await getStreamSessionURL(endpointObject.DataEndpoint, streamName, STREAM_SESSION_OPTIONS),
        }
        return data
    } else {
        throw new Error('Cannot get the url');
    }
}

async function getStreamSessionURL(endpoint: string, streamName: string, options: Partial<GetHLSStreamingSessionURLCommandInput>) {
    const kinesisVideoArchivedMedia = new KinesisVideoArchivedMedia({
        region: 'us-east-1',
        endpoint: endpoint
    })

    const data = await kinesisVideoArchivedMedia.getHLSStreamingSessionURL({
        StreamName: streamName,
        ...options,
    });

    return data.HLSStreamingSessionURL
};

export async function getStreamProcessor(streamProcessorName: string) {

    const streams = await kinesisVideo.listStreams({ MaxResults: 20 });

    for (const stream of streams.StreamInfoList) {
        const fragments = await new KinesisVideoArchivedMedia({ region: 'us-east-1' })
            .listFragments({ MaxResults: 10, StreamARN: stream.StreamARN, StreamName: stream.StreamName, FragmentSelector: { FragmentSelectorType: 'SERVER_TIMESTAMP', TimestampRange: {
                StartTimestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
                EndTimestamp: new Date(),
            } } });
        console.info(fragments)
    }


    const stream = await kinesisVideo.describeStream({
        StreamName: streamProcessorName,
    })

    return rekognition.describeStreamProcessor({ Name: streamProcessorName });
}

export async function startStreamProcessor(streamProcessorName: string) {

    const stream = await kinesisVideo.describeStream({
        StreamName: streamProcessorName,
    })

    return rekognition.startStreamProcessor({
        Name: streamProcessorName,
        StartSelector: {
            KVSStreamStartSelector: {
                ProducerTimestamp: Date.now(),
            }
        },
        StopSelector: {
            MaxDurationInSeconds: 120,
        }
    });
}

export async function stopStreamProcessor(streamProcessorName: string) {
    return rekognition.stopStreamProcessor({ Name: streamProcessorName });
}

export async function deleteStreamProcessor(streamProcessorName: string) {
    return rekognition.deleteStreamProcessor({ Name: streamProcessorName });
}