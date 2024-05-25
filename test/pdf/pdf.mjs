import { assert, error, runTests } from "@rsc-utils/core-utils";
import { PdfCacher, PdfJsonFieldManager, writeFileSync } from "../../build/index.js";

runTests(async function test_PdfUtils() {
	const url = "https://pf2.rpgsage.io/pathbuilder-2e-mal-level-4.pdf";
	const content = await PdfCacher.read(url).catch(error);
	assert(!!content, "File was NOT cached and read.");
	const fields = PdfJsonFieldManager.from(content);
	const name = fields.findValue("CharacterName");
	assert(name === "Malken'throp (Mal)", `Wrong CharacterName: ${name}`);
	// writeFileSync("./test/mal.json", content);
}, true);
