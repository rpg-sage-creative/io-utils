import { BatchGetItemCommand, BatchWriteItemCommand, DynamoDB, ListTablesCommand, type AttributeValue } from "@aws-sdk/client-dynamodb";
import { errorReturnUndefined, partition, toLiteral, warn, type Optional, type Snowflake, type UUID } from "@rsc-utils/core-utils";
import type { VALID_URL } from "../../url/types.js";
import type { AwsRegion } from "../AwsRegion.js";
import type { DdbClientConfig } from "./DdbClientConfig.js";
import { deserializeObject } from "./internal/deserialize.js";
import { serialize } from "./internal/serialize.js";
import { DdbTable } from "./DdbTable.js";

/*
 * 400 KB max json size in DDB
 */

type RepoId = Snowflake | UUID;
type RepoItem<Id extends RepoId = Snowflake> = { id:Id; objectType:string; };
type BatchGetRequestItems = Record<string, { Keys:{ id:AttributeValue; }[] }>;
type BatchWriteRequestItems = Record<string, { PutRequest?:{ Item:Record<string, AttributeValue>; }; DeleteRequest?:{ Key: { id:AttributeValue; }; }; }[]>;

type BatchGetResults<Item extends RepoItem<any>> = {
	batchCount: number;
	errorCount: number;
	values: (Item | undefined)[];
};
type BatchResults<Item extends RepoItem> = {
	batchCount: number;
	errorCount: number;
	unprocessed: Item[];
	success: boolean;
	partial: boolean;
};

export class DdbRepo {
	public constructor(public config: DdbClientConfig) { }

	private client?: DynamoDB;
	public getClient(): DynamoDB {
		return this.client ??= DdbRepo.getClient(this.config);
	}

	public destroy(): void {
		this.client?.destroy();
		delete this.client;
	}

	public async deleteAll(keys: Optional<RepoItem>[]): Promise<BatchResults<RepoItem>> {
		let errorCount = 0;
		const unprocessed: RepoItem[] = [];

		const { BatchPutMaxItemCount } = DdbRepo;
		const batches = partition(keys, (_, index) => Math.floor(index / BatchPutMaxItemCount));
		for (const batch of batches) {
			const RequestItems: BatchWriteRequestItems = { };
			batch.forEach(key => {
				// double check we have a valid id / type
				if (key?.id && key.objectType) {
					const tableItem = RequestItems[key.objectType] ?? (RequestItems[key.objectType] = []);
					tableItem.push({ DeleteRequest:{ Key:{ id:serialize(key.id) } } });
				}else {
					warn(`Invalid Value: DdbRepo.deleteAll(${toLiteral(key)})`);
				}
			});

			const command = new BatchWriteItemCommand({ RequestItems });
			const response = await this.getClient().send(command).catch(errorReturnUndefined);
			if (response?.$metadata.httpStatusCode !== 200) errorCount++; // NOSONAR
			if (response?.UnprocessedItems) {
				Object.keys(response.UnprocessedItems).forEach(objectType => {
					response.UnprocessedItems?.[objectType]?.forEach(({DeleteRequest}) => {
						const id = deserializeObject<RepoItem>(DeleteRequest?.Key!).id;
						unprocessed.push({ id, objectType });
					});
				});
			}
		}

		const unprocessedCount = unprocessed.length;
		return {
			batchCount: batches.length,
			errorCount,
			unprocessed,
			success: errorCount === 0 && unprocessedCount === 0,
			partial: unprocessedCount > 0 && unprocessedCount < keys.length
		};
	}

	public async getBy<Id extends RepoId, Item extends RepoItem<Id> = RepoItem<Id>>(keys: Optional<Item>[]): Promise<BatchGetResults<Item>> {
		let errorCount = 0;

		const values: (Item | undefined)[] = [];

		const { BatchGetMaxItemCount } = DdbRepo;
		const batches = partition(keys, (_, index) => Math.floor(index / BatchGetMaxItemCount));
		for (const batch of batches) {

			// make by hand to use key.objectType as table name
			const RequestItems: BatchGetRequestItems = { };
			batch.forEach(key => {
				// double check we have a valid id
				if (key?.id && key.objectType) {
					const keyItem = RequestItems[key.objectType] ?? (RequestItems[key.objectType] = { Keys:[] });
					keyItem.Keys.push({ id:serialize(key.id) });
				}else {
					warn(`Invalid Key: DdbRepo.getBy(${toLiteral(key)})`);
				}
			});

			// send the request
			const command = new BatchGetItemCommand({ RequestItems });
			const response = await this.getClient().send(command).catch(errorReturnUndefined);
			if (response?.$metadata.httpStatusCode !== 200) errorCount++; // NOSONAR
			if (response?.Responses) {

				// deserialize items
				const batchItems = Object.keys(response.Responses).reduce((map, objectType) => {
					map.set(objectType, response.Responses![objectType]!.map(deserializeObject) as Item[]);
					return map;
				}, new Map<string, (Item | undefined)[]>());

				// return the items in the order in which they were requested
				batch.forEach(key => {
					values.push(key?.id ? batchItems.get(key.objectType)?.find(item => item?.id === key.id) : undefined);
				});
			}
		}

		const batchCount = batches.length;
		return {
			batchCount,
			errorCount,
			values
		};
	}

	public async getTableNames(): Promise<string[] | undefined> {
		const command = new ListTablesCommand({});
		const response = await this.getClient().send(command);//.catch(errorReturnUndefined);
		return response?.TableNames;
	}

