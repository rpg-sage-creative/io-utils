import type { SnsClientConfig } from "./SnsClientConfig.js";
type Args = {
    clientConfig: SnsClientConfig;
    content: string;
    subject: string;
};
/** If SNS info is found in the env, then the subject/content are sent to SNS. */
export declare function sendSns({ clientConfig, content, subject }: Args): Promise<boolean>;
export {};
