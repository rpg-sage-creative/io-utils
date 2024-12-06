import { AttributeValue, BatchGetItemCommand, CreateTableCommand, DeleteItemCommand, DynamoDB, GetItemCommand, ListTablesCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { errorReturnNull } from "@rsc-utils/core-utils";
import { deserializeObject } from "./internal/deserialize.js";
import { serialize } from "./internal/serialize.js";
export class DdbRepo {
    tableName;
    constructor(tableName) {
        this.tableName = tableName;
    }
    async getById(id) {
        const command = new GetItemCommand({
            TableName: this.tableName,
            Key: { id: serialize(id) }
        });
        const response = await DdbRepo.getClient().send(command).catch(errorReturnNull);
        if (response?.Item) {
            return deserializeObject(response.Item);
        }
        return undefined;
    }
    async getByIds(...ids) {
        const RequestItems = {};
        RequestItems[this.tableName] = { Keys: ids.map(id => ({ id: serialize(id) })) };
        const command = new BatchGetItemCommand({ RequestItems });
        const response = await DdbRepo.getClient().send(command).catch(errorReturnNull);
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
        const response = await DdbRepo.getClient().send(command).catch(errorReturnNull);
        return response?.$metadata.httpStatusCode === 200;
    }
    async save(value) {
        const command = new PutItemCommand({
            TableName: this.tableName,
            Item: serialize(value).M
        });
        const response = await DdbRepo.getClient().send(command).catch(errorReturnNull);
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
        if (!response?.TableNames?.includes(tableName)) {
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
}
