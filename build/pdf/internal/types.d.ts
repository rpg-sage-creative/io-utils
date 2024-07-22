/** Represents the JSON extracted from a PDF. */
export type PdfJson = {
    Pages: PageJson[];
    Meta?: {
        Title?: string;
    };
};
