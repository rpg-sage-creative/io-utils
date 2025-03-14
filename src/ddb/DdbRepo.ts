import { AttributeValue, BatchGetItemCommand, CreateTableCommand, DeleteItemCommand, DeleteTableCommand, DynamoDB, GetItemCommand, ListTablesCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { errorReturnUndefined } from "@rsc-utils/core-utils";
import { deserializeObject } from "./internal/deserialize.js";
import { serialize } from "./internal/serialize.js";

export class DdbRepo {
	public constructor(public tableName: string) { }

	public async getById<T>(id: string | number): Promise<T | undefined> {
		if (!id) {
			return undefined;
		}
		const command = new GetItemCommand({
			TableName: this.tableName,
			Key: { id: serialize(id) }
		});
		const response = await DdbRepo.getClient().send(command).catch(errorReturnUndefined);
		if (response?.Item) {
			return deserializeObject(response.Item);
		}
		return undefined;
	}

	public async getByIds<T>(...ids: (string | number)[]): Promise<T[]> {
		// make by hand to use this.tableName
		const RequestItems: { [key: string]: { Keys:{ id:AttributeValue; }[] }} = { };
		RequestItems[this.tableName] = { Keys: ids.map(id => ({ id:serialize(id) })) };

		const command = new BatchGetItemCommand({ RequestItems });
		const response = await DdbRepo.getClient().send(command).catch(errorReturnUndefined);
		if (response?.Responses) {
			return response.Responses[this.tableName].map(deserializeObject) as T[];
		}
		return [];
	}

	public async deleteById(id: string | number): Promise<boolean> {
		const command = new DeleteItemCommand({
			TableName: this.tableName,
			Key: { id: serialize(id) }
		});
		const response = await DdbRepo.getClient().send(command).catch(errorReturnUndefined);
		return response?.$metadata.httpStatusCode === 200;
	}

	public async save<T>(value: T): Promise<boolean> {
		const command = new PutItemCommand({
			TableName: this.tableName,
			Item: serialize(value as object).M
		});
		const response = await DdbRepo.getClient().send(command).catch(errorReturnUndefined);
		return response?.$metadata.httpStatusCode === 200;
	}

	public static async testConnection(client = DdbRepo.getClient()): Promise<boolean> {
		const command = new ListTablesCommand({});
		const response = await client.send(command).catch(() => undefined);
		return response !== undefined;
	}

	protected static getClient(): DynamoDB {
		return new DynamoDB({
			credentials: {
				accessKeyId: "ACCESSKEYID",
				secretAccessKey: "SECRETACCESSKEY",
			},
			endpoint: "http://localhost:8000",
			region: "local",
			// region: "us-west-1",
		});
	}

	/** ensures the table exists ... DEBUG / TEST ONLY */
	public static async for(tableName: string): Promise<DdbRepo> {
		const client = DdbRepo.getClient();
		const command = new ListTablesCommand({});
		const response = await client.send(command);//.catch(errorReturnUndefined);
		const tester = new RegExp(`^${tableName}$`, "i");
		const exists = response?.TableNames?.some(name => tester.test(name));
		if (!exists) {
			const command = new CreateTableCommand({
				TableName: tableName,
				AttributeDefinitions: [
					{ AttributeName:"id", AttributeType:"S" }
				],
				KeySchema: [
					{ AttributeName:"id", KeyType:"HASH" }
				],
				ProvisionedThroughput: {
					ReadCapacityUnits: 5,
					WriteCapacityUnits: 5
				}
			});
			await client.send(command);//.catch(errorReturnUndefined);
		}
		return new DdbRepo(tableName);
	}

	/** drops the table if it exists ... DEBUG / TEST ONLY */
	public static async drop(tableName: string): Promise<boolean> {
		const client = DdbRepo.getClient();
		const command = new ListTablesCommand({});
		const response = await client.send(command);//.catch(errorReturnUndefined);
		const tester = new RegExp(`^${tableName}$`, "i");
		const TableName = response?.TableNames?.find(name => tester.test(name));
		if (TableName) {
			const command = new DeleteTableCommand({ TableName });
			const response = await client.send(command);//.catch(errorReturnUndefined);
			return response.$metadata.httpStatusCode === 200;
		}
		return false;
	}
}