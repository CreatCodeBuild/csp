export class UnreachableError extends Error {
    constructor(msg) {
        super(msg);
        this.name = UnreachableError.name;
    }
}
// An unbufferred channel is a channel that has 0 buffer size which lets it blocks on pop() and put() methods.
// Bufferred channel implementation will come later when you or I or we need it. GitHub Issues welcome.
export class UnbufferredChannel {
    constructor() {
        this._closed = false;
        this.popActions = [];
        this.putActions = [];
        this.readyListener = [];
    }
    put(ele) {
        if (this._closed) {
            throw new Error("can not put to a closed channel");
        }
        if (this.readyListener.length > 0) {
            for (let { resolve, i } of this.readyListener) {
                resolve(i);
            }
            this.readyListener = [];
        }
        // if no pop action awaiting
        if (this.popActions.length === 0) {
            return new Promise((resolve, reject) => {
                this.putActions.push({ resolve, reject, ele });
            });
        }
        else {
            return new Promise((resolve) => {
                let onPop = this.popActions.shift();
                if (onPop === undefined) {
                    throw new UnreachableError("should have a pending pop action");
                }
                onPop({ value: ele, done: false });
                resolve();
            });
        }
    }
    // checks if a channel is ready to be read but dooes not read it
    // it returns only after the channel is ready
    async ready() {
        if (this.putActions.length > 0 || this._closed) {
            return this;
        }
        else {
            return new Promise((resolve) => {
                this.readyListener.push({ resolve, i: this });
            });
        }
    }
    async pop() {
        let next = await this.next();
        return next.value;
    }
    next() {
        if (this._closed) {
            return Promise.resolve({ value: undefined, done: true });
        }
        if (this.putActions.length === 0) {
            return new Promise((resolve, reject) => {
                this.popActions.push(resolve);
            });
        }
        else {
            return new Promise((resolve) => {
                let putAction = this.putActions.shift();
                if (putAction === undefined) {
                    throw new UnreachableError("should have a pending put action");
                }
                let { resolve: resolver, ele } = putAction;
                resolver();
                resolve({ value: ele, done: false });
            });
        }
    }
    // put to a closed channel throws an error
    // pop from a closed channel returns undefined
    // close a closed channel throws an error
    async close() {
        if (this._closed) {
            throw Error("can not close a channel twice");
        }
        // A closed channel always pops { value: undefined, done: true }
        for (let pendingPopper of this.popActions) {
            pendingPopper({ value: undefined, done: true });
        }
        this.popActions = [];
        // A closed channel is always ready to be popped.
        for (let { resolve, i } of this.readyListener) {
            resolve(i);
        }
        this.readyListener = [];
        for (let pendingPutter of this.putActions) {
            pendingPutter.reject("A closed channel can never be put");
        }
        this._closed = true;
    }
    closed() {
        return this._closed;
    }
    [Symbol.asyncIterator]() {
        return this;
    }
}
// A shorter name for UnbufferredChannel.
export function chan() {
    return new UnbufferredChannel();
}
// select() is modelled after Go's select statement ( https://tour.golang.org/concurrency/5 )
// and does the same thing and should have identical behavior.
// https://stackoverflow.com/questions/37021194/how-are-golang-select-statements-implemented
export async function select(channels, defaultCase) {
    let promises = channels.map(async ([c, func], i) => {
        await c.ready();
        return i;
    });
    if (defaultCase) {
        promises = promises.concat([
            new Promise((resolve) => {
                // Run it in the next tick of the event loop to prevent starvation.
                // Otherwise, if used in an infinite loop, select might always go to the default case.
                setTimeout(() => {
                    resolve(promises.length - 1);
                }, 0);
            }),
        ]);
    }
    let i = await Promise.race(promises);
    if (defaultCase && i === promises.length - 1) {
        return await defaultCase();
    }
    let ele = await channels[i][0].pop();
    return await channels[i][1](ele);
}
const MAX_INT_32 = Math.pow(2, 32) / 2 - 1;
export function after(ms) {
    if (0 > ms || ms > MAX_INT_32) {
        throw new Error(`${ms} is out of signed int32 bound or is negative`);
    }
    let c = new UnbufferredChannel();
    async function f() {
        await sleep(ms);
        await c.put(ms); // todo: should it close or put?
    }
    f();
    return c;
}
// A promised setTimeout.
export function sleep(ms) {
    if (0 > ms || ms > MAX_INT_32) {
        throw Error(`${ms} is out of signed int32 bound or is negative`);
    }
    return new Promise((resolve, reject) => {
        setTimeout(resolve, ms);
    });
}
export class Multicaster {
    constructor(source) {
        this.source = source;
        this.listeners = [];
        (async () => {
            while (true) {
                if (source.closed()) {
                    for (let l of this.listeners) {
                        l.close();
                    }
                    return;
                }
                let data = await source.pop();
                for (let l of this.listeners) {
                    if (l.closed()) {
                        continue;
                    }
                    l.put(data);
                }
            }
        })();
    }
    copy() {
        let c = new UnbufferredChannel();
        this.listeners.push(c);
        return c;
    }
}
export function multi(c) {
    return new Multicaster(c);
}
