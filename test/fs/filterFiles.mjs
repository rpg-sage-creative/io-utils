import { assert, assertAsync, runTests } from "@rsc-utils/core-utils";
import { filterFiles, filterFilesSync } from "../../build/index.js";

const TEST_ROOT = "./test/fs";

runTests(async function test_filterFiles() {
	const path = TEST_ROOT;
	const files = [
		'filterFiles.mjs',
		'findJsonFile.mjs',
		'isDir.mjs',
		'listFiles.mjs',
		'readFiles.mjs',
		'readJsonFiles.mjs',
		'writeFiles.mjs'
	].map(f => `${TEST_ROOT}/${f}`);

	assert(files, filterFilesSync, path, "mjs");
	await assertAsync(files, filterFiles, path, "mjs");

	const _recursiveFiles = [
		'files/jsonDb.json.db',
		'files/jsonFile.json',
		'files/jsonFileOne.json',
		'files/jsonFileTwo.json',
		'filterFiles.mjs',
		'findJsonFile.mjs',
		'isDir.mjs',
		'listFiles.mjs',
		'readFiles.mjs',
		'readJsonFiles.mjs',
		'writeFiles.mjs'
	];
	const recursiveFilePaths = _recursiveFiles.map(f => `${TEST_ROOT}/${f}`);
	const justJson = recursiveFilePaths.filter(s => s.endsWith("json"));

	function notOut(f) { return f !== "out"; }

	assert(recursiveFilePaths, filterFilesSync, path, { fileFilter:notOut, recursive:true });
	await assertAsync(recursiveFilePaths, filterFiles, path, { fileFilter:notOut, recursive:true });

	assert(justJson, filterFilesSync, path, { fileExt:"json", recursive:true });
	await assertAsync(justJson, filterFiles, path, { fileExt:"json", recursive:true });

}, true);