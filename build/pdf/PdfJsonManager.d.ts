import { type Optional } from "@rsc-utils/core-utils";
import { PdfJsonFieldManager } from "./PdfJsonFieldManager.js";
import type { PdfJson } from "./types.js";
export declare class PdfJsonManager<T extends PdfJson = PdfJson> {
    json: Optional<T>;
    fields: PdfJsonFieldManager;
    /** Was this created with json that was non-null and non-undefined. */
    isDefined: boolean;
    /** Does this created with json that has keys.  */
    isEmpty: boolean;
    constructor(json: Optional<T>);
    getNonBlankString(name: string): string | undefined;
    isChecked(key: string): boolean;
    static from<U extends PdfJson>(json: Optional<U>): PdfJsonManager<U>;
}
