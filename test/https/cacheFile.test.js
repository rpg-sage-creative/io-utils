import { toLiteral } from "@rsc-utils/core-utils";
import { existsSync, rmSync, statSync } from "fs";
import { cacheFile } from "../../build/index.js";

const filePath = "./invite-permission-list.jpg";

function deleteCacheFile() {
	try { if (existsSync(filePath)) rmSync(filePath); }catch(ex) { }
}

beforeAll(() => deleteCacheFile());

afterAll(() => deleteCacheFile());

describe("https", () => {
	describe("cacheFile", () => {

		const url = "https://rpgsage.io/images/docs/invite-permission-list.jpg";
		const expectedFileSize = 21413;

		test(`cacheFile(${toLiteral(url)})`, async () => {
			const cached = await cacheFile(url, filePath);
			expect(cached).toBe(true);

			const fileSize = statSync(filePath).size;
			expect(fileSize).toBe(expectedFileSize);
		});

		test.todo("figure out how to log validate logging progress");

	});
});