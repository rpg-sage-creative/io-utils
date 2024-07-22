import { collectFields } from "./internal/collectFields.js";
export class PdfJsonFieldManager {
    fields;
    initialLength;
    constructor(input) {
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
        this.initialLength = this.fields.length;
    }
    get isEmpty() {
        return this.fields.length === 0;
    }
    get length() {
        return this.fields.length;
    }
    find(name) {
        return this.fields.find(field => field.name === name);
    }
    getChecked(name) {
        const field = this.find(name);
        if (field) {
            if (typeof (field.checked) === "boolean") {
                return field.checked;
            }
            return null;
        }
        return undefined;
    }
    getValue(name) {
        const field = this.find(name);
        if (field) {
            if (typeof (field.value) === "string") {
                return field.value;
            }
            return null;
        }
        return undefined;
    }
    has(name) {
        return this.find(name) !== undefined;
    }
    remove(field) {
        if (typeof (field) === "string") {
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
