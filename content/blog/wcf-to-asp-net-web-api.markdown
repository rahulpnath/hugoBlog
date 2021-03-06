---
author: rahulpnath
comments: true
date: 2012-07-07 10:16:57+00:00
layout: post
slug: wcf-to-asp-net-web-api
title: WCF to ASP.NET Web API
wordpress_id: 328
categories:
- .Net
- ASP.NET
- WCF
tags:
- ASP.NET Web API
- Web Api
---

Windows Communication Foundation(WCF) brought around a unified programming model for building service oriented application.All the previous technologies that was used to build services like MSMQ, remoting, ASMX Web Services,all came under one umbrella.

 

WCF had embraced SOAP,moving away from the [restful web](http://rahulpnath.wordpress.com/2011/06/11/rest-after-a-long-time/) giving all sorts of flexibility and configurability.Everyone was happy for sometime thinking about the power that actually WCF gave by just changing a set of configurations and embraced it entirely.But then most of this configuration did not apply to many of the user scenario,and just went unused,coming with the extra ‘baggage’ that SOAP had to carry around.

 

I found Scott’s summary the best,as in this [podcast](http://www.hanselminutes.com/264/this-is-not-your-fathers-wcf-all-about-the-webapi-with-glenn-block),when he speaks of WCF       
> ”_If you are giving me an api whose strong point is it can talk over multi transport and has abstracted me away from the details that i actually need in the name of flexibility that i am not going to use,then that is just baggage_”

 

WCF had its own way of being restful,so came WCF WebHTTP,WCF Rest Starter Kit and even a WCF Web Api.Apparently ASP.NET MVC,which is inherently restful,was also having getting capabilities to build basic web Api’s. 

 

With [ASP.NET MVC 4](http://www.asp.net/mvc/mvc4) , both the paths that REST had taken merges as [ASP.NET Web API](http://www.asp.net/web-api).       
So yes this is the ideal platform for building Restful services on the .NET Framework.      
Web API is nothing but services exposed over http,providing reach to various devices and platforms without doubt,as http is supported across platforms and devices.SOAP did use http,but it used it more as a transport than an application protocol,by sending message packets over http.But with Web Api the ‘contract’ is the actions of HTTP –GET ,PUT ,POST ,DELETE etc..

 

All said WCF still holds good in cases where SOAP is necessary,where it was actually intended to be used.It’s just the REST’ful part take a new form.

 

Can’t wait to get you hands dirty!!!! Jump in with [this](http://channel9.msdn.com/Events/TechEd/NorthAmerica/2012/DEV309).
