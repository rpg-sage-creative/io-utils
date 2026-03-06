import { enableLogLevels, pause, generateSnowflake, tagLiterals } from "@rsc-utils/core-utils";
import { DdbRepo } from "../../../build/index.js";

/*

400 KB max json size in DDB

*/

/** @type {DdbRepo | undefined} */
let ddbRepo;

enableLogLevels("development");

// let the container finish starting
beforeAll(async () => {
	ddbRepo = new DdbRepo(DdbRepo.DdbClientConfig);

	let connected;
	do {
		// pause a split second
		await pause(250);
		// try to list tables
		connected = await ddbRepo.testConnection();
	}while (!connected);
});

function getJsonObjects() {
	const jsonObjects = [];

	for (let i = 0; i < 50; i++) {
		const serverId = generateSnowflake();
		jsonObjects.push({ name:`Random Server: ${serverId}`, id:serverId, objectType:"ddb-test-server" });

		const userId = generateSnowflake();
		jsonObjects.push({ name:`Random User: ${userId}`, id:userId, objectType:"ddb-test-user" });

		const botId = generateSnowflake();
		jsonObjects.push({
			name: `Random Bot: ${botId}`,
			id: botId,
			objectType: "ddb-test-bot",

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

	return jsonObjects;
}

describe("aws", () => {
describe("ddb", () => {
	describe("DdbRepo", () => {
		let timeout = undefined; // default
		// timeout = 10 * 1000; // 10 seconds

		const jsonObjects = getJsonObjects();
		const idKeys = jsonObjects.map(({ id, objectType }) => ({ id, objectType }));

		const objectTypes = [...new Set(jsonObjects.map(({ objectType }) => objectType))];

		describe(`Create Test Tables`, () => {
			test(JSON.stringify(objectTypes), async () => {
				for (const objectType of objectTypes) {
					expect(await ddbRepo.for(objectType).ensure()).toBeDefined();
				}
			}, timeout);
		});

		describe("Single Item Commands", () => {

			test(`save (${jsonObjects.length} items)`, async() => {
				let ddbTable;
				let objectType;
				for (const json of jsonObjects) {
					if (json.objectType !== objectType) {
						ddbTable = ddbRepo.for(objectType = json.objectType);
					}

					// initial json get/save/get
					expect(await ddbTable.getById(json.id)).toBeUndefined();
					expect(await ddbTable.save(json)).toBe(true);
					expect(await ddbTable.getById(json.id)).toStrictEqual(json);
				};
			}, timeout);

			test(`mutate (${jsonObjects.length} items)`, async() => {
				let ddbTable;
				let objectType;
				for (const json of jsonObjects) {
					if (json.objectType !== objectType) {
						ddbTable = ddbRepo.for(objectType = json.objectType);
					}

					// alter the object and make sure it doesn't match the ddbTable
					const objectTypeTwo = (json.objectType ?? "None").split("").reverse().join("");
					const clone = { ...json, objectTypeTwo };

					// confirm clone id matches
					expect(json.id).toBe(clone.id);

					// confirm clone object is different
					expect(json).not.toStrictEqual(clone);
					expect(await ddbTable.getById(clone.id)).not.toStrictEqual(clone);

					// save the clone successfully
					expect(await ddbTable.save(clone)).toBe(true);

					// refetch the clone and make sure it doesn't match original
					const fetched = await ddbTable.getById(json.id);
					expect(fetched).toStrictEqual(clone);
					expect(fetched).not.toStrictEqual(json);
				};
			}, timeout);

			test(`delete (${jsonObjects.length} items)`, async() => {
				let ddbTable;
				let objectType;
				for (const json of jsonObjects) {
					if (json.objectType !== objectType) {
						ddbTable = ddbRepo.for(objectType = json.objectType);
					}

					// delete and confirm
					expect(await ddbTable.deleteById(json.id)).toBe(true);
					expect(await ddbTable.getById(json.id)).toBeUndefined();
				};
			}, timeout);

		});

		describe(`Batch Item Commands`, () => {

			const expectedGetNoneResults = {
				batchCount: Math.ceil(jsonObjects.length / DdbRepo.BatchGetMaxItemCount),
				errorCount: 0,
				values: jsonObjects.map(() => undefined)
			};

			const expectedSaveAllResults = {
				batchCount: Math.ceil(jsonObjects.length / DdbRepo.BatchPutMaxItemCount),
				errorCount: 0,
				unprocessed: [],
				success: true,
				partial: false
			};

			const expectedGetAllResults = {
				batchCount: Math.ceil(jsonObjects.length / DdbRepo.BatchGetMaxItemCount),
				errorCount: 0,
				values: jsonObjects
			};

			const expectedGetAllResultsReversed = {
				batchCount: Math.ceil(jsonObjects.length / DdbRepo.BatchGetMaxItemCount),
				errorCount: 0,
				values: jsonObjects.slice().reverse()
			};

			const expectedDeleteAllResults = {
				batchCount: Math.ceil(jsonObjects.length / DdbRepo.BatchPutMaxItemCount),
				errorCount: 0,
				unprocessed: [],
				success: true,
				partial: false
			};

			test(tagLiterals`DdbRepo.saveAll(...) --> ${expectedSaveAllResults}`, async () => {
				// show they aren't there
				expect(await ddbRepo.getBy(idKeys)).toStrictEqual(expectedGetNoneResults);
				// save them
				expect(await ddbRepo.saveAll(jsonObjects)).toStrictEqual(expectedSaveAllResults);
				// show they are there
				expect(await ddbRepo.getBy(idKeys)).toStrictEqual(expectedGetAllResults);
			}, timeout);

			test(`DdbRepo.getBy`, async () => {
				// reverse list and fetch
				const reversedKeys = idKeys.slice().reverse();
				// show the results are ordered as the keys
				expect(await ddbRepo.getBy(reversedKeys)).toStrictEqual(expectedGetAllResultsReversed);
			}, timeout);

			test(tagLiterals`DdbRepo.deleteAll(...) --> ${expectedDeleteAllResults}`, async () => {
				// show they are there
				expect(await ddbRepo.getBy(jsonObjects)).toStrictEqual(expectedGetAllResults);
				// delete them
				expect(await ddbRepo.deleteAll(jsonObjects)).toStrictEqual(expectedDeleteAllResults);
				// show they aren't there
				expect(await ddbRepo.getBy(idKeys)).toStrictEqual(expectedGetNoneResults);
			}, timeout);

		});

		describe(`Drop Test Tables`, () => {
			test(JSON.stringify(objectTypes), async () => {
				for (const objectType of objectTypes) {
					expect(await ddbRepo.for(objectType).drop()).toBe(true);
				}
			}, timeout);
		});

	});
});
});

afterAll(async () => {
	ddbRepo?.destroy();
});