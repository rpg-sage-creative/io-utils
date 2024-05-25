/**
 * Attempts to get the file size (content-length) from a url.
 * Returns the number of bytes, or rejects if an error occurs.
 */
export declare function getFileSize(url: string): Promise<number>;
