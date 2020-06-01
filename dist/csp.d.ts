interface base {
    close(): void;
    closed(): boolean;
}
export interface PopChannel<T> extends base {
    pop(): Promise<T | undefined>;
}
export interface PutChannel<T> extends base {
    put(ele: T): Promise<void>;
}
export interface BaseChannel<T> extends PopChannel<T>, PutChannel<T> {
}
export interface Channel<T> extends PopChannel<T> {
    ready(i: number): Promise<number>;
}
export interface IterableChannel<T> extends PopChannel<T> {
    [Symbol.asyncIterator]: AsyncIterator<T, T>;
}
interface PopperOnResolver<T> {
    (ele: {
        value: undefined;
        done: true;
    } | {
        value: T;
        done: false;
    }): void;
}
export declare class UnbufferredChannel<T> implements Channel<T>, PutChannel<T> {
    private _closed;
    popActions: PopperOnResolver<T>[];
    putActions: Array<{
        resolver: Function;
        ele: T;
    }>;
    readyListener: {
        resolve: Function;
        i: number;
    }[];
    put(ele: T): Promise<void>;
    ready(i: number): Promise<number>;
    pop(): Promise<T | undefined>;
    next(): Promise<{
        value: T;
        done: false;
    } | {
        value: undefined;
        done: true;
    }> | {
        value: undefined;
        done: true;
    };
    close(): Promise<void>;
    closed(): boolean;
    [Symbol.asyncIterator](): this;
}
export declare function chan<T>(): UnbufferredChannel<T>;
interface onSelect<T> {
    (ele: T | undefined): Promise<any>;
}
interface DefaultCase<T> {
    (): Promise<T>;
}
export declare function select<T>(channels: [Channel<T>, onSelect<T>][], defaultCase?: DefaultCase<T>): Promise<any>;
export declare function after(ms: number): Channel<number>;
export declare function sleep(ms: number): Promise<unknown>;
export {};
