import { type Optional } from "@rsc-utils/core-utils";
import { PdfJsonFieldManager, type PdfJsonFieldTransmuter } from "./PdfJsonFieldManager.js";
import { PdfJsonManager } from "./PdfJsonManager.js";
import type { Field, PdfJson } from "./types.js";
/** Copies a pdf from the given url to a local file before trying to read it. */
export declare class PdfCacher {
    private readonly url;
    /** The local file id. */
    private readonly id;
    /** The path to the local file. */
    private readonly cachedPdfPath;
    /** Creates a new PdfCacher for the given url. */
    constructor(url: string);
    /** Reads from the url and writes the local file. */
    private setCache;
    /** Reads the local file and returns the JSON returned by PDFParser. */
    read<T>(): Promise<T>;
    /** Reads the local file and returns the JSON returned by PDFParser. */
    readFields(): Promise<Field[]>;
    /** Convenience for: PdfJsonManager.from(await this.read()) */
    createManager<T extends PdfJson>(): Promise<PdfJsonManager<T>>;
    /** Deletes the local file. */
    private removeCache;
    /** Convenience for new PdfCacher(url).read(); */
    static read<U>(url: Optional<string>): Promise<U | undefined>;
    /** Convenience for new PdfCacher(url).read(); */
    static readFields(url: Optional<string>, transmuter?: PdfJsonFieldTransmuter): Promise<PdfJsonFieldManager | undefined>;
    /** Convenience for: PdfJsonManager.from(await this.read()) */
    static createManager<U extends PdfJson>(url: Optional<string>): Promise<PdfJsonManager<U> | undefined>;
}
