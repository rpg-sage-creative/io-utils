const tests = [
	{ deserialized:null, serialized:{NULL:true} },
	{ deserialized:true, serialized:{BOOL:true} },
	{ deserialized:false, serialized:{BOOL:false} },
	{ deserialized:"", serialized:{S:""} },
	{ deserialized:"one", serialized:{S:"one"} },
	{ deserialized:1, serialized:{N:"1"} },
	{ deserialized:1.2, serialized:{N:"1.2"} },
	{ deserialized:BigInt("12345678901234567890"), serialized:{S:"bigint-12345678901234567890n"} },
	{ deserialized:{}, serialized:{M:{}} },
	{ deserialized:{a:"A"}, serialized:{M:{a:{S:"A"}}} },
	{ deserialized:{a:"A",b:{c:"C"}}, serialized:{M:{a:{S:"A"},b:{M:{c:{S:"C"}}}}} },
	{ deserialized:{a:"A",b:{c:"C"},d:[1]}, serialized:{M:{a:{S:"A"},b:{M:{c:{S:"C"}}},d:{L:[{N:"1"}]}}} },
	{ deserialized:[], serialized:{L:[]} },
	{ deserialized:["",0,{a:"A"}], serialized:{L:[{S:""},{N:"0"},{M:{a:{S:"A"}}}]} },
	{ deserialized:new Set(["a","b","c"]), serialized:{SS:["a","b","c"]} },
	{ deserialized:new Set([1,2,3]), serialized:{NS:["1","2","3"]} },
	{ deserialized:new Set([1,"2"]), serialized:{M:{$SET$:{L:[{N:"1"},{S:"2"}]}}} },
];

export function getTests(which) {
	switch(which) {
		case "serialize": return tests;
		case "deserialize": return tests;
		default: return [];
	}
}