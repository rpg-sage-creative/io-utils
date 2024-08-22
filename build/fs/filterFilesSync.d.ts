type DirFilterFn = (dirName: string, dirPath: string) => boolean;
type FileFilterFn = (fileName: string, filePath: string) => boolean;
type BothOptions = {
    fileExt: string;
    fileFilter: FileFilterFn;
};
type ExtOptions = {
    fileExt: string;
    fileFilter?: FileFilterFn;
};
type FilterOptions = {
    fileExt?: string;
    fileFilter: FileFilterFn;
};
type Options = {
    dirFilter?: DirFilterFn;
    recursive?: boolean;
} & (BothOptions | ExtOptions | FilterOptions);
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
