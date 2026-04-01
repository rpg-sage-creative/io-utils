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
        if (!created) {
            if (!returnOutput)
                return false;
            if (updateTableArgs) {
                return { create: createOutput };
            }
            return createOutput;
        }
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
    async delete(keys) {
        return processInBatches(this, "Delete", keys);
    }
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
            let err;
            results = await client.scan(scanArgs).catch(reason => { err = reason; return undefined; });
            if (err || results?.$metadata.httpStatusCode !== 200) {
                return Promise.reject(err ?? results?.$metadata.httpStatusCode);
            }
            const items = results.Items ?? [];
            for (const item of items) {
                index++;
                await callbackfn.call(thisArg, deserializeObject(item), index, array);
            }
            scanArgs.ExclusiveStartKey = results.LastEvaluatedKey;
        } while (results.LastEvaluatedKey !== undefined);
    }
    async get(keys) {
        return processInBatches(this, "Get", keys);
    }
    async getAll(tableName) {
        const items = [];
        await this.forEachAsync(tableName, item => items.push(item));
        return items;
    }
    getClient() {
        return this.client ??= DdbRepo.getClient(this.config);
    }
    async getTableNames() {
        const command = new ListTablesCommand({});
        const response = await this.getClient().send(command);
        return response?.TableNames;
    }
    for(objectType) {
        return new DdbTable(this, objectType);
    }
    async save(items) {
        return processInBatches(this, "Put", items);
    }
    async testConnection() {
        return DdbRepo.testConnection(this.getClient());
    }
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
    static getUpdateTimeToLiveInput(tableName) {
        return {
            TableName: tableName,
            TimeToLiveSpecification: {
                AttributeName: "expireTs",
                Enabled: true,
            },
        };
    }
    static getClient(config) {
        const { endpoint, region, ...credentials } = config ?? DdbRepo.DdbClientConfig;
        return new DynamoDB({ credentials, endpoint, region });
    }
    static async testConnection(client = DdbRepo.getClient()) {
        const command = new ListTablesCommand({});
        const response = await client.send(command).catch(noop);
        return response !== undefined;
    }
    static BatchGetMaxItemCount = 100;
    static BatchPutMaxItemCount = 25;
    static DdbClientConfig = {
        accessKeyId: "ACCESSKEYID",
        endpoint: "http://localhost:8000",
        region: "local",
        secretAccessKey: "SECRETACCESSKEY",
    };
    static MaxItemByteSize = 400 * 1024;
    static TableNameParser = (objectType) => objectType.toLowerCase() + "s";
}
