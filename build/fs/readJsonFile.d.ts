/**
 * Convenience for: readTextFile(path).then(json => parse(json));
 * An error while parsing will be rejected.
 * Rejections from readTextFile and readFile are bubbled.
 */
export declare function readJsonFile<T>(path: string): Promise<T | null>;
