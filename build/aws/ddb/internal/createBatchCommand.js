import { BatchGetItemCommand, BatchWriteItemCommand } from "@aws-sdk/client-dynamodb";
import { serialize, serializeKey } from "./serialize.js";
export function createBatchCommand(type, keys, tableNameParser) {
    switch (type) {
        case "Delete": return createBatchDeleteCommand(keys, tableNameParser);
        case "Get": return createBatchGetCommand(keys, tableNameParser);
        case "Put": return createBatchPutCommand(keys, tableNameParser);
    }
}
export function createBatchDeleteCommand(keys, tableNameParser) {
    const RequestItems = {};
    for (const item of keys) {
        const tableName = tableNameParser(item.objectType);
        const tableItems = RequestItems[tableName] ??= [];
        tableItems.push({ DeleteRequest: { Key: serializeKey(item) } });
    }
    return new BatchWriteItemCommand({ RequestItems });
}
export function createBatchGetCommand(keys, tableNameParser) {
    const RequestItems = {};
    for (const item of keys) {
        const tableName = tableNameParser(item.objectType);
        const tableItems = RequestItems[tableName] ??= { Keys: [] };
        tableItems.Keys.push(serializeKey(item));
    }
    return new BatchGetItemCommand({ RequestItems });
}
export function createBatchPutCommand(items, tableNameParser) {
    const RequestItems = {};
    for (const item of items) {
        const tableName = tableNameParser(item.objectType);
        const tableItems = RequestItems[tableName] ??= [];
        tableItems.push({ PutRequest: { Item: serialize(item).M } });
    }
    return new BatchWriteItemCommand({ RequestItems });
}
