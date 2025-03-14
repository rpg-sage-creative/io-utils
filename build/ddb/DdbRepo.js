import { AttributeValue, BatchGetItemCommand, CreateTableCommand, DeleteItemCommand, DeleteTableCommand, DynamoDB, GetItemCommand, ListTablesCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { errorReturnUndefined } from "@rsc-utils/core-utils";
import { deserializeObject } from "./internal/deserialize.js";
import { serialize } from "./internal/serialize.js";
export class DdbRepo {
    tableName;
    constructor(tableName) {
        this.tableName = tableName;
    }
    async getById(id) {
        if (!id) {
            return undefined;
        }
        const command = new GetItemCommand({
            TableName: this.tableName,
            Key: { id: serialize(id) }
        });
        const response = await DdbRepo.getClient().send(command).catch(errorReturnUndefined);
        if (response?.Item) {
            return deserializeObject(response.Item);
        }
        return undefined;
    }
    async getByIds(...ids) {
        const RequestItems = {};
        RequestItems[this.tableName] = { Keys: ids.map(id => ({ id: serialize(id) })) };
        const command = new BatchGetItemCommand({ RequestItems });
        const response = await DdbRepo.getClient().send(command).catch(errorReturnUndefined);
        if (response?.Responses) {
            return response.Responses[this.tableName].map(deserializeObject);
        }
        return [];
    }
    async deleteById(id) {
        const command = new DeleteItemCommand({
            TableName: this.tableName,
            Key: { id: serialize(id) }
        });
        const response = await DdbRepo.getClient().send(command).catch(errorReturnUndefined);
        return response?.$metadata.httpStatusCode === 200;
    }
    async save(value) {
        const command = new PutItemCommand({
            TableName: this.tableName,
            Item: serialize(value).M
        });
        const response = await DdbRepo.getClient().send(command).catch(errorReturnUndefined);
        return response?.$metadata.httpStatusCode === 200;
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
}
