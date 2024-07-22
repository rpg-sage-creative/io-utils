import { getDataRoot, randomSnowflake } from "@rsc-utils/core-utils";
import PDFParser from "pdf2json";
import { deleteFileSync } from "../fs/deleteFileSync.js";
import { writeFile } from "../fs/writeFile.js";
import { getBuffer } from "../https/getBuffer.js";
import { PdfJsonManager } from "./PdfJsonManager.js";
export class PdfCacher {
    url;
    id;
    cachedPdfPath;
    constructor(url) {
        this.url = url;
        this.id = randomSnowflake();
        this.cachedPdfPath = `${getDataRoot("cache/pdf", true)}/${this.id}.pdf`;
    }
    async setCache() {
        const buffer = await getBuffer(this.url).catch(() => null);
        if (buffer) {
            return writeFile(this.cachedPdfPath, buffer, true).catch(() => false);
        }
        return false;
    }
    async read() {
        const cached = await this.setCache();
        if (!cached) {
            return Promise.reject(new Error(`No Cache to read: ${this.id}`));
        }
        return new Promise((resolve, reject) => {
            const pdfParser = new PDFParser();
            pdfParser.on("pdfParser_dataError", async (errData) => {
                this.removeCache();
                reject(errData.parserError);
            });
            pdfParser.on("pdfParser_dataReady", async (json) => {
                this.removeCache();
                resolve(json);
            });
            pdfParser.loadPDF(this.cachedPdfPath);
        });
    }
    async createManager() {
        return new Promise((resolve, reject) => this.read()
            .then(json => resolve(PdfJsonManager.from(json)), reject));
    }
    removeCache() {
        return deleteFileSync(this.cachedPdfPath);
    }
    static async read(url) {
        if (url) {
            const cacher = new PdfCacher(url);
            return cacher.read();
        }
        return undefined;
    }
    static async createManager(url) {
        return new Promise((resolve, reject) => PdfCacher.read(url)
            .then(json => resolve(PdfJsonManager.from(json)), reject));
    }
}
