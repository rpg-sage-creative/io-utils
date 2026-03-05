import { type AwsRegion } from "../AwsRegion.js";
export type SnsClientConfig = {
    /** "snsAccessKeyId":"" */
    accessKeyId: string;
    /** "snsRegion":"" */
    region: AwsRegion;
    /** "snsSecretAccessKey":"" */
    secretAccessKey: string;
    /** "snsTopicArn":"" */
    topicArn: string;
};
export declare function isSnsClientConfig(config: unknown): config is SnsClientConfig;
