import { getDataRoot, randomSnowflake } from "@rsc-utils/core-utils";
import PDFParser from "pdf2json";
import { deleteFile } from "../fs/deleteFile.js";
import { writeFile } from "../fs/writeFile.js";
import { getBuffer } from "../https/getBuffer.js";
import { PdfJsonFieldManager } from "./PdfJsonFieldManager.js";
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
        const buffer = await getBuffer(this.url).catch(() => undefined);
        if (buffer) {
            return writeFile(this.cachedPdfPath, buffer, { makeDir: true }).catch(() => false);
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
    async readFields() {
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
            pdfParser.once("pdfParser_dataReady", async () => {
                clearTimer();
                await this.removeCache();
                const fieldData = pdfParser?.getAllFieldData() ?? [];
                const fields = fieldData.map(data => {
                    switch (data.type) {
                        case "box":
                            return { name: data.id, checked: data.value };
                        case "radio":
                            return { name: data.value, checked: true };
                        case "date":
                        case "link":
                        case "signature":
                        case "alpha":
                        default:
                            return { name: data.id, value: data.value };
                    }
                });
                resolve(fields);
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
    async removeCache() {
        return deleteFile(this.cachedPdfPath).catch(() => false);
    }
    static async read(url) {
        if (url) {
            const cacher = new PdfCacher(url);
            return cacher.read();
        }
        return undefined;
    }
    static async readFields(url, transmuter) {
        if (url) {
            const cacher = new PdfCacher(url);
            const fields = await cacher.readFields();
            return PdfJsonFieldManager.from(fields, transmuter);
        }
        return undefined;
    }
    static async createManager(url) {
        if (!url)
            return undefined;
        const { promise, resolve, reject } = Promise.withResolvers();
        PdfCacher.read(url).then(json => resolve(PdfJsonManager.from(json)), reject);
        return promise;
    }
}
