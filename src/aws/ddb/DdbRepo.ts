import { BatchGetItemCommand, BatchWriteItemCommand, CreateTableCommand, DynamoDB, ListTablesCommand, type CreateTableCommandInput } from "@aws-sdk/client-dynamodb";
import { errorReturnUndefined, tagLiterals, warn, type Optional } from "@rsc-utils/core-utils";
import type { VALID_URL } from "../../url/types.js";
import type { AwsRegion } from "../AwsRegion.js";
import type { DdbClientConfig } from "./DdbClientConfig.js";
import { DdbTable } from "./DdbTable.js";
import { deserializeObject } from "./internal/deserialize.js";
import { serialize } from "./internal/serialize.js";
import { splitIntoBatches } from "./internal/splitIntoBatches.js";
import { resolveId, type BatchDeleteResults, type BatchGetRequestItems, type BatchGetResults, type BatchWriteRequestItems, type BatchWriteResults, type IdResolvable, type RepoId, type RepoItem, type TableNameParser, type UnprocessedItem } from "./types.js";

/*
 * 400 KB max json size in DDB
 */


type DDbRepoOptions = {
	batchGetMaxItemCount?: number;
	batchPutMaxItemCount?: number;
	itemToTableName?: TableNameParser;
};

export class DdbRepo<
	Id extends RepoId = RepoId,
	Item extends RepoItem<Id> = RepoItem<Id>,
