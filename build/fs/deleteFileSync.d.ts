/**
 * Convenience wrapper for fs.rmSync(path, { force }) that resolves to boolean.
 * Resolves true if rmSync completes successfully.
 * Resolves false if no errors were thrown and rmSync didn't complete successfully.
 * Errors are not captured and expected to be handled.
 */
export declare function deleteFileSync(path: string, options?: {
    force?: boolean;
}): boolean;
/**
 * Convenience wrapper for fs.rmSync(path, { force }) that resolves to truthy/falsey.
 * Resolves "NotFound" if the file is checked before deleting and didn't exist (counts as truthy for if the file was deleted).
 * Resolves true if rmSync completes successfully and it isn't checked after or it is checked after and not found.
 * Returns false if rmSync completes successfully and the file is checked after and still exists.
 * Errors are not captured and expected to be handled.
 */
export declare function deleteFileSync(path: string, options: {
    checkExists: true;
    force?: boolean;
}): "NotFound" | boolean;
