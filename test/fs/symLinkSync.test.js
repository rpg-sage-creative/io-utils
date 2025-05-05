import { enableLogLevels } from "@rsc-utils/core-utils";
import { deleteFileSync, fileExistsSync, readJsonFileSync, symLinkSync } from "../../build/index.js";

enableLogLevels("development");

describe("fs", () => {
	describe("symLinkSync", () => {

		const TEST_ROOT = "./test/fs";

		const dir = `${TEST_ROOT}/files`;
		const file = `${dir}/jsonFile.json`;
		const original = `./jsonFile.json`
		const link = `${dir}/jsonFile.link-sync.json`;

		test(`link ${file} as ${link}`, () => {
			expect(fileExistsSync(file)).toBe(true);
			expect(fileExistsSync(link)).toBe(false);
			expect(symLinkSync(original, link, { overwrite:true })).toBe(true);
			expect(fileExistsSync(link)).toBe(true);
			expect(readJsonFileSync(file)).toStrictEqual(readJsonFileSync(link));
			expect(deleteFileSync(link)).toBeTruthy();
		});

	});
});