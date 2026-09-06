import { CreateTableCommand, DeleteTableCommand, DynamoDB, ListTablesCommand, UpdateTimeToLiveCommand } from "@aws-sdk/client-dynamodb";
import { errorReturnUndefined, noop } from "@rsc-utils/core-utils";
import { DdbTable } from "./DdbTable.js";
import { deserializeObject } from "./internal/deserialize.js";
import { processInBatches } from "./internal/processInBatches.js";
export class DdbRepo {
    config;
    client;
    batchGetMaxItemCount;
    batchPutMaxItemCount;
    tableNameParser;
    constructor(config, options) {
        this.config = config;
        const batchGetMaxItemCount = options?.batchGetMaxItemCount ?? DdbRepo.BatchGetMaxItemCount;
        this.batchGetMaxItemCount = Math.max(0, Math.min(batchGetMaxItemCount, DdbRepo.BatchGetMaxItemCount));
        const batchPutMaxItemCount = options?.batchPutMaxItemCount ?? DdbRepo.BatchPutMaxItemCount;
        this.batchPutMaxItemCount = Math.max(0, Math.min(batchPutMaxItemCount, DdbRepo.BatchPutMaxItemCount));
        this.tableNameParser = options?.tableNameParser ?? DdbRepo.TableNameParser;
    }
    async createTable(...args) {
        const createTableArgs = args.shift();
        const returnOutput = args[0] === true ? args.shift() : false;
        const updateTableArgs = args.shift();
        const client = this.getClient();
        const createCommand = new CreateTableCommand(createTableArgs);
        const createOutput = await client.send(createCommand).catch(errorReturnUndefined);
        const created = createOutput?.$metadata.httpStatusCode === 200
            && createOutput?.TableDescription?.TableName === createTableArgs.TableName;
        // failed to create, no need to run update
        if (!created) {
            if (!returnOutput)
                return false;
            if (updateTableArgs) {
                return { create: createOutput };
            }
            return createOutput;
        }
        // no ttl args, no need to run update
        if (!updateTableArgs) {
            return returnOutput
                ? createOutput
                : true;
        }
        const updateCommand = new UpdateTimeToLiveCommand(updateTableArgs);
        const updateOutput = await client.send(updateCommand).catch(errorReturnUndefined);
        const updated = updateOutput?.$metadata.httpStatusCode === 200
            && updateOutput.TimeToLiveSpecification?.AttributeName === updateTableArgs.TimeToLiveSpecification?.AttributeName
            && updateOutput.TimeToLiveSpecification?.Enabled === updateTableArgs.TimeToLiveSpecification?.Enabled;
        return returnOutput
            ? { create: createOutput, update: updateOutput }
            : updated;
    }
    destroy() {
        this.client?.destroy();
        delete this.client;
    }
    async dropTable(tableName, returnOutput) {
        const command = new DeleteTableCommand({ TableName: tableName });
        const promise = this.getClient().send(command);
        if (returnOutput)
            return promise;
        const response = await promise.catch(errorReturnUndefined);
        return response?.$metadata.httpStatusCode === 200;
    }
    /**
     * Attempts to delete all the given items from their appropriate tables.
     */
    async delete(keys) {
        return processInBatches(this, "Delete", keys);
    }
    /**
     * Uses ScanCommandOutput to iterate over every item in the table.
     * callbackfn array will always be an empty array.
     *
     * @param callbackfn
     * @param thisArg
     * @returns
     */
    async forEachAsync(tableName, callbackfn, thisArg) {
        const scanArgs = {
            ExclusiveStartKey: undefined,
            TableName: tableName,
        };
        let index = -1;
        const array = [];
        const client = this.getClient();
        let results;
        do {
            // store anything we catch
            let err;
            results = await client.scan(scanArgs).catch(reason => { err = reason; return undefined; });
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
            scanArgs.ExclusiveStartKey = results.LastEvaluatedKey;
        } while (results.LastEvaluatedKey !== undefined);
    }
    /**
     * Uses BatchGetItemCommand to retrieve the items for all the given keys.
     * If needed, multiple batches will be used.
     * The fetched results are sorted and returned in the order their keys were given.
     * Any keys that didnt't get a results are returned as undefined.
     */
    async get(keys) {
        return processInBatches(this, "Get", keys);
    }
    /** returns all the items in the table */
    async getAll(tableName) {
        const items = [];
        /** @todo optimize this by writing proper code vs piggy-backing on forEachAsync */
        await this.forEachAsync(tableName, item => items.push(item));
        return items;
    }
    getClient() {
        return this.client ??= DdbRepo.getClient(this.config);
    }
    async getTableNames() {
        const command = new ListTablesCommand({});
        const response = await this.getClient().send(command); //.catch(errorReturnUndefined);
        return response?.TableNames;
    }
    for(objectType) {
        return new DdbTable(this, objectType);
    }
    /**
     * Uses BatchWriteItemCommand to save all the given items.
     * If needed, multiple batches will be used.
     * Only unprocessed items are returned.
     */
    async save(items) {
        return processInBatches(this, "Put", items);
    }
    async testConnection() {
        return DdbRepo.testConnection(this.getClient());
    }
    /** Returns a CreateTableCommandInput with the commonly used settings expected for RPG Sage Creative projects. */
    static getCreateTableInput(tableName) {
        return {
            TableName: tableName,
            AttributeDefinitions: [
                { AttributeName: "objectType", AttributeType: "S" },
                { AttributeName: "id", AttributeType: "S" },
            ],
            KeySchema: [
                { AttributeName: "objectType", KeyType: "HASH" },
                { AttributeName: "id", KeyType: "RANGE" },
            ],
            ProvisionedThroughput: {
                ReadCapacityUnits: 1,
                WriteCapacityUnits: 1
            },
            BillingMode: "PAY_PER_REQUEST",
            StreamSpecification: {
                StreamEnabled: false,
            },
        };
    }
    /** Returns a UpdateTimeToLiveCommandInput with the commonly used settings expected for RPG Sage Creative projects. */
    static getUpdateTimeToLiveInput(tableName) {
        return {
            TableName: tableName,
            TimeToLiveSpecification: {
                AttributeName: "expireTs",
                Enabled: true,
            },
        };
    }
    /** Returns a DynamoDb object for the given config. If no config is given, then DdbRepo.LocalstackTestConfig is used. */
    static getClient(config) {
        const { endpoint, region, ...credentials } = config ?? DdbRepo.DdbClientConfig;
        return new DynamoDB({ credentials, endpoint, region });
    }
    /** Tests that a command can be sent successfully. If no client is given, then a client is created using DdbRepo.LocalstackTestConfig */
    static async testConnection(client = DdbRepo.getClient()) {
        const command = new ListTablesCommand({});
        const response = await client.send(command).catch(noop);
        return response !== undefined;
    }
    static BatchGetMaxItemCount = 100;
    static BatchPutMaxItemCount = 25;
    /** Default config to be used by DdbRepo. */
    static DdbClientConfig = {
        accessKeyId: "ACCESSKEYID",
        endpoint: "http://localhost:8000",
        region: "local",
        secretAccessKey: "SECRETACCESSKEY",
    };
    static MaxItemByteSize = 400 * 1024;
    static TableNameParser = (objectType) => objectType.toLowerCase() + "s";
}
