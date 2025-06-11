import { type Optional } from "@rsc-utils/core-utils";
import type { Field } from "./types.js";
import type { PdfJson } from "./types.js";
type TransmutedField = Field & {
    id?: string | number;
};
export type PdfJsonFieldTransmuter = (fields: Field) => TransmutedField;
export declare class PdfJsonFieldManager {
    fields: TransmutedField[];
    initialLength: number;
    constructor(input: Optional<PdfJson | PdfJsonFieldManager | Field[]>, transmuter?: PdfJsonFieldTransmuter);
    get isEmpty(): boolean;
    get length(): number;
    /** Returns the given field by matching the name or transmuted id. */
    find<T extends Field>(value: Optional<string | number>): T | undefined;
    /**
     * Returns a string array if the field exists as a valid string.
     * NewLine characters are treated as the delimiter.
     * Returns null if the field is not a string.
     * Returns undefined if not found.
     */
    getArray(key: Optional<string | number>, delim?: string): Optional<string[]>;
    /**
     * Finds the given field and returns true/false if the checked value is boolean.
     * Returns null if the checked value is not boolean.
     * Returns undefined if not found.
     */
    getChecked(key: Optional<string | number>): Optional<boolean>;
    /**
     * Returns a number if the field exists as string parseable as a number.
     * Returns NaN if the field exists as a non-numeric string.
     * Returns null if the field is not a string.
     * Returns undefined if not found.
     */
    getNumber(key: Optional<string | number>): Optional<number>;
    getNumber(key: Optional<string | number>, defValue: number): number;
    /**
     * Finds the given field and returns the value as a non-blank string.
     * Returns null if the value is not a string or empty.
     * Returns undefined if not found.
     */
    getValue(key?: Optional<string | number>): Optional<string>;
    getValue(key: Optional<string | number>, defValue: string): string;
    /** Returns true if the key was found, regards of whether or not it had a valid value. */
    has(key: Optional<string | number>): boolean;
    /** Removes the field so that it cannot be reused. */
    remove(field: Optional<Field | string | number>): void;
    static from<U extends PdfJson | Field[], V extends PdfJsonFieldManager>(input: Optional<U | V>, transmuter?: PdfJsonFieldTransmuter): PdfJsonFieldManager;
}
export {};
