import { assertAsync, runTests } from "@rsc-utils/core-utils";
import { findJsonFile } from "../../build/index.js";

const TEST_ROOT = "./test/fs";

runTests(async function test_findJsonFile() {
	const path = TEST_ROOT;

	await assertAsync({"index":0,"name":"one"}, findJsonFile, path + "/files", { contentFilter:json => json.name === "one" });
	await assertAsync({"index":0,"name":"two"}, findJsonFile, path + "/files", { contentFilter:json => json.name === "two" });

}, true);