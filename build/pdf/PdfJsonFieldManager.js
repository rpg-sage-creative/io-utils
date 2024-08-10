import { isDefined } from "@rsc-utils/core-utils";
import { collectFields } from "./internal/collectFields.js";
export class PdfJsonFieldManager {
    fields;
    initialLength;
    constructor(input, transmuter) {
        if (input) {
            if (input instanceof PdfJsonFieldManager) {
                this.fields = input.fields.slice();
            }
            else if (Array.isArray(input)) {
                this.fields = input;
            }
            else {
                this.fields = collectFields(input);
            }
        }
        else {
            this.fields = [];
        }
        if (transmuter) {
            this.fields = this.fields.map(({ name, value, checked }) => transmuter({ name, value, checked }));
        }
        this.initialLength = this.fields.length;
    }
    get isEmpty() {
        return this.fields.length === 0;
    }
    get length() {
        return this.fields.length;
    }
    find(value) {
        if (isDefined(value)) {
            return this.fields.find(field => field.name === value || field.id === value);
        }
        return undefined;
    }
    getArray(key, delim = ",") {
        const value = this.getValue(key);
        return isDefined(value)
            ? value.replace(/\n/g, delim).split(delim)
            : value;
    }
    getChecked(key) {
        const field = this.find(key);
        if (field) {
            if (typeof (field.checked) === "boolean") {
                return field.checked;
            }
            return null;
        }
        return undefined;
    }
    getNumber(key, defValue) {
        const sValue = this.getValue(key);
        if (isDefined(sValue))
            return +sValue;
        return defValue ?? sValue;
    }
    getValue(key, defValue) {
        const field = this.find(key);
        if (field) {
            if (typeof (field.value) === "string") {
                return field.value.trim() === "" ? null : field.value;
            }
            return defValue ?? null;
        }
        return defValue ?? undefined;
    }
    has(key) {
        return this.find(key) !== undefined;
    }
    remove(field) {
        const isNotField = (value) => ["number", "string"].includes(typeof (value));
        if (isNotField(field)) {
            field = this.find(field);
        }
        if (field) {
            const fieldIndex = this.fields.indexOf(field);
            if (fieldIndex > -1) {
                this.fields.splice(fieldIndex, 1);
            }
        }
    }
    static from(input) {
        return new PdfJsonFieldManager(input);
    }
}
