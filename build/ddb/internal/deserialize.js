import { debug } from "@rsc-utils/core-utils";
function deserializeSet(value) {
    const set = new Set();
    value.L.forEach(val => set.add(deserialize(val)));
    return set;
}
export function deserializeObject(value) {
    return Object.keys(value).reduce((out, key) => {
        try {
            out[key] = deserialize(value[key]);
        }
        catch {
            debug({ key, value: value[key] });
        }
        return out;
    }, {});
}
export function deserialize(value) {
    if ("NULL" in value) {
        return value.NULL === true ? null : undefined;
    }
    if ("L" in value) {
        return value.L?.map(deserialize);
    }
    if (value.M?.["$SET$"]) {
        return deserializeSet(value.M.$SET$);
    }
    if ("NS" in value) {
        return new Set(value.NS.map(Number));
    }
    if ("SS" in value) {
        return new Set(value.SS);
    }
    if ("B" in value) {
        return Buffer.from(value.B);
    }
    if (value.M?.["$BIGINT$"]?.S) {
        return BigInt(value.M.$BIGINT$?.S);
    }
    if ("BOOL" in value) {
        return value.BOOL === true;
    }
    if ("N" in value) {
        return +value.N;
    }
    if ("S" in value) {
        return value.S;
    }
    if ("M" in value) {
        return deserializeObject(value.M);
    }
    throw new Error(`Cannot deserialize: ${JSON.stringify(value)}`);
}
