import { verbose } from "@rsc-utils/core-utils";
import {} from "@rsc-utils/progress-utils";
import { WriteStream, createWriteStream, existsSync, mkdirSync, rmSync, statSync } from "fs";
import { createHttpLogger } from "./createHttpLogger.js";
import { getProtocol } from "./getProtocol.js";
export function cacheFile(...args) {
    const options = typeof (args[args.length - 1]) !== "string" ? args.pop() : undefined;
    const url = options?.url ?? args.shift();
    if (typeof (url) !== "string") {
        return Promise.reject(new Error("Invalid url"));
    }
    const filePath = options?.filePath ?? args.shift();
    if (typeof (filePath) !== "string") {
        return Promise.reject(new Error("Invalid filePath"));
    }
    const useLogger = !!options?.logPercent || !!options?.progressTracker;
    return new Promise((_resolve, _reject) => {
        const dirPath = filePath.split("/").slice(0, -1).join("/");
        if (!existsSync(dirPath)) {
            verbose(`Creating folder: ${dirPath}`);
            mkdirSync(dirPath, { recursive: true });
        }
        if (existsSync(filePath)) {
            verbose(`Removing old file: ${filePath}`);
            rmSync(filePath);
        }
        verbose(`Opening file for stream: ${filePath}`);
        let writeStream = createWriteStream(filePath, { encoding: "utf8" });
        let pTracker = useLogger ? options.progressTracker ?? createHttpLogger(`Fetching Bytes: ${url}`, 0) : null;
        const resolve = () => {
            pTracker?.finish();
            pTracker = null;
            writeStream?.close();
            writeStream = null;
            if (existsSync(filePath)) {
                const fileSize = statSync(filePath).size;
                if (fileSize > 0) {
                    _resolve(true);
                }
                else {
                    _reject(`Destination file invalid: ${filePath} (${fileSize})`);
                }
            }
            else {
                _reject(`Destination file not created: ${filePath}`);
            }
        };
        const reject = (err) => {
            pTracker?.error(err);
            pTracker = null;
            writeStream?.close();
            writeStream = null;
            _reject(err);
        };
        try {
            const protocol = getProtocol(url);
            const req = protocol.get(url, response => {
                try {
                    response.pipe(writeStream);
                    response.on("data", (chunk) => pTracker?.increment(chunk.byteLength));
                    response.once("close", reject);
                    response.once("end", resolve);
                    response.once("error", reject);
                }
                catch (ex) {
                    reject(ex);
                }
            });
            req.once("response", resp => pTracker?.start(+(resp.headers["content-length"] ?? 0)));
            req.once("close", reject);
            req.once("error", reject);
            req.once("timeout", reject);
        }
        catch (ex) {
            reject(ex);
        }
    });
}
