import type { DdbRepo } from "../DdbRepo.js";
import type { BatchGetResults, BatchWriteResults, RepoItem } from "../types.js";
export declare function processInBatches<Item extends RepoItem>(ddbRepo: DdbRepo, cmd: "Delete" | "Put", itemsOrKeys: Item[]): Promise<BatchWriteResults<Item>>;
export declare function processInBatches<Item extends RepoItem>(ddbRepo: DdbRepo, cmd: "Get", itemsOrKeys: Item[]): Promise<BatchGetResults<Item>>;
