import { tagLiterals } from "@rsc-utils/core-utils";
import { getJson } from "../../build/index.js";

describe("https", () => {
	describe("getJson", () => {

		const url = "https://pf2.rpgsage.io/abc/some.json";

		test(tagLiterals`getJson(${url})`, async () => {
			const json = await getJson(url);
			expect(Array.isArray(json)).toBe(true);
		});

		const urlTwo = "https://hephaistos.online/query";
		const dataTwo = {"query":`{\n\tcharacters(readOnlyPermalinkId: "213430835") {\n\t\tjson\n\t}\n}`};
		test(tagLiterals`getJson(${urlTwo}, ${dataTwo})`, async () => {
			const graphQlJson = await getJson(urlTwo, dataTwo);
			expect(graphQlJson).toBeDefined();
			const { data:{ characters:{ 0:{ json:raw } } } } = graphQlJson;
			// console.log({raw});
			const json = JSON.parse(raw);
			// console.log({json});
		});
	});
});