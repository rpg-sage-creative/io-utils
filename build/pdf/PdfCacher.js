import { getDataRoot, randomSnowflake } from "@rsc-utils/core-utils";
import PDFParser from "pdf2json";
import { deleteFile } from "../fs/deleteFile.js";
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
            let timer;
            const TIMER_MS = 2000;
            let resetCount = 0;
            const MAX_RESETS = 5;
            const clearTimer = () => timer ? clearTimeout(timer) : void 0;
            const resetTimer = () => {
                if (resetCount < MAX_RESETS) {
                    clearTimer();
                    timer = setTimeout(() => pdfParser.emit("pdfParser_dataError", { parserError: "TIMEOUT" }), TIMER_MS);
                }
            };
            pdfParser.once("pdfParser_dataError", async (errData) => {
                clearTimer();
                await this.removeCache();
                reject(errData?.parserError);
            });
            pdfParser.once("pdfParser_dataReady", async (json) => {
                clearTimer();
                await this.removeCache();
                resolve(json);
            });
            pdfParser.once("data", resetTimer);
            pdfParser.once("readable", _meta => {
                resetTimer();
            });
            pdfParser.loadPDF(this.cachedPdfPath).then(resetTimer);
            resetTimer();
        });
    }
    async createManager() {
        return new Promise((resolve, reject) => this.read()
            .then(json => resolve(PdfJsonManager.from(json)), reject));
    }
    removeCache() {
        return deleteFile(this.cachedPdfPath);
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
