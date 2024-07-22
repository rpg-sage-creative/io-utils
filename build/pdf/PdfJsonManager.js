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
    getValue(key) {
        return this.fields.findValue(key, false);
    }
    isChecked(key) {
        return this.fields.findChecked(key, false);
    }
    static from(json) {
        return new PdfJsonManager(json);
    }
}
