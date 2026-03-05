import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";
import { warnReturnUndefined } from "@rsc-utils/core-utils";
export async function sendSns({ content, subject, snsInfo }) {
    const { accessKeyId, secretAccessKey, topicArn, region } = snsInfo;
    const email = new PublishCommand({
        Subject: subject,
        Message: content,
        TopicArn: topicArn
    });
    const sesClient = new SNSClient({ region, credentials: { accessKeyId, secretAccessKey } });
    const results = await sesClient.send(email).catch(warnReturnUndefined);
    return results?.$metadata.httpStatusCode === 200;
}
