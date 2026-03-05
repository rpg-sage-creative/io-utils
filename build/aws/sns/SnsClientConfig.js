import { isAwsRegion } from "../AwsRegion.js";
export function isSnsClientConfig(config) {
    return typeof (config) === "object" && config !== null
        && "accessKeyId" in config && typeof (config.accessKeyId) === "string"
        && "region" in config && isAwsRegion(config.region)
        && "secretAccessKey" in config && typeof (config.secretAccessKey) === "string"
        && "topicArn" in config && typeof (config.topicArn) === "string";
}
