/**
 * Lists all the filenames found in the given path.
 */
export declare function listFiles(path: string): Promise<string[]>;
/**
 * Lists all the filenames found in the given path that have the given extension.
 */
export declare function listFiles(path: string, ext: string): Promise<string[]>;
