/** Convenience wrapper for fs.appendFile(filePath, data) that resolves to boolean. */
export declare function appendFile(filePath: string, data: string | Buffer): Promise<boolean>;
