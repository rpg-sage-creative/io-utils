import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";
import { warnReturnUndefined } from "@rsc-utils/core-utils";
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
export async function sendSns({ content, subject, snsInfo }: Args): Promise<boolean> {
	const { accessKeyId, secretAccessKey, topicArn, region } = snsInfo;

	const email = new PublishCommand({
		Subject: subject,
		Message: content,
		TopicArn: topicArn
	});

	const sesClient = new SNSClient({ region, credentials:{ accessKeyId, secretAccessKey } });
	const results = await sesClient.send(email).catch(warnReturnUndefined);
	return results?.$metadata.httpStatusCode === 200;
}