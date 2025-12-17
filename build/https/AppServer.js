import { captureProcessExit, error, info, stringifyJson, verbose } from "@rsc-utils/core-utils";
import { createServer } from "http";
function errorReturn500(ex) {
    error(ex);
    return {
        statusCode: 500,
        contentType: "application/json",
        body: { error: "Unknown Error" }
    };
}
function ensureOutput(output) {
    if (output === null || output === undefined) {
        return stringifyJson({ error: "null or undefined output" });
    }
    if (Buffer.isBuffer(output)) {
        return output;
    }
    if (typeof (output) === "string") {
        return output;
    }
    return stringifyJson(output);
}
export class AppServer {
    name;
    handlers;
    constructor(name, handlers) {
        this.name = name;
        this.handlers = handlers;
    }
    log(level, ...args) {
        const req = args.find(arg => typeof (arg) !== "string");
        const ev = args.find(arg => typeof (arg) === "string");
        const url = req ? `("${req.url}")` : ``;
        const dot = ev ? `.` : ``;
        const msg = ev ?? "";
        const fn = level === "info" ? info : verbose;
        fn(level, `AppServer<${this.name}>${url}${dot}${msg}`);
    }
    verbose(...args) {
        this.log("verbose", ...args);
    }
    server;
    create() {
        if (this.server) {
            return this;
        }
        this.server = createServer((req, res) => {
            this.verbose(req);
            if (req.method === "POST") {
                const chunks = [];
                req.on("data", (chunk) => {
                    this.verbose(req, `on("data")`);
                    chunks.push(chunk);
                });
                req.once("end", (async () => {
                    this.verbose(req, `once("end")`);
                    const buffer = Buffer.concat(chunks);
                    if (this.handlers?.bufferHandler) {
                        const handlerResponse = await this.handlers.bufferHandler(buffer).catch(errorReturn500);
                        res.writeHead(handlerResponse.statusCode, { "Content-Type": handlerResponse.contentType });
                        res.end(ensureOutput(handlerResponse.body));
                        this.verbose(req, `once("end").res.end(${handlerResponse.statusCode})`);
                    }
                    else {
                        res.end();
                        this.verbose(req, `once("end").res.end()`);
                    }
                }));
            }
            else {
                res.writeHead(405, { "Content-Type": "application/json" });
                res.write(stringifyJson({ error: "Method not allowed!" }));
                res.end();
                this.verbose(req, `res.end(405)`);
            }
        });
        this.handlers?.createdHandler?.(this);
        return this;
    }
    destroy() {
        this.handlers?.destroyHandler?.(this);
        this.server?.closeAllConnections();
        this.server?.removeAllListeners();
        delete this.handlers;
        delete this.server;
    }
    port;
    listen(port) {
        if (this.port) {
            return this;
        }
        this.create();
        this.port = port;
        this.server?.listen(port);
        this.log("info", `listen(${port})`);
        this.handlers?.startHandler?.(this);
        captureProcessExit(this);
        return this;
    }
    static start(name, port, arg) {
        const handlers = typeof (arg) === "function" ? { bufferHandler: arg } : arg;
        return new AppServer(name, handlers).listen(port);
    }
}
