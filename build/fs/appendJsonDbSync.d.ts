type Options = {
    makeDir?: boolean;
};
/** Appends the given content to the given file path/name, optionally building the path if it doesn't exist. */
export declare function appendJsonDbSync<T>(filePath: string, content: T, options?: Options): boolean;
export {};
