import { toLiteral } from "@rsc-utils/core-utils";
import { filterFiles, filterFilesSync } from "../../build/index.js";

describe("fs", () => {

	const path = "./test/fs";

	const testFiles = [
		'filterFiles.test.js',
		'findJsonFile.test.js',
		'isDir.test.js',
		'listFiles.test.js',
		'readFiles.test.js',
		'readJsonFiles.test.js',
		'writeFiles.test.js',
	].map(f => `${path}/${f}`);

	const recursiveFiles = [
		'files/jsonDb.json.db',
		'files/jsonFile.json',
		'files/jsonFileOne.json',
		'files/jsonFileTwo.json',
	]
	.map(f => `${path}/${f}`)
	.concat(testFiles);

	const recursiveJsonFiles = recursiveFiles.filter(s => s.endsWith("json"));

	const tests = [
		{ path, options:{ fileExt:"test.js" }, files:testFiles },
		{ path, options:{ fileFilter:f => f !== "out", recursive:true }, files:recursiveFiles },
		{ path, options:{ fileExt:"json", recursive:true }, files:recursiveJsonFiles },
	];

	describe("filterFiles", () => {

		tests.forEach(({ path, options, files }) => {
			test(`filterFiles(${toLiteral(path)}, ${toLiteral(options)})`, async () => {
				expect(await filterFiles(path, options)).toStrictEqual(files);
			});
		});

	});

	describe("filterFilesSync", () => {

		tests.forEach(({ path, options, files }) => {
			test(`filterFilesSync(${toLiteral(path)}, ${toLiteral(options)})`, () => {
				expect(filterFilesSync(path, options)).toStrictEqual(files);
			});
		});

	});
});
