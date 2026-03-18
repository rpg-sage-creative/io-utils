import { type Awaitable, type Optional } from "@rsc-utils/core-utils";
import { DdbRepo } from "./DdbRepo.js";
import { type BatchDeleteResults, type BatchWriteResults, type IdResolvable, type RepoId, type RepoItem } from "./types.js";
export declare class DdbTable<Id extends RepoId = RepoId, Item extends RepoItem<Id> = RepoItem<Id>> {
    repo: DdbRepo;
    tableName: string;
    constructor(repo: DdbRepo, tableName: string);
    /** deletes the item in the table for the given id */
    delete(id: Optional<IdResolvable<Id>>): Promise<boolean>;
    deleteAll(ids: Optional<IdResolvable<Id>>[]): Promise<BatchDeleteResults<RepoId>>;
    /** @deprecated @intrernal drops the table if it exists ... DEBUG / TEST ONLY */
    drop(): Promise<boolean>;
    /** @deprecated @intrernal ensures the table exists ... DEBUG / TEST ONLY */
    ensure(): Promise<boolean>;
    /** uses ScanCommandOutput to iterate over every item in the table */
    forEachAsync<T extends Item = Item>(callbackfn: (value: T, index: number, array: T[]) => Awaitable<void>, thisArg?: any): Promise<void>;
    /** returns the item in the table for the given id */
    get<T extends Item = Item>(id: Optional<Id>): Promise<T | undefined>;
    /** returns the items in the table for the given ids */
    getAll<T extends Item = Item>(ids: Optional<Id>[]): Promise<(T | undefined)[]>;
    /** checks the ddb table names to get correctly cased table name for this table */
    protected getCasedTableName(): Promise<string | undefined>;
    /** saves the item given to the table */
    save<T extends Item = Item>(value: Optional<T>): Promise<boolean>;
    /** saves all the items given to the table */
    saveAll<T extends Item = Item>(values: T[]): Promise<BatchWriteResults<T>>;
}
