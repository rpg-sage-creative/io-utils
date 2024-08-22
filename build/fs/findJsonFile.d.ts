import { type Awaitable } from "@rsc-utils/core-utils";
type ContentFilterFn<T> = (json: T) => Awaitable<boolean>;
type DirFilterFn = (dirName: string, dirPath: string) => Awaitable<boolean>;
type FileFilterFn = (fileName: string, filePath: string) => Awaitable<boolean>;
type Options<T> = {
    contentFilter: ContentFilterFn<T>;
    dirFilter?: DirFilterFn;
    fileExt?: string;
    fileFilter?: FileFilterFn;
    recursive?: boolean;
};
/**
 * Returns the first json that matches the given contentFilter.
 * This uses filterFiles to narrow down the files before opening them.
 */
export declare function findJsonFile<T>(path: string, options: Options<T>): Promise<T | undefined>;
export {};
