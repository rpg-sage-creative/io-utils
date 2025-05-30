import type { Optional } from "@rsc-utils/core-utils";
import type { VALID_URL, WrapOptions, WRAPPED_URL } from "./types.js";
/** Returns true if the value tests successfully against the url regex and allows for <> brackets */
export declare function isUrl(value: Optional<string>): value is VALID_URL;
export declare function isUrl(value: Optional<string>, options: WrapOptions): value is VALID_URL | WRAPPED_URL;
