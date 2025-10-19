import { enableLogLevels, pause, randomSnowflake, toLiteral } from "@rsc-utils/core-utils";
import { DdbRepo } from "../../build/index.js";

/*

400 KB max json size in DDB

*/

enableLogLevels("development");

// let the container finish starting
beforeAll(async () => {
	let connected;
	do {
		// pause a split second
		await pause(250);
		// try to list tables
		connected = await DdbRepo.testConnection();
	}while (!connected);
});

function getJsonObjects() {
	const jsonObjects = [];

	for (let i = 0; i < 50; i++) {
		const serverId = randomSnowflake();
		jsonObjects.push({ name:`Random Server: ${serverId}`, id:serverId, objectType:"ddb-test-server" });

		const userId = randomSnowflake();
		jsonObjects.push({ name:`Random User: ${userId}`, id:userId, objectType:"ddb-test-user" });

		const botId = randomSnowflake();
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

describe("ddb", () => {
	describe("DdbRepo", () => {

		const jsonObjects = getJsonObjects();
		const idKeys = jsonObjects.map(({ id, objectType }) => ({ id, objectType }));

		const objectTypes = [...new Set(jsonObjects.map(({ objectType }) => objectType))];

		describe(`Create Test Tables`, () => {
			test(toLiteral(objectTypes), async () => {
				for (const objectType of objectTypes) {
					expect(await DdbRepo.for(objectType)).toBeDefined();
				}
			}, 10*1000);
		});

		describe("Single Item Commands", () => {

			test(`save (${jsonObjects.length} items)`, async() => {
				let ddb;
				let objectType;
				for (const json of jsonObjects) {
					if (json.objectType !== objectType) {
						ddb = await DdbRepo.for(objectType = json.objectType);
					}

					// initial json get/save/get
					expect(await ddb.getById(json.id)).toBeUndefined();
					expect(await ddb.save(json)).toBe(true);
					expect(await ddb.getById(json.id)).toStrictEqual(json);
				};
			}, 10*1000);

			test(`mutate (${jsonObjects.length} items)`, async() => {
				let ddb;
				let objectType;
				for (const json of jsonObjects) {
					if (json.objectType !== objectType) {
						ddb = await DdbRepo.for(objectType = json.objectType);
					}

					// alter the object and make sure it doesn't match the ddb
					const objectTypeTwo = (json.objectType ?? "None").split("").reverse().join("");
					const clone = { ...json, objectTypeTwo };

					// confirm clone id matches
					expect(json.id).toBe(clone.id);

					// confirm clone object is different
					expect(json).not.toStrictEqual(clone);
					expect(await ddb.getById(clone.id)).not.toStrictEqual(clone);

					// save the clone successfully
					expect(await ddb.save(clone)).toBe(true);

					// refetch the clone and make sure it doesn't match original
					const fetched = await ddb.getById(json.id);
					expect(fetched).toStrictEqual(clone);
					expect(fetched).not.toStrictEqual(json);
				};
			}, 10*1000);

			test(`delete (${jsonObjects.length} items)`, async() => {
				let ddb;
				let objectType;
				for (const json of jsonObjects) {
					if (json.objectType !== objectType) {
						ddb = await DdbRepo.for(objectType = json.objectType);
					}

					// delete and confirm
					expect(await ddb.deleteById(json.id)).toBe(true);
					expect(await ddb.getById(json.id)).toBeUndefined();
				};
			}, 10*1000);

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

			test(`DdbRepo.saveAll(...) --> ${toLiteral(expectedSaveAllResults)}`, async () => {
				// show they aren't there
				expect(await DdbRepo.getBy(...idKeys)).toStrictEqual(expectedGetNoneResults);
				// save them
				expect(await DdbRepo.saveAll(...jsonObjects)).toStrictEqual(expectedSaveAllResults);
				// show they are there
				expect(await DdbRepo.getBy(...idKeys)).toStrictEqual(expectedGetAllResults);
			}, 10*1000);

			test(`DdbRepo.getBy`, async () => {
				// reverse list and fetch
				const reversedKeys = idKeys.slice().reverse();
				// show the results are ordered as the keys
				expect(await DdbRepo.getBy(...reversedKeys)).toStrictEqual(expectedGetAllResultsReversed);
			}, 10*1000);

			test(`DdbRepo.deleteAll(...) --> ${toLiteral(expectedDeleteAllResults)}`, async () => {
				// show they are there
				expect(await DdbRepo.getBy(...jsonObjects)).toStrictEqual(expectedGetAllResults);
				// delete them
				expect(await DdbRepo.deleteAll(...jsonObjects)).toStrictEqual(expectedDeleteAllResults);
				// show they aren't there
				expect(await DdbRepo.getBy(...idKeys)).toStrictEqual(expectedGetNoneResults);
			}, 10*1000);

		});

		describe(`Drop Test Tables`, () => {
			test(toLiteral(objectTypes), async () => {
				for (const objectType of objectTypes) {
					expect(await DdbRepo.drop(objectType)).toBe(true);
				}
			}, 10*1000);
		});

	});
});
