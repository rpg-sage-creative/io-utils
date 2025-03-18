type DirFilterFn = (dirName: string, dirPath: string) => boolean;
type FileFilterFn = (fileName: string, filePath: string) => boolean;
type DirOptions = {
    dirFilter?: DirFilterFn;
    recursive?: boolean;
};
type FileOptions = {
    fileExt: string;
    fileFilter: FileFilterFn;
} | {
    fileExt: string;
    fileFilter?: never;
} | {
    fileExt?: never;
    fileFilter: FileFilterFn;
};
type Options = DirOptions & FileOptions;
/**
 * @deprecated use filterFilesSync(path: string, options: Options)
 * Lists all the file paths that exist in the given path (optionally recursively) and *pass* the filter given.
 * @returns Array of file paths (not just file names).
 */
export declare function filterFilesSync(path: string, filter: FileFilterFn, recursive?: boolean): string[];
/**
 * @deprecated use filterFilesSync(path: string, options: Options)
 * Lists all the file paths that exist in the given path (optionally recursively) with the given extension.
 * @returns Array of file paths (not just file names).
 */
export declare function filterFilesSync(path: string, ext: string, recursive?: boolean): string[];
/**
 * Lists all the file paths that exist in the given path (optionally recursively) with that match the given extension and/or filter.
 * @returns Array of file paths (not just file names).
 */
export declare function filterFilesSync(path: string, options: Options): string[];
export {};
