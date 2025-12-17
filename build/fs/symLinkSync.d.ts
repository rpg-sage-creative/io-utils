type Options = {
    makeDir?: boolean;
    overwrite?: boolean;
};
export declare function symLinkSync(original: string, link: string): boolean;
export declare function symLinkSync(original: string, link: string, options: Options): boolean;
export {};
