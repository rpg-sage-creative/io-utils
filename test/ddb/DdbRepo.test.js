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

function getObjectTypeFolders() {
	return ["servers"];
}

function getJsonObjects() {
	const idOne = randomSnowflake();
	const serverOne = { name:`Random Server: ${idOne}`, id:idOne, objectType:"Server" };

	const idTwo = randomSnowflake();
	const serverTwo = { name:`Random Server: ${idTwo}`, id:idTwo, objectType:"Server" };

	const idThree = randomSnowflake();
	const serverThree = { name:`Random Server: ${idThree}`, id:idThree, objectType:"Server" };

	const idFour = randomSnowflake();
	const botOne = { name:`Random Bot: ${idFour}`, id:idFour, objectType:"Bot" };

	return [serverOne, serverTwo, serverThree, botOne];
}

describe("ddb", () => {
	describe("DdbRepo", () => {

		const jsonObjects = getJsonObjects();

		const objectTypes = [...new Set(jsonObjects.map(({ objectType }) => objectType))];

		// ensure ddb table exists
		objectTypes.forEach(objectType => {
			test(`DdbRepo.for(${toLiteral(objectType)})`, async () => expect(await DdbRepo.for(objectType)).toBeDefined());
			// test(`DdbRepo.drop(${toLiteral(objectType)})`, async () => expect(await DdbRepo.drop(objectType)).toBe(true));
		});

		// exit out when clearing DDB tables
		// return;

		/** @type {DdbRepo} */
		let ddb;

		describe("Single Item Commands", () => {

			// iterate each object (to add to ddb)
			jsonObjects.forEach(json => {

				// alter the object and make sure it doesn't match the ddb
				const objectTypeTwo = (json.objectType ?? "None").split("").reverse().join("");
				const clone = { ...json, objectTypeTwo };

				// check for object, save object, check again
				test(json.id, async () => {
					ddb = await DdbRepo.for(json.objectType);

					// initial json get/save/get
					expect(await ddb.getById(json.id)).toBeUndefined();
					expect(await ddb.save(json)).toBe(true);
					expect(await ddb.getById(json.id)).toStrictEqual(json);

					// cofirm clone id matches
					expect(json.id).toBe(clone.id);

					// cofirm clone object is different
					expect(json).not.toStrictEqual(clone);
					expect(await ddb.getById(clone.id)).not.toStrictEqual(clone);

					// save the clone successfully
					expect(await ddb.save(clone)).toBe(true);

					// refetch the clone and make sure it doesn't match original
					const fetched = await ddb.getById(json.id);
					expect(fetched).toStrictEqual(clone);
					expect(fetched).not.toStrictEqual(json);

					expect(await ddb.deleteById(json.id)).toBe(true);
					expect(await ddb.getById(clone.id)).toBeUndefined();
				});

			});

		});

		describe(`Batch Item Commands`, () => {

			test(`DdbRepo.saveAll`, async () => {
				expect(await DdbRepo.saveAll(...jsonObjects)).toBe(true);
			});

			test(`DdbRepo.getBy`, async () => {
				// reverse list and fetch
				const reversed = jsonObjects.slice().reverse();
				const reversedKeys = reversed.map(({ id, objectType }) => ({ id, objectType }));
				const fetched = await DdbRepo.getBy(...reversedKeys);
				expect(fetched).toStrictEqual(reversed);
			});

			test(`DdbRepo.deleteAll`, async () => {
				expect(await DdbRepo.deleteAll(...jsonObjects)).toBe(true);
			});

		});

	});
});
