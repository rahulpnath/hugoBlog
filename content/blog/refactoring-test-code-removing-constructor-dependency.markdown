---
layout: post
title: "Refactoring Test Code: Removing Constructor Dependency"
comments: true
categories: 
- Testing
- TDD
- Refactoring
tags: 
date: 2016-03-31 04:18:03 
keywords: 
description: 
---
<a href="https://www.flickr.com/photos/toomore/23066277453" class="center" title="Image By Toomore Chiang, from https://www.flickr.com/photos/toomore/23066277453"><img src="/images\testing.jpg" class="center" alt="Testing"></a>

In the earlier post, [Removing Unnecessary Dependencies](http://rahulpnath.com/blog/refactoring-to-improve-testability-removing-unnecessary-dependencies/), we saw how having an unnecessary dependency hinders testability. In this post we will see how the test code changed by the refactoring we did for removing the unnecessary dependency and explore ways to control these changes.

### Impact on Tests by the Refactoring ###

The refactoring in the last post involved a change in the updating the constructor signature to take in a string value instead of an interface. This broke a lot of our tests and forced us to change all constructor usages with the below code. 

``` csharp
var anonymousName = "Anonymous Name";
myService = new MyService(otherDependency, anonymousName);
```
When seen in isolation, this is not much a change, but as the number of tests grows it becomes a pain. This definitely does not feel right. Breaking tests forces us out of [Test-First Development](http://xunitpatterns.com/test%20first%20development.html) and reduces the confidence in the tests and in the code. 
 
> *The idea behind TDD was [Red-Green-Refactor](http://www.jamesshore.com/Blog/Red-Green-Refactor.html). But if tests break when Refactoring, then why follow TDD at all?*


### Refactoring Tests ###

Ideally, we should write tests that do not break when we refactor, so that it helps us to use the same tests over the refactored code. Let's see how we can improve the test code to prevent tests from breaking, when we refactor to [remove unnecessary dependency](http://rahulpnath.com/blog/refactoring-to-improve-testability-removing-unnecessary-dependencies/). Below is the original code (*rewritten into xUnit and Moq, as I prefer that*) with the dependency on IAppSettings (which we will change it to string later)

``` csharp
[Fact]
public void PerformOperationsShouldReturnTrue()
{
    var otherDependency = new Mock<IMyOtherDependency>();
    var appSettings = new Mock<IAppSettings>();
    appSettings.Setup(a => a["app.name"]).Returns("My Test Application");
    var myService = new MyService(otherDependency, appSettings);

    var result = myService.PerformOperations();

    otherDependency.Verify(a => a.UtilityMethod(), Times.Once());
    Assert.True(result);
}
```

Let's analyze the test code for the dependencies that it has:

 - *UtilityMethod* of IMyOtherDependency
 - *app.name* configuration value from IAppSettings
 - *Constructor* of [System Under Test](http://xunitpatterns.com/SUT.html)(SUT) - MyService
 - *PerformOperations* of SUT which is getting tested
 
The test by itself verifies that calling *PerformOperations* returns true and UtilityMethod gets called once. It is not dependent on the value ('My Test Application') returned by appSettings. The only need is that it should return some (dummy) value when asked for 'app.name'. Assuming that there are multiple tests in this class that does the same setup of IAppSettings to return a dummy value you can start smelling *Cut-and-Paste code reuse for fixture setup*.

> *Rule of Three: “The first time you do something, you just do it. Second time you do something similar, you wince at the duplication, but you do the duplicate thing anyway. The third time you do something similar, you refactor.”*

The [Rule of Three](https://en.wikipedia.org/wiki/Rule_of_three_(computer_programming) is applicable even when writing test code and we should always keep an eye for duplication. **It is easy to get lost in the thought that it's just test code and does not hurt to copy paste**. Code duplication in test code does hurt and it hurts the most when you refactor production code. 

So lets Refactor applying the [various techniques](http://www.refactoring.com/catalog/) that we know of!

#### **[Extract Method](http://www.refactoring.com/catalog/extractMethod.html)** ####
*You have a code fragment that can be grouped together. Turn the fragment into a method whose name explains the purpose of the method.*

Since we only depend on the *IMyOtherDependency* and the SUT instance instantiated with that, we can extract SUT creation with a given instance of IMyOtherDependency as below.

``` csharp
[Fact]
public void PerformOperationsShouldReturnTrue()
{
    var otherDependency = new Mock<IMyOtherDependency>();
    var myService = GetMyServiceWithMyOtherDependency(otherDependency);

    var result = myService.PerformOperations();

    otherDependency.Verify(a => a.UtilityMethod(), Times.Once());
    Assert.True(result);
}

private MyService GetMyServiceWithMyOtherDependency(Mock<IMyOtherDependency> otherDependency)
{
    var appSettings = new Mock<IAppSettings>();
    appSettings.Setup(a => a["app.name"]).Returns("My Test Application");
    var myService = new MyService(otherDependency, appSettings);
    return myService;
}
```
This starts taking us towards **[Object Mother Pattern](http://martinfowler.com/bliki/ObjectMother.html)**. It looks good to start with and might work well if all we have is the same [fixture setup](http://xunitpatterns.com/Fixture%20Setup%20Patterns.html). But if we have a different kind of fixture setup, with more dependency and combinations of setup, we will soon have a lot of similar creational methods with different combinations of parameters  - *GetMyServiceWithMyOtherDependencyAndAppSettings,GetMyServiceWithAppSettings* etc. The problem with having different methods is that all of them are dependent on the SUT constructor and set the same properties, leading to code duplication again. 

#### **[Extract Class](http://www.refactoring.com/catalog/extractClass.html)** ####
*You have one class doing work that should be done by two. Create a new class and move the relevant fields and methods from the old class into the new class.*

With these new creational methods the test class is having more responsibility than it should actually have, so let's extract these creation methods into *MyServiceBuilder* class to see if we can further solve the problem.

``` csharp
public class MyServiceBuilder
{
    public IAppSettings AppSettings { get; private set; }
    public IMyOtherDependency OtherDependency { get; private set; }

    public MyServiceBuilder()
    {
        var appsettingsMock = new Mock<IAppSettings>();
        appsettingsMock.Setup(a => a["app.name"]).Returns("My Test Application");
        AppSettings = appsettingsMock.Object;
        OtherDependency = new Mock<IMyOtherDependency>().Object;
    }

    public MyService Build()
    {
        return new MyService(OtherDependency, AppSettings);
    }

    public MyServiceBuilder WithAppSettings(IAppSettings appSettings)
    {
        AppSettings = appSettings;
        return this;
    }

    public MyServiceBuilder WithOtherDependency(IMyOtherDependency otherDependency)
    {
        OtherDependency = otherDependency;
        return this;
    }
}
```
This takes us to **[Test Data Builder Pattern](http://www.natpryce.com/articles/000714.html)** and as we notice we have reduced the dependency on the MyService constructor to just one and only place where we need to change if the constructor signature changes. Since the [Cyclomatic Complexity](https://en.wikipedia.org/wiki/Cyclomatic_complexity) of *MyServiceBuilder* is one it is fine not to write tests for it   . Using the new builder class our original test case now looks like below.

``` csharp
[Fact]
public void PerformOperationsShouldReturnTrue()
{
    var otherDependency = new Mock<IMyOtherDependency>();
    var myService = new MyServiceBuilder().WithOtherDependency(otherDependency.Object).Build();

    var result = myService.PerformOperations();

    otherDependency.Verify(a => a.UtilityMethod(), Times.Once());
    Assert.True(result);
}
```

Now the test is just dependent on the objects that it needs. If all the test use *MyServiceBuilder*, we can now easily refactor to [Remove the Unnecessary Dependency](http://rahulpnath.com/blog/refactoring-to-improve-testability-removing-unnecessary-dependencies/) on IAppSettings, by just changing the *MyServiceBuilder* to use a string property. We will also need to change tests that use the *WithAppSettings* method which is expected, as those tests are dependent on the app settings value in the first place and so the tests definitely need to be re-written.

### Generic Test Data Builder ###
We could have essentially stopped at the above step, but then we realize that it is too much work to create a Test Data Builder class for each of the production code classes that we have. It takes a lot out of the [finite number of keystrokes left in your hands](http://keysleft.com/) and you definitely don't want to waste that in typing redundant code. This is where we can use
[AutoFixture](https://github.com/AutoFixture/AutoFixture), that is an open source library for .NET that helps reduce the [Setup](http://xunitpatterns.com/Four%20Phase%20Test.html)/[Arrange](http://c2.com/cgi/wiki?ArrangeActAssert) phase. Using [AutoData Theories with AutoFixture](http://blog.ploeh.dk/2010/10/08/AutoDataTheorieswithAutoFixture/) our test case now looks like below.

``` csharp
[Theory, AutoMoqData]
public void PerformOperationsShouldReturnTrue(
    [Frozen]Mock<IMyOtherDependency> otherDependency,
    MyService myService)
{
    var result = myService.PerformOperations();

    otherDependency.Verify(a => a.UtilityMethod(), Times.Once());
    Assert.True(result);
}
```

The test code does not have any dependency on the constructor of the SUT and a change in constructor signature does not affect our tests at all. We can refactor *MyService* and use the same tests as long as the functionality served by the class remains the same. Constructors are implementation details and it's better to keep tests independent of it. This keeps our test code clean and more robust!