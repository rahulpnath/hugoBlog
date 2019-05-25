---
layout: post
title: "Single Responsibility Principle"
comments: false
drafts: true
categories: 
- Programming
- Thoughts
description: 
---


The [Single Responsibility Principle](https://8thlight.com/blog/uncle-bob/2014/05/08/SingleReponsibilityPrinciple.html) (SRP) is one of the five principle that encompasses the SOLID Design principles. Since the principle is related to object oriented programming the statement principle is more technical in nature

> *A class should have one, and only one, reason to change.*

Though the principle is targeted at the basic building block of Object Oriented Code, it can very well be applied to other aspects of software development and life in general. 


### SRP in Software Development

#### **Version Control Commits**

Git commit messages are one of such things when taken in isolation does not seem like providing value, but when taken as a whole and considered in a long run provides a great value. Proper commit messages acts like a documentation and also allows to capture any though processes that went at the time of making the code change. We often make design/technical choices that are hard to explain through code (except with comments).commit messages are a great place to capture this and it provides a history of changes. Commits also help stay in the flow and quickly get back into flow. Like with SRP in class, it's best to keep commit messages change one aspect of the code at a time. This helps track changes better and also TDK. Having a good readable history of commits TDK.


#### **Work Task**

Irrespective of the type of development methodology you use its best to capture the requirements up front TDK. When capturing requirements keeping breaking it down into smaller parts helps keep the complexity of tasks less. It's easier to approach smaller independent tasks than large coupled tasks. Applying SRP means to break down tasks I to smaller individual pieces and working on them. This also helps associate commit messages to each task and keep them small as well. 

#### **Micro Services**

Micro Services is a buzz these days (it doesn't look good from my part, if I don't specify it atleast once here on my blog) and by definition adheres to SRP.  Having a service isolating one service so that it is fully independent. TDK micro services qualities

### SRP in Real World

As we have seen micro services spans across the software development it also tends to manifest itself in the real world. 

#### **Gadgets TDK**

Over the past few years we have seen a trend towards more specific devices that are capable of doing one thing perfectly. We have smart phones that are capable of doing everything - from calling to music, video, photography, videography, etc. But as we need better quality and perfection we move towards devices that have a 'single Responsibility' - which does just one thing and that thing well

#### **Multitasking**

Ability to multitask was seen as a great capability and a desirable quality a while back. Since late we have started realizing that the brain works best when focusing on one task. Meditation, being mindful etc TDK have become popular and help concentrate on a single task. Any that requires a quality output needs to be given full attention. It should be the 'single thing that we are responsible for TDK when doing that activity.
