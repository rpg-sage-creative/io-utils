/**
 * Convenience wrapper for fs.rm(path, { force:true }) that resolves to boolean.
 * Resolves true if rm completes successfully.
 * Resolves false if no errors were thrown and rm didn't complete successfully.
 * Errors are bubbled via rejection to be handled with .catch()
 */
export declare function deleteFile(path: string, options?: {
    force?: boolean;
}): Promise<boolean>;
/**
 * Convenience wrapper for fs.rm(path, { force:true }) that resolves to truthy/falsey.
 * Resolves "NotFound" if the file is checked before deleting and didn't exist (counts as truthy for if the file was deleted).
 * Resolves true if rm completes successfully and it isn't checked after or it is checked after and not found.
 * Returns false if rm completes successfully and the file is checked after and still exists.
 * Errors are bubbled via rejection to be handled with .catch()
 */
export declare function deleteFile(path: string, options: {
    checkExists: true;
    force?: boolean;
}): Promise<"NotFound" | boolean>;
