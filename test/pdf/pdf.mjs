import { assert, error, runTests } from "@rsc-utils/core-utils";
import { PdfCacher, PdfJsonFieldManager } from "../../build/index.js";

runTests(async function test_PdfUtils() {
	const url = "https://pf2.rpgsage.io/pathbuilder-2e-mal-level-4.pdf";
	const content = await PdfCacher.read(url).catch(error);
	assert(!!content, "File was NOT cached and read.");
	const fields = PdfJsonFieldManager.from(content);
	const name = fields.getValue("CharacterName");
	assert(name === "Malken'throp (Mal)", `Wrong CharacterName: ${name}`);
	// writeFileSync("./test/mal.json", content);

	const urlTwo = `file://Users/randaltmeyer/git/rsc/io-utils/test/pdf/in/1264091676897448063.pdf`;
	const managerTwo = await PdfCacher.createManager(urlTwo).catch(error);
	const nameTwo = managerTwo.getNonBlankString("Character_Name");
	const ale_1 = managerTwo.isChecked("Ale_1");
	assert(nameTwo === "Todd Campbell", `Wrong Character_Name: ${nameTwo}`);
	assert(ale_1, `Not Checked (Ale_1): ${ale_1}`);
	// writeFileSync("./test/todd.json", contentTwo);
}, true);
