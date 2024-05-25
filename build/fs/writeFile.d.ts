/** Writes the given content to the given file path/name. */
export declare function writeFile<T>(filePathAndName: string, content: T): Promise<boolean>;
/** Writes the given content to the given file path/name, optionally building the path if it doesn't exist. */
export declare function writeFile<T>(filePathAndName: string, content: T, mkdir: boolean): Promise<boolean>;
/** Writes the given content to the given file path/name, optionally building the path if it doesn't exist, optionally formatting JSON output. */
export declare function writeFile<T>(filePathAndName: string, content: T, mkdir: boolean, formatted: boolean): Promise<boolean>;
