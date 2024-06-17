type FilterFn = (fileName: string, filePath: string) => boolean;
/**
 * Lists all the file paths that exist in the given path (optionally recursively) and *pass* the filter given.
 * @returns Array of file paths (not just file names).
 */
export declare function filterFilesSync(path: string, filter: FilterFn, recursive?: boolean): string[];
export declare function filterFilesSync(path: string, ext: string, recursive?: boolean): string[];
export {};
