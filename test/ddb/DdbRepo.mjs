import { assert, error, runTests, randomSnowflake } from "@rsc-utils/core-utils";
import { DdbRepo } from "../../build/index.js";

runTests(async function test_DdbRepo() {
	const ddb = await DdbRepo.for("Servers");

	const id = randomSnowflake();
	const objectType = "Server";
	const name = `Random Server: ${id}`;
	const server = { name, id, objectType };

	const foundZero = await ddb.getById(id);
	assert(undefined, o => o, foundZero);

	const saved = await ddb.save(server);
	assert(true, o => o, saved);

	const found = await ddb.getById(id);
	assert(server, o => o, found);

	const array = await ddb.getByIds(id);
	assert([server], o => o, array);

	const deleted = await ddb.deleteById(id);
	assert(true, o => o, deleted);

	const foundTwo = await ddb.getById(id);
	assert(undefined, o => o, foundTwo);

}, true);