import type { Optional } from "@rsc-utils/core-utils";
import type { ESCAPED_URL, VALID_URL } from "./types.js";
/** Returns true if the value starts with http:// or https:// and allows for <> brackets */
export declare function isUrl(value: Optional<string>): value is VALID_URL | ESCAPED_URL;
/** Removes any <> brackets from the given url. */
export declare function cleanUrl(value: VALID_URL | ESCAPED_URL): VALID_URL;
