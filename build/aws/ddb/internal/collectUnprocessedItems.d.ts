import type { BatchWriteItemCommandOutput } from "@aws-sdk/client-dynamodb";
import type { RepoItem } from "../types.js";
export declare function collectUnprocessedItems<Item extends RepoItem>(output?: BatchWriteItemCommandOutput): Item[];
