---
title: 'Publishing an obfuscated kotlin library'
author: [Iury Souza]
tags: [kotlin, java, appsec, gradle]
image: img/publish-an-obfuscated-kotlin-library.jpg
date: '2020-12-27T23:46:37.121Z'
draft: false
---

Being an android developer, I've heard about code obfuscation pretty early in my career. Since it's preconfigured in android's gradle plugin (it's actually proguard under the hood), but you don't really mess with it unless you want to.
On the other hand, when you're developing a java/kotlin library and you want to use code obfuscation, things get a little different. In this article I wanted to give a brief overview of my strategy for publishing obfuscated kotlin libraries.

# Code obfuscation
If you're not sure what that means, code obfuscation is the modification of the source code to make it unintelligible, meaning it is _impossible_ for a third-party to understand.
It's makes for a great AppSec initiative and often takes care of the bare minimum security you can have when publishing a source code out in they wild.  By making the code hard to reverse engineer, you ensure that your library's intellectual property is guarded against security threats, unauthorized access, and discovery of application vulnerabilities.

# Proguard
ProGuard is the most popular optimizer for Java bytecode and it also provides obfuscation for they names of classes, fields and methods.

![proguard-pipeline](https://www.guardsquare.com/files/media/guardsquare2016/Website/ProGuard/ProGuard_build_process_b.png)

Proguard is basically a command line tool that takes input jars (aars, wars, ears, zips, apks, directories) and then performs shriking, optimization, obfuscation and preverification to output a new jar.

Here we're just interested in the obfuscation step which will rename the classes, fields, and methods using short meaningless names making it really hard to read the code.

# An obfuscation strategy
### Choosing our tools
There are probably many ways to do this, but since I have a mobile development background, we'll be doing this using proguard's gradle plugin, which will make things are little more simple, specially during the _publication_ part. Also, I'll use gradle's groovy dsl, just because I like its convenience better than kotlin's now (for gradle scripts). I may need another article to justify that, but, bear with me. This is how we integrate proguard's gradle plugin:

``` groovy
buildscript {
    repositories { jcenter() }
    dependencies {
        classpath "com.guardsquare:proguard-gradle:7.0.1"
    }
}
```
We now need to use it to obfuscate our library's `jar`. To do that we're going to use gradle's syntax to create a task that does just that.

``` groovy
task("obfuscateArtifact", type: ProGuardTask, dependsOn: jar) 
```

Let's dissec the task signature for a second. Here we're declaring that this is a task of type `ProguardTask` and that it depends on `jar` task, meaning it has to run _after_ it. This `jar` task comes from either the kotlin or java plugin, that you're already using and it is responsible for packaging your application artifacts into a jar file. The reason our `obfuscateArtifact` task needs to run after this one can be seen in the image above. Proguard takes a jar file as the input, so we need this task to create the jar and then we'll apply our task on top of it.

Now let's configure the input/output of our task:

``` groovy
def artifactName = "$libraryArtifactId-${libraryVersion}.jar"
def obfuscatedFolder = "$buildDir/obfuscated"

injars "$buildDir/libs/$artifactName"
outjars "$obfuscatedFolder/$artifactName"
```

The `jar` task will create, by default, the outputfile file in `buildDir/libs` folder. By default, its name follows the pattern: `artifactId-version.jar`. The `artifactId` is defined in the publishing task that we'll see later on. It's useful to have those values as variables declared in a `gradle.properties` file.

Next properties are for handling deobfuscation. These are meant to be used when you want to understand your stacktraces.
``` groovy
printseeds "$obfuscatedFolder/seeds.txt"
printmapping "$obfuscatedFolder/mapping.txt"
```
###  Handling dependencies
After that, we have to make proguard understand our project's dependencies. To do that we need to provide it with java's standard library and ours runtime, and compile-time  dependencies. A quick explanation of the last two:
- The `compile-time` classpath contains the classes that you’ve added in order to compile your code. This is the equivalent of the classpath passed to `javac` (or any other java compiler).
- The `runtime:` classpath contains the classes that are used when your application is running. That’s the classpath passed to the `java` executable. This is all the code your library is using when it's running.

In proguard we can use the `libraryjars` property to provide these dependencies:
``` groovy
libraryjars "${System.getProperty('java.home')}/lib/rt.jar"
libraryjars configurations.runtime
libraryjars sourceSets.main.compileClasspath
```

The first line has a path pointing to a `rt.jar`. This stands for `runtime JAR` and it has all the classes from the Core Java API. This is the path you use when you're targeting java 8 and below. The other two lines handles runtime and compile-time dependencies that we get by using gradle's dsl.

### Wrapping up
The last piece of this puzzle is proguard's configuration file. I prefer doing that in a separated file. If you're using intelij you can get nice syntax highlight for this file, which in my book is always a nice to have.
``` groovy
configuration files("$projectDir/gradle/configuration.pro")
```

The configuration you're going to use is up to you, even if you don't add anything in the config file, proguard will handle code obfuscation by default. We'll come back to this file again.

Ok, now if you want to obfuscate your code you just need to:
- run `jar` task
- run `obfuscateArtifact` task

Problem solved! Or maybe not.

# Automating the publication pipeline
Assuming you get the `artifactId` right, what we did until now may actually work for youu. The obfuscate task will trigger a build and then obfuscate the jar. But that not ideal. We don't want to manually run this specific task every time. To me, the obfuscation step should be just a part of our library's publication pipeline now. We shouldn't have to remember about it anymore. In order to fix this we need to take a look at this so called, publication pipeline.

If you already have one, it may be just a simple `publishing` task, something like this:

``` groovy
group = "com.myLibrary.group."
version = "$myLibraryVersion"

publishing {
    publications {
        create(MavenPublication) {
            artifactId = "$myLibraryArtifactId"
            from components["java"]
            name = "My Library's name"
            description = "My Library's description"
        }
    }
}
```
The key here is the `from components["java"]` declaration. Quoting from gradle's docs:

> Components are defined by plugins and provide a simple way to define a publication for publishing. They comprise one or more artifacts as well as the appropriate metadata. For example, **the java component consists of the production JAR — produced by the jar task — and its dependency information**.

So, this is how our publication task gets the project's artifacts and dependencies. Therefore, if we want to publish an obfuscated library we need to remove that line and provide our publication with the output produced by `obfuscateArtifact` task.


So, how can we do that?
As we saw in the documentation the `components["java"]` is automatically defined by the java/kotlin plugin and includes all classes from the default `sourceSets`. If we want to define our own artifacts that we want to be published, we can use the `artifact` property.
This is how you do it, inside the `create` block, add:

``` groovy
artifact("$buildDir/obfuscated/${libraryArtifactId}-${version}.jar") {
    builtBy obfuscateArtifact
}
```
Now, let's read this backwards:
- `builtBy` tells which task is going to build the artifact
- the argument to the `artifact` function is the path where this task is going to output it. This path was defined earlier by the `outputJar` property, in our `obfuscateArtifact` task.


Almost there! Now, we need to provide the dependency information. This comes automatically when using the `components["java"`, but here we need to manually provide it. Still in the `create` block, add:

``` groovy 
pom.withXml {
    def dependencies = asNode().appendNode("dependencies")
    configurations.implementation.allDependencies.each { dep ->
        def depNode = dependencies.appendNode("dependency")
        depNode.appendNode("groupId", dep.group)
        depNode.appendNode("artifactId", dep.name)
        depNode.appendNode("version", dep.version)
    }
}
```

And that's about it!
Now, we can forget about obfuscation. We just run the publish task and get our obfuscated code published seamlessly.

## Naming conflicts
If you're using this library in another codebase that will also obfuscate its code you might get some naming conflicts due to proguard using the same name for classes/methods in that projects own obfuscation process. To fix this you can provide proguard with a custom dictionary.

``` txt
//class-dictionary.txt
Lorem
ipsum
dolor
sit
amet
consectetur
adipiscing
...
```
You'll then need tell proguard about it in the `configuration.pro` file, by adding the line.
``` pro
-classobfuscationdictionary class-dictionary.txt
```
Now, proguard will use the words in that file to name our classes during the obfuscation step, avoiding naming conflicts.

The last thing I like to do is to create a different `artifactId` for the unobfuscated version of the library and to publish both versions. You can see the complete script in this [gist](https://gist.github.com/iurysza/8b1dfb998bb9054cd708043a55f8e227)

This diagram shows our end product.
![diagram](https://dev-to-uploads.s3.amazonaws.com/i/628lwza2a5nacpjkur1l.png)


## References
[Proguard home page](https://www.guardsquare.com/en/products/proguard)
[Code obfuscation guide](https://www.appsealing.com/code-obfuscation-comprehensive-guide/)
