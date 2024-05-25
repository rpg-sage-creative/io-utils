export function toFilePath(filePathAndName) {
    return filePathAndName.split(/\//).slice(0, -1).join("/");
}
