import { isDefined } from "@rsc-utils/core-utils";
import { PdfJsonFieldManager } from "./PdfJsonFieldManager.js";
export class PdfJsonManager {
    json;
    fields;
    isDefined;
    isEmpty;
    constructor(json) {
        this.json = json;
        this.isDefined = isDefined(json);
        this.isEmpty = this.isDefined ? Object.keys(json).length > 0 : false;
        this.fields = PdfJsonFieldManager.from(json);
    }
    getString(name) {
        return this.fields.getValue(name) ?? undefined;
    }
    isChecked(key) {
        return this.fields.getChecked(key) === true;
    }
    static from(json) {
        return new PdfJsonManager(json);
    }
}
