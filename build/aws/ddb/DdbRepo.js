import { BatchGetItemCommand, BatchWriteItemCommand, CreateTableCommand, DynamoDB, ListTablesCommand } from "@aws-sdk/client-dynamodb";
import { errorReturnUndefined, tagLiterals, warn } from "@rsc-utils/core-utils";
import { DdbTable } from "./DdbTable.js";
import { deserializeObject } from "./internal/deserialize.js";
import { serialize } from "./internal/serialize.js";
import { splitIntoBatches } from "./internal/splitIntoBatches.js";
import { resolveId } from "./types.js";
export class DdbRepo {
    config;
    batchGetMaxItemCount;
    batchPutMaxItemCount;
    itemToTableName;
    constructor(config, options) {
        this.config = config;
        const batchGetMaxItemCount = options?.batchGetMaxItemCount ?? DdbRepo.BatchGetMaxItemCount;
        this.batchGetMaxItemCount = Math.max(0, Math.min(batchGetMaxItemCount, DdbRepo.BatchGetMaxItemCount));
        const batchPutMaxItemCount = options?.batchPutMaxItemCount ?? DdbRepo.BatchPutMaxItemCount;
        this.batchPutMaxItemCount = Math.max(0, Math.min(batchPutMaxItemCount, DdbRepo.BatchPutMaxItemCount));
        this.itemToTableName = options?.itemToTableName ?? DdbRepo.ItemToTableName;
    }
    async createTable(createTableArgs) {
        const command = new CreateTableCommand(createTableArgs);
        const response = await this.getClient().send(command).catch(errorReturnUndefined);
        return response?.TableDescription?.TableName === createTableArgs.TableName;
    }
    client;
    getClient() {
        return this.client ??= DdbRepo.getClient(this.config);
    }
    destroy() {
        this.client?.destroy();
        delete this.client;
    }
    async deleteAll(keys, ddbTableName) {
        let errorCount = 0;
        const unprocessed = [];
        const client = this.getClient();
        const itemToTableName = ddbTableName
            ? () => ddbTableName
            : this.itemToTableName;
        const batches = splitIntoBatches(keys, this.batchPutMaxItemCount);
        for (const batch of batches) {
            const RequestItems = {};
            for (const key of batch) {
                const id = typeof (key) === "string" ? key : key?.id;
                if (id) {
                    const keyTableName = itemToTableName(key);
                    const tableItems = RequestItems[keyTableName] ??= [];
                    tableItems.push({ DeleteRequest: { Key: { id: serialize(id) } } });
                }
                else {
                    warn(tagLiterals `Invalid Value: DdbRepo.deleteAll(${key})`);
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
                        const id = deserializeObject(DeleteRequest?.Key).id;
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
    async getAll(keys, ddbTableName) {
        let errorCount = 0;
        const values = [];
        const client = this.getClient();
        const itemToTableName = ddbTableName
            ? () => ddbTableName
            : this.itemToTableName;
        const batches = splitIntoBatches(keys, this.batchGetMaxItemCount);
        for (const batch of batches) {
            const RequestItems = {};
            for (const key of batch) {
                const id = resolveId(key);
                if (id) {
                    const keyTableName = itemToTableName(key);
                    const keyItem = RequestItems[keyTableName] ??= { Keys: [] };
                    keyItem.Keys.push({ id: serialize(id) });
                }
                else {
                    warn(tagLiterals `Invalid Value: DdbRepo.getAll(${key})`);
                }
            }
            const command = new BatchGetItemCommand({ RequestItems });
            const response = await client.send(command).catch(errorReturnUndefined);
            if (response?.$metadata.httpStatusCode !== 200) {
                errorCount++;
            }
            if (response?.Responses) {
                const itemMap = new Map();
                Object.entries(response.Responses).forEach(([tableName, serialized]) => {
                    itemMap.set(tableName, serialized.map(deserializeObject));
                });
                batch.forEach(key => {
                    let item;
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
    async getTableNames() {
        const command = new ListTablesCommand({});
        const response = await this.getClient().send(command);
        return response?.TableNames;
    }
    for(tableName) {
        return new DdbTable(this, tableName);
    }
    async saveAll(items, ddbTableName) {
        let errorCount = 0;
        const unprocessed = [];
        const client = this.getClient();
        const itemToTableName = ddbTableName
            ? () => ddbTableName
            : this.itemToTableName;
        const batches = splitIntoBatches(items, this.batchPutMaxItemCount);
        for (const batch of batches) {
            const RequestItems = {};
            for (const item of batch) {
                const tableName = itemToTableName(item);
                const tableItems = RequestItems[tableName] ??= [];
                tableItems.push({ PutRequest: { Item: serialize(item).M } });
            }
            const command = new BatchWriteItemCommand({ RequestItems });
            const response = await client.send(command).catch(errorReturnUndefined);
            if (response?.$metadata.httpStatusCode !== 200) {
                errorCount++;
            }
            if (response?.UnprocessedItems) {
                Object.values(response.UnprocessedItems).forEach(writeRequests => {
                    writeRequests.forEach(({ PutRequest }) => {
                        const item = deserializeObject(PutRequest.Item);
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
    static BatchGetMaxItemCount = 100;
    static BatchPutMaxItemCount = 25;
    static MaxItemByteSize = 400 * 1024;
    static ItemToTableName = (item) => item.objectType.toLowerCase() + "s";
}
