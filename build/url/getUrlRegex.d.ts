import { type RegExpAnchorOptions, type RegExpCaptureOptions, type RegExpFlagOptions } from "@rsc-utils/core-utils";
import type { WrapOptions } from "./types.js";
type GetOptions = RegExpFlagOptions & RegExpAnchorOptions & RegExpCaptureOptions & WrapOptions;
export declare const UrlRegExp: RegExp;
export declare const UrlRegExpG: RegExp;
/**
 * Returns an instance of the number regexp.
 * If gFlag is passed, a new regexp is created.
 * If gFlag is not passed, a cached version of the regexp is used.
 */
export declare function getUrlRegex(options?: GetOptions): RegExp;
export {};
