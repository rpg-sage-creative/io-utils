import { DynamoDB, type CreateTableCommandInput } from "@aws-sdk/client-dynamodb";
import { type Optional } from "@rsc-utils/core-utils";
import type { DdbClientConfig } from "./DdbClientConfig.js";
import { DdbTable } from "./DdbTable.js";
import { type BatchDeleteResults, type BatchGetResults, type BatchWriteResults, type IdResolvable, type RepoId, type RepoItem, type TableNameParser } from "./types.js";
type DDbRepoOptions = {
    batchGetMaxItemCount?: number;
    batchPutMaxItemCount?: number;
    itemToTableName?: TableNameParser;
};
export declare class DdbRepo<Id extends RepoId = RepoId, Item extends RepoItem<Id> = RepoItem<Id>> {
    config: DdbClientConfig;
    readonly batchGetMaxItemCount: number;
    readonly batchPutMaxItemCount: number;
    readonly itemToTableName: TableNameParser<Id, RepoItem<Id>>;
    constructor(config: DdbClientConfig, options?: DDbRepoOptions);
    createTable(createTableArgs: CreateTableCommandInput): Promise<boolean>;
    private client?;
    getClient(): DynamoDB;
    destroy(): void;
    /**
     * Attempts to delete all the given items from their appropriate tables.
     */
    deleteAll(keys: Optional<Item>[]): Promise<BatchDeleteResults<Id>>;
    deleteAll(keys: Optional<IdResolvable>[], tableName: string): Promise<BatchDeleteResults<Id>>;
    /**
     * Uses BatchGetItemCommand to retrieve the items for all the given keys.
     * If needed, multiple batches will be used.
     * The fetched results are sorted and returned in the order their keys were given.
     * Any keys that didnt't get a results are returned as undefined.
     */
    getAll(keys: Optional<Item>[]): Promise<BatchGetResults<Item>>;
    getAll(keys: Optional<IdResolvable>[], tableName: string): Promise<BatchGetResults<Item>>;
    getTableNames(): Promise<string[] | undefined>;
    for<Id extends RepoId = RepoId, Item extends RepoItem<Id> = RepoItem<Id>>(tableName: string): DdbTable<Id, Item>;
    /**
     * Uses BatchWriteItemCommand to save all the given items.
     * If needed, multiple batches will be used.
     * Only unprocessed items are returned.
     */
    saveAll(items: Item[], tableName?: string): Promise<BatchWriteResults<Item>>;
    testConnection(): Promise<boolean>;
    /** Tests that a command can be sent successfully. If no client is given, then a client is created using DdbRepo.LocalstackTestConfig */
    static testConnection(client?: DynamoDB): Promise<boolean>;
    /** Returns a DynamoDb object for the given config. If no config is given, then DdbRepo.LocalstackTestConfig is used. */
    static getClient(config?: DdbClientConfig): DynamoDB;
    /** Default config to be used by DdbRepo. */
    static DdbClientConfig: DdbClientConfig;
    static readonly BatchGetMaxItemCount = 100;
    static readonly BatchPutMaxItemCount = 25;
    static readonly MaxItemByteSize: number;
    static readonly ItemToTableName: (item: RepoItem) => string;
}
export {};
