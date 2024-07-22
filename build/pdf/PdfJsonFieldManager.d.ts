import type { Optional } from "@rsc-utils/core-utils";
import type { Field } from "./internal/types.js";
import type { PdfJson } from "./types.js";
export declare class PdfJsonFieldManager {
    private fields;
    initialLength: number;
    constructor(fields: Field[]);
    get isEmpty(): boolean;
    get length(): number;
    /** Returns the given field by matching the name. */
    find<T extends Field>(name: string): T | undefined;
    /**
     * Finds the given field and returns true if the field is checked.
     * Also removes the field from the fields array.
     */
    findChecked(name: string, remove: boolean): boolean;
    /**
     * Finds the given field and returns the value as a non-blank string or undefined.
     * Also removes the field from the fields array.
     */
    findValue(name: string, remove: boolean): string | undefined;
    /** Removes the field so that it cannot be reused. */
    private removeField;
    static from<U extends PdfJson>(input: Optional<U>): PdfJsonFieldManager;
}
