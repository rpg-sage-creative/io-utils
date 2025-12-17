type Options = {
    makeDir?: boolean;
    formatted?: boolean;
};
/** Writes the given content to the given file path/name, optionally building the path if it doesn't exist, optionally formatting JSON output. */
export declare function writeFileSync<T>(filePathAndName: string, content: T, options?: Options): boolean;
export {};
