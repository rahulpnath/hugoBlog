---
title: "Dynamically Create Powershell Alias"
drafts: true
comments: false
categories:
  - Tools
---

While playing around with the Windows Terminal I had set up [Aliasing](https://www.rahulpnath.com/blog/setting_up_windows_terminal/#aliasing) to enable alias for commonly used commands.

**For e.g Typing in _s_ implies _git status_.**

I wanted to create new command aliases from the command line itself, instead of opening up the script file and modifying it manually. So I created a quick powershell function to do that.

{{< gist rahulpnath 0007a3bdd7da2efc7024bd92c002cf17 >}}
