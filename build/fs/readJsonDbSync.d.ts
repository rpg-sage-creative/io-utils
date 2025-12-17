/**
 * Designed for reading a .json.db file that is a list of json items on each line, but not an array.
 */
export declare function readJsonDbSync<T>(path: string): T[];
