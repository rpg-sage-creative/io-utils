import { assert, info, runTests, randomSnowflake } from "@rsc-utils/core-utils";
import { DdbRepo } from "../../build/index.js";

function sortById(a, b) {
	return a.id === b.id ? 0 : a.id < b.id ? -1 : 1;
}

runTests(async function test_DdbRepo() {
	const ddb = await DdbRepo.for("Servers");

	const objectType = "Server";

	const idOne = randomSnowflake();
	const serverOne = { name:`Random Server: ${idOne}`, id:idOne, objectType };

	const idTwo = randomSnowflake();
	const serverTwo = { name:`Random Server: ${idTwo}`, id:idTwo, objectType };

	const foundZero = await ddb.getById(idOne);
	assert(undefined, o => o, foundZero);

	const savedOne = await ddb.save(serverOne);
	assert(true, o => o, savedOne);

	const savedTwo = await ddb.save(serverTwo);
	assert(true, o => o, savedTwo);

	const foundOne = await ddb.getById(idOne);
	assert(serverOne, o => o, foundOne);

	const array = await ddb.getByIds(idOne, idTwo);
	assert([serverOne, serverTwo].sort(sortById), o => o, array.sort(sortById));

	const deletedOne = await ddb.deleteById(idOne);
	assert(true, o => o, deletedOne);

	const deletedTwo = await ddb.deleteById(idTwo);
	assert(true, o => o, deletedTwo);

	const foundTwo = await ddb.getById(idTwo);
	assert(undefined, o => o, foundTwo);

}, true);