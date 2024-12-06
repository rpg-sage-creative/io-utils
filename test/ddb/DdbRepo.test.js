import { pause, randomSnowflake, sortByKey, toLiteral } from "@rsc-utils/core-utils";
import { DdbRepo } from "../../build/index.js";

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

describe("ddb", () => {
	describe("DdbRepo", () => {

		const objectType = "Server";

		const idOne = randomSnowflake();
		const serverOne = { name:`Random Server: ${idOne}`, id:idOne, objectType };

		const idTwo = randomSnowflake();
		const serverTwo = { name:`Random Server: ${idTwo}`, id:idTwo, objectType };

		/** @type {DdbRepo} */
		let ddb;

		test(`DdbRepo.for("Servers")`, async () => {
			ddb = await DdbRepo.for("Servers");
			expect(ddb).toBeDefined();
		});

		test(`ddb.getById(${toLiteral(idOne)}) === undefined`, async () => {
			expect(await ddb.getById(idOne)).toBeUndefined();
		});

		test(`ddb.save(${toLiteral(serverOne)}) === true`, async () => {
			const saved = await ddb.save(serverOne);
			expect(saved).toBe(true);
		});

		test(`ddb.save(${toLiteral(serverTwo)}) === true`, async () => {
			expect(await ddb.save(serverTwo)).toBe(true);
		});

		test(`ddb.getById(${toLiteral(idOne)}) === ${toLiteral(serverOne)}`, async () => {
			expect(await ddb.getById(idOne)).toStrictEqual(serverOne);
		});

		test(`ddb.getByIds(${toLiteral(idOne)}, ${toLiteral(idTwo)}) equals [${toLiteral(serverOne)}, ${toLiteral(serverTwo)}]`, async () => {
			const array = await ddb.getByIds(idOne, idTwo);
			array.sort(sortByKey("id"));
			const expected = [serverOne, serverTwo];
			expected.sort(sortByKey("id"));
			expect(array).toStrictEqual(expected);
		});

		test(`ddb.deleteById(${toLiteral(idOne)}) === true`, async () => {
			expect(await ddb.deleteById(idOne)).toBe(true);
		});

		test(`ddb.deleteById(${toLiteral(idTwo)}) === true`, async () => {
			expect(await ddb.deleteById(idTwo)).toBe(true);
		});

		test(`ddb.getById(${toLiteral(idTwo)}) === undefined`, async () => {
			expect(await ddb.getById(idTwo)).toBeUndefined();
		});

	});
});
