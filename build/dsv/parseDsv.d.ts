import csvParser from "csv-parser";
type ParserInput = string | Buffer;
type Delimiter = "," | "|" | "\t";
type StringRecord = Record<string, string>;
type Results<T extends StringRecord> = {
    keys: string[];
    items: T[];
    delimiter: Delimiter;
};
export declare function parseDsv<T extends StringRecord>(input: ParserInput, opts?: csvParser.Options | Delimiter): Promise<Results<T> | undefined>;
export {};
