import { deleteFileSync, writeFileSync } from "../../build/index.js";

describe("fs", () => {
	describe("deleteFileSync", () => {

		test(`deleteFileSync("made_up_path") === true`, () => {
			expect(deleteFileSync("made_up_path")).toBe(true);
		});
		test(`deleteFileSync("made_up_path", { force:false }) === true`, () => {
			expect(() => deleteFileSync("made_up_path", { force:false })).toThrow();
		});
		test(`deleteFileSync("made_up_path", { checkExists:"before" }) === "NotFound"`, () => {
			expect(deleteFileSync("made_up_path", { checkExists:"before" })).toBe("NotFound");
		});
		test(`deleteFileSync("made_up_path", { checkExists:true }) === "NotFound"`, () => {
			expect(deleteFileSync("made_up_path", { checkExists:true })).toBe("NotFound");
		});

		test(`deleteFileSync("made_up_path", { checkExists:true }) === "NotFound"`, () => {
			writeFileSync("made_up_path", "made_up_path");
			expect(deleteFileSync("made_up_path", { checkExists:true })).toBe(true);
		});

	});
});