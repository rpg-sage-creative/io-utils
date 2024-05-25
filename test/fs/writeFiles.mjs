import { assert, runTests } from "@rsc-utils/core-utils";
import { appendJsonDb, deleteFileSync, readTextSync, writeFile, writeFileSync } from "../../build/index.js";

const TEST_ROOT = "./test/fs";

runTests(async function test_writeFiles() {

	const filePath = `${TEST_ROOT}/files/out/file.txt`;
	writeFileSync(filePath, `{"index":0,"name":"zero"}`, true);
	assert(`{"index":0,"name":"zero"}`, readTextSync, filePath);
	assert(true, deleteFileSync, filePath);

	await writeFile(filePath, `{"index":0,"name":"zero"}`);
	assert(`{"index":0,"name":"zero"}`, readTextSync, filePath);
	assert(true, deleteFileSync, filePath);

	writeFileSync(filePath, {"index":0,"name":"zero","bigInt":9223372036854775807n});
	assert(`{"index":0,"name":"zero","bigInt":"bigint-9223372036854775807n"}`, readTextSync, filePath);
	assert(true, deleteFileSync, filePath);

	await writeFile(filePath, {"index":0,"name":"zero"});
	assert(`{"index":0,"name":"zero"}`, readTextSync, filePath);
	await appendJsonDb(filePath, {"index":1,"name":"one"});
	assert(`{"index":0,"name":"zero"}\n{"index":1,"name":"one"}`, readTextSync, filePath);
	assert(true, deleteFileSync, filePath);

}, true);