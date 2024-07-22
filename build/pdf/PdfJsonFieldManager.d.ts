import type { Optional } from "@rsc-utils/core-utils";
import type { Field } from "./internal/types.js";
import type { PdfJson } from "./types.js";
export declare class PdfJsonFieldManager {
    fields: Field[];
    initialLength: number;
    constructor(input: Optional<PdfJson | PdfJsonFieldManager | Field[]>);
    get isEmpty(): boolean;
    get length(): number;
    /** Returns the given field by matching the name. */
    find<T extends Field>(name: string): T | undefined;
    /**
     * Finds the given field and returns true/false if the checked value is boolean.
     * Returns null if the checked value is not boolean.
     * Returns undefined if not found.
     */
    getChecked(name: string): Optional<boolean>;
    /**
     * Finds the given field and returns the value as a non-blank string.
     * Returns null if the value is not a string or empty.
     * Returns undefined if not found.
     */
    getValue(name: string): Optional<string>;
    has(name: string): boolean;
    /** Removes the field so that it cannot be reused. */
    remove(field: Optional<Field | string>): void;
    static from<U extends PdfJson, V extends PdfJsonFieldManager>(input: Optional<U | V>): PdfJsonFieldManager;
}
