import { isDefined } from "@rsc-utils/core-utils";
import { PdfJsonFieldManager } from "./PdfJsonFieldManager.js";
export class PdfJsonManager {
    fields;
    isDefined;
    isEmpty;
    json;
    constructor(input) {
        if (input) {
            this.json = input instanceof PdfJsonManager ? input.json : input;
        }
        this.isDefined = isDefined(this.json);
        this.isEmpty = this.isDefined ? Object.keys(this.json).length > 0 : false;
        this.fields = PdfJsonFieldManager.from(this.json);
    }
    getString(name) {
        return this.fields.getValue(name) ?? undefined;
    }
    hasField(name) {
        return this.fields.has(name);
    }
    isChecked(name) {
        return this.fields.getChecked(name) === true;
    }
    static from(input) {
        return new PdfJsonManager(input);
    }
}
