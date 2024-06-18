import { assert, runTests } from "@rsc-utils/core-utils";
import { isDir, isDirSync } from "../../build/index.js";

runTests(async function test_isDir() {
	const TEST_ROOT = "./test/fs";

	assert(true, isDirSync, `${TEST_ROOT}/files`);
	assert(false, isDirSync, `${TEST_ROOT}/listFiles.mjs`);

	const dirTrue = await isDir(`${TEST_ROOT}/files`);
	const dirFalse = await isDir(`${TEST_ROOT}/listFiles.mjs`);
	assert(true, () => dirTrue);
	assert(false, () => dirFalse);

}, true);