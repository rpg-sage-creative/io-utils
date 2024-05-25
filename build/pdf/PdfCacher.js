import { getDataRoot } from "@rsc-utils/core-utils";
import { randomUUID } from "crypto";
import PDFParser from "pdf2json";
import { deleteFileSync } from "../fs/deleteFileSync.js";
import { writeFile } from "../fs/writeFile.js";
import { getBuffer } from "../https/getBuffer.js";
export class PdfCacher {
    url;
    id;
    cachedPdfPath;
    constructor(url) {
        this.url = url;
        this.id = randomUUID();
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
    removeCache() {
        return deleteFileSync(this.cachedPdfPath);
    }
    static async read(url) {
        if (url) {
            return new PdfCacher(url).read();
        }
        return null;
    }
}
