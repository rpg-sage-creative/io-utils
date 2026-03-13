import { ProgressTracker } from "@rsc-utils/core-utils";
type Opts = {
    logPercent?: boolean;
    progressTracker?: ProgressTracker;
    /** milliseconds */
    timeout?: number;
};
/** Convenience wrapper for getText(url).then(text => parse(text)) */
export declare function getJson<T = any>(url: string): Promise<T>;
export declare function getJson<T = any, U = any>(url: string, postData: U, opts?: Opts): Promise<T>;
export {};
