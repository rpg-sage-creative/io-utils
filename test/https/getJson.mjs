import { assert, error, runTests } from "@rsc-utils/core-utils";
import { getJson } from "../../build/index.js";

runTests(async function test_getJson() {
	const json = await getJson("https://pf2.rpgsage.io/abc/some.json").catch(error);
	assert(true, Array.isArray, json);
}, true);
