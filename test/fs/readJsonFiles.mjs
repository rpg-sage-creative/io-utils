import { assertAsync, runTests } from "@rsc-utils/core-utils";
import { readJsonFiles } from "../../build/index.js";

const TEST_ROOT = "./test/fs";

runTests(async function test_readJsonFiles() {
	const path = TEST_ROOT;

	const data = [
		{"index":0,"name":"one"},
		{"index":0,"name":"two"}
	];

	const contentFilter = json => ["one","two"].includes(json.name);

	await assertAsync(data, readJsonFiles, path + "/files", { contentFilter });

}, true);