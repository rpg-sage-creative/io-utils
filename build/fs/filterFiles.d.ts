import type { Awaitable } from "@rsc-utils/core-utils";
type DirFilterFn = (dirName: string, dirPath: string) => Awaitable<boolean>;
type FileFilterFn = (fileName: string, filePath: string) => Awaitable<boolean>;
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
