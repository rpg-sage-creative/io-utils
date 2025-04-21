import { fileExists } from "../../build/index.js";

describe("fs", () => {
	describe("fileExists", () => {

		const TEST_ROOT = "./test/fs";

		const dir = `${TEST_ROOT}/files`;
		const file = `${TEST_ROOT}/fileExists.test.js`;
		const invalid = `${TEST_ROOT}/NOT_VALID.js`;

		test(`${dir} exists`, async () => {
			expect(await fileExists(dir)).toBe(true);
		});
		test(`${file} exists`, async () => {
			expect(await fileExists(file)).toBe(true);
		});
		test(`${invalid} exists`, async () => {
			expect(await fileExists(invalid)).toBe(false);
		});

	});
});