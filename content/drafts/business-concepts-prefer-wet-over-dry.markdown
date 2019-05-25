---
layout: post
title: "Business Concepts - Prefer WET over DRY"
comments: false
categories: 
- Programming
draft: true
description: 
primaryImage: 
---

Often as developers we try to avoid code duplication, as there is a cost attached with duplicated code. We have a phrase *[Don't Repeat Yourself](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself)* (DRY) which is often stated to avoid code duplication. Contrary to DRY we also have a catchphrase for duplicating the code - '*Write Everything Twice*' (WET). One of the primary reasons why code duplication is bad is that any changes to the code, potentially needs to be applied across all the duplicated section. However the same argument can also be used against DRY Principle, when a change introduced is applicable to only a particular scenario for a reused portion of the code. Now you have the extra work of duplicating the code at appropriate places to cater for the new behaviour.

As a developer we now have the added challenge of choosing between WET and DRY options when writing code. In the post, [Why DRY?](http://blog.ploeh.dk/2014/08/07/why-dry/), Mark Seemann helps understand this a bit better and the trade-offs involved. In this post I would like to look at a use case that favors WET over DRY.

Recently at one of my clients we were working on integrating couple of different applications (owned by different departments) through the use of messaging. Change in one system was to be notified to other systems by sending messages. All the applications had a concept of a Customer and they could go through a variety of state changes. For the department that I was working with, wanted these changes notified to a group of people via email.

### Data Transfer Objects 

###  Business Events


Let's take a quick example. At one of recent clients we have a requirement to post messages to Yammer group to notify users of various business events.