> {
	public readonly batchGetMaxItemCount: number;
	public readonly batchPutMaxItemCount: number;
	public readonly itemToTableName: TableNameParser<Id, RepoItem<Id>>;

	public constructor(public config: DdbClientConfig, options?: DDbRepoOptions) {
		const batchGetMaxItemCount = options?.batchGetMaxItemCount ?? DdbRepo.BatchGetMaxItemCount;
		this.batchGetMaxItemCount = Math.max(0, Math.min(batchGetMaxItemCount, DdbRepo.BatchGetMaxItemCount));

		const batchPutMaxItemCount = options?.batchPutMaxItemCount ?? DdbRepo.BatchPutMaxItemCount
		this.batchPutMaxItemCount = Math.max(0, Math.min(batchPutMaxItemCount, DdbRepo.BatchPutMaxItemCount));

		this.itemToTableName = options?.itemToTableName ?? DdbRepo.ItemToTableName;
	}

	public async createTable(createTableArgs: CreateTableCommandInput): Promise<boolean> {
		const command = new CreateTableCommand(createTableArgs);
		const response = await this.getClient().send(command).catch(errorReturnUndefined);
		return response?.TableDescription?.TableName === createTableArgs.TableName;
	}

	private client?: DynamoDB;
	public getClient(): DynamoDB {
		return this.client ??= DdbRepo.getClient(this.config);
	}

	public destroy(): void {
		this.client?.destroy();
		delete this.client;
	}

	/**
	 * Attempts to delete all the given items from their appropriate tables.
	 */
	public async deleteAll(keys: Optional<Item>[]): Promise<BatchDeleteResults<Id>>;
	public async deleteAll(keys: Optional<IdResolvable>[], tableName: string): Promise<BatchDeleteResults<Id>>;
	public async deleteAll(keys: Optional<IdResolvable<Id>>[], ddbTableName?: string): Promise<BatchDeleteResults<Id>> {
		let errorCount = 0;

		const unprocessed: UnprocessedItem<Id>[] = [];

		const client = this.getClient();

		const itemToTableName = ddbTableName
			? () => ddbTableName
			: this.itemToTableName as (key: Optional<IdResolvable<Id>>) => string;

		const batches = splitIntoBatches(keys, this.batchPutMaxItemCount);

		for (const batch of batches) {
			const RequestItems: BatchWriteRequestItems = { };

			for (const key of batch) {
				/** @todo why am i allowing keys/ids to be optional ? */
				const id = typeof(key) === "string" ? key : key?.id;
				if (id) {

					const keyTableName = itemToTableName(key);
					const tableItems = RequestItems[keyTableName] ??= [];

					tableItems.push({ DeleteRequest:{ Key:{ id:serialize(id) } } });

				}else {
					warn(tagLiterals`Invalid Value: DdbRepo.deleteAll(${key})`);
				}
			}

			const command = new BatchWriteItemCommand({ RequestItems });
			const response = await client.send(command).catch(errorReturnUndefined);

			if (response?.$metadata.httpStatusCode !== 200) {
				errorCount++;
			}

			if (response?.UnprocessedItems) {

				Object.entries(response.UnprocessedItems).forEach(([tableName, writeRequests]) => {
					writeRequests.forEach(({ DeleteRequest }) => {
						const id = deserializeObject<Item>(DeleteRequest?.Key!).id;
						unprocessed.push({ id, tableName });
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

	/**
	 * Uses BatchGetItemCommand to retrieve the items for all the given keys.
	 * If needed, multiple batches will be used.
	 * The fetched results are sorted and returned in the order their keys were given.
	 * Any keys that didnt't get a results are returned as undefined.
	 */
	public async getAll(keys: Optional<Item>[]): Promise<BatchGetResults<Item>>;
	public async getAll(keys: Optional<IdResolvable>[], tableName: string): Promise<BatchGetResults<Item>>;
	public async getAll(keys: Optional<IdResolvable>[], ddbTableName?: string): Promise<BatchGetResults<Item>> {
		let errorCount = 0;

		const values: (Item | undefined)[] = [];

		const client = this.getClient();

		const itemToTableName = ddbTableName
			? () => ddbTableName
			: this.itemToTableName as (key: Optional<IdResolvable>) => string;

		const batches = splitIntoBatches(keys, this.batchGetMaxItemCount);

		for (const batch of batches) {
			const RequestItems: BatchGetRequestItems = { };

			for (const key of batch) {
				/** @todo why am i allowing keys/ids to be optional ? */
				const id = resolveId(key);
				if (id) {

					const keyTableName = itemToTableName(key);
					const keyItem = RequestItems[keyTableName] ??= { Keys:[] };

					keyItem.Keys.push({ id:serialize(id) });

				}else {
					warn(tagLiterals`Invalid Value: DdbRepo.getAll(${key})`);
				}
			}

			const command = new BatchGetItemCommand({ RequestItems });
			const response = await client.send(command).catch(errorReturnUndefined);

			if (response?.$metadata.httpStatusCode !== 200) {
				errorCount++;
			}

			if (response?.Responses) {

				const itemMap = new Map<string, (Item | undefined)[]>();
				Object.entries(response.Responses).forEach(([tableName, serialized]) => {
					itemMap.set(tableName, serialized.map(deserializeObject) as Item[]);
				});

				// return the items in the order in which they were requested
				batch.forEach(key => {
					let item: Item | undefined;
					const id = resolveId(key);
					if (id) {
						const tableName = itemToTableName(key);
						item = itemMap.get(tableName)?.find(item => resolveId(item) === id);
					}
					values.push(item);
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

	public for<
		Id extends RepoId = RepoId,
		Item extends RepoItem<Id> = RepoItem<Id>
	>(
		tableName: string
	): DdbTable<Id, Item> {
		return new DdbTable(this as DdbRepo<any>, tableName);
	}

	/**
	 * Uses BatchWriteItemCommand to save all the given items.
	 * If needed, multiple batches will be used.
	 * Only unprocessed items are returned.
	 */
	public async saveAll(items: Item[], tableName?: string): Promise<BatchWriteResults<Item>>;
	public async saveAll(items: Item[], ddbTableName?: string): Promise<BatchWriteResults<Item>> {
		let errorCount = 0;

		const unprocessed: Item[] = [];

		const client = this.getClient();

		const itemToTableName = ddbTableName
			? () => ddbTableName
			: this.itemToTableName;

		const batches = splitIntoBatches(items, this.batchPutMaxItemCount);

		for (const batch of batches) {
			const RequestItems: BatchWriteRequestItems = { };

			for (const item of batch) {

				const tableName = itemToTableName(item);
				const tableItems = RequestItems[tableName] ??= [];

				tableItems.push({ PutRequest:{ Item:serialize(item).M! } });

			}

			const command = new BatchWriteItemCommand({ RequestItems });
			const response = await client.send(command).catch(errorReturnUndefined);

			if (response?.$metadata.httpStatusCode !== 200) {
				errorCount++;
			}

			if (response?.UnprocessedItems) {

				Object.values(response.UnprocessedItems).forEach(writeRequests => {
					writeRequests.forEach(({ PutRequest }) => {
						const item = deserializeObject<Item>(PutRequest!.Item!);
						unprocessed.push(item);
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
			partial: unprocessedCount > 0 && unprocessedCount < items.length
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

	public static readonly BatchGetMaxItemCount = 100;
	public static readonly BatchPutMaxItemCount = 25;
	public static readonly MaxItemByteSize = 400 * 1024;
	public static readonly ItemToTableName = (item: RepoItem) => item.objectType.toLowerCase() + "s";
}
