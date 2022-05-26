---
title: Kotlin Multiplatform under the surface
author: [Iury Souza]
tags: [kotlin, multiplatform, mobile, kmm]
date: '2021-08-18T08:00:00.121Z'
image: img/kotlin-multiplatform-under-the-surface-cover.jpeg
draft: false
---

The mobile development community has always had many alternatives for creating cross-platform apps. Since the days of webview-based solutions we've come a long way, but we still have many alternatives. The most recent one is the Jetbrains led, Kotlin Multiplatform Mobile project.

If you're curious about how does it stand against the competition and what are its pros and cons, this brief overview may help you get started.

## Cross-platform vs Multiplatform

As you may have noticed, Jetbrains calls its solution: Kotlin **Multiplatform** Mobile. This might get overlooked by a lot of people, me included, up until I decided to write this down. But then it hit me: what's the difference between Cross-platform and Multiplatform?

After some research, I got the answer.
From the user's point of view, this is plain simple. In short: there's no difference.
Multiplatform and Cross-platform implementations achieve the same thing. It simply means that the application will run on - you guessed it. Multiple platforms.

Since we're focusing on mobile dev, Multiplatform means Android and iOS. But this can translate to web, desktop... whatever. Just... multiple platforms.
It doesn't say anything about **how** the app was created. If you have a code-base for an app written in Kotlin targeting android and another written in swift targeting iOS, you have a multiplatform app.

Now, cross-platform is different. Cross-platform means that the same code you wrote will run on, for example, android and iOS. This is usually done via some kind of runtime that needs to be shipped to the hosting platform that enables that code to be *interpreted* for that particular environment it is running on.

## So what about Kotlin Multiplatform?

The main idea behind Kotlin Multiplatform is **code-sharing**. If you enter the home page, you'll see them mentioning how you can write the code once and have it running on both platforms. So -you may be asking, isn't that cross-platform... like Flutter or React? What gives?

The main advantage of Kotlin Multiplatform is that it delivers **native code** for multiple target platforms/architectures by taking the same code as input.
It is able to do this because of the **Kotlin/Native Compiler**, so to understand how Kotlin Multiplatform works we first need to understand what is Kotlin/Native.

## Kotlin/Native

Quoting from Kotlin's landing page:

> Kotlin/Native is a technology for compiling Kotlin code to native binaries, which can run without a virtual machine. It is an LLVM based backend for the Kotlin compiler and a native implementation of the Kotlin standard library.

![image](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/flnyeb40col3h8mvye69.png)

There's a lot to unpack here. Let's take the first sentence in:

So Kotlin/Native will give us native binary executables that can run on an OS using no virtual machine.

A binary is the machine code, ready to be run on the specified target architecture. So it's the machine code for, for example, the iOS targeting a specific CPU architecture, like `arm64` (which is the official iPhone architecture name)

Then it goes on to mention an **LLVM based backend for the Kotlin compiler**. This one is dense.

### LLVM

[The LLVM Compiler Infrastructure Project](https://llvm.org/) is probably the biggest open-source compiler project that exists to build native binaries. Languages such as C, C++, Haskell, Rust & Swift compile into native binaries through LLVM.

Ok, fine... but what about the backend?  More specifically, what is a backend for a compiler?

### The Kotlin Compiler, frontends, and backends

The Kotlin compiler first compiles your Kotlin source code into an _Intermediate Representation_, or _IR_. This is what they call the *Frontend*.

Then, the LLVM compiler takes this IR as input and generates machine code for several supported CPU architecture (like the aforementioned arm64). This is the compiler backend.

![Alt Text](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/6cgqfc6h6ryysfio80wn.png)
## Batteries included

>(...) and a native implementation of the Kotlin standard library.

This last part refers to the stdlib. Kotlin multiplatform also includes a sound standard library. This allows us to get up and running with it. So when writing common code, we'll be using things like `kotlin.String` instead of `java.lang.String`. The *Compiler Backend* will automatically map the IR  a `Kotlin.String` into the correct type.

If you think about it, since the native side doesn't have access to, for example, `List`, this means you would have to roll your own when targeting that platform. Not cool.
So the Kotlin team built this to enable us to hit the ground running when targeting native. They also did that for things like IO, networking, and more - all of which are included.

```
Kotlin.String   ----jvm-----> java.lang.String
                -----js-----> string
                ---native---> KString
```

## Long story short

1. The Kotlin Compiler compiles code into an Intermediate Representation with the Compiler Frontend
2. Then, it takes this *IR* and sends it to the LLVM based Compiler Backend.
3. Kotlin has a stdlib that covers most basic use-cases, like IO and networking which is compiled to the appropriate target representation.


## Not Cross-platform, but truly Multiplatform

>*Write once, run anywhere (with the jve).*
> *-java*
>
>Kotlin, probably:
>![image](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/ms3j71np9sy75jovxnrp.png)

Kotlin Multiplatform takes advantage of its great tooling paired with the amazing LLVM project to create true native code that you only need to write once.

It is not Cross-platform because it doesn't need a runtime to be able to run anywhere. It is just plain native code.

Cool, right?
I would say that Kotlin is able to take that direction because of its tooling/architecture and the stage that LLVM project has achieved. Let's see what the future holds for this tech.
There are certainly many challenges that we haven't discussed here, but anyways, the foundation of the tech looks pretty interesting to me.

There's this [talk](https://www.youtube.com/watch?v=Dul17VSiejo) from KotlinConf18 by Kevin Galligan where he goes on to make the case for this multiplatform idea and why he thinks this is _the future_.
I also recommend this great [post](https://blog.londogard.com/gradle/kotlin/workshop/multiplatf
