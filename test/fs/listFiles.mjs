import { assert, assertAsync, runTests } from "@rsc-utils/core-utils";
import { listFiles, listFilesSync } from "../../build/index.js";

const TEST_ROOT = "./test/fs";

runTests(async function test_listFiles() {
	const path = TEST_ROOT;
	const files = [
		'files',
		'filterFiles.mjs',
		'findJsonFile.mjs',
		'isDir.mjs',
		'listFiles.mjs',
		'readFiles.mjs',
		'readJsonFiles.mjs',
		'writeFiles.mjs'
	];
	const mjsFiles = files.filter(s => s.endsWith(".mjs"));

	assert(files, listFilesSync, path);
	await assertAsync(files, listFiles, path);

	assert(mjsFiles, listFilesSync, path, "mjs");
	await assertAsync(mjsFiles, listFiles, path, "mjs");

}, true);