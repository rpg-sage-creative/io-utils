import {} from "@rsc-utils/core-utils";
import ExifReader from "exifreader";
export function bufferToMetadata(buffer) {
    const size = buffer?.length ?? 0;
    if (!size)
        return undefined;
    const tags = ExifReader.load(buffer);
    if (!tags)
        return undefined;
    const type = tags["FileType"]?.value;
    const width = tags["Image Width"]?.value ?? tags["ImageWidth"]?.value;
    const height = tags["Image Height"]?.value ?? tags["ImageHeight"]?.value;
    if (!type || !width || !height)
        return undefined;
    return { type, width, height, size };
}
