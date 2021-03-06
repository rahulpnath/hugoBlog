---
author: rahulpnath
comments: true
date: 2010-11-17 05:40:57+00:00
layout: post
slug: wp7-application-model
title: WP7 Application Model
wordpress_id: 314
categories:
- WP7
---

Mobile phones should be always responsive,highly responsive infact.If it's not responding within 10 to 15 seconds,the users hits the switch off button or removes the battery to reset the phone....I have done this many a times.

The WP7 application model allows only 1 application to be running at a time.But its not that bad that you have to always start from the beginning of an app if you switch away from it.Whenever you switch away from an app,it just goes into a hibernation mode,tombstoning to be more precise.Whenever a user switches between applications,the phone activates and deactivates the applications.Events are raised to notify this activating and deactivating so that the developers can handle them and maintain the state of the application between switches,as if it was just back there running.A user may also explicitly close down an application by pressing the back button on the device at the first page of the application.

On start of a new instance of an application,which happens whenever an application is opened other than by switching to it using the back button,a launching event is raised after which the application moves on into the running state.It's advised not to perform any time consuming activities in the Launching event handler,as any latency of more than 10 seconds causes the application to be bought down by the phone.So any IsolatedStorage access is recommended to be done after the application is up and running,making the app more responsive,which is our primary goal.On normal close the application raises a Closing event,where you might be saving persistent data to the IsolatedStorage.Data relating to a particular instance of application need not be saved here as the only way now to start the application is coming right from the beginning,raising the Launching even all over again.Again saving to the IsolatedStorage can be a little tricky.If it takes more than 10 seconds,the application will be terminated forcefully.The key here is that any data to be persisted should be done as and when you have the data and in a asynchronous manner.The earlier this happens the better it is for your application.Otherwise you may run into forceful termination of your application and loosing data and thereby decreasing you application's reliability and use.

Tombstoning opens up a whole new path for the application lifecylcle,introducing additional two events,Activated and Deactivated.The State Dictionary maintained by the [PhoneApplicationService](http://msdn.microsoft.com/en-us/library/microsoft.phone.shell.phoneapplicationservice(v=VS.92\).aspx)(which also provides all the above mentioned events) is kept as is between application switches.That is whatever is saved in that before deactivating the app will be available after the application is activated.This is how maintaining application state is achieved between application switches.On start of a new application instance the State Dictionary would be empty.Data that is required for just a particular application instance goes into the State Dictionary and the data that is required for all application instances gets saved into the IsolatedStorage.Applications may get tombstoned due to many reasons.It maybe due to user hitting the start button when in an application,launching choosers or launchers(in some cases of doesn't get tombstoned,but its always better to handle for this),due to phone going into idle state(which again can be handled).

The below diagram,as from msdn, gives the complete picture of the application model.

![wp7 application model](/images/wp7_application_model.png)





Getting a good idea of the application model is important to build highly responsive,reliable application for the Windows Phone 7.




**_References:_**




[Execution Model For Windows Phone](http://msdn.microsoft.com/en-us/library/ff769557(v=VS.92\).aspx)
