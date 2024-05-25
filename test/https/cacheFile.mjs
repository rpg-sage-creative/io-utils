import { assert, error, errorReturnFalse, runTests } from "@rsc-utils/core-utils";
import { existsSync, rmSync, statSync } from "fs";
import { cacheFile } from "../../build/index.js";

async function _test_cacheFile(logPercent = false) {
	const filePath = "./invite-permission-list.jpg";
	try {
		if (existsSync(filePath)) {
			// verbose(`rmSync("${filePath}");`);
			rmSync(filePath);
		}
	}catch(ex) {
		error(`Deleting file: ${cacheFile}`, ex);
	}

	const url = "https://rpgsage.io/images/docs/invite-permission-list.jpg";
	try {
		// verbose(`const cached = await cacheFile("${url}", "${filePath}").catch(errorReturnFalse);`);
		const cached = await cacheFile(url, filePath, logPercent ? { logPercent } : undefined).catch(errorReturnFalse);
		// verbose({cached});
		// verbose(`Asserting cacheFile exists.`);
		assert(existsSync(filePath), `Error caching: ${url}`);
	}catch(ex) {
		error(`Caching url (${url}) to file (${filePath})`, ex);
	}

	try {
		const expectedFileSize = 21413;
		const fileSize = statSync(filePath).size;
		// verbose(`Asserting fileSize is ${expectedFileSize}.`);
		assert(fileSize === expectedFileSize, `Invalid cacheFile: ${filePath} (${fileSize})`);
	}catch(ex) {
		error(`Checking fileSize: ${filePath}`, ex);
	}

	try {
		if (existsSync(filePath)) {
			// verbose(`rmSync("${filePath}");`);
			rmSync(filePath);
		}
	}catch(ex) {
		error(`Deleting file: ${cacheFile}`, ex);
	}
}

runTests(async function test_cacheFile() {
	await _test_cacheFile(false);
	await _test_cacheFile(true);
}, true);