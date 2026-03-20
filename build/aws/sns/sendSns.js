import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";
import { warnReturnUndefined } from "@rsc-utils/core-utils";
export async function sendSns({ clientConfig, content, subject }) {
    const { topicArn, region, ...credentials } = clientConfig;
    const snsClient = new SNSClient({
        region,
        credentials
    });
    const command = new PublishCommand({
        Subject: subject,
        Message: content,
        TopicArn: topicArn
    });
    const response = await snsClient.send(command).catch(warnReturnUndefined);
    return response?.$metadata.httpStatusCode === 200;
}
