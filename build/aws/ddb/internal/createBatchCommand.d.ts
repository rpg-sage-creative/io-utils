import { BatchGetItemCommand, BatchWriteItemCommand } from "@aws-sdk/client-dynamodb";
import type { RepoItem, TableNameParser } from "../types.js";
export declare function createBatchCommand(type: "Delete" | "Get" | "Put", keys: RepoItem[], tableNameParser: TableNameParser): BatchWriteItemCommand | BatchGetItemCommand;
export declare function createBatchDeleteCommand(keys: RepoItem[], tableNameParser: TableNameParser): BatchWriteItemCommand;
export declare function createBatchGetCommand(keys: RepoItem[], tableNameParser: TableNameParser): BatchGetItemCommand;
export declare function createBatchPutCommand(items: RepoItem[], tableNameParser: TableNameParser): BatchWriteItemCommand;
