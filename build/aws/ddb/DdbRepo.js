import { BatchGetItemCommand, BatchWriteItemCommand, DynamoDB, ListTablesCommand } from "@aws-sdk/client-dynamodb";
import { errorReturnUndefined, partition, toLiteral, warn } from "@rsc-utils/core-utils";
import { deserializeObject } from "./internal/deserialize.js";
import { serialize } from "./internal/serialize.js";
import { DdbTable } from "./DdbTable.js";
export class DdbRepo {
    config;
    constructor(config) {
        this.config = config;
    }
    client;
    getClient() {
        return this.client ??= DdbRepo.getClient(this.config);
    }
    destroy() {
        this.client?.destroy();
        delete this.client;
    }
    async deleteAll(keys) {
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
            const response = await this.getClient().send(command).catch(errorReturnUndefined);
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
    async getBy(keys) {
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
            const response = await this.getClient().send(command).catch(errorReturnUndefined);
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
    async getTableNames() {
        const command = new ListTablesCommand({});
        const response = await this.getClient().send(command);
        return response?.TableNames;
    }
    for(tableName) {
        return new DdbTable(this, tableName);
    }
    async saveAll(values) {
        let errorCount = 0;
        const unprocessed = [];
        const client = this.getClient();
        const { BatchPutMaxItemCount } = DdbRepo;
        const batches = partition(values, (_, index) => Math.floor(index / BatchPutMaxItemCount));
        for (const batch of batches) {
            const RequestItems = {};
            batch.forEach(value => {
                if (value.id && value.objectType) {
                    const tableItem = RequestItems[value.objectType] ??= [];
                    tableItem.push({ PutRequest: { Item: serialize(value).M } });
                }
                else {
                    warn(`Invalid Value: DdbRepo.saveAll(${toLiteral(value)})`);
                }
            });
            const command = new BatchWriteItemCommand({ RequestItems });
            const response = await client.send(command).catch(errorReturnUndefined);
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
    async testConnection() {
        return DdbRepo.testConnection(this.getClient());
    }
    static async testConnection(client = DdbRepo.getClient()) {
        const command = new ListTablesCommand({});
        const response = await client.send(command).catch(() => undefined);
        return response !== undefined;
    }
    static getClient(config) {
        const { endpoint, region, ...credentials } = config ?? DdbRepo.DdbClientConfig;
        return new DynamoDB({ credentials, endpoint, region });
    }
    static DdbClientConfig = {
        accessKeyId: "ACCESSKEYID",
        endpoint: "http://localhost:8000",
        region: "local",
        secretAccessKey: "SECRETACCESSKEY",
    };
    static async getBy(...keys) {
        keys = keys.flat();
        const ddbRepo = new DdbRepo(DdbRepo.DdbClientConfig);
        const results = await new DdbRepo(DdbRepo.DdbClientConfig).getBy(keys);
        ddbRepo.destroy();
        return results;
    }
    static async deleteAll(...keys) {
        keys = keys.flat();
        const ddbRepo = new DdbRepo(DdbRepo.DdbClientConfig);
        const results = await new DdbRepo(DdbRepo.DdbClientConfig).deleteAll(keys);
        ddbRepo.destroy();
        return results;
    }
    static async saveAll(...values) {
        values = values.flat();
        const ddbRepo = new DdbRepo(DdbRepo.DdbClientConfig);
        const results = await new DdbRepo(DdbRepo.DdbClientConfig).saveAll(values);
        ddbRepo.destroy();
        return results;
    }
    static BatchGetMaxItemCount = 100;
    static BatchPutMaxItemCount = 25;
    static MaxItemByteSize = 400 * 1024;
}
