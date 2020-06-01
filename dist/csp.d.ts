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
export interface SeletableChannel<T> extends PopChannel<T> {
    ready(i: number): Promise<number>;
}
export interface Channel<T> extends SeletableChannel<T>, PutChannel<T> {
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
interface onSelect<T, R> {
    (ele: T | undefined): Promise<R>;
}
interface DefaultCase<T> {
    (): Promise<T>;
}
export declare function select<T, R1, R2>(channels: [SeletableChannel<T>, onSelect<T, R1>][], defaultCase?: DefaultCase<R2>): Promise<R1 | R2>;
export declare function after(ms: number): Channel<number>;
export declare function sleep(ms: number): Promise<unknown>;
export {};
