import { assert, error, runTests } from "@rsc-utils/core-utils";
import { readFile, readFileSync, readJsonDb, readJsonDbSync, readJsonFile, readJsonFileSync, readText, readTextSync } from "../../build/index.js";

const TEST_ROOT = "./test/fs";

runTests(async function test_readFiles() {
	const readFileNotFound = await readFile(`${TEST_ROOT}/files/_jsonFile.json`).catch(error);
	assert(false, Buffer.isBuffer, readFileNotFound);

	const readFileSyncNotFound = readFileSync(`${TEST_ROOT}/files/_jsonFile.json`);
	assert(false, Buffer.isBuffer, readFileSyncNotFound);

	const readFileBuffer = await readFile(`${TEST_ROOT}/files/jsonFile.json`);
	assert(true, Buffer.isBuffer, readFileBuffer);

	const readFileSyncBuffer = readFileSync(`${TEST_ROOT}/files/jsonFile.json`);
	assert(true, Buffer.isBuffer, readFileSyncBuffer);

	const readTextContent = await readText(`${TEST_ROOT}/files/jsonFile.json`);
	assert(`{"index":0,"name":"zero"}`, () => readTextContent);

	const readTextSyncContent = readTextSync(`${TEST_ROOT}/files/jsonFile.json`);
	assert(`{"index":0,"name":"zero"}`, () => readTextSyncContent);

	const readJsonObject = await readJsonFile(`${TEST_ROOT}/files/jsonFile.json`);
	assert({"index":0,"name":"zero"}, () => readJsonObject);

	const readJsonSyncObject = readJsonFileSync(`${TEST_ROOT}/files/jsonFile.json`);
	assert({"index":0,"name":"zero"}, () => readJsonSyncObject);

	const readJsonDbArray = await readJsonDb(`${TEST_ROOT}/files/jsonDb.json.db`);
	assert([{"index":0,"name":"zero"},{"index":1,"name":"one","bigInt":9223372036854775807n}], () => readJsonDbArray);

	const readJsonDbSyncArray = readJsonDbSync(`${TEST_ROOT}/files/jsonDb.json.db`);
	assert([{"index":0,"name":"zero"},{"index":1,"name":"one","bigInt":9223372036854775807n}], () => readJsonDbSyncArray);

}, true);