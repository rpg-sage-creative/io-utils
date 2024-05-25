/// <reference types="node" />
import { type IncomingMessage, type Server } from "http";
import type { BufferHandler } from "./types.js";
/**
 * A simple, reusable app server for offloading tasks from a process.
 */
export declare class AppServer<T> {
    name: string;
    handler: BufferHandler<T>;
    constructor(name: string, handler: BufferHandler<T>);
    protected log(level: "info" | "verbose", ...args: (IncomingMessage | string)[]): void;
    protected verbose(ev: string): void;
    protected verbose(req: IncomingMessage): void;
    protected verbose(req: IncomingMessage, ev: string): void;
    server?: Server;
    create(): this;
    port?: number;
    listen(port: number): this;
    static start<T>(name: string, port: number, handler: BufferHandler<T>): AppServer<T>;
}
