/**
 * Returns true if the file didn't exist or rmSync didn't throw errors.
 * Returns false if an error was thrown.
 */
export declare function deleteFile(path: string): Promise<boolean>;
/**
 * Returns "NotFound" if the file didn't exist (counts as truthy for if the file was deleted).
 * Returns true if the file existed *and* was deleted.
 * Returns false if the file wasn't deleted.
 */
export declare function deleteFile(path: string, options: {
    checkExists: true;
}): Promise<"NotFound" | boolean>;
