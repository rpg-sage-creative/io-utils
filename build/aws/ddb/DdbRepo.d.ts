import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { type Optional, type Snowflake, type UUID } from "@rsc-utils/core-utils";
import type { DdbClientConfig } from "./DdbClientConfig.js";
import { DdbTable } from "./DdbTable.js";
type RepoId = Snowflake | UUID;
type RepoItem<Id extends RepoId = Snowflake> = {
    id: Id;
    objectType: string;
};
type BatchGetResults<Item extends RepoItem<any>> = {
    batchCount: number;
    errorCount: number;
    values: (Item | undefined)[];
};
type BatchResults<Item extends RepoItem> = {
    batchCount: number;
    errorCount: number;
    unprocessed: Item[];
    success: boolean;
    partial: boolean;
};
export declare class DdbRepo {
    config: DdbClientConfig;
    constructor(config: DdbClientConfig);
    private client?;
    getClient(): DynamoDB;
    destroy(): void;
    deleteAll(keys: Optional<RepoItem>[]): Promise<BatchResults<RepoItem>>;
    getBy<Id extends RepoId, Item extends RepoItem<Id> = RepoItem<Id>>(keys: Optional<Item>[]): Promise<BatchGetResults<Item>>;
    getTableNames(): Promise<string[] | undefined>;
    for<Id extends RepoId = RepoId, Item extends RepoItem<Id> = RepoItem<Id>>(tableName: string): DdbTable<Id, Item>;
    saveAll<Item extends RepoItem>(values: Item[]): Promise<BatchResults<Item>>;
    testConnection(): Promise<boolean>;
    /** Tests that a command can be sent successfully. If no client is given, then a client is created using DdbRepo.LocalstackTestConfig */
    static testConnection(client?: DynamoDB): Promise<boolean>;
    /** Returns a DynamoDb object for the given config. If no config is given, then DdbRepo.LocalstackTestConfig is used. */
    static getClient(config?: DdbClientConfig): DynamoDB;
    /** Default config to be used by DdbRepo. */
    static DdbClientConfig: DdbClientConfig;
    /** @deprecated use instance methods */
    static getBy<Id extends RepoId, Item extends RepoItem<Id> = RepoItem<Id>>(keys: Optional<Item>[]): Promise<BatchGetResults<Item>>;
    static getBy<Id extends RepoId, Item extends RepoItem<Id> = RepoItem<Id>>(...keys: Optional<Item>[]): Promise<BatchGetResults<Item>>;
    /** @deprecated use instance methods */
    static deleteAll(keys: Optional<RepoItem>[]): Promise<BatchResults<RepoItem>>;
    static deleteAll(...keys: Optional<RepoItem>[]): Promise<BatchResults<RepoItem>>;
    /** @deprecated use instance methods */
    static saveAll<Item extends RepoItem>(values: Item[]): Promise<BatchResults<Item>>;
    static saveAll<Item extends RepoItem>(...values: Item[]): Promise<BatchResults<Item>>;
    static readonly BatchGetMaxItemCount = 100;
    static readonly BatchPutMaxItemCount = 25;
    static readonly MaxItemByteSize: number;
}
export {};
