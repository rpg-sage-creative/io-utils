import { assert, runTests } from "@rsc-utils/core-utils";
import { ImageCacher } from "../../build/index.js";

async function test(url, size, width, height, type) {
	const meta = await ImageCacher.readMetadata(url);
	assert(true, m => !!m, meta);
	if (meta) {
		assert(size, m => m.size, meta);
		assert(width, m => m.width, meta);
		assert(height, m => m.height, meta);
		assert(type, m => m.type, meta);
	}
}

runTests(async function test_ImageCacher() {
	await test("https://rpgsage.io/test-images/259x591-21413.jpg", 21413, 259, 591, "jpeg");
	await test("https://rpgsage.io/test-images/32x32-4871.png", 4871, 32, 32, "png");
	await test("https://rpgsage.io/test-images/2494x2046-75630.webp", 75630, 2494, 2046, "webp");
	await test("https://rpgsage.io/test-images/411x412-499203.gif", 499203, 411, 412, "gif");
	// await test("file:///Users/randaltmeyer/Downloads/AnimatedPath_0.66.v2.gif", 499203, 411, 412, "gif");
}, true);