type Options = {
    mkdir?: boolean;
    overwrite?: boolean;
};
export declare function symLink(original: string, link: string): Promise<boolean>;
export declare function symLink(original: string, link: string, options: Options): Promise<boolean>;
export {};
