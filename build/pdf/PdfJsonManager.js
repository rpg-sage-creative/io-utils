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
    hasAllFields(...names) {
        return names.every(name => this.hasField(name));
    }
    hasAllSnippets(...snippetsToFind) {
        const snippetsFound = snippetsToFind.map(_ => false);
        const pages = this.json?.Pages ?? [];
        for (const page of pages) {
            const texts = page.Texts ?? [];
            for (const text of texts) {
                const strings = text.R?.map((r) => r.T) ?? [];
                snippetsToFind.forEach((t, i) => {
                    if (strings.includes(t)) {
                        snippetsFound[i] = true;
                    }
                });
                if (!snippetsFound.includes(false)) {
                    return true;
                }
            }
        }
        return false;
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
