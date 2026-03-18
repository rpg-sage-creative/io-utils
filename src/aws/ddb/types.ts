import type { AttributeValue } from "@aws-sdk/client-dynamodb";
import type { Optional, Snowflake, UUID } from "@rsc-utils/core-utils";

export type RepoId = Snowflake | UUID;

export type RepoItem<
	Id extends RepoId = RepoId,
	ObjectType extends string = string,
> = {
	id: Id;
	objectType: ObjectType;
};

export type IdResolvable<
	Id extends RepoId = RepoId,
> = Id | RepoItem<Id>;

export function resolveId<
	Id extends RepoId = RepoId,
>(
	resolvable: Optional<IdResolvable<Id>>,
): Id | undefined {

	return typeof(resolvable) === "string"
		? resolvable
		: resolvable?.id;

}

export type BatchGetRequestItems = Record<
	string,
	{
		Keys:{
			id: AttributeValue;
		}[];
	}
>;

export type BatchDeleteResults<
	Id extends RepoId,
> = {
	batchCount: number;
	errorCount: number;
	unprocessed: UnprocessedItem<Id>[];
	success: boolean;
	partial: boolean;
};

export type BatchGetResults<
	Item extends RepoItem,
> = {
	batchCount: number;
	errorCount: number;
	values: (Item | undefined)[];
};

export type BatchWriteRequestItems = Record<
	string,
	{
		PutRequest?: {
			Item: Record<string, AttributeValue>;
		};
		DeleteRequest?: {
			Key: {
				id: AttributeValue;
			};
		};
	}[]
>;

export type BatchWriteResults<
	Item extends RepoItem,
> = {
	batchCount: number;
	errorCount: number;
	unprocessed: Item[];
	success: boolean;
	partial: boolean;
};

export type TableNameParser<
	Id extends RepoId = RepoId,
	Item extends RepoItem<Id>= RepoItem<Id>,
> = (
	item: Item
) => string;

export type UnprocessedItem<
	Id extends RepoId,
> = {
	id: Id;
	tableName: string;
};
