import { type ProgressTracker } from "@rsc-utils/core-utils";
type Opts = {
    logPercent?: boolean;
    progressTracker?: ProgressTracker;
    /** milliseconds */
    timeout?: number;
};
type Options = Opts & {
    url: string;
    filePath: string;
};
/**
 * Reads a file from the given url and stores it using the given filePath.
 * Returns false if errors occur, true otherwise.
 */
export declare function cacheFile(url: string, filePath: string): Promise<boolean>;
export declare function cacheFile(url: string, filePath: string, options: Opts): Promise<boolean>;
export declare function cacheFile(options: Options): Promise<boolean>;
export {};
