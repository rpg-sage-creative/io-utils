import { isDefined } from "@rsc-utils/core-utils";
import { PdfJsonFieldManager } from "./PdfJsonFieldManager.js";
export class PdfJsonManager {
    fields;
    /** Was this created with json that was non-null and non-undefined. */
    isDefined;
    /** Does this created with json that has keys.  */
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
    get title() {
        return this.json?.Meta?.Title;
    }
    hasAllFields(...names) {
        return names.every(name => this.hasField(name));
    }
    /**
     * Iterates through all Pages.Texts.R.T and checks for each snippetToFind using .includes.
     * Mostly used to validate that a PDF has certain key phrases for identification/validation.
     */
    hasAllSnippets(...snippetsToFind) {
        // track which were found
        const snippetsFound = snippetsToFind.map(_ => false);
        // iterate pages
        const pages = this.json?.Pages ?? [];
        for (const page of pages) {
            // iterate texts
            const texts = page.Texts ?? [];
            for (const text of texts) {
                // grab string sections
                const strings = text.R?.map((r) => r.T) ?? [];
                // mark found texts as found
                snippetsToFind.forEach((t, i) => {
                    if (strings.includes(t)) {
                        snippetsFound[i] = true;
                    }
                    /** @todo retest all compatible pdfs to see if this is needed */
                    else if (strings.includes(t.replaceAll("%20", " "))) {
                        snippetsFound[i] = true;
                    }
                });
                // return true as soon as each text is found
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
