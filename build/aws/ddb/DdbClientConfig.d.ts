import type { VALID_URL } from "../../url/types.js";
import { type AwsRegion } from "../AwsRegion.js";
export type DdbClientConfig = {
    /** "ddbAccessKeyId":"" */
    accessKeyId: string;
    /** "ddbEndpoint":"" */
    endpoint: VALID_URL;
    /** "ddbRegion":"" */
    region: AwsRegion;
    /** "ddbSecretAccessKey":"" */
    secretAccessKey: string;
};
export declare function isDdbClientConfig(config: unknown): config is DdbClientConfig;
