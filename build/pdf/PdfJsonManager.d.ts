import { type Optional } from "@rsc-utils/core-utils";
import { PdfJsonFieldManager } from "./PdfJsonFieldManager.js";
import type { PdfJson } from "./types.js";
export declare class PdfJsonManager<T extends PdfJson = PdfJson> {
    fields: PdfJsonFieldManager;
    /** Was this created with json that was non-null and non-undefined. */
    isDefined: boolean;
    /** Does this created with json that has keys.  */
    isEmpty: boolean;
    json?: T;
    constructor(input: Optional<T | PdfJsonManager<T>>);
    get title(): string | undefined;
    hasAllFields(...names: string[]): boolean;
    /**
     * Iterates through all Pages.Texts.R.T and checks for each snippetToFind using .includes.
     * Mostly used to validate that a PDF has certain key phrases for identification/validation.
     */
    hasAllSnippets(...snippetsToFind: string[]): boolean;
    getString(name: string): string | undefined;
    hasField(name: string): boolean;
    isChecked(name: string): boolean;
    static from<U extends PdfJson>(input: Optional<U | PdfJsonManager<U>>): PdfJsonManager<U>;
}
