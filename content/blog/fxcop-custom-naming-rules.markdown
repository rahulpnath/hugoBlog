---
author: rahulpnath
comments: true
date: 2009-06-10 02:53:00+00:00
layout: post
slug: fxcop-custom-naming-rules
title: FxCop Custom Naming Rules
wordpress_id: 32
categories:
- .Net
tags:
- Code Analysis
---

Recently I had started using [FxCop](http://msdn.microsoft.com/en-us/library/bb429476.aspx),which is a wonderful code analysis tool.Soon after getting into it,I felt the need of rules specific to my requirements and standards.One such need was in the area of 'Naming of Variables'.  
Every project/organization might have their own naming standards and rules for variables. FxCop provides a way to make sure everyone in the team adheres to these rules.  
I found this material quite interesting and helpful.  
[FxCop And Code Analysis](http://www.binarycoder.net/fxcop/html/index.html)  
  
FxCop analyzes the CIL( Common    Intermediate Language) ,so it is supposedly to be language independent.The CIL genarated by the vb compiler and the c# compiler are almost same,but there are diferences which needs to be handled and taken care of while writing custom rules.  
One such example i faced in checking for naming convention of string variables is posted [here](http://social.msdn.microsoft.com/Forums/en-US/vstscode/thread/709866cf-34de-4275-adb0-b8dfbf4d5906).  
  
You can always see the CIL genarated using the '[ildasm](http://msdn.microsoft.com/en-us/library/f7dy01k1%28VS.80%29.aspx)' tool which comes with visual studio.  
It would be helpful ,if you look at the IL genarated while writing rules,as writing rules is always a trial and error method.  
One other tool which comes handy is [Reflector](http://www.red-gate.com/products/reflector/).  
  
Will soon post more on writing custom rules.Hope this helps to start with!!!!  
  
[CodeProject](http://www.codeproject.com/script/Articles/BlogFeedList.aspx?amid=5842203)
