import { toLiteral } from "@rsc-utils/core-utils";
import { serialize } from "../../../build/ddb/internal/serialize.js";
import { getTests } from "../data.js";

describe("ddb", () => {
	describe("serialize", () => {

		const tests = getTests("serialize");

		tests.forEach(({ serialized, deserialized }) => {
			test(`serialize(${toLiteral(deserialized)}) === ${toLiteral(serialized)}`, () => {
				expect(serialize(deserialized)).toStrictEqual(serialized);
			});
		});

	});
});