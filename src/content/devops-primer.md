---
layout: post
title: A primer
author: [Iury Souza]
tags: [ devops, automation ]
image: img/devops-primer.jpg
date: '2020-12-16T23:46:37.121Z'
draft: false
---

Recently, I've been trying to improve my understanding of good CI and CD practices and I often saw this word: `DevOps`.
I mean, I thought I sort of understood what DevOps meant: - The team who keeps our infrastructure up and running and that manages some crazy scripts for on our pipelines, right?  Well... no.

So I decided to take some time to understand this. Picked a book on the subject, read some articles here and there...
And in this series I'll try to talk about some of what I learned and about my own experiences.

The book I picked up was *The DevOps Handbook*, subtitled: *How to Create World-Class Agility, Reliability, & Security in Technology Organizations*. This is an incredible source of knowledge, written by some very smart folks from the DevOps community. After that, one thing led to another, and I stumbled upon *The Twelve-Factor App*. This one is a methodology developed by people working for the Heroku platform. They provide key insights for anyone that develops software delivered as a service (SaaS), but a lot of what they talk about is useful for any kind of software. You should really check them out if you have the chance. But enough with that. Let's dive in.


# So, what is DevOps?
Quoting Wikipedia:
> DevOps is a set of practices that combines software development and IT operations.
> It aims to shorten the systems development life cycle and provide continuous delivery with high software quality.
> DevOps is complementary with Agile software development; several DevOps aspects came from Agile methodology.

So, this is basically agile at a macro-level. When you take a birds-eye view of all the agile methodologies,
clean-code best practices, conventions, collaboration tools, etc, what you and your organization really
want is to deliver value to the costumer. Ok, makes sense, right?

It does! And the people from the *DevOps Handbook* even came up with this idea of a `value-stream`. Now, what is a value stream is in the first place?

Quoting from the book:
> In the DevOps, we typically define a value stream as the process required to **convert a business hypothesis** into a **technology-enabled service** that delivers **value** to the **customer**.

![Value Stream](https://dev-to-uploads.s3.amazonaws.com/i/zlf5jsfw0qu2hv513xa7.png)

# The Three Ways

Right off the bat, the authors split DevOps practices into three ways:
- **The First Way** enables fast left-to-right flow of work from Development to Operations to the customer. In order to maximize flow, we need to make work visible, reduce our batch sizes and intervals of work, build in quality by preventing defects from being passed to downstream work centers, and constantly optimize for the global goals.
- **The Second Way** enables the fast and constant flow of feedback from right to left at all stages of our value stream. It requires that we amplify feedback to prevent problems from happening again, or enable faster detection and recovery.
- **The Third Way** enables the creation of a generative, high-trust culture that supports a dynamic, disciplined, and scientific approach to experimentation and risk-taking, facilitating the creation of organizational learning, both from our successes and failures. Furthermore, by continually shortening and amplifying our feedback loops, we create ever-safer systems of work and are better able to take risks and perform experiments that help us learn faster than our competition and win in the marketplace.

The book is divided into three parts, one per way. Each part documents the relevant technical practices with supporting case studies and experiences sourced from industry behemoths like Netflix and Amazon.

But this is not a book review, and for the purpose of this series I wanted to share some insights on topics I've found particularly compelling. Let's dive in!



