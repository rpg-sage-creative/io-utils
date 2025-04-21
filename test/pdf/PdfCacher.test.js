import { error } from "@rsc-utils/core-utils";
import { PdfCacher, PdfJsonFieldManager } from "../../build/index.js";

beforeAll(() => {
	process.env.dataRoot = "./test";
});

describe("pdf", () => {
	describe("PdfCacher", () => {

		test(`https://pf2.rpgsage.io/pathbuilder-2e-mal-level-4.pdf`, async () => {
			const urlOne = "https://pf2.rpgsage.io/pathbuilder-2e-mal-level-4.pdf";
			const contentOne = await PdfCacher.read(urlOne).catch(error);
			expect(contentOne).toBeDefined();
			const managerOne = PdfJsonFieldManager.from(contentOne);
			const nameOne = managerOne.getValue("CharacterName");
			expect(nameOne).toBe("Malken'throp (Mal)");
			// writeFileSync("./test/pdf/out/mal.json", contentOne);
		});

	});
});
// runTests(async function test_PdfUtils() {
// 	const urlOne = "https://pf2.rpgsage.io/pathbuilder-2e-mal-level-4.pdf";
// 	const contentOne = await PdfCacher.read(urlOne).catch(error);
// 	assert(!!contentOne, "File (Mal) was NOT cached and read.");
// 	const managerOne = PdfJsonFieldManager.from(contentOne);
// 	const nameOne = managerOne.getValue("CharacterName");
// 	assert(nameOne === "Malken'throp (Mal)", `Wrong CharacterName: ${nameOne}`);
// 	// writeFileSync("./test/pdf/out/mal.json", contentOne);

// 	const urlTwo = `file://Users/randaltmeyer/git/rsc/io-utils/test/pdf/in/1264091676897448063.pdf`;
// 	const managerTwo = await PdfCacher.createManager(urlTwo).catch(error);
// 	const nameTwo = managerTwo.getString("Character_Name");
// 	const ale_1 = managerTwo.isChecked("Ale_1");
// 	assert(nameTwo === "Todd Campbell", `Wrong Character_Name: ${nameTwo}`);
// 	assert(ale_1, `Not Checked (Ale_1): ${ale_1}`);
// 	// writeFileSync("./test/pdf/out/todd.json", contentTwo);

// 	const urlThree = `file://Users/randaltmeyer/git/rsc/io-utils/test/pdf/in/BudMastercraft.pdf`;
// 	const contentThree = await PdfCacher.read(urlThree).catch(error);
// 	assert(!!contentThree, "File (Bud) was NOT cached and read.");
// 	const managerThree = new PdfJsonFieldManager(contentThree, f => ({ id:+f.name.replace(/\D/g, ""), ...f }));
// 	const nameThree = managerThree.getValue(1);
// 	assert(nameThree === "Character Name", `Wrong Character_Name: ${nameThree}`);

// 	const urlFour = `file://Users/randaltmeyer/git/rsc/io-utils/test/pdf/in/Tjut!.pdf`;
// 	const contentFour = await PdfCacher.read(urlFour).catch(error);
// 	assert(!contentFour, `Tjut! can't be read, thus this should be false, negated, and thus ok.`);
// 	// assert(!!contentFour, "File (Tjut!) was NOT cached and read.");
// 	// const managerFour = new PdfJsonFieldManager(contentFour, f => ({ id:+f.name.replace(/\D/g, ""), ...f }));
// 	// const nameFour = managerFour.getValue(1);
// 	// assert(nameFour === "Tjut!", `Wrong Character_Name: ${nameFour}`);
// }, true);
