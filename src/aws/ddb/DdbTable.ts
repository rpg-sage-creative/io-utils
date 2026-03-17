import { CreateTableCommand, DeleteItemCommand, DeleteTableCommand, GetItemCommand, PutItemCommand, type ScanCommandInput, type ScanCommandOutput } from "@aws-sdk/client-dynamodb";
import { errorReturnUndefined, type Awaitable, type Optional, type Snowflake, type UUID } from "@rsc-utils/core-utils";
import { DdbRepo } from "./DdbRepo.js";
import { deserializeObject } from "./internal/deserialize.js";
import { serialize } from "./internal/serialize.js";

type RepoId = Snowflake | UUID;

type RepoItem<Id extends RepoId = Snowflake> = { id:Id; objectType:string; };

export class DdbTable<Id extends RepoId = Snowflake, Item extends RepoItem<Id> = RepoItem<Id>> {
	public constructor(public repo: DdbRepo, public tableName: string) { }

	/** deletes the item in the table for the given id */
	public async deleteById(id: Optional<Id>): Promise<boolean> {
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

	/** @deprecated drops the table if it exists ... DEBUG / TEST ONLY */
	public async drop(): Promise<boolean> {
		const TableName = await this.getCasedTableName();
		if (TableName) {
			const command = new DeleteTableCommand({ TableName });
			const response = await this.repo.getClient().send(command);//.catch(errorReturnUndefined);
			return response.$metadata.httpStatusCode === 200;
		}
		return false;
	}

	/** @deprecated ensures the table exists ... DEBUG / TEST ONLY */
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

	public async forEachAsync<T>(callbackfn: (value: T, index: number, array: T[]) => Awaitable<void>, thisArg?: any): Promise<void> {
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
	public async getById(id: Optional<Id>): Promise<Item | undefined> {
		if (id) {
			const command = new GetItemCommand({
				TableName: this.tableName,
				Key: { id: serialize(id) }
			});

			const response = await this.repo.getClient().send(command).catch(errorReturnUndefined);
			if (response?.Item) {
				return deserializeObject(response.Item);
			}
		}

		return undefined;
	}

	/** returns the items in the table for the given ids */
	public async getByIds(ids: Optional<Id>[]): Promise<(Item | undefined)[]> {
		const keys = ids.map(id => id ? ({ id, objectType:this.tableName }) : undefined);
		const results = await this.repo.getBy<Id>(keys);
		return results.values as (Item | undefined)[];
	}

	/** checks the ddb table names to get correctly cased table name for this table */
	protected async getCasedTableName(): Promise<string | undefined> {
		const lower = this.tableName.toLowerCase();
		const tableNames = await this.repo.getTableNames();
		return tableNames?.find(name => name.toLowerCase() === lower);
	}

	public async save(value: Optional<Item>): Promise<boolean> {
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

}