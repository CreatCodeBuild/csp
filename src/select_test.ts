
import { chan, select, sleep, after } from './csp'
import { deepStrictEqual, equal, throws } from 'assert';


describe('select', async () => {
    it("works", async () => {
        let sec1 = chan<string>();
        sec1.put('put after unblock');
        let x = await select([
            [sec1, async ele => ele],
        ])
        equal('put after unblock', x)
    })
    it("works 2", async () => {
        let unblock = chan<null>();
        unblock.close()
        let sec1 = chan<string>();
        setTimeout(async () => {
            sec1.put('sec1');
        }, 1000);
        let x = await select([
            [sec1, async function (ele) { return ele }],
            [unblock, async function (ele) { return ele }],
        ])
        equal(undefined, x)
    })
    it("can select from a channel that will be closed later", async () => {
        let unblock = chan<null>();
        setTimeout(async () => {
            unblock.close()
        }, 100);
        let x = await select([
            [unblock, async function (ele) { return ele }],
        ])
        equal(undefined, x)
    })
    it("can select from a channel that will be put later", async () => {
        let unblock = chan<string>();
        setTimeout(async () => {
            unblock.put('put 1 sec later')
        }, 100);
        let x = await select([
            [unblock, async function (ele) { return ele }],
        ])
        equal('put 1 sec later', x)
    })

    it("can pop from unselected channels", async () => {
        let unblock = chan<null>();
        unblock.close()
        let sec1 = chan<string>();
        let t1 = async () => {
            await sleep(100)
            await sec1.put('sec1');
        }
        t1();
        equal('unblock', await select([
            [unblock, async function () {
                return 'unblock'
            }],
            [sec1, async function (ele) {
                return ele
            }]
        ]))
        equal('sec1', await sec1.pop())
    })

    it("returns in order", async () => {
        let unblock = chan<null>();
        unblock.put(null)
        let sec1 = chan<string>();
        sec1.put('put after unblock');
        let x = await select([
            [sec1, async ele => ele],
            // [unblock, async () => 'unblock' ]
        ])
        equal('put after unblock', x)
    })

    xit("favors channels with values ready to be received over closed channels", async () => {
        // Currently does not support, but
        // Is this even a good design decision?
        let unblock = chan<null>();
        unblock.close()
        let sec1 = chan<null>();
        sec1.put(null);
        let x = await select([
            [sec1, async function () { return 'sec1' }],
            [unblock, async function () { return 'unblock' }],
        ])
        equal('sec1', x)
    })

    it('has default case', async () => {
        let unblock = chan<null>();
        equal('default', await select(
            [
                [unblock, async function () { return 'unblock' }],
            ],
            async function () {
                return 'default'
            }
        ))
    })
    it("won't trigger default case if the normal case is ready", async () => {
        let unblock = chan<null>();
        unblock.close()
        equal(await select(
            [
                [unblock, async function () { return 'unblock' }],
            ],
            async function () {
                return 'default'
            }
        ), 'unblock');
        equal(0, unblock.popActions.length)
        equal(0, unblock.putActions.length)
        equal(0, unblock.readyListener.length)
    })
    it("won't trigger default case if the normal case is ready 2", async () => {
        let unblock = chan<string>();
        unblock.put('something')
        equal(await select(
            [
                [unblock, async function (ele) { return ele }],
            ],
            async function () {
                return 'default'
            }
        ), 'something')
    })

    it('after', async () => {
        let c = chan();
        throws(
            () => {
                after(2147483648)
            },
            new Error('2147483648 is out of signed int32 bound or is negative')
        )
    });

    it('do not starve in an infinite loop', async () => {
        let c = after(10);
        let i = 0;
        while(++i) {
            let ret = await select(
                [
                    [c, async () => {
                        return 'after';
                    }]
                ],
                async () => {
                    // console.log(i);
                    return 'default';
                }
            )
            if (ret === 'after') {
                break;
            }
        }
    });
});
