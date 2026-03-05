import type { Region } from "../Region.js";
export type SnsInfo = {
    /** "snsAccessKeyId":"" */
    accessKeyId: string;
    /** "snsSecretAccessKey":"" */
    secretAccessKey: string;
    /** "snsTopicArn":"" */
    topicArn: string;
    /** "snsRegion":"" */
    region: Region;
};
type Args = {
    content: string;
    snsInfo: SnsInfo;
    subject: string;
};
/** If SNS info is found in the env, then the subject/content are sent to SNS. */
export declare function sendSns({ content, subject, snsInfo }: Args): Promise<boolean>;
export {};
