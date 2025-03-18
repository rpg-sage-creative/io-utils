import { type Awaitable } from "@rsc-utils/core-utils";
type ContentFilterFn<T> = (json: T) => Awaitable<boolean>;
type DirFilterFn = (dirName: string, dirPath: string) => Awaitable<boolean>;
type FileFilterFn = (fileName: string, filePath: string) => Awaitable<boolean>;
type Options<T> = {
    contentFilter?: ContentFilterFn<T>;
    dirFilter?: DirFilterFn;
    fileExt?: string;
    fileFilter?: FileFilterFn;
    recursive?: boolean;
};
/**
 * This uses filterFiles to narrow down the files before opening them.
 * If a contentFilter is given, then the opened files are filtered using it.
 */
export declare function readJsonFilesSync<T>(path: string, options?: Options<T>): T[];
export {};
