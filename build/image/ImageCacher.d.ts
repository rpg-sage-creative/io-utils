import { type Optional } from "@rsc-utils/core-utils";
import { type ImageMetadata } from "./bufferToMetadata.js";
/** Copies an image from the given url to a local file before trying to read it. */
export declare class ImageCacher {
    private readonly url;
    /** The local file id. */
    private readonly id;
    /** The path to the local file. */
    private readonly cachedImagePath;
    /** Creates a new ImageCacher for the given url. */
    constructor(url: string);
    /** Reads from the url and writes the local file. */
    private setCache;
    /** Reads the local file and returns the image metadata. */
    read(): Promise<Buffer>;
    /** Deletes the local file. */
    private removeCache;
    /** Convenience for new PdfCacher(url).read(); */
    static read(url: Optional<string>): Promise<Buffer | undefined>;
    static readMetadata(url: Optional<string>): Promise<ImageMetadata | undefined>;
}
