import { toLiteral } from "@rsc-utils/core-utils";
import { getJson } from "../../build/index.js";

describe("https", () => {
	describe("getJson", () => {

		const url = "https://pf2.rpgsage.io/abc/some.json";

		test(`getJson(${toLiteral(url)})`, async () => {
			const json = await getJson(url);
			expect(Array.isArray(json)).toBe(true);
		});

	});
});