import { CreateTableCommand, DeleteItemCommand, DeleteTableCommand, GetItemCommand, PutItemCommand, type ScanCommandInput, type ScanCommandOutput } from "@aws-sdk/client-dynamodb";
import { errorReturnUndefined, type Awaitable, type Optional } from "@rsc-utils/core-utils";
import { DdbRepo } from "./DdbRepo.js";
import { deserializeObject } from "./internal/deserialize.js";
import { serialize } from "./internal/serialize.js";
import { resolveId, type BatchDeleteResults, type BatchWriteResults, type IdResolvable, type RepoId, type RepoItem } from "./types.js";

export class DdbTable<Id extends RepoId = RepoId, Item extends RepoItem<Id> = RepoItem<Id>> {
	public constructor(public repo: DdbRepo, public tableName: string) { }

	/** deletes the item in the table for the given id */
	public async delete(id: Optional<IdResolvable<Id>>): Promise<boolean> {
		id = resolveId(id);
		if (id) {
			const command = new DeleteItemCommand({
				TableName: this.tableName,
				Key: { id: serialize(id) }
			});

			const response = await this.repo.getClient().send(command).catch(errorReturnUndefined);
			return response?.$metadata.httpStatusCode === 200;
		}

		/** @todo throw error? */
		return false;
	}

	public async deleteAll(ids: Optional<IdResolvable<Id>>[]): Promise<BatchDeleteResults<RepoId>> {
		return this.repo.deleteAll(ids as Optional<Id>[], this.tableName);
	}

	/** @deprecated @intrernal drops the table if it exists ... DEBUG / TEST ONLY */
	public async drop(): Promise<boolean> {
		const TableName = await this.getCasedTableName();
		if (TableName) {
			const command = new DeleteTableCommand({ TableName });
			const response = await this.repo.getClient().send(command);//.catch(errorReturnUndefined);
			return response.$metadata.httpStatusCode === 200;
		}
		return false;
	}

	/** @deprecated @intrernal ensures the table exists ... DEBUG / TEST ONLY */
	public async ensure(): Promise<boolean> {
		const existing = await this.getCasedTableName();
		if (!existing) {
			const command = new CreateTableCommand({
				TableName: this.tableName,
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
			const response = await this.repo.getClient().send(command).catch(errorReturnUndefined);
			return response?.TableDescription?.TableName === this.tableName;
		}
		return true;
	}

	/** uses ScanCommandOutput to iterate over every item in the table */
	public async forEachAsync<T extends Item = Item>(callbackfn: (value: T, index: number, array: T[]) => Awaitable<void>, thisArg?: any): Promise<void> {
		const args: ScanCommandInput = {
			ExclusiveStartKey: undefined,
			TableName: this.tableName,
		};

		let index = -1;
		const array: T[] = [];

		const client = this.repo.getClient();
		let results: ScanCommandOutput | undefined;
		do {

			results = await client.scan(args).catch(errorReturnUndefined);
			if (results?.$metadata.httpStatusCode !== 200) break;

			const items = results.Items ?? [];
			for (const item of items) {
				index++;
				await callbackfn.call(thisArg, deserializeObject(item), index, array);
			}

			args.ExclusiveStartKey = results.LastEvaluatedKey;

		}while(results.LastEvaluatedKey !== undefined);

	}

	/** returns the item in the table for the given id */
	public async get<T extends Item = Item>(id: Optional<Id>): Promise<T | undefined> {
		if (id) {
			const command = new GetItemCommand({
				TableName: this.tableName,
				Key: { id: serialize(id) }
			});

			const client = this.repo.getClient();

			const response = await client.send(command).catch(errorReturnUndefined);

			if (response?.Item) {
				return deserializeObject(response.Item);
			}
		}

		return undefined;
	}

	/** returns the items in the table for the given ids */
	public async getAll<T extends Item = Item>(ids: Optional<Id>[]): Promise<(T | undefined)[]> {
		const results = await this.repo.getAll(ids, this.tableName);
		return results.values as T[];
	}

	/** checks the ddb table names to get correctly cased table name for this table */
	protected async getCasedTableName(): Promise<string | undefined> {
		const lower = this.tableName.toLowerCase();
		const tableNames = await this.repo.getTableNames();
		return tableNames?.find(name => name.toLowerCase() === lower);
	}

	/** saves the item given to the table */
	public async save<T extends Item = Item>(value: Optional<T>): Promise<boolean> {
		if (value?.id) {
			const command = new PutItemCommand({
				TableName: this.tableName,
				Item: serialize(value as object).M
			});

			const response = await this.repo.getClient().send(command).catch(errorReturnUndefined);
			return response?.$metadata.httpStatusCode === 200;
		}

		/** @todo throw error? */
		return false;
	}

	/** saves all the items given to the table */
	public async saveAll<T extends Item = Item>(values: T[]): Promise<BatchWriteResults<T>> {
		return this.repo.saveAll(values, this.tableName) as Promise<BatchWriteResults<T>>;
	}
}