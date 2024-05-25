/**
 * Lists all the file paths that exist in the given path (optionally recursively) and *pass* the filter given.
 * @returns Array of file paths (not just file names).
 */
export declare function filterFiles(path: string, filter: (fileName: string, filePath: string) => boolean | PromiseLike<boolean>, recursive?: boolean): Promise<string[]>;
