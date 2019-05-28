---
title: "Azure AD: Restrict Application Access To Users Belonging To A Group"
drafts: true
comments: false
---

For one of the web application I was working on, access was to be restricted based on user belonging to a particular Azure AD Group. The application as such did not have any Role Based Functionality. It felt an overhead to setup the [Role Based Access](https://www.rahulpnath.com/blog/dot-net-core-api-and-azure-ad-groups-based-access/) to just restrict for users belonging to a particular group. 

In this post let us look at how we can set up Azure AD authentication such that only users of a particular group can authenticate against it and get a token

### Setting up Web Application


### Setting up Azure AD Application