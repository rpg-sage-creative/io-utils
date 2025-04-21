/**
 * Checks to see if the given file exists.
 * (Wrapper for fs.exists so that I have the option to add additional logic later if needed.)
 * @todo use fs.stat to avoid deprecated fs.exists !?
 */
export declare function fileExists(path: string): Promise<boolean>;
