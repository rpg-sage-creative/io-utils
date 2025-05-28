import csvParser from "csv-parser";
import { Readable as ReadableStream, Transform } from "node:stream";

type ParserInput = string | Buffer;
export type DsvDelimiter = "," | "|" | "\t";

type StringRecord = Record<string, string>;
export type DsvResults<T extends StringRecord> = { keys:string[]; items:T[]; delimiter:DsvDelimiter; };

/**
 * A custom expansion of Promise.withResolvers() that wires up the stream to a parser and returns the pipe along with the promise/resolve/reject functions.
 * By handling the wiring of the stream in here we can reuse this logic while ensuring objects get torn down properly.
 */
function withResolvers<T>(input: ParserInput, parserOptions?: csvParser.Options) {
	const { promise, resolve, reject } = Promise.withResolvers<T>();

	// declare variables used in teardown (destroy)
	let stream: ReadableStream | undefined = ReadableStream.from(input);
	let parser: csvParser.CsvParser | undefined = csvParser(parserOptions);
	let pipe: Transform | undefined;

	// reusable teardown logic for both resolve and reject
	const destroy = () => {
		stream?.destroy();
		stream = undefined;
		parser?.destroy();
		parser = undefined;
		pipe?.destroy();
		pipe = undefined;
	};

	// wrappers for resolve/reject that perform teardown (call destroy)
	const _resolve = (value: T) => { destroy(); resolve(value); };
	const _reject = (err: unknown) => { destroy(); reject(err); };

	// wireup the stream and parser and catch all reject/resolve
	pipe = stream.pipe(parser).once("error", _reject).once("close", _resolve);

	// return expanded resolvers
	return { pipe, promise, resolve:_resolve, reject:_reject };
}

/**
 * Used to detect the delimiter by reading the headers.
 * Headers should be simple text-only keys, so this should work 99% of the time.
 */
async function detectSeparator(input: ParserInput): Promise<string | undefined> {
	// create the pipe and resolvers
	const { pipe, promise, resolve } = withResolvers<string | undefined>(input);

	// we only check the headers
	pipe.once("headers", headers => {
		// default parser is comma, if we have multiple columns then that's our answer
		if (headers.length > 1) return resolve(",");

		// data with a single column means no commas
		if (headers.length === 1) {
			// find the first char that isn't used for a header as the delimiter
			const match = /([^\w "])/.exec(headers[0]);
			if (match) {
				// we have the delimiter, send it
				return resolve(match[0]);
			}
		}
		// we are done, resolving destroys the stream and parser
		return resolve(undefined);
	});

	// pass the promise out
	return promise;
}

/**
 * Reads the given input and parses the rows into json objects using the header row as keys.
 * @param input
 * @param opts can be full csv-parser options or simply a delimiter
 * @returns results of parsing the data or undefined if there is no data or only one column is returned.
 */
export async function parseDsv<T extends StringRecord>(input: ParserInput, opts?: csvParser.Options | DsvDelimiter): Promise<DsvResults<T> | undefined> {
	// require a valid input value
	if (typeof(input) !== "string" && !Buffer.isBuffer(input)) {
		throw new RangeError(`Invalid Data: parseDsv(${input})`);
	}

	// create parser options from given opts
	let parserOptions: { separator?:string; } = opts ? typeof(opts) === "string" ? { separator:opts } : opts : { };

	// if we don't have a delimiter/separator, detect one
	if (!parserOptions?.separator) {
		parserOptions.separator = await detectSeparator(input);
	}

	// create return values
	const keys: string[] = [];
	const items: T[] = [];
	const delimiter = parserOptions.separator as DsvDelimiter ?? ",";

	// writeup pipe
	const { pipe, promise } = withResolvers<T[]>(input, parserOptions);
	pipe.on("headers", (headers: string[]) => keys.push(...headers));
	pipe.on("data", (data: T) => items.push(data));

	// await processing
	await promise;

	// single or no columns aren't valid for our purpose
	if (keys.length <= 1) return undefined;

	// return results
	return { keys, items, delimiter };
}