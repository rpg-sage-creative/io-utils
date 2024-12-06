import { error, info, stringifyJson, verbose } from "@rsc-utils/core-utils";
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
    handler;
    constructor(name, handler) {
        this.name = name;
        this.handler = handler;
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
                    const handlerResponse = await this.handler(buffer).catch(errorReturn500);
                    res.writeHead(handlerResponse.statusCode, { 'Content-type': handlerResponse.contentType });
                    res.end(ensureOutput(handlerResponse.body));
                    this.verbose(req, `once("end").res.end(${handlerResponse.statusCode})`);
                }));
            }
            else {
                res.writeHead(405, { 'Content-type': 'application/json' });
                res.write(stringifyJson({ error: "Method not allowed!" }));
                res.end();
                this.verbose(req, `res.end(405)`);
            }
        });
        return this;
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
        return this;
    }
    static start(name, port, handler) {
        return new AppServer(name, handler).listen(port);
    }
}
