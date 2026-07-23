import csvParser from "csv-parser";
/** DSV parsing expects either a string or Buffer. */
type ParserInput = string | Buffer;
/** DSV parsing expects a delimiter to be one of these values. */
export type DsvDelimiter = "," | "|" | "\t";
/** A Record restricted to string keys and values. */
type StringRecord = Record<string, string>;
export type DsvResults<Item extends StringRecord> = {
    /** the item keys from the header row */
    keys: string[];
    /** the data rows as Item objects */
    items: Item[];
    /** the delimiter used in the file */
    delimiter: DsvDelimiter;
};
/**
 * Reads the given input and parses the rows into json objects using the header row as keys.
 * @param input the content to be parsed
 * @param opts can be full csv-parser options or simply a delimiter
 * @returns results of parsing the data or undefined if there is no data or only one column is returned.
 */
export declare function parseDsv<T extends StringRecord>(input: ParserInput, opts?: csvParser.Options | DsvDelimiter): Promise<DsvResults<T> | undefined>;
export {};
