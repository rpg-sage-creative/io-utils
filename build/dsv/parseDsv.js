import csvParser from "csv-parser";
import { Readable as ReadableStream, Transform } from "node:stream";
function withResolvers(input, parserOptions) {
    const { promise, resolve, reject } = Promise.withResolvers();
    let stream = ReadableStream.from(input);
    let parser = csvParser(parserOptions);
    let pipe;
    const destroy = () => {
        stream?.destroy();
        stream = undefined;
        parser?.destroy();
        parser = undefined;
        pipe?.destroy();
        pipe = undefined;
    };
    const _resolve = (value) => { destroy(); resolve(value); };
    const _reject = (err) => { destroy(); reject(err); };
    pipe = stream.pipe(parser).once("error", _reject).once("close", _resolve);
    return { pipe, promise, resolve: _resolve, reject: _reject };
}
async function detectSeparator(input) {
    const { pipe, promise, resolve } = withResolvers(input);
    pipe.once("headers", headers => {
        if (headers.length > 1)
            return resolve(",");
        if (headers.length === 1) {
            const match = /([^\w "])/.exec(headers[0]);
            if (match) {
                return resolve(match[0]);
            }
        }
        return resolve(undefined);
    });
    return promise;
}
export async function parseDsv(input, opts) {
    if (typeof (input) !== "string" && !Buffer.isBuffer(input)) {
        throw new RangeError(`Invalid Data: parseDsv(${input})`);
    }
    let parserOptions = opts ? typeof (opts) === "string" ? { separator: opts } : opts : {};
    if (!parserOptions?.separator) {
        parserOptions.separator = await detectSeparator(input);
    }
    const keys = [];
    const items = [];
    const delimiter = parserOptions.separator ?? ",";
    const { pipe, promise } = withResolvers(input, parserOptions);
    pipe.on("headers", (headers) => headers.forEach(key => keys.push(key)));
    pipe.on("data", (data) => items.push(data));
    await promise;
    if (keys.length <= 1)
        return undefined;
    return { keys, items, delimiter };
}
