export function createExtFilter(ext) {
    const regex = new RegExp(`\\.${ext}$`, "i");
    return (fileName) => regex.test(fileName);
}
