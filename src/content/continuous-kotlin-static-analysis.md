---
title: 'Continuous Kotlin Static Analysis'
author: [Iury Souza]
tags: [kotlin, mobile, QA, devops]
date: '2020-12-20T23:46:37.121Z'
image: img/kotlin-ci.jpg
draft: false
---

# What is it anyway?
Static analysis is a way to find errors and other issues in a source code without actually executing it (hence, static). The process provides an understanding of the code structure and can help ensure that the code adheres to industry standards and capture issues early.

> In sum, it's a glorified spellchecker.

This is not a new idea, the first one of these tools is [lint](https://www.wikiwand.com/en/Lint_(software)) which dates back from the late 70's and is the most common kind of static analysis tool. Most languages have a _linter_ nowadays.
The automation provided by these tools is fundamental to improve code quality, as it greatly increase code reviewing speed while also being less prone to human error.

#### Let machines do what they're best at!

<img width="100%" style="width:100%" src="https://thumbs.gfycat.com/AchingOptimisticAlabamamapturtle-size_restricted.gif">

### What can it do?

Static analysis can be broken into formal, cosmetic, design properties, error checking and predictive categories.
- **Formal**  checks if the code is correct;
- **Cosmetic** checks if the code syncs up with style standards;
- **Design properties** check the level of complexities;
- **Error checking** looks for code violations;
- **Predictive** guesses how code will behave when run.


# But who needs this anyway?
In short, everyone does. Quoting John Carmack, lead developer of Wolfenstein, Doom, Quake and their sequels:
> The first step is fully admitting that the code you write is riddled with errors. That is a bitter pill to swallow for a lot of people, but without it, most suggestions for change will be viewed with irritation or outright hostility. You have to want criticism of your code.

> Automation is necessary. It is common to take a sort of smug satisfaction in reports of colossal failures of automatic systems, but for every failure of automation, the failures of humans are legion. Exhortations to "write better code" plans for more code reviews, pair programming, and so on just don't cut it, especially in an environment with dozens of programmers under a lot of time pressure. The value in catching even the small subset of errors that are tractable to static analysis every single time is huge.

# First Quality Gate
<img width="75%" style="width:75%" src="https://static.wikia.nocookie.net/ageofempires/images/e/e0/Palisadegate.png/revision/latest/top-crop/width/450/height/450?cb=20170112132848">


Static code analysis is a common DevOps practice and makes for a great first quality gate, since it provides early feedback for developers making it easier to fix issues.
So, if you've reached this far, I'm hoping that I was able to convince you, but how can we get static analysis added to your project?


# Kotlin static analysis landscape

So, in the Kotlin community two tools usually come up when talking about static analysis: [ktlint](https://github.com/pinterest/ktlint) and [detekt](https://github.com/detekt/detekt).

`ktlint` prides itself for taking a *no-configuration* approach to linting. The idea is that it will always reflect kotlin's [official code style](https://kotlinlang.org/docs/reference/coding-conventions.html) so the idea here is to be a cosmetic static analysis tool.
`Detekt` on the other hand provides many other features like complexity reports, code smell analysis while also being extensively configurable.

# Basic integration pitfalls
Both tools provide many ways to integrate in your project. You can add a plain gradle task, a gradle plugin or install the command line interface. The recommended route is via a gradle plugin.
After integrating these tools in your project you can use tasks like `detektCheck` and `ktlintCheck` to run over all your project and report the issues. And that's it, you're done!

##### Yes, but also no.

The problem with the basic integration is that in real life things tend to be a little different.
If you're adding static analysis to a greenfield project, it's usually fine to run those tasks over the whole project, but if that is not your case, you'll probably want to avoid auto-formatting your whole project or getting 5k+ warnings every time you run one of those tasks. Warnings just turn into noise.
You could use a _baseline_, which is a configuration that helps incremental adoption on a project, but you're still going to stumble in some issues related to running these over your whole codebase.


## A better solution
If you stop and think about it to be able to get the benefits I've mentioned in the beginning of this post, ideally:
- You want these tasks to run fast, so you can run them often.
- You want to incrementally adopt this in your codebase
- And last, but certainly not least: you don't want to keep forgetting to run these tasks.

Configuring both tools is really similar, so I'll highlight some points that happen in both scripts. You can get detekt's [here](https://gist.github.com/iurysza/005c08ff7f1892097c2823b1786ac087).

So, the magic here is to get the files that were changed in our commit
- There's git command that does just that:
  `$ git diff --name-only origin/main --relative ` In line 38 we call it by using groovy's api. This will output all the change files names.
- In line 44 we process the output so that we can pass the filename list to ktlint/detekt.
- From lines 13 to 20 we decide whether we need to run static analysis or just ignore all files.

[ktlint.gradle-gist](https://gist.github.com/iurysza/dada9047da83d101a6c4b63ed8407cb3)


And that's about it! The rest of the code (from both scripts) just handles the report output location.

#### Good! Almost there now!
We just need a way to make this a part of our workflow. This way we won't forget to run these tasks. And yeah, we can use a `git-hook` like the `pre-commit` hook to do just that.

If you're not familiar with git-hooks, you can check them [here](https://www.atlassian.com/git/tutorials/git-hooks), but if you want to keep reading, just think about them as a piece of code that is going to be called when you do something in git.

The `pre-commit` hook will run when you try to commit something. It runs before git actually creates the commit, so the idea is to only allow a new commit when our static analysis passes successfully, effectively creating our first quality gate. Woot woot!

[precommit-hook-gist](https://gist.github.com/iurysza/fc6d0b735089c573aa5b0ce8797ef548#file-pre-commit-hook)

![](https://media.giphy.com/media/IwAZ6dvvvaTtdI8SD5/giphy.gif)

That's it! This makes sure that every piece of code you commit has to follow the minimum quality standards that you and your team agreed upon.
This is not yet a _final solution_ as people can bypass those checks by running `git commit --no-verify`, but it's a solid first step towards a better codebase.

Besides, if you think about it, these scripts can be easily integrated to a CI environment. What if it could send those warnings as inline comments in your pull request? Stay tuned for more =)


#### References
[Carmac's blog](https://www.gamasutra.com/view/news/128836/InDepth_Static_Code_Analysis.php)
[Static analysis definition](https://searchsoftwarequality.techtarget.com/definition/static-analysis-static-code-analysis)
