import { type Awaitable, type Optional, type Snowflake, type UUID } from "@rsc-utils/core-utils";
import { DdbRepo } from "./DdbRepo.js";
type RepoId = Snowflake | UUID;
type RepoItem<Id extends RepoId = Snowflake> = {
    id: Id;
    objectType: string;
};
export declare class DdbTable<Id extends RepoId = Snowflake, Item extends RepoItem<Id> = RepoItem<Id>> {
    repo: DdbRepo;
    tableName: string;
    constructor(repo: DdbRepo, tableName: string);
    /** deletes the item in the table for the given id */
    deleteById(id: Optional<Id>): Promise<boolean>;
    /** @deprecated drops the table if it exists ... DEBUG / TEST ONLY */
    drop(): Promise<boolean>;
    /** @deprecated ensures the table exists ... DEBUG / TEST ONLY */
    ensure(): Promise<boolean>;
    forEachAsync<T>(callbackfn: (value: T, index: number, array: T[]) => Awaitable<void>, thisArg?: any): Promise<void>;
    /** returns the item in the table for the given id */
    getById(id: Optional<Id>): Promise<Item | undefined>;
    /** returns the items in the table for the given ids */
    getByIds(ids: Optional<Id>[]): Promise<(Item | undefined)[]>;
    /** checks the ddb table names to get correctly cased table name for this table */
    protected getCasedTableName(): Promise<string | undefined>;
    save(value: Optional<Item>): Promise<boolean>;
}
export {};
