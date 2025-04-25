import { deleteFile, writeFileSync } from "../../build/index.js";

describe("fs", () => {
	describe("deleteFile", () => {

		// default force is true, which bypasses errors deleting a non-existant file
		test(`deleteFile("made_up_path") === true`, async () => {
			expect(await deleteFile("made_up_path")).toBe(true);
		});
		// passing in force causes it to throw
		test(`deleteFile("made_up_path", { force:false }) !== true`, async () => {
			expect(await deleteFile("made_up_path", { force:false }).catch(()=>{})).not.toBe(true);
		});

		test(`deleteFile("made_up_path", { checkExists:"before" }) === "NotFound"`, async () => {
			expect(await deleteFile("made_up_path", { checkExists:"before" })).toBe("NotFound");
		});
		test(`deleteFile("made_up_path", { checkExists:"before", force:false }) === "NotFound"`, async () => {
			expect(await deleteFile("made_up_path", { checkExists:"before", force:false })).toBe("NotFound");
		});

		test(`deleteFile("made_up_path", { checkExists:true }) === "NotFound"`, async () => {
			expect(await deleteFile("made_up_path", { checkExists:true })).toBe("NotFound");
		});

		test(`deleteFile("made_up_path", { checkExists:true }) === "NotFound"`, async () => {
			writeFileSync("made_up_path", "made_up_path");
			expect(await deleteFile("made_up_path", { checkExists:true })).toBe(true);
		});

	});
});