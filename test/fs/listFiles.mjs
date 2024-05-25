import { assert, runTests } from "@rsc-utils/core-utils";
import { filterFiles, listFiles, listFilesSync } from "../../build/index.js";

const TEST_ROOT = "./test/fs";

runTests(async function test_listFiles() {
	const path = TEST_ROOT;
	const files = [
		'files',
		'listFiles.mjs',
		'readFiles.mjs',
		'writeFiles.mjs'
	];
	assert(files, listFilesSync, path);

	const waitedFiles = await listFiles(path);
	assert(files, () => waitedFiles);

	const _filteredFiles = files.filter(f=>f!=="files").map(f => `${TEST_ROOT}/${f}`);
	const filteredFiles = await filterFiles(path, f => f !== "files");
	assert(_filteredFiles, () => filteredFiles);

	const _recursiveFiles = [
		'files',
		'files/jsonDb.json.db',
		'files/jsonFile.json',
		'listFiles.mjs',
		'readFiles.mjs',
		'writeFiles.mjs'
	].map(f => `${TEST_ROOT}/${f}`);
	const recursiveFiles = await filterFiles(path, f => f !== "out", true);
	assert(_recursiveFiles, () => recursiveFiles);
}, true);