import type { Awaitable } from "@rsc-utils/core-utils";
type FilterFn = (fileName: string, filePath: string) => Awaitable<boolean>;
/**
 * Lists all the file paths that exist in the given path (optionally recursively) and *pass* the filter given.
 * @returns Array of file paths (not just file names).
 */
export declare function filterFiles(path: string, filter: FilterFn, recursive?: boolean): Promise<string[]>;
/**
 * Lists all the file paths that exist in the given path (optionally recursively) with the given extension.
 * @returns Array of file paths (not just file names).
 */
export declare function filterFiles(path: string, ext: string, recursive?: boolean): Promise<string[]>;
export {};
