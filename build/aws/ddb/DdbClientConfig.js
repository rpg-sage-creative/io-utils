import { isUrl } from "../../url/isUrl.js";
import { isAwsRegion } from "../AwsRegion.js";
export function isDdbClientConfig(config) {
    return typeof (config) === "object" && config !== null
        && "accessKeyId" in config && typeof (config.accessKeyId) === "string"
        && "endpoint" in config && isUrl(config.endpoint)
        && "region" in config && isAwsRegion(config.region)
        && "secretAccessKey" in config && typeof (config.secretAccessKey) === "string";
}
