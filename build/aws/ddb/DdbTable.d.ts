import { DeleteItemCommand, GetItemCommand, PutItemCommand, QueryCommand, type CreateTableCommandOutput, type DeleteItemCommandOutput, type DeleteTableCommandOutput, type GetItemCommandOutput, type PutItemCommandOutput, type QueryCommandOutput, type UpdateTimeToLiveCommandOutput } from "@aws-sdk/client-dynamodb";
import { type Awaitable, type OrUndefined, type Snowflake } from "@rsc-utils/core-utils";
import { DdbRepo } from "./DdbRepo.js";
import type { BatchWriteResults, RepoId, RepoItem } from "./types.js";
export declare class DdbTable<Id extends RepoId = RepoId, Item extends RepoItem<Id> = RepoItem<Id>> {
    repo: DdbRepo;
    objectType: string;
    readonly tableName: string;
    constructor(repo: DdbRepo, objectType: string);
    /** used by .forEachAsync and .query */
    private createQueryCommandInput;
    /** returns true if the item in the table is deleted */
    delete(id: Id): Promise<boolean>;
    /** returns true if all the items in the table are deleted */
    delete(ids: Id[]): Promise<boolean>;
    /** returns BatchDeleteResults */
    delete(ids: Id[], returnOutput: true): Promise<BatchWriteResults<RepoItem<Id>>>;
    drop(returnOutput: true): Promise<DeleteTableCommandOutput>;
    ensure(returnOutput: true): Promise<{
        create: CreateTableCommandOutput;
        update?: UpdateTimeToLiveCommandOutput;
    }>;
    exists(): Promise<boolean | undefined>;
    /**
     * Queries the table for objects with matching objectType and iterates them.
     * callbackfn array will always be an empty array.
     *
     * @param callbackfn
     * @param thisArg
     * @returns
     */
    forEachAsync<T extends Item = Item>(callbackfn: (value: T, index: number, array: T[]) => Awaitable<unknown>, thisArg?: any): Promise<void>;
    /** returns the item in the table for the given id */
    get<T extends Item = Item>(id: Id): Promise<OrUndefined<T>>;
    /** returns the items in the table for the given ids */
    get<T extends Item = Item>(ids: Id[]): Promise<OrUndefined<T>[]>;
    /** returns all the items in the table */
    getAll<T extends Item = Item>(): Promise<T[]>;
    /** A prebuilt query conmand that returns all table items of the objecttype that match the given filter arguments (archived/relatedId) */
    query({ archived, relatedId }: {
        archived?: boolean;
        relatedId?: Snowflake;
    }): Promise<Item[]>;
    /** returns true if the item is saved */
    save<T extends Item = Item>(value: T): Promise<boolean>;
    /** returns true if all the items are saved */
    save<T extends Item = Item>(values: T[]): Promise<boolean>;
    /** returns BatchWriteResults */
    save<T extends Item = Item>(values: T[], returnOutput: true): Promise<BatchWriteResults<Item>>;
    send(cmd: DeleteItemCommand): Promise<DeleteItemCommandOutput>;
    send(cmd: GetItemCommand): Promise<GetItemCommandOutput>;
    send(cmd: PutItemCommand): Promise<PutItemCommandOutput>;
    send(cmd: QueryCommand): Promise<QueryCommandOutput>;
}
