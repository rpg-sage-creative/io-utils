import { generateSnowflake, getDataRoot } from "@rsc-utils/core-utils";
import { format, join } from "node:path";
import { deleteFile } from "../fs/deleteFile.js";
import { readFile } from "../fs/readFile.js";
import { writeFile } from "../fs/writeFile.js";
import { getBuffer } from "../https/getBuffer.js";
import { bufferToMetadata } from "./bufferToMetadata.js";
export class ImageCacher {
    url;
    id;
    cachedImagePath;
    constructor(url) {
        this.url = url;
        this.id = generateSnowflake();
        const childPath = join("cache", "image");
        const dir = getDataRoot(childPath, true);
        this.cachedImagePath = format({ dir, base: this.id, ext: "img" });
    }
    async setCache() {
        const buffer = await getBuffer(this.url).catch(() => undefined);
        if (buffer) {
            return writeFile(this.cachedImagePath, buffer, { makeDir: true }).catch(() => false);
        }
        return false;
    }
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
    async removeCache() {
        return deleteFile(this.cachedImagePath).catch(() => false);
    }
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
