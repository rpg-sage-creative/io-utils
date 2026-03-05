import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { type Optional, type Snowflake, type UUID } from "@rsc-utils/core-utils";
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
export declare class DdbRepo<Id extends RepoId = Snowflake, Item extends RepoItem<Id> = RepoItem<Id>> {
    tableName: string;
    constructor(tableName: string);
    deleteById(id: Optional<Id>): Promise<boolean>;
    getById(id: Optional<Id>): Promise<Item | undefined>;
    getByIds(ids: Optional<Id>[]): Promise<(Item | undefined)[]>;
    /** @deprecated don't use spread operator, use getBy(Id[]) */
    getByIds(...ids: Optional<Id>[]): Promise<(Item | undefined)[]>;
    save(value: Optional<Item>): Promise<boolean>;
    static testConnection(client?: DynamoDB): Promise<boolean>;
    protected static getClient(): DynamoDB;
    static getBy<Id extends RepoId, Item extends RepoItem<Id> = RepoItem<Id>>(keys: Optional<Item>[]): Promise<BatchGetResults<Item>>;
    /** @deprecated don't use spread operator, use getBy(Item[]) */
    static getBy<Id extends RepoId, Item extends RepoItem<Id> = RepoItem<Id>>(...keys: Optional<Item>[]): Promise<BatchGetResults<Item>>;
    static deleteAll(keys: Optional<RepoItem>[]): Promise<BatchResults<RepoItem>>;
    /** @deprecated don't use spread operator, use deleteAll(RepoItem[]) */
    static deleteAll(...keys: Optional<RepoItem>[]): Promise<BatchResults<RepoItem>>;
    static saveAll<Item extends RepoItem>(values: Item[]): Promise<BatchResults<Item>>;
    /** @deprecated don't use spread operator, use saveAll(Item[]) */
    static saveAll<Item extends RepoItem>(...values: Item[]): Promise<BatchResults<Item>>;
    /** ensures the table exists ... DEBUG / TEST ONLY */
    static for(tableName: string): Promise<DdbRepo>;
    /** drops the table if it exists ... DEBUG / TEST ONLY */
    static drop(tableName: string): Promise<boolean>;
    static readonly BatchGetMaxItemCount = 100;
    static readonly BatchPutMaxItemCount = 25;
    static readonly MaxItemByteSize: number;
}
export {};
