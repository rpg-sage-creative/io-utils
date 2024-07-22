import { isDefined, type Optional } from "@rsc-utils/core-utils";
import { PdfJsonFieldManager } from "./PdfJsonFieldManager.js";
import type { PdfJson } from "./types.js";

export class PdfJsonManager<T extends PdfJson = PdfJson> {
	public fields: PdfJsonFieldManager;
	/** Was this created with json that was non-null and non-undefined. */
	public isDefined: boolean;
	/** Does this created with json that has keys.  */
	public isEmpty: boolean;
	public json?: T;

	public constructor(input: Optional<T | PdfJsonManager<T>>) {
		if (input) {
			this.json = input instanceof PdfJsonManager ? input.json : input;
		}
		this.isDefined = isDefined(this.json);
		this.isEmpty = this.isDefined ? Object.keys(this.json as T).length > 0 : false;
		this.fields = PdfJsonFieldManager.from(this.json);
	}

	public getString(name: string): string | undefined {
		return this.fields.getValue(name) ?? undefined;
	}

	public hasField(name: string): boolean {
		return this.fields.has(name);
	}

	public isChecked(name: string): boolean {
		return this.fields.getChecked(name) === true;
	}

	public static from<U extends PdfJson>(input: Optional<U | PdfJsonManager<U>>): PdfJsonManager<U> {
		return new PdfJsonManager(input);
	}
}