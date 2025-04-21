import { toLiteral } from "@rsc-utils/core-utils";
import { listFiles, listFilesSync } from "../../build/index.js";

const TEST_ROOT = "./test/fs";

describe("fs", () => {

	const path = TEST_ROOT;

	const testFiles = [
		'fileExists.test.js',
		'filterFiles.test.js',
		'findJsonFile.test.js',
		'isDir.test.js',
		'listFiles.test.js',
		'readFiles.test.js',
		'readJsonFiles.test.js',
		'symLink.test.js',
		'writeFiles.test.js',
	];

	const files = [
		'files',
	]
	.concat(testFiles)
	.sort();

	describe("listFiles", () => {

		test(`listFiles(${toLiteral(path)})`, async () => {
			expect(await listFiles(path)).toStrictEqual(files);
		});
		test(`listFiles(${toLiteral(path)}, "test.js")`, async () => {
			expect(await listFiles(path, "test.js")).toStrictEqual(testFiles);
		});

	});

	describe("listFilesSync", () => {

		test(`listFilesSync(${toLiteral(path)})`, async () => {
			expect(listFilesSync(path)).toStrictEqual(files);
		});
		test(`listFilesSync(${toLiteral(path)}, "test.js")`, async () => {
			expect(listFilesSync(path, "test.js")).toStrictEqual(testFiles);
		});

	});

});
