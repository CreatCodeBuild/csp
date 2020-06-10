// For Deno Users
// import * as CSP from "https://creatcodebuild.github.io/csp/src/csp.ts";
// For Frontend that uses ES Module
// import * as CSP from "https://creatcodebuild.github.io/csp/dist/csp.js";
import { chan, select, sleep } from './csp'

describe("Concurrent Programming 101: in JavaScript", async () => {

    // Indended Audience: Programmers with little prior concurrent programming exprience in CSP style.
    // If you are an experienced Go or Clojure developer, read the next section.

    // In this section, we will learn the basics of channels.

    // CSP stands for communicating sequential process, it is a formal way to describing concurrent behvaiors of programs.
    // It was first described by Tony Hoare http://www.usingcsp.com/
    // Languages like Go make it popular in practical software practices. Erlang might be also inspired by it but it embraces an Actor Model instead.
    // Clojure's core.async library also embraces CSP.

    // It treats all the concurrent unit as its own process. This process is logical. 
    // It could be a real OS process, an OS thread, a coroutine or a promise chain.
    // The only way to communicate between each thread is by message passing
    // and channels are the only media of message passing.

    // There is no shared data/memory/state between/among process.
    // Don't communicate by sharing memory, share memory by communicating. ( https://go-proverbs.github.io/ )
    // The only shared data structure between 2 processes is the channel.

    // Another unique and somewhat surprising behavior of channels is that
    // a channel blocks on sending until the other side begins to receive and
    // a channel blcosk on receiving until the other side begins to send.

    // This allows 2 processes to coordinate works by using the same channel.

    /*
    在本节中，我们将学习通道的基础知识。

    CSP表示 Communicating Sequential Process，它是描述程序并发行为的一种正式方法。它最初是由Tony Hoare（http://www.usingcsp.com/）提出的。
    诸如 Go 之类的语言使其在实际的软件实践中广受欢迎。Erlang可能也受到它的启发，但是最终选择了Actor模型。
    Clojure 的 core.async 库也拥抱 CSP。

    CSP将所有并发单元视为进程，逻辑上的进程。进程可以是真实的OS进程，OS线程，协程或Promise链。
    在每个进程之间进行通信的唯一方法是通过消息传递。
    通道是消息传递的唯一媒体。

    进程之间没有共享的内存/状态。
    不要通过共享内存进行通信，而是通过通信共享内存。 （https://go-proverbs.github.io/）
    2个进程之间唯一的共享数据结构是通道。

    通道的另一个独特且有点令人惊讶的行为是
    通道会阻塞发送，直到另一端开始接收并
    从通道接受数据也会被阻塞，直到另一端开始发送。
    
    这允许2个进程使用同一通道来协作
    */

    it("Example 1", async () => {

        /*
        Here we defined a channel and 2 async tasks.
        The first task put data to the channel in an infinite loop. Normally, you should fear inifite loops.
        But in this case, c.put() blocks until c.pop() is called in task2.
        Since task2 only loop 3 times, task1 wil only loop 3 times as well.

        Also notice that task2 sleeps 1 sec in each iteration so that task1's c.put() will be blocked for 1 sec as well.
        */
        let c = chan<number>();
        let task1 = async () => {
            let i = 0;
            while (1) {
                await c.put(++i);
            }
        }
        let task2 = async () => {
            let i = 0;
            while (i++ < 3) {
                let x = await c.pop();
                console.log(x);
                await sleep(1000);
            }
        }
        task1();
        task2();
    })
});

describe('Some unique or advanced usages of this particular module', async () => {

    // Indended Audience: Experienced Concurrent Programming Programmers.
    it("2", async () => {
        let c = chan<number>();
        let p = c.put(1)
        await c.pop();
        await p;
    });

})
