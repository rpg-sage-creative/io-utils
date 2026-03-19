import { generateSnowflake } from "@rsc-utils/core-utils";

const testDate = new Date();
const testBigInt = BigInt("12345678901234567890");
const tests = [
	{ deserialized:null, serialized:{NULL:true} },
	{ deserialized:true, serialized:{BOOL:true} },
	{ deserialized:false, serialized:{BOOL:false} },
	{ deserialized:"", serialized:{S:""} },
	{ deserialized:"one", serialized:{S:"one"} },
	{ deserialized:1, serialized:{N:"1"} },
	{ deserialized:1.2, serialized:{N:"1.2"} },
	{ deserialized:testDate, serialized:{M:{$date:{S:testDate.toISOString()}}} },
	{ deserialized:testBigInt, serialized:{M:{$bigint:{S:testBigInt.toString()}}} },
	{ deserialized:{}, serialized:{M:{}} },
	{ deserialized:{a:"A"}, serialized:{M:{a:{S:"A"}}} },
	{ deserialized:{a:"A",b:{c:"C"}}, serialized:{M:{a:{S:"A"},b:{M:{c:{S:"C"}}}}} },
	{ deserialized:{a:"A",b:{c:"C"},d:[1]}, serialized:{M:{a:{S:"A"},b:{M:{c:{S:"C"}}},d:{L:[{N:"1"}]}}} },
	{ deserialized:[], serialized:{L:[]} },
	{ deserialized:["",0,{a:"A"}], serialized:{L:[{S:""},{N:"0"},{M:{a:{S:"A"}}}]} },
	{ deserialized:new Set(["a","b","c"]), serialized:{SS:["a","b","c"]} },
	{ deserialized:new Set([1,2,3]), serialized:{NS:["1","2","3"]} },
	{ deserialized:new Set([1,"2"]), serialized:{M:{$set:{L:[{N:"1"},{S:"2"}]}}} },
];

export function getTests(which) {
	switch(which) {
		case "serialize": return tests;
		case "deserialize": return tests;
		default: return [];
	}
}

let channelIndex = 0;
const channelIds = ["ic-channel", "ooc-channel", "gm-channel", "dice-channel", "misc-channel"];
let userIndex = 0;
const userIds = ["fighter-id", "rogue-id", "wizard-id"];
function addChannelsAndUsers(objectType) {
	if (objectType !== "Game") return undefined;
	const channelId = channelIds[channelIndex];
	channelIndex++;
	if (channelIndex === channelIds.length) channelIndex = 0;
	const userId = userIds[userIndex];
	userIndex++;
	if (userIndex === userIds.length) userIndex = 0;
	return { channelIds:[{id:channelId}], userIds:[{id:userId}] };
}
export function getJsonObjects(...objectTypes) {
	const jsonObjects = [];

	for (let i = 0; i < 50; i++) {
		for (const objectType of objectTypes) {
			const id = generateSnowflake();
			jsonObjects.push({
				name: `Random ${objectType}: ${id}`,
				id,
				objectType,
				...addChannelsAndUsers(objectType),

				// throw in some other values for funsies
				bigintValue: 1234567890n,
				trueValue: true,
				falseValue: false,
				dateValue: new Date(),
				emptyStringValue: "",
				nullValue: null,
				numberValue: 1234567890,
				stringValue: "non-empty string",
				zeroValue: 0,
			});
		}
	}

	return jsonObjects;
}