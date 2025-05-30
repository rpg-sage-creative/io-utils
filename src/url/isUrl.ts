import type { Optional } from "@rsc-utils/core-utils";
import { getUrlRegex } from "./getUrlRegex.js";
import type { VALID_URL, WrapOptions, WRAPPED_URL } from "./types.js";

/** Returns true if the value tests successfully against the url regex and allows for <> brackets */
export function isUrl(value: Optional<string>): value is VALID_URL;

export function isUrl(value: Optional<string>, options: WrapOptions): value is VALID_URL | WRAPPED_URL;

export function isUrl(value: Optional<string>, options?: WrapOptions): boolean {
	return value ? getUrlRegex({ anchored:true, ...options }).test(value) : false;
}
