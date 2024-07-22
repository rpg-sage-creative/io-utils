import { isDefined } from "@rsc-utils/core-utils";
import { PdfJsonFieldManager } from "./PdfJsonFieldManager.js";
import { stringOrUndefined } from "./internal/stringOrUndefined.js";
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
    getNonBlankString(name) {
        return stringOrUndefined(this.fields.getValue(name));
    }
    isChecked(key) {
        return this.fields.getChecked(key) === true;
    }
    static from(json) {
        return new PdfJsonManager(json);
    }
}
