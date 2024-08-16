function serializeArrayOrSet(value) {
    if (Array.isArray(value)) {
        return { L: value.map(serialize) };
    }
    if (value instanceof Set) {
        const values = [...value];
        const types = { s: false, n: false, o: false };
        for (const val of values) {
            const type = typeof (val);
            if (type === "string") {
                types.s = true;
            }
            else if (type === "number") {
                types.n = true;
            }
            else {
                types.o = true;
            }
            if (types.o || (types.n && types.s)) {
                break;
            }
        }
        if (types.s && !types.n && !types.o) {
            return { SS: values };
        }
        if (types.n && !types.s && !types.o) {
            return { NS: values.map(String) };
        }
        return serialize({ $SET$: values });
    }
    return undefined;
}
function serializeObject(value) {
    return Object.keys(value).reduce((out, key) => {
        out.M[key] = serialize(value[key]);
        return out;
    }, { M: {} });
}
export function serialize(value) {
    if (value === null)
        return { NULL: true };
    const arrayOrSet = serializeArrayOrSet(value);
    if (arrayOrSet !== undefined)
        return arrayOrSet;
    if (Buffer.isBuffer(value))
        return { B: new Uint8Array(value) };
    switch (typeof (value)) {
        case "bigint": return { S: `bigint-${value}n` };
        case "boolean": return { BOOL: value };
        case "number": return { N: String(value) };
        case "string": return { S: String(value) };
        case "object": return serializeObject(value);
        case "function": throw new Error("Cannot serialize: function");
        case "symbol": throw new Error("Cannot serialize: symbol");
        case "undefined": throw new Error("Cannot serialize: undefined");
        default: throw new Error(`Cannot serialize: ${typeof (value)}`);
    }
}
