/** Writes the given content to the given file path/name, optionally building the path if it doesn't exist, optionally formatting JSON output. */
export declare function writeFile<T>(filePathAndName: string, content: T, options?: {
    makeDir?: boolean;
    formatted?: boolean;
}): Promise<boolean>;
