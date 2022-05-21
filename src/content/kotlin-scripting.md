---
layout: post
title: Type safe scripts
author: [Iury Souza]
tags: [kotlin, scripting, automation]
image: img/kotlin-scripting.jpg
date: '2020-07-26T10:00:00.000Z'
draft: false
excerpt: Ever had a hard time trying to make sense of a bash script? What if you could replace that with kotlin?
---

A kotlin script is a way to **compile** and **run** `Kotlin` code easily.
Scripts are a powerful tool when you want to automate any kind of work. The most used languages for scripting tend to be `python`
or `bash`/`shell` but, what if you could get the same task done with `Kotlin`?
But not just that. What if you had access to any java or kotlin library in your scripts?

With `Kscript` you can easily do that! Besides it also offers a lot of features.

- Scripts caching: Running the same script will be way faster the second time.
- Maven dependencies
- IntelliJ support
- Bootstrap header
- Check the [kscript repo](https://github.com/holgerbrandl/kscript) for the full feature set.

<br>

### Trying it out


Install it with [sdk man](https://sdkman.io):

```bash
$ sdk install kscript
```

<p></p>
Now let's create a `.kts` file and try importing some libraries to create an embedded server:

``` kotlin
#!/usr/bin/env kscript

@file:MavenRepository("bintray-ktor","https://dl.bintray.com/kotlin/ktor")
@file:DependsOnMaven("io.ktor:ktor-server-netty:1.2.6")

import io.ktor.application.*
import io.ktor.http.*
import io.ktor.response.*
import io.ktor.routing.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*

println("starting server...")

val server = embeddedServer(Netty, port = 8080) {
  routing {
    get("/") {
      call.respondText("Hello World!", ContentType.Text.Plain)
    }
  }
}
server.start(wait = true)
```

Now, lets run it!
```
$ kscript kscript-server.kts
```

Open your browser on `localhost:8080/`

Cool, right?

But if you’re like me you probably do most of your work on the IDE. So, let’s try that now.

If you have Intelij Idea on your machine you can type 
``` bash
$ kscript --idea kscript-server.kts 
``` 
and it will generate a Gradle Kotlin project with all dependencies declared with the `@file` convention and add them to a Gradle file.

**#Protip**: If syntax highlighting is not working properly, just right click on the `build.gradle` file select `Import Gradle project` 
