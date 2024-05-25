import { debug, info, warn, assert, runTests, startAsserting, stopAsserting } from "@rsc-utils/core-utils";

runTests(async function testFunction() {
	assert(false, "No Tests!");
	info();
	debug();
	warn();
	error();
}, true);
