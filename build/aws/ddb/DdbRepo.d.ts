import { DynamoDB, type CreateTableCommandInput, type CreateTableCommandOutput, type DeleteTableCommandOutput, type UpdateTimeToLiveCommandInput, type UpdateTimeToLiveCommandOutput } from "@aws-sdk/client-dynamodb";
import { type Awaitable } from "@rsc-utils/core-utils";
import type { DdbClientConfig } from "./DdbClientConfig.js";
import { DdbTable } from "./DdbTable.js";
import type { BatchGetResults, BatchWriteResults, RepoId, RepoItem, TableNameParser } from "./types.js";
type DDbRepoOptions = {
    batchGetMaxItemCount?: number;
    batchPutMaxItemCount?: number;
    tableNameParser?: TableNameParser;
};
export declare class DdbRepo<Id extends RepoId = RepoId, Item extends RepoItem<Id> = RepoItem<Id>> {
    config: DdbClientConfig;
    private client?;
    readonly batchGetMaxItemCount: number;
    readonly batchPutMaxItemCount: number;
    readonly tableNameParser: TableNameParser;
    constructor(config: DdbClientConfig, options?: DDbRepoOptions);
    createTable(createTableArgs: CreateTableCommandInput): Promise<boolean>;
    createTable(createTableArgs: CreateTableCommandInput, updateTableArgs: UpdateTimeToLiveCommandInput): Promise<boolean>;
    createTable(createTableArgs: CreateTableCommandInput, returnOutput: true): Promise<CreateTableCommandOutput>;
    createTable(createTableArgs: CreateTableCommandInput, updateTableArgs: UpdateTimeToLiveCommandInput, returnOutput: true): Promise<{
        create: CreateTableCommandOutput;
        update: UpdateTimeToLiveCommandOutput;
    }>;
    destroy(): void;
    dropTable(tableName: string): Promise<boolean>;
    dropTable(tableName: string, returnOutput: true): Promise<DeleteTableCommandOutput>;
    /**
     * Attempts to delete all the given items from their appropriate tables.
     */
    delete(keys: Item[]): Promise<BatchWriteResults<Item>>;
    /**
     * Uses ScanCommandOutput to iterate over every item in the table.
     * callbackfn array will always be an empty array.
     *
     * @param callbackfn
     * @param thisArg
     * @returns
     */
    forEachAsync<T extends Item = Item>(tableName: string, callbackfn: (value: T, index: number, array: T[]) => Awaitable<unknown>, thisArg?: any): Promise<void>;
    /**
     * Uses BatchGetItemCommand to retrieve the items for all the given keys.
     * If needed, multiple batches will be used.
     * The fetched results are sorted and returned in the order their keys were given.
     * Any keys that didnt't get a results are returned as undefined.
     */
    get(keys: Item[]): Promise<BatchGetResults<Item>>;
    /** returns all the items in the table */
    getAll<T extends Item = Item>(tableName: string): Promise<T[]>;
    getClient(): DynamoDB;
    getTableNames(): Promise<string[] | undefined>;
    for<Id extends RepoId = RepoId, Item extends RepoItem<Id> = RepoItem<Id>>(objectType: string): DdbTable<Id, Item>;
    /**
     * Uses BatchWriteItemCommand to save all the given items.
     * If needed, multiple batches will be used.
     * Only unprocessed items are returned.
     */
    save(items: Item[]): Promise<BatchWriteResults<Item>>;
    testConnection(): Promise<boolean>;
    /** Returns a CreateTableCommandInput with the commonly used settings expected for RPG Sage Creative projects. */
    static getCreateTableInput(tableName: string): CreateTableCommandInput;
    /** Returns a UpdateTimeToLiveCommandInput with the commonly used settings expected for RPG Sage Creative projects. */
    static getUpdateTimeToLiveInput(tableName: string): UpdateTimeToLiveCommandInput;
    /** Returns a DynamoDb object for the given config. If no config is given, then DdbRepo.LocalstackTestConfig is used. */
    static getClient(config?: DdbClientConfig): DynamoDB;
    /** Tests that a command can be sent successfully. If no client is given, then a client is created using DdbRepo.LocalstackTestConfig */
    static testConnection(client?: DynamoDB): Promise<boolean>;
    static readonly BatchGetMaxItemCount = 100;
    static readonly BatchPutMaxItemCount = 25;
    /** Default config to be used by DdbRepo. */
    static DdbClientConfig: DdbClientConfig;
    static readonly MaxItemByteSize: number;
    static readonly TableNameParser: TableNameParser;
}
export {};
