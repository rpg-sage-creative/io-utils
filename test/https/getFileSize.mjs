import { assert, runTests } from "@rsc-utils/core-utils";
import { getFileSize } from "../../build/index.js";

runTests(async function test_getFileSize() {
	const url = "https://rpgsage.io/images/docs/invite-permission-list.jpg";
	const expectedFileSize = 21413;
	const fileSize = await getFileSize(url);
	assert(fileSize === expectedFileSize, `Invalid File Size (${fileSize}): ${url}`);
}, true);