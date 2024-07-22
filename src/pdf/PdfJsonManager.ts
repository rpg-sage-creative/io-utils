import { isDefined, type Optional } from "@rsc-utils/core-utils";
import { PdfJsonFieldManager } from "./PdfJsonFieldManager.js";
import type { PdfJson } from "./types.js";

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

	public getValue(key: string): string | undefined {
		return this.fields.findValue(key, false);
	}

	public isChecked(key: string): boolean {
		return this.fields.findChecked(key, false);
	}

	public static from<U extends PdfJson>(json: Optional<U>): PdfJsonManager<U> {
		return new PdfJsonManager(json);
	}
}