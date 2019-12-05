---
title: "Setting Up The Windows Terminal"
drafts: true
comments: false
categories:
- Tools
cover: /images/windows_terminal.jpg
---

For a long time I have been using the [Cmder](https://www.rahulpnath.com/blog/cmder-portable-console-emulator-for-windows/) as my command line. This was mostly for the ability to copy-paste, open multiple tabs and ability to add aliases (shortcut command). I was never particulary interested in other customizations of the command line. However one of these [recent tweets](https://twitter.com/bradwilson/status/1199826823628017664) got me interested with the new Windows Terminal.


### Toggling the Prompt

Pressing  <img style="display: inline-block;" src="/images/windows-10.png" alt="WIN Key"> + 1 (the position of the app on the taskbar) works as [toggle](https://www.itprotoday.com/access-taskbar-keyboard-shortcuts). If the app is open and selected it will minimize, if not it will bring to the front and selects it. If the app is not running it will start the app.

![](/images/windows_terminal_toggle.jpg)

### Theme

To theme the terminal you need to [install two powershell modules](https://github.com/JanDeDobbeleer/oh-my-posh?WT.mc_id=-blog-scottha#installation)

``` powershell
Install-Module posh-git -Scope CurrentUser
Install-Module oh-my-posh -Scope CurrentUser
```

To load these modules by default on launch of powershell update the powershel [profile](https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_profiles?view=powershell-6#the-profile-variable). For this run 'notepad $PROFILE' from a powershell commandline. Add the below lines to the end of the file and save. You can choose an [existing theme](https://github.com/JanDeDobbeleer/oh-my-posh?WT.mc_id=-blog-scottha#themes)  or [even make a custom one](https://github.com/JanDeDobbeleer/oh-my-posh?WT.mc_id=-blog-scottha#creating-your-own-theme). I use the *Paradox* theme currently.

``` powershell
Import-Module posh-git
Import-Module oh-my-posh
Set-Theme Paradox
```

You can further customize this as you want. Here is a [great example](https://bradwilson.io/blog/prompt/powershell#windowsterminal) to start with. I might start playing around with this and modify a few things. 

Once all set up if you see squares and weird looking characters once you restart the propmpt, it is very likely that you need some updated fonts. Head over to [Nerd Fonts](https://www.nerdfonts.com/) where you have a lot of options. These fonts are what gives all those cool looking features on the prompt. To make windows terminal use the font you need to update the settings. This can be done by clicking the button with a down arrow right next to the tabs on the top bar of the terminal or pressing *Ctrl + ,*. This opens the profiles.json setting file where you can update the font face per profile. 

``` json
"fontFace": "UbuntuMono NF",
```

### Aliases

I use the command line mostly for interacing with git repositories and like having shorter commands for the commonly used command like *git status*, *git commit* etc. My previous command line tool [Cmder](https://www.rahulpnath.com/blog/cmder-portable-console-emulator-for-windows/) had a feature to set alias. Similarly in powershell we can create a function to wrap the git command and then use the [New-Alias](https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.utility/new-alias?view=powershell-6) cmdlet to create an alias for it. You can find a [good list to start with](https://stackoverflow.com/a/23201953/1948745) here and modify them as you need. I have the list of alias in a separate file and load it in the Profile as below. Having it in Dropbox allows to sync it across to multiple devices and have the same alias everywhere.

``` powershell
. C:\Users\rahul\Dropbox\Git-Alias.ps1
```



