/**
 * Convenience for: readFile(path, encoding).then(buffer => buffer.toString(encoding));
 * Rejections from readFile are bubbled.
 */
export declare function readText(path: string, encoding?: string): Promise<string>;
