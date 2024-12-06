import { toLiteral } from "@rsc-utils/core-utils";
import { isDir, isDirSync } from "../../build/index.js";

describe("fs", () => {

	const TEST_ROOT = "./test/fs";

	const dir = `${TEST_ROOT}/files`;
	const file = `${TEST_ROOT}/isDir.test.js`;
	const invalid = `${TEST_ROOT}/NOT_VALID.js`;

	describe("isDir", () => {

		test(`isDir(${toLiteral(dir)}) === true`, async () => {
			expect(await isDir(dir)).toBe(true);
		});

		test(`isDir(${toLiteral(file)}) === false`, async () => {
			expect(await isDir(file)).toBe(false);
		});

		test(`isDir(${toLiteral(invalid)}) should throw`, async () => {
			let err;
			await isDir(invalid).catch(_err => err = _err);
			expect(err).toBeDefined();
		});

	});

	describe("isDirSync", () => {

		test(`isDirSync(${toLiteral(dir)}) === true`, () => {
			expect(isDirSync(dir)).toBe(true);
		});

		test(`isDirSync(${toLiteral(file)}) === false`, () => {
			expect(isDirSync(file)).toBe(false);
		});

		test(`isDirSync(${toLiteral(invalid)}) === false`, () => {
			expect(isDirSync(invalid)).toBe(false);
		});

	});
});