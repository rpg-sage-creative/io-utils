/** Writes the given content to the given file path/name. */
export declare function writeFileSync<T>(filePathAndName: string, content: T): boolean;
/** Writes the given content to the given file path/name, optionally building the path if it doesn't exist. */
export declare function writeFileSync<T>(filePathAndName: string, content: T, mkdir: boolean): boolean;
/** Writes the given content to the given file path/name, optionally building the path if it doesn't exist, optionally formatting JSON output. */
export declare function writeFileSync<T>(filePathAndName: string, content: T, mkdir: boolean, formatted: boolean): boolean;
