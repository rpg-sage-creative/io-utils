import type { Optional } from "@rsc-utils/core-utils";
import { collectFields } from "./internal/collectFields.js";
import { stringOrUndefined } from "./internal/stringOrUndefined.js";
import type { CheckField, Field, TextField } from "./internal/types.js";
import type { PdfJson } from "./types.js";

export class PdfJsonFieldManager {
	public fields: Field[];
	public initialLength: number;

	public constructor(input: Optional<PdfJson | PdfJsonFieldManager | Field[]>) {
		if (input) {
			if (input instanceof PdfJsonFieldManager) {
				this.fields = input.fields.slice();

			}else if (Array.isArray(input)) {
				this.fields = input;

			}else {
				this.fields = collectFields(input);
			}
		}else {
			this.fields = [];
		}
		this.initialLength = this.fields.length;
	}

	public get isEmpty(): boolean {
		return this.fields.length === 0;
	}

	public get length(): number {
		return this.fields.length;
	}

	/** Returns the given field by matching the name. */
	public find<T extends Field>(name: string): T | undefined {
		return this.fields.find(field => field.name === name) as T;
	}

	/**
	 * Finds the given field and returns true if the field is checked.
	 * Also removes the field from the fields array.
	 */
	public findChecked(name: string, remove: boolean): boolean {
		const field = this.find<CheckField>(name);
		if (remove) this.removeField(field);
		return field?.checked === true;
	}

	/**
	 * Finds the given field and returns the value as a non-blank string or undefined.
	 * Also removes the field from the fields array.
	 */
	public findValue(name: string, remove: boolean): string | undefined {
		const field = this.find<TextField>(name);
		if (remove) this.removeField(field);
		return stringOrUndefined(field?.value);
	}

	/** Removes the field so that it cannot be reused. */
	private removeField(field: Optional<Field>): void {
		if (field) {
			const fieldIndex = this.fields.indexOf(field);
			if (fieldIndex > -1) {
				this.fields.splice(fieldIndex, 1);
			}
		}
	}

	public static from<U extends PdfJson, V extends PdfJsonFieldManager>(input: Optional<U | V>): PdfJsonFieldManager {
		return new PdfJsonFieldManager(input);
	}

}