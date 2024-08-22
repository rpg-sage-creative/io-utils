import type { Awaitable } from "@rsc-utils/core-utils";
type DirFilterFn = (dirName: string, dirPath: string) => Awaitable<boolean>;
type FileFilterFn = (fileName: string, filePath: string) => Awaitable<boolean>;
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
 * @deprecated use filterFiles(path: string, options: Options)
 * Lists all the file paths that exist in the given path (optionally recursively) and *pass* the filter given.
 * @returns Array of file paths (not just file names).
 */
export declare function filterFiles(path: string, filter: FileFilterFn, recursive?: boolean): Promise<string[]>;
/**
 * @deprecated use filterFiles(path: string, options: Options)
 * Lists all the file paths that exist in the given path (optionally recursively) with the given extension.
 * @returns Array of file paths (not just file names).
 */
export declare function filterFiles(path: string, ext: string, recursive?: boolean): Promise<string[]>;
/**
 * Lists all the file paths that exist in the given path (optionally recursively) with that match the given extension and/or filter.
 * @returns Array of file paths (not just file names).
 */
export declare function filterFiles(path: string, options: Options): Promise<string[]>;
export {};
