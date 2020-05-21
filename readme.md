# Communicating Sequential Process in All of JavaScript
This is a ES module that supports CSP style of concurrency in Browser, Node and Deno. This module has 0 external dependencies.

The implementation is mapped to Go's channel semantics as close as possible unless the nature of JS advices otherwise.

## How to Use
### Browser ES Module & Deno in JavaScript
```js
import * as CSP from "https://creatcodebuild.github.io/csp/dist/csp.js";
```
### Deno in TypeScript
```js
import * as CSP from "https://creatcodebuild.github.io/csp/src/csp.ts";
```
### Node
I haven't publish a NPM Package for this yet. For now, just copy & paste. There is only 1 file.

## Document
The library is at the early stage, all documentations are written in the formal of unit tests with detailed explainations.

See [Doc](./csp_doc.ts)

### 中文用户福利文档
__目标受众：以前很少有CSP风格的并行编程经验的程序员。__
*如果您是经验丰富的Go或Clojure开发人员，请阅读下一节。*

## Development Setup
```
yarn install
```
See Makefile for other commands.

## Why?
My motivation of writing it is not merely an intellectual pursue of reinvention the wheel, considering there are already at least 3 implementations of CSP in JavaScript.

I am writing a new kind of GraphQL backend framework that focuses on distributed development (multi-lingua) and real-time communicating (GraphQL Subscription). Why am I writing yet another GraphQL framework? That deserves an article of its own. In order to achieve it, I need a robust concurrent model that can work both in a single process and distributely. After much research, I have chosen CSP over Actor Model because 

1. CSP is easier to implement.
2. CSP works better in a single-process situation.
3. Go has native CSP so that I save energy (I'm only targeting JS and Go at the moment)

None of the CSP implementations in JS meets my requirement so that I have to implement my own. It's faster to write my own than PR to other repos.
