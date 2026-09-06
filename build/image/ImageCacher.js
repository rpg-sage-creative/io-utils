import { formatDataFilePath, generateSnowflake, noop } from "@rsc-utils/core-utils";
import { deleteFile } from "../fs/deleteFile.js";
import { readFile } from "../fs/readFile.js";
import { writeFile } from "../fs/writeFile.js";
import { getBuffer } from "../https/getBuffer.js";
import { bufferToMetadata } from "./bufferToMetadata.js";
/** Copies an image from the given url to a local file before trying to read it. */
export class ImageCacher {
    url;
    /** The local file id. */
    id;
    /** The path to the local file. */
    cachedImagePath;
    /** Creates a new ImageCacher for the given url. */
    constructor(url) {
        this.url = url;
        this.id = generateSnowflake();
        this.cachedImagePath = formatDataFilePath({ dir: ["cache", "image"], name: this.id, ext: "img" });
    }
    /** Reads from the url and writes the local file. */
    async setCache() {
        const buffer = await getBuffer(this.url).catch(noop);
        if (buffer) {
            return writeFile(this.cachedImagePath, buffer, { makeDir: true }).catch(() => false);
        }
        return false;
    }
    /** Reads the local file and returns the image metadata. */
    async read() {
        const cached = await this.setCache();
        if (!cached) {
            return Promise.reject(new Error(`No Cache to read: ${this.id}`));
        }
        return new Promise(async (resolve, reject) => {
            const bufferOrError = await readFile(this.cachedImagePath).catch(err => err);
            await this.removeCache();
            if (Buffer.isBuffer(bufferOrError)) {
                resolve(bufferOrError);
            }
            else {
                reject(bufferOrError);
            }
        });
    }
    /** Deletes the local file. */
    async removeCache() {
        return deleteFile(this.cachedImagePath).catch(() => false);
    }
    /** Convenience for new ImageCacher(url).read(); */
    static async read(url) {
        if (url) {
            const cacher = new ImageCacher(url);
            return cacher.read();
        }
        return undefined;
    }
    static async readMetadata(url) {
        const buffer = await ImageCacher.read(url);
        return bufferToMetadata(buffer);
    }
}
