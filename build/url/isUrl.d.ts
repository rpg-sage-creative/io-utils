import type { Optional } from "@rsc-utils/core-utils";
import type { VALID_URL, WRAPPED_URL } from "./types.js";
type WrapOptionsOptionalNever = {
    wrapChars: string;
    wrapOptional?: never;
};
type WrapOptionsOptionalFalse = {
    wrapChars: string;
    wrapOptional: false;
};
type WrapOptionsOptionalTrue = {
    wrapChars: string;
    wrapOptional: true;
};
/** Returns true if the value tests successfully against the url regex */
export declare function isUrl(value: Optional<string>): value is VALID_URL;
/** Returns true if the value tests successfully against the url regex and includes the given wrap chars */
export declare function isUrl(value: Optional<string>, options: WrapOptionsOptionalNever): value is WRAPPED_URL;
/** Returns true if the value tests successfully against the url regex and includes the given wrap chars */
export declare function isUrl(value: Optional<string>, options: WrapOptionsOptionalFalse): value is WRAPPED_URL;
/** Returns true if the value tests successfully against the url regex and allows for the given wrap chars */
export declare function isUrl(value: Optional<string>, options: WrapOptionsOptionalTrue): value is VALID_URL | WRAPPED_URL;
export {};
