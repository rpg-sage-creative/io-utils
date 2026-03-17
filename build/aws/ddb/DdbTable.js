import { CreateTableCommand, DeleteItemCommand, DeleteTableCommand, GetItemCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { errorReturnUndefined } from "@rsc-utils/core-utils";
import { DdbRepo } from "./DdbRepo.js";
import { deserializeObject } from "./internal/deserialize.js";
import { serialize } from "./internal/serialize.js";
export class DdbTable {
    repo;
    tableName;
    constructor(repo, tableName) {
        this.repo = repo;
        this.tableName = tableName;
    }
    async deleteById(id) {
        if (id) {
            const command = new DeleteItemCommand({
                TableName: this.tableName,
                Key: { id: serialize(id) }
            });
            const response = await this.repo.getClient().send(command).catch(errorReturnUndefined);
            return response?.$metadata.httpStatusCode === 200;
        }
        return false;
    }
    async drop() {
        const TableName = await this.getCasedTableName();
        if (TableName) {
            const command = new DeleteTableCommand({ TableName });
            const response = await this.repo.getClient().send(command);
            return response.$metadata.httpStatusCode === 200;
        }
        return false;
    }
    async ensure() {
        const existing = await this.getCasedTableName();
        if (!existing) {
            const command = new CreateTableCommand({
                TableName: this.tableName,
                AttributeDefinitions: [
                    { AttributeName: "id", AttributeType: "S" }
                ],
                KeySchema: [
                    { AttributeName: "id", KeyType: "HASH" }
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
    async forEachAsync(callbackfn, thisArg) {
        const args = {
            ExclusiveStartKey: undefined,
            TableName: this.tableName,
        };
        let index = -1;
        const array = [];
        const client = this.repo.getClient();
        let results;
        do {
            results = await client.scan(args).catch(errorReturnUndefined);
            if (results?.$metadata.httpStatusCode !== 200)
                break;
            const items = results.Items ?? [];
            for (const item of items) {
                index++;
                await callbackfn.call(thisArg, deserializeObject(item), index, array);
            }
            args.ExclusiveStartKey = results.LastEvaluatedKey;
        } while (results.LastEvaluatedKey !== undefined);
    }
    async getById(id) {
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
    async getByIds(ids) {
        const keys = ids.map(id => id ? ({ id, objectType: this.tableName }) : undefined);
        const results = await this.repo.getBy(keys);
        return results.values;
    }
    async getCasedTableName() {
        const lower = this.tableName.toLowerCase();
        const tableNames = await this.repo.getTableNames();
        return tableNames?.find(name => name.toLowerCase() === lower);
    }
    async save(value) {
        if (value?.id) {
            const command = new PutItemCommand({
                TableName: this.tableName,
                Item: serialize(value).M
            });
            const response = await this.repo.getClient().send(command).catch(errorReturnUndefined);
            return response?.$metadata.httpStatusCode === 200;
        }
        return false;
    }
}
