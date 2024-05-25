/**
 * Lists all the file paths that exist in the given path (optionally recursively) and *pass* the filter given.
 * @returns Array of file paths (not just file names).
 */
export declare function filterFilesSync(path: string, filter: (fileName: string, filePath: string) => boolean, recursive?: boolean): string[];
