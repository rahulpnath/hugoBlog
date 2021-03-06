---
author: rahulpnath
comments: true
date: 2011-06-11 14:22:28+00:00
layout: post
slug: rest-after-a-long-time
title: REST...after a long time
wordpress_id: 257
categories:
- ASP.NET
---

It's not been too long since I have been  into Web development,but I have already started hearing the buzz word every now and then.

REpresentational State Transfer(REST).

Aaron Skonnard left me with enough curiosity and confusions with his [Why we need REST](http://channel9.msdn.com/blogs/matthijs/why-rest-by-aaron-skonnard) talk,to make me dig deeper into it.It takes more time to unlearn things than to learn .With REST it was really something like that.There was this whole concept of SOAP and its API's that came to my mind every now and then.But then is it actually SOAP that REST is trying to replace.Actually no.It's basically an alternate way to Remote Procedure Call(RPC) methodology and it so happens that almost all the SOAP implementation use RPC today.SOAP gave a lot of things out of the box,but most of it never got used,which meant it was just adding up complexity unnecessarily.But as always it's never a 'SOAP vs REST',it's about what you are trying to achieve that would drive the decision.

REST simplifies a lot on the interface that is exposed to the client.As for REST there is not explicit '_contracts_'  to be specified.The HTTP verbs,GET,PUT POST and DELETE are the interface that is used in REST.This makes it much simple and uniform.Also rest takes a Resource Oriented programming where everything under consideration is a resource and the HTTP interface acts on that.At an implementation level you would still have functions for any of those Create,Read,Update and Delete(CRUD) operations,with the only difference being it would be all mapped to the HTTP verbs.

As for WCF is concerned you have 2 attributes,WebGet and WebInvoke, that would decorate you functions to indicate the mapping with the http interface.WebGet is used to map to the GET of http and all other verbs map to WebInvoke,which inturn has Method property that indicates what method of http it actually maps to.
``` csharp
[WebGet(UriTemplate = "users/{username}")]
[OperationContract]
User GetUserDetails(string userName)

[WebInvoke(Method = "PUT", UriTemplate = "users/{username}")]
[OperationContract]
void PutNewUser(string userName, User user) {...}
```
As seen in the above snippet,the same resource,users,supports 2 different kind of methods to be invoked on it.So the function that actually gets invoked would be decided by the Http.So you see the client never calls a GetUserDetails or PutNewUser.All it knows is HTTP and its interface,which gives a uniformity across resources and also makes life simple.

REST is an architectural style,so obviously you need to shift your thought process from previous styles that you would have been exposed to.Wherever you see about REST,it mentions about the basic operations of CRUD over a resource.So often the thought of '_Are only these operations are suported?_' comes.So here is one of the shifts in thinking that you would have to think.In REST everything is a resource,be it a person or some activity that he does.So as long as you have different resources for everything you only end up doing the CRUD operations on all those.So its about how you model out these resources.For eg.A transaction that you might need to do can by itself be a resource,over which you would end up doing the basic CRUD operations

Another powerful feature that REST uses is Caching that is inbuilt into the HTTP.Right from no caching to conditional caching can be achieved very easily for your rest services.This reduces the number of roundtrips  and makes a better use of the bandwidth.This is one important feature that makes web what it is today,and you have this power at your disposal,with actually no or very little work.Details on HTTP caching and different machanisms are [here](http://www.w3.org/Protocols/rfc2616/rfc2616-sec13.html)

With ASP.NET MVC,you can expose you website also as a service,more interestingly you can do that in a RESTful manner.This makes your website to be used not only by humans but also by machines/programs.You would be using AcceptVerbs attribute as you used WebInvoke/WebGet for WCF.This makes it easy for you to expose your website itself as a service.You can have it return HTML for humans and JSON/XML/any other data format for a machine/program.

REST really makes things simpler and its more towards the way originally the web was intended to be.There is a very good article again by Aaron on [Building restful services](http://msdn.microsoft.com/en-us/library/dd203052.aspx).

Now I need some REST ;)
