/** Convenience wrapper for getText(url).then(text => parse(text)) */
export declare function getJson<T = any>(url: string): Promise<T>;
export declare function getJson<T = any, U = any>(url: string, postData: U): Promise<T>;
