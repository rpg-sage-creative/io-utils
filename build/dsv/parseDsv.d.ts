import csvParser from "csv-parser";
type ParserInput = string | Buffer;
export type DsvDelimiter = "," | "|" | "\t";
type StringRecord = Record<string, string>;
export type DsvResults<T extends StringRecord> = {
    keys: string[];
    items: T[];
    delimiter: DsvDelimiter;
};
/**
 * Reads the given input and parses the rows into json objects using the header row as keys.
 * @param input
 * @param opts can be full csv-parser options or simply a delimiter
 * @returns results of parsing the data or undefined if there is no data or only one column is returned.
 */
export declare function parseDsv<T extends StringRecord>(input: ParserInput, opts?: csvParser.Options | DsvDelimiter): Promise<DsvResults<T> | undefined>;
export {};
