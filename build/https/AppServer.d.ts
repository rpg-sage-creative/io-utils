import { type Awaitable } from "@rsc-utils/core-utils";
import { type IncomingMessage, type Server } from "http";
import type { BufferHandler } from "./types.js";
type Handlers<T> = {
    createdHandler?: (app: AppServer<T>) => Awaitable<void>;
    bufferHandler: BufferHandler<T>;
    startHandler?: (app: AppServer<T>) => Awaitable<void>;
    destroyHandler?: (app: AppServer<T>) => Awaitable<void>;
};
/**
 * A simple, reusable app server for offloading tasks from a process.
 */
export declare class AppServer<T> {
    name: string;
    handlers?: Handlers<T> | undefined;
    constructor(name: string, handlers?: Handlers<T> | undefined);
    protected log(level: "info" | "verbose", ...args: (IncomingMessage | string)[]): void;
    protected verbose(ev: string): void;
    protected verbose(req: IncomingMessage): void;
    protected verbose(req: IncomingMessage, ev: string): void;
    server?: Server;
    create(): this;
    destroy(): void;
    port?: number;
    listen(port: number): this;
    static start<T>(name: string, port: number, bufferHandler: BufferHandler<T>): AppServer<T>;
    static start<T>(name: string, port: number, handlers: Handlers<T>): AppServer<T>;
}
export {};
