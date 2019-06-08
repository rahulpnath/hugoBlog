---
title: "Azure DevOps: Setting Up Build and Deploy Pipeline For an Auto Updating Electron App"
drafts: true
comments: false
---

In this post we will see how to set up a build and deploy pipeline for an Electron application. [Electron](https://electronjs.org/) in a framework for creating cross platform native applications using Javascript, HTML and CSS. Electron enables to use existing web development skills to develop cross platform desktop applications. If you are new to it check out my [Setting up an Electron Application using create-react-app Template](http://localhost:1313/blog/electron-and-react/) to get started.

### Packaging Electron Applications

When it comes to packaging the electron app as a distributable, there are [couple of options](https://electronjs.org/docs/tutorial/application-distribution). In this example I have use [electron-builder](https://www.electron.build/). 

``` json
"scripts": {
    "react-start": "react-scripts start",
    "electron-start": "set DEV_URL=http://localhost:3000 && electron .",
    "start": "concurrently \"yarn run react-start\" \"wait-on http://localhost:3000/ && yarn run electron-start\"",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "pack": "electron-builder --dir",
    "predist": "yarn build",
    "dist": "electron-builder",
    "postinstall": "electron-builder install-app-deps"
  }
```

### Azure DevOps Pipeline

![](/images/electron_azure_devops.jpg)


### Auto Update