import { AttributeValue, BatchGetItemCommand, BatchWriteItemCommand, CreateTableCommand, DeleteItemCommand, DeleteTableCommand, DynamoDB, GetItemCommand, ListTablesCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { errorReturnUndefined, partition, toLiteral, warn } from "@rsc-utils/core-utils";
import { deserializeObject } from "./internal/deserialize.js";
import { serialize } from "./internal/serialize.js";
export class DdbRepo {
    tableName;
    constructor(tableName) {
        this.tableName = tableName;
    }
    async deleteById(id) {
        if (id) {
            const command = new DeleteItemCommand({
                TableName: this.tableName,
                Key: { id: serialize(id) }
            });
            const response = await DdbRepo.getClient().send(command).catch(errorReturnUndefined);
            return response?.$metadata.httpStatusCode === 200;
        }
        return false;
    }
    async getById(id) {
        if (id) {
            const command = new GetItemCommand({
                TableName: this.tableName,
                Key: { id: serialize(id) }
            });
            const response = await DdbRepo.getClient().send(command).catch(errorReturnUndefined);
            if (response?.Item) {
                return deserializeObject(response.Item);
            }
        }
        return undefined;
    }
    async getByIds(...ids) {
        const keys = ids.map(id => id ? ({ id, objectType: this.tableName }) : undefined);
        const results = await DdbRepo.getBy(...keys);
        return results.values;
    }
    async save(value) {
        if (value?.id) {
            const command = new PutItemCommand({
                TableName: this.tableName,
                Item: serialize(value).M
            });
            const response = await DdbRepo.getClient().send(command).catch(errorReturnUndefined);
            return response?.$metadata.httpStatusCode === 200;
        }
        return false;
    }
    static async testConnection(client = DdbRepo.getClient()) {
        const command = new ListTablesCommand({});
        const response = await client.send(command).catch(() => undefined);
        return response !== undefined;
    }
    static getClient() {
        return new DynamoDB({
            credentials: {
                accessKeyId: "ACCESSKEYID",
                secretAccessKey: "SECRETACCESSKEY",
            },
            endpoint: "http://localhost:8000",
            region: "local",
        });
    }
    static async getBy(...keys) {
        let errorCount = 0;
        const values = [];
        const { BatchGetMaxItemCount } = DdbRepo;
        const batches = partition(keys, (_, index) => Math.floor(index / BatchGetMaxItemCount));
        for (const batch of batches) {
            const RequestItems = {};
            batch.forEach(key => {
                if (key?.id && key.objectType) {
                    const keyItem = RequestItems[key.objectType] ?? (RequestItems[key.objectType] = { Keys: [] });
                    keyItem.Keys.push({ id: serialize(key.id) });
                }
                else {
                    warn(`Invalid Key: DdbRepo.getBy(${toLiteral(key)})`);
                }
            });
            const command = new BatchGetItemCommand({ RequestItems });
            const response = await DdbRepo.getClient().send(command).catch(errorReturnUndefined);
            if (response?.$metadata.httpStatusCode !== 200)
                errorCount++;
            if (response?.Responses) {
                const batchItems = Object.keys(response.Responses).reduce((map, objectType) => {
                    map.set(objectType, response.Responses[objectType].map(deserializeObject));
                    return map;
                }, new Map());
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
    static async deleteAll(...keys) {
        let errorCount = 0;
        const unprocessed = [];
        const { BatchPutMaxItemCount } = DdbRepo;
        const batches = partition(keys, (_, index) => Math.floor(index / BatchPutMaxItemCount));
        for (const batch of batches) {
            const RequestItems = {};
            batch.forEach(key => {
                if (key?.id && key.objectType) {
                    const tableItem = RequestItems[key.objectType] ?? (RequestItems[key.objectType] = []);
                    tableItem.push({ DeleteRequest: { Key: { id: serialize(key.id) } } });
                }
                else {
                    warn(`Invalid Value: DdbRepo.deleteAll(${toLiteral(key)})`);
                }
            });
            const command = new BatchWriteItemCommand({ RequestItems });
            const response = await DdbRepo.getClient().send(command).catch(errorReturnUndefined);
            if (response?.$metadata.httpStatusCode !== 200)
                errorCount++;
            if (response?.UnprocessedItems) {
                Object.keys(response.UnprocessedItems).forEach(objectType => {
                    response.UnprocessedItems?.[objectType]?.forEach(({ DeleteRequest }) => {
                        const id = deserializeObject(DeleteRequest?.Key).id;
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
    static async saveAll(...values) {
        let errorCount = 0;
        const unprocessed = [];
        const { BatchPutMaxItemCount } = DdbRepo;
        const batches = partition(values, (_, index) => Math.floor(index / BatchPutMaxItemCount));
        for (const batch of batches) {
            const RequestItems = {};
            batch.forEach(value => {
                if (value.id && value.objectType) {
                    const tableItem = RequestItems[value.objectType] ?? (RequestItems[value.objectType] = []);
                    tableItem.push({ PutRequest: { Item: serialize(value).M } });
                }
                else {
                    warn(`Invalid Value: DdbRepo.saveAll(${toLiteral(value)})`);
                }
            });
            const command = new BatchWriteItemCommand({ RequestItems });
            const response = await DdbRepo.getClient().send(command).catch(errorReturnUndefined);
            if (response?.$metadata.httpStatusCode !== 200)
                errorCount++;
            if (response?.UnprocessedItems) {
                Object.keys(response.UnprocessedItems).forEach(objectType => {
                    response.UnprocessedItems?.[objectType]?.forEach(wr => {
                        unprocessed.push(deserializeObject(wr.PutRequest.Item));
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
    static async for(tableName) {
        const client = DdbRepo.getClient();
        const command = new ListTablesCommand({});
        const response = await client.send(command);
        const tester = new RegExp(`^${tableName}$`, "i");
        const exists = response?.TableNames?.some(name => tester.test(name));
        if (!exists) {
            const command = new CreateTableCommand({
                TableName: tableName,
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
            await client.send(command);
        }
        return new DdbRepo(tableName);
    }
    static async drop(tableName) {
        const client = DdbRepo.getClient();
        const command = new ListTablesCommand({});
        const response = await client.send(command);
        const tester = new RegExp(`^${tableName}$`, "i");
        const TableName = response?.TableNames?.find(name => tester.test(name));
        if (TableName) {
            const command = new DeleteTableCommand({ TableName });
            const response = await client.send(command);
            return response.$metadata.httpStatusCode === 200;
        }
        return false;
    }
    static BatchGetMaxItemCount = 100;
    static BatchPutMaxItemCount = 25;
    static MaxItemByteSize = 400 * 1024;
}
