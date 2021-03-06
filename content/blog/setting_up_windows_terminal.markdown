---
title: "Setting Up The Windows Terminal"
date: 2019-12-06
comments: true
categories:
- Tools
cover: /images/windows_terminal.jpg
---

For a long time, I have been using the [Cmder](https://www.rahulpnath.com/blog/cmder-portable-console-emulator-for-windows/) as my command line. It was mostly for the ability to copy-paste, open multiple tabs, and the ability to add aliases (shortcut command). I was never particularly interested in other customizations of the command line. However, one of these [recent tweets](https://twitter.com/bradwilson/status/1199826823628017664) made me explore the new Windows Terminal.

> [Windows Terminal](https://github.com/microsoft/terminal) is a new, modern, feature-rich, productive terminal application for command-line users. It includes many of the features most frequently requested by the Windows command-line community, including support for tabs, rich text, globalization, configurability, theming & styling, and more.

You can install using the [command line](https://github.com/microsoft/terminal#installing-and-running-windows-terminal) itself or get it from the [Windows Store](https://www.microsoft.com/en-us/p/windows-terminal-preview/9n0dx20hk701#activetab=pivot:overviewtab). I prefer the Windows Store version as it gets automatically updated.

### Toggling

Pressing  <img style="display: inline-block;" src="/images/windows-10.png" alt="WIN Key"> (WIndows Key) + # (the position of the app on the taskbar) works as [toggle](https://www.itprotoday.com/access-taskbar-keyboard-shortcuts). If the app is open and selected, it will minimize, if not, it will bring to the front and selects it. If the app is not running, it will start the app.

![](/images/windows_terminal_toggle.jpg)

In my case, *Windows Key + 1* launches Terminal, *Windows Key + 2* launches Chrome, *Windows Key + 3* launches Visual Studio and so on.

### Theming

To theme the terminal, you need to [install two PowerShell modules](https://github.com/JanDeDobbeleer/oh-my-posh?WT.mc_id=-blog-scottha#installation).

``` powershell
Install-Module posh-git -Scope CurrentUser
Install-Module oh-my-posh -Scope CurrentUser
```

To load these modules by default on launching PowerShell, update the PowerShell [profile](https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_profiles?view=powershell-6#the-profile-variable). For this run 'notepad $PROFILE' from a PowerShell command line. Add the below lines to the end of the file and save. You can choose an [existing theme](https://github.com/JanDeDobbeleer/oh-my-posh?WT.mc_id=-blog-scottha#themes)  or [even make a custom one](https://github.com/JanDeDobbeleer/oh-my-posh?WT.mc_id=-blog-scottha#creating-your-own-theme). You can further customize this as you want. Here is a [great example](https://bradwilson.io/blog/prompt/powershell#windowsterminal) to get started. I use the *Paradox* theme currently.

``` powershell
Import-Module posh-git
Import-Module oh-my-posh
Set-Theme Paradox
```
Restart the prompt, and if you see squares or weird-looking characters, you likely need some updated fonts. Head over to [Nerd Fonts](https://www.nerdfonts.com/), where you can browse for them. 

>*Nerd Fonts patches developer targeted fonts with a high number of glyphs (icons). and gives all those cool icons in the prompt*.

To make windows Terminal use the new font, update the settings. Click the button with a down arrow right next to the tabs or use *Ctrl + ,* shortcut. It opens the profiles.json setting file where you can update the font face per profile. 

``` json
"fontFace": "UbuntuMono NF",
```

### Aliasing

I use the command line mostly for interacting with git repositories and like having shorter commands for commonly used commands, like *git status*, *git commit*, etc. My previous command-line, [Cmder](https://www.rahulpnath.com/blog/cmder-portable-console-emulator-for-windows/), had a feature to set alias. Similarly, in PowerShell, we can create a function to wrap the git command and then use the [New-Alias](https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.utility/new-alias?view=powershell-6) cmdlet to create an alias. You can find a [good list to start with](https://stackoverflow.com/a/23201953/1948745) here and modify them as you need. I have the list of alias in a separate file and load it in the Profile as below. Having it in Dropbox allows me to sync it across to multiple devices and have the same alias everywhere.

Use the [Dot sourcing operator](https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_operators?view=powershell-6#dot-sourcing-operator-) to run the script in the current scope and make everything in the specified file added to the current scope.

``` powershell
. C:\Users\rahul\Dropbox\poweshell_alias.ps1
```

The alias does override any existing alias with the same name, so make sure that you use aliases that don't conflict with anything that you already use. Here is the [powershell_alias file](https://gist.github.com/rahulpnath/8a6413dadf8759ffbc9778d018ab2039) that I use.

I no longer use Cmder and enjoy using the new Terminal. I have just scratched the surface of the terminal here, and there are heaps more that you can format, customize, add other shells, etc. 

Enjoy the new Terminal!

**References:**   

- [What's the difference between a console, a terminal, and a shell?](https://www.hanselman.com/blog/WhatsTheDifferenceBetweenAConsoleATerminalAndAShell.aspx)
- [How to make a pretty prompt](https://www.hanselman.com/blog/HowToMakeAPrettyPromptInWindowsTerminalWithPowerlineNerdFontsCascadiaCodeWSLAndOhmyposh.aspx)
- [Anatomy of a Prompt (PowerShell)](https://bradwilson.io/blog/prompt/powershell#windowsterminal)