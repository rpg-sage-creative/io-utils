import { rm } from "fs";
import { fileExists, readJsonFile, symLink } from "../../build/index.js";
import { enableLogLevels } from "@rsc-utils/core-utils";

enableLogLevels("development");

describe("fs", () => {
	describe("symLink", () => {

		const TEST_ROOT = "./test/fs";

		const dir = `${TEST_ROOT}/files`;
		const file = `${dir}/jsonFile.json`;
		const original = `./jsonFile.json`
		const link = `${dir}/jsonFile.link.json`;

		test(`link ${file} as ${link}`, async() => {
			expect(await fileExists(file)).toBe(true);
			expect(await fileExists(link)).toBe(false);
			expect(await symLink(original, link, { overwrite:true })).toBe(true);
			expect(await fileExists(link)).toBe(true);
			expect(await readJsonFile(file)).toStrictEqual(await readJsonFile(link));
			expect(() => new Promise(res => rm(link, { force:true }, res))).not.toThrow();
		});

	});
});