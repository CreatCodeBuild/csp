import { chan, select, sleep, after, UnreachableError } from './csp'
import { deepStrictEqual, equal, throws } from 'assert';


describe("Channel", async () => {

    it("can read in order", async () => {
        let c = chan<number>();
        let task1 = async () => {
            let i = 0;
            while (1) {
                await c.put(++i);
                await c.put(++i);
            }
        }
        let task2 = async () => {
            let data: (number | undefined)[] = [];
            let i = 0;
            while (i++ < 10) {
                let x = await c.pop();
                data.push(x);
            }
            return data
        }
        let t1 = task1();
        let t2 = task2();
        deepStrictEqual(await t2, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })

    it("supports iteration protocol", async () => {
        let c = chan<number>();
        let task1 = async () => {
            let i = 0;
            while (1) {
                await c.put(++i);
                await c.put(++i);
            }
        }
        let task2 = async () => {
            let data: (number | undefined)[] = [];
            let i = 0;
            for await (let x of c) {
                i++
                data.push(x);
                if (i === 10) {
                    break
                }
            }
            deepStrictEqual(data, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
        }
        let t1 = task1();
        let t2 = task2();
        await t2;
    })

    it("close always returns undefined", async () => {
        let c = chan<number>();
        let task1 = async () => {
            await c.close();
        }
        let task2 = async () => {
            let data: (number | undefined)[] = [];
            let x = await c.pop();
            data.push(x);
            x = await c.pop();
            data.push(x);
            x = await c.pop();
            data.push(x);
            return data;
        }
        let t2 = task2();
        await task1();
        deepStrictEqual(await t2, [undefined, undefined, undefined])
    })

    it("close works with put", async () => {
        let c = chan<number>();
        let task1 = async () => {
            await c.put(1);
            await c.close();
        }
        let task2 = async () => {
            let data: (number | undefined)[] = [];
            let x = await c.pop();
            data.push(x);
            x = await c.pop();
            data.push(x);
            return data;
        }
        let t1 = task1();
        let t2 = task2();
        await t1;
        deepStrictEqual(await t2, [1, undefined])
    })

    it("close works with iterator", async () => {
        let c = chan<number>();
        let t1 = async () => {
            await c.put(1);
            await c.put(2);
            await c.close();
        }
        t1();
        let task2 = async () => {
            let data: (number | undefined)[] = [];
            for await (let x of c) {
                data.push(x);
            }
            return data;
        }
        let t2 = task2();
        await t1;
        deepStrictEqual(await t2, [1, 2])
    })

    it("can have concurrent pending put operations", async () => {
        let c = chan<number>();
        let task1 = async () => {
            let p1 = c.put(1);
            let p2 = c.put(2);
            await p1;
            await p2;
            c.close();
        }
        let task2 = async () => {
            let data: (number | undefined)[] = [];
            for await (let x of c) {
                data.push(x);
            }
            return data;
        }
        let t1 = task1();
        let t2 = task2();
        await t1;
        let r = await t2;
        deepStrictEqual(r, [1, 2])
    })

    it("can have concurrent pending pop operations", async () => {
        let c = chan<number>();
        let task1 = async () => {
            let p1 = c.put(1);
            let p2 = c.put(2);
            await p1;
            await p2;
            c.close();
        }
        let task2 = async () => {
            let data: (Promise<number | undefined> | undefined)[] = [];
            for (let i = 0; i < 2; i++) {
                data.push(c.pop())
            }
            let ds: any[] = [];
            for (let d of data) {
                ds.push(await d)
            }
            return ds
        }
        let t2 = task2();
        let t1 = task1();
        await t1;
        let r = await t2;
        deepStrictEqual(r, [1, 2])
    })

    xit('close while having pending put actions', async () => {
        let c = chan();
        let put = c.put(1);
        await c.close();
        // await put;
        // try {
        throws(async () => {
            await put;
        }, 'A closed channel can never be put');

        // } catch (err) {
        //     console.log(err);   // the stack trace isn't right
        // }
    });
});
