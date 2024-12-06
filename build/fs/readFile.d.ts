/**
 * Resolves with a buffer of the file's contents, or rejects with "Not a Buffer" or an error (if one occured).
 */
export declare function readFile(path: string): Promise<Buffer>;
