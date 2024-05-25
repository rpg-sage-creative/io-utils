/**
 * Convenience for: readFileSync(path).toString(encoding);
 * Returns null if readFileSync returns null.
 */
export declare function readTextSync(path: string, encoding?: string): string | null;
