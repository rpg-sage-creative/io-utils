import csvParser from "csv-parser";
import { Readable as ReadableStream, Transform } from "node:stream";
function withResolvers(input, parserOptions) {
    const { promise, resolve: _resolve, reject: _reject } = Promise.withResolvers();
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
    const resolve = (value) => {
        destroy();
        _resolve(value);
    };
    const reject = (err) => {
        destroy();
        _reject(err);
    };
    pipe = stream
        .pipe(parser)
        .once("error", reject)
        .once("close", resolve);
    return {
        pipe,
        promise,
        resolve,
        reject
    };
}
const DelimiterRegExp = (/(?<delim>[^\w "])/);
async function detectSeparator(input) {
    const { pipe, promise, resolve } = withResolvers(input);
    pipe.once("headers", headers => {
        if (headers.length > 1)
            return resolve(",");
        if (headers.length === 1) {
            const match = DelimiterRegExp.exec(headers[0]);
            if (match) {
                return resolve(match.groups.delim);
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
    let parserOptions = {};
    if (opts) {
        parserOptions = typeof (opts) === "string"
            ? { separator: opts }
            : opts;
    }
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
    if (keys.length <= 1) {
        return undefined;
    }
    return { keys, items, delimiter };
}
