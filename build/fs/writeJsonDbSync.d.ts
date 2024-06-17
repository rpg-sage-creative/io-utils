/**
 * Designed for reading a Foundry .db file that is a list of json items on each line, but not an array.
 */
export declare function writeJsonDbSync<T>(filePathAndName: string, values: T[], makeDir?: boolean): boolean;
