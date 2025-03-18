import { enableLogLevels, pause, randomSnowflake, sortByKey, toLiteral } from "@rsc-utils/core-utils";
import { readdirSync } from "fs";
import { DdbRepo, readJsonFilesSync } from "../../build/index.js";

/*

MAKE THE TABLES WITH YEAR IN THE NAME
IDS ARE SNOWFLAKES SO I CAN GET THE YEAR AND KNOW WHICH TABLE TO QUERY
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

let dataRoot = null;
dataRoot = "/Users/randaltmeyer/git/rsc/rpg-sage/docker-volumes/rpg-sage-mono/sage";
function getObjectTypeFolders() {
	if (dataRoot) {
		// NO "dice", "messages"
		// return ["bots", "e20", "games", "maps", "pb2e", "servers", "users"];
		return readdirSync(dataRoot);
	}
	return ["servers"];
}

function readJsonFiles(path) {
	const all = readJsonFilesSync(path);
	all.forEach(json => {
		// hack various versions of the message objects
		if (!json.id && json.messageDid) json.id = json.messageDid;
		if (!json.id && json.discordKey?.message) json.id = json.discordKey.message;
	});
	return all;
}

function getJsonFiles(objectTypeFolder) {
	if (dataRoot) {
		return readJsonFiles(`${dataRoot}/${objectTypeFolder}`);
	}

	const objectType = "Server";

	const idOne = randomSnowflake();
	const serverOne = { name:`Random Server: ${idOne}`, id:idOne, objectType };

	const idTwo = randomSnowflake();
	const serverTwo = { name:`Random Server: ${idTwo}`, id:idTwo, objectType };

	return [serverOne, serverTwo];
}

describe("ddb", () => {
	describe("DdbRepo", () => {

		const objectTypeFolders = getObjectTypeFolders();
		objectTypeFolders.forEach(objectTypeFolder => {

			const jsonObjects = getJsonFiles(objectTypeFolder);

			/** @type {DdbRepo} */
			let ddb;

			describe(objectTypeFolder, () => {

				// ensure ddb table exists
				test(`DdbRepo.for(${toLiteral(objectTypeFolder)})`, async () => {
					ddb = await DdbRepo.for(objectTypeFolder);
					expect(ddb).toBeDefined();
				});

				// test("drop", async () => expect(await DdbRepo.drop(objectTypeFolder)).toBe(true));

				// return;

				// iterate each object (to add to ddb)
				jsonObjects.forEach(json => {

					// check for object, save object, check again
					test(json.id, async () => {
						expect(await ddb.getById(json.id)).toBeUndefined();
						expect(await ddb.save(json)).toBe(true);
						expect(await ddb.getById(json.id)).toStrictEqual(json);
					});

					// alter the object and make sure it doesn't match the ddb

					// save the update successfully

					// refetch the update and make sure it doesn't match original but does match the updated

				});

				// grab first, middle, last item ids and fetch as a group
				if (jsonObjects.length > 3) {
					const first = jsonObjects[0];
					const middle = jsonObjects[Math.floor(jsonObjects.length / 2)];
					const last = jsonObjects[jsonObjects.length - 1];
					const objects = [first, middle, last].filter((o, i, a) => a.findIndex(_o => o.id === _o.id) === i);
					const ids = objects.map(o => o.id);
					const objsLabel = ids.map(id => `{id:"${id}",...}`).join(",");

					test(`ddb.getByIds(...${toLiteral(ids)}) equals [${objsLabel}]`, async () => {
						const array = await ddb.getByIds(...ids);
						array.sort(sortByKey("id"));
						const expected = objects.slice();
						expected.sort(sortByKey("id"));
						expect(array).toStrictEqual(expected);
					});
				}

				// iterate each object (to delete from ddb)
				jsonObjects.forEach(json => {

					// ensure exists, delete, ensure deleted
					test(`ddb.deleteById(${toLiteral(json.id)})`, async () => {
						expect(await ddb.getById(json.id)).toStrictEqual(json);
						expect(await ddb.deleteById(json.id)).toBe(true);
						expect(await ddb.getById(json.id)).toBeUndefined();
					});

				});

			});
		});

	});
});
