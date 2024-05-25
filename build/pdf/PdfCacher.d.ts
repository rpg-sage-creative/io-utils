import type { Optional } from "./internal/types.js";
/** Copies a pdf from the given url to a local file before trying to read it. */
export declare class PdfCacher {
    private url;
    /** The local file id. */
    private id;
    /** The path to the local file. */
    private cachedPdfPath;
    /** Creates a new PdfCacher for the given url. */
    constructor(url: string);
    /** Reads from the url and writes the local file. */
    private setCache;
    /** Reads the local file and returns the JSON returned by PDFParser. */
    read<T>(): Promise<T>;
    /** Deletes the local file. */
    private removeCache;
    /** Convenience for new PdfCacher(url).read(); */
    static read<U>(url: Optional<string>): Promise<U | null>;
}
