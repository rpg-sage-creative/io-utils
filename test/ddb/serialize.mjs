import { assert, error, runTests } from "@rsc-utils/core-utils";
import { serialize } from "../../build/ddb/internal/serialize.js";

runTests(async function test_serialize() {
	const tests = [
		[null, {NULL:true}],
		[true, {BOOL:true}],
		[false, {BOOL:false}],
		["", {S:""}],
		["one", {S:"one"}],
		[1, {N:"1"}],
		[1.2, {N:"1.2"}],
		[BigInt("12345678901234567890"), {S:"bigint-12345678901234567890n"}],
		[{}, {M:{}}],
		[{a:"A"}, {M:{a:{S:"A"}}}],
		[{a:"A",b:{c:"C"}}, {M:{a:{S:"A"},b:{M:{c:{S:"C"}}}}}],
		[{a:"A",b:{c:"C"},d:[1]}, {M:{a:{S:"A"},b:{M:{c:{S:"C"}}},d:{L:[{N:"1"}]}}}],
		[[], {L:[]}],
		[["",0,{a:"A"}], {L:[{S:""},{N:"0"},{M:{a:{S:"A"}}}]}],
		[new Set(["a","b","c"]),{SS:["a","b","c"]}],
		[new Set([1,2,3]),{NS:["1","2","3"]}],
		[new Set([1,"2"]),{M:{$SET$:{L:[{N:"1"},{S:"2"}]}}}],
	];
	tests.forEach(([value, serialValue]) => {
		assert(serialValue, serialize, value)
	});

}, true);