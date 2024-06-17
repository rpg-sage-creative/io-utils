/** Appends the given content to the given file path/name, optionally building the path if it doesn't exist. */
export declare function appendJsonDb<T>(filePathAndName: string, content: T, makeDir?: boolean): Promise<boolean>;