	public for(tableName: string): DdbTable {
		return new DdbTable(this, tableName);
	}

	public async saveAll<Item extends RepoItem>(values: Item[]): Promise<BatchResults<Item>> {
		let errorCount = 0;
		const unprocessed: Item[] = [];

		const client = this.getClient();

		const { BatchPutMaxItemCount } = DdbRepo;
		const batches = partition(values, (_, index) => Math.floor(index / BatchPutMaxItemCount));
		for (const batch of batches) {
			const RequestItems: BatchWriteRequestItems = { };
			batch.forEach(value => {
				// double check we have a valid id / type
				if (value.id && value.objectType) {
					const tableItem = RequestItems[value.objectType] ??= [];
					tableItem.push({ PutRequest:{ Item:serialize(value).M! } });
				}else {
					warn(`Invalid Value: DdbRepo.saveAll(${toLiteral(value)})`);
				}
			});

			const command = new BatchWriteItemCommand({ RequestItems });
			const response = await client.send(command).catch(errorReturnUndefined);
			if (response?.$metadata.httpStatusCode !== 200) errorCount++; // NOSONAR
			if (response?.UnprocessedItems) {
				Object.keys(response.UnprocessedItems).forEach(objectType => {
					response.UnprocessedItems?.[objectType]?.forEach(wr => {
						unprocessed.push(deserializeObject<Item>(wr.PutRequest!.Item!));
					});
				});
			}
		}

		const unprocessedCount = unprocessed.length;
		return {
			batchCount: batches.length,
			errorCount,
			unprocessed,
			success: errorCount === 0 && unprocessedCount === 0,
			partial: unprocessedCount > 0 && unprocessedCount < values.length
		};
	}

	public async testConnection(): Promise<boolean> {
		return DdbRepo.testConnection(this.getClient());
	}

	/** Tests that a command can be sent successfully. If no client is given, then a client is created using DdbRepo.LocalstackTestConfig */
	public static async testConnection(client = DdbRepo.getClient()): Promise<boolean> {
		const command = new ListTablesCommand({});
		const response = await client.send(command).catch(() => undefined);
		return response !== undefined;
	}

	/** Returns a DynamoDb object for the given config. If no config is given, then DdbRepo.LocalstackTestConfig is used. */
	public static getClient(config?: DdbClientConfig): DynamoDB {
		const { endpoint, region, ...credentials } = config ?? DdbRepo.DdbClientConfig;
		return new DynamoDB({ credentials, endpoint, region });
	}

	/** Default config to be used by DdbRepo. */
	public static DdbClientConfig: DdbClientConfig = {
		accessKeyId: "ACCESSKEYID",
		endpoint: "http://localhost:8000" as VALID_URL,
		region: "local" as AwsRegion,
		secretAccessKey: "SECRETACCESSKEY",
	};

	/** @deprecated use instance methods */
	public static async getBy<Id extends RepoId, Item extends RepoItem<Id> = RepoItem<Id>>(keys: Optional<Item>[]): Promise<BatchGetResults<Item>>;
	public static async getBy<Id extends RepoId, Item extends RepoItem<Id> = RepoItem<Id>>(...keys: Optional<Item>[]): Promise<BatchGetResults<Item>>;
	public static async getBy<Id extends RepoId, Item extends RepoItem<Id> = RepoItem<Id>>(...keys: Optional<Item>[] | Optional<Item>[][]): Promise<BatchGetResults<Item>> {
		/** @todo remove this when we remove the deprecated signature that spreads the args */
		keys = keys.flat() as Optional<Item>[];
		const ddbRepo = new DdbRepo(DdbRepo.DdbClientConfig);
		const results = await new DdbRepo(DdbRepo.DdbClientConfig).getBy(keys);
		ddbRepo.destroy();
		return results;
	}

	/** @deprecated use instance methods */
	public static async deleteAll(keys: Optional<RepoItem>[]): Promise<BatchResults<RepoItem>>;
	public static async deleteAll(...keys: Optional<RepoItem>[]): Promise<BatchResults<RepoItem>>;
	public static async deleteAll(...keys: Optional<RepoItem>[] | Optional<RepoItem>[][]): Promise<BatchResults<RepoItem>> {
		/** @todo remove this when we remove the deprecated signature that spreads the args */
		keys = keys.flat() as RepoItem[];
		const ddbRepo = new DdbRepo(DdbRepo.DdbClientConfig);
		const results = await new DdbRepo(DdbRepo.DdbClientConfig).deleteAll(keys);
		ddbRepo.destroy();
		return results;
	}

	/** @deprecated use instance methods */
	public static async saveAll<Item extends RepoItem>(values: Item[]): Promise<BatchResults<Item>>;
	public static async saveAll<Item extends RepoItem>(...values: Item[]): Promise<BatchResults<Item>>;
	public static async saveAll<Item extends RepoItem>(...values: Item[] | Item[][]): Promise<BatchResults<Item>> {
		/** @todo remove this when we remove the deprecated signature that spreads the args */
		values = values.flat() as Item[];
		const ddbRepo = new DdbRepo(DdbRepo.DdbClientConfig);
		const results = await new DdbRepo(DdbRepo.DdbClientConfig).saveAll(values);
		ddbRepo.destroy();
		return results;
	}

	public static readonly BatchGetMaxItemCount = 100;
	public static readonly BatchPutMaxItemCount = 25;
	public static readonly MaxItemByteSize = 400 * 1024;
}