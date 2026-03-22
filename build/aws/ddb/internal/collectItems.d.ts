import type { BatchGetItemCommandOutput } from "@aws-sdk/client-dynamodb";
import type { OrUndefined } from "@rsc-utils/core-utils";
import type { RepoItem } from "../types.js";
export declare function collectItems<Item extends RepoItem>(keys: RepoItem[], output?: BatchGetItemCommandOutput): OrUndefined<Item>[];
