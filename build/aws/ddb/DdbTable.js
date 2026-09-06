import { DeleteItemCommand, GetItemCommand, PutItemCommand, QueryCommand } from "@aws-sdk/client-dynamodb";
import { errorReturnUndefined } from "@rsc-utils/core-utils";
import { DdbRepo } from "./DdbRepo.js";
import { deserializeObject } from "./internal/deserialize.js";
import { processInBatches } from "./internal/processInBatches.js";
import { serialize } from "./internal/serialize.js";
export class DdbTable {
    repo;
    objectType;
    tableName;
    constructor(repo, objectType) {
        this.repo = repo;
        this.objectType = objectType;
        this.tableName = repo.tableNameParser(objectType);
    }
    /** used by .forEachAsync and .query */
    createQueryCommandInput() {
        return {
            TableName: this.tableName,
            KeyConditionExpression: "#objectType = :objectType",
            ExpressionAttributeNames: {
                "#objectType": "objectType",
            },
            ExpressionAttributeValues: {
                ":objectType": serialize(this.objectType),
            },
        };
    }
    async delete(idOrIds, returnOutput) {
        if (!idOrIds)
            return false;
        if (Array.isArray(idOrIds)) {
            const keys = idOrIds.map(id => ({ id, objectType: this.objectType }));
            const response = await processInBatches(this.repo, "Delete", keys);
            return returnOutput
                ? response
                : response.success;
        }
        const command = new DeleteItemCommand({
            TableName: this.tableName,
            Key: {
                id: serialize(idOrIds),
                objectType: serialize(this.objectType),
            },
        });
        const response = await this.send(command).catch(errorReturnUndefined);
        return response?.$metadata.httpStatusCode === 200;
    }
    async drop(returnOutput) {
        return this.repo.dropTable(this.tableName, returnOutput);
    }
    async ensure(returnOutput) {
        const exists = await this.exists();
        if (!exists) {
            const createTableArgs = DdbRepo.getCreateTableInput(this.tableName);
            const updateTableArgs = DdbRepo.getUpdateTimeToLiveInput(this.tableName);
            return this.repo.createTable(createTableArgs, updateTableArgs, returnOutput);
        }
        return true;
    }
    async exists() {
        const tableNames = await this.repo.getTableNames();
        return tableNames?.includes(this.tableName);
    }
    /**
     * Queries the table for objects with matching objectType and iterates them.
     * callbackfn array will always be an empty array.
     *
     * @param callbackfn
     * @param thisArg
     * @returns
     */
    async forEachAsync(callbackfn, thisArg) {
        const input = this.createQueryCommandInput();
        let index = -1;
        const array = [];
        const client = this.repo.getClient();
        let results;
        do {
            // store anything we catch
            let err;
            results = await client.query(input)
                .catch(reason => { err = reason; return undefined; });
            // let the calling function know that something went wrong and we didn't iterate every item
            if (err || results?.$metadata.httpStatusCode !== 200) {
                return Promise.reject(err ?? results?.$metadata.httpStatusCode);
            }
            const items = results.Items ?? [];
            for (const item of items) {
                index++;
                // this call could throw an exception
                // because it isn't our code, we are ignoring it so they have to deal with it
                await callbackfn.call(thisArg, deserializeObject(item), index, array);
            }
            input.ExclusiveStartKey = results.LastEvaluatedKey;
        } while (results.LastEvaluatedKey !== undefined);
    }
    async get(idOrIds) {
        // a single undefined id
        if (!idOrIds)
            return undefined;
        // process the array through DdbRepo's batch logic
        if (Array.isArray(idOrIds)) {
            const keys = idOrIds.map(id => ({ id, objectType: this.objectType }));
            const response = await processInBatches(this.repo, "Get", keys);
            return response.items;
        }
        // process a single id with a GetItemCommand
        const command = new GetItemCommand({
            TableName: this.tableName,
            Key: {
                id: serialize(idOrIds),
                objectType: serialize(this.objectType),
            },
        });
        const response = await this.send(command).catch(errorReturnUndefined);
        if (response?.Item) {
            return deserializeObject(response.Item);
        }
        return undefined;
    }
    /** returns all the items in the table */
    async getAll() {
        return this.query({});
    }
    /** A prebuilt query conmand that returns all table items of the objecttype that match the given filter arguments (archived/relatedId) */
    async query({ archived, relatedId }) {
        //#region create input
        const input = this.createQueryCommandInput();
        const expressions = [];
        if (typeof (archived) === "boolean") {
            input.ExpressionAttributeNames["#archivedTs"] = "archivedTs";
            input.ExpressionAttributeValues[":archivedTs_value"] = serialize(0);
            if (archived) {
                input.ExpressionAttributeValues[":archivedTs_type"] = "N";
                expressions.push(`(attribute_exists(#archivedTs) AND attribute_type(#archivedTs, :archivedTs_type) AND #archivedTs > :archivedTs_value)`);
            }
            else {
                input.ExpressionAttributeValues[":archivedTs_type"] = "NULL";
                expressions.push(`(attribute_not_exists(#archivedTs) OR attribute_type(#archivedTs, :archivedTs_type) OR #archivedTs = :archivedTs_value)`);
            }
        }
        if (relatedId) {
            input.ExpressionAttributeNames["#relatedIds"] = "relatedIds";
            input.ExpressionAttributeValues[":relatedId"] = serialize(relatedId);
            expressions.push(`contains(#relatedIds, :relatedId)`);
        }
        input.FilterExpression = expressions.join(" AND ") || undefined;
        //#endregion
        const array = [];
        const client = this.repo.getClient();
        let results;
        do {
            // store anything we catch
            let err;
            results = await client.query(input)
                .catch(reason => { err = reason; return undefined; });
            // let the calling function know that something went wrong and we didn't iterate every item
            if (err || results?.$metadata.httpStatusCode !== 200) {
                return Promise.reject(err ?? results?.$metadata.httpStatusCode);
            }
            results.Items?.forEach(item => array.push(deserializeObject(item)));
            input.ExclusiveStartKey = results.LastEvaluatedKey;
        } while (results.LastEvaluatedKey !== undefined);
        return array;
    }
    async save(valueOrValues, returnOutput) {
        if (!valueOrValues)
            return false;
        if (Array.isArray(valueOrValues)) {
            const response = await processInBatches(this.repo, "Put", valueOrValues);
            return returnOutput
                ? response
                : response.success;
        }
        const command = new PutItemCommand({
            TableName: this.tableName,
            Item: serialize(valueOrValues).M,
        });
        const response = await this.send(command).catch(errorReturnUndefined);
        return response?.$metadata.httpStatusCode === 200;
    }
    async send(cmd) {
        return this.repo.getClient().send(cmd);
    }
}
