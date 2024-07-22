import { isDefined, type Optional } from "@rsc-utils/core-utils";
import { PdfJsonFieldManager } from "./PdfJsonFieldManager.js";
import type { PdfJson } from "./types.js";
import { stringOrUndefined } from "./internal/stringOrUndefined.js";

export class PdfJsonManager<T extends PdfJson = PdfJson> {
	public fields: PdfJsonFieldManager;
	/** Was this created with json that was non-null and non-undefined. */
	public isDefined: boolean;
	/** Does this created with json that has keys.  */
	public isEmpty: boolean;

	public constructor(public json: Optional<T>) {
		this.isDefined = isDefined(json);
		this.isEmpty = this.isDefined ? Object.keys(json as any).length > 0 : false;
		this.fields = PdfJsonFieldManager.from(json);
	}

	public getNonBlankString(name: string): string | undefined {
		return stringOrUndefined(this.fields.getValue(name));
	}

	public isChecked(key: string): boolean {
		return this.fields.getChecked(key) === true;
	}

	public static from<U extends PdfJson>(json: Optional<U>): PdfJsonManager<U> {
		return new PdfJsonManager(json);
	}
}