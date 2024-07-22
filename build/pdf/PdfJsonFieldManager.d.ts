import type { Field, PdfJson } from "./internal/types.js";
export declare class PdfJsonFieldManager {
    private fields;
    constructor(fields: Field[]);
    /** Returns the given field by matching the name. */
    find<T extends Field>(name: string): T | undefined;
    /**
     * Finds the given field and returns true if the field is checked.
     * Also removes the field from the fields array.
     */
    findChecked(name: string): boolean;
    /**
     * Finds the given field and returns the value as a non-blank string or undefined.
     * Also removes the field from the fields array.
     */
    findValue(name: string): string | undefined;
    /** Removes the field so that it cannot be reused. */
    private removeField;
    static from<T extends PdfJson>(input: T): PdfJsonFieldManager;
}
