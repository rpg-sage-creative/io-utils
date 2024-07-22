import type { Optional } from "@rsc-utils/core-utils";
import { collectCheckFields } from "./collectCheckFields.js";
import { collectTextFields } from "./collectTextFields.js";
import type { Field, PdfJson } from "./types.js";

/** @internal */
export function collectFields(json: Optional<PdfJson>): Field[] {
	const fields: Field[] = [];
	const pages = json?.Pages ?? [];
	pages.forEach(page => {
		fields.push(...collectTextFields(page));
		fields.push(...collectCheckFields(page));
	});
	return fields;
}