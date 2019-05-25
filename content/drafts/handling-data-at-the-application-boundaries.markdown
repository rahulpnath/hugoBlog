---
layout: post
title: "Handling Data at the Application Boundaries"
comments: false
categories: 
drafts: true
description: 
---

Recently while working on building a web api (for one of my side projects), I have been thinking about how the data should be exposed at the ApiController endpoints. The options that were weighing in was either to have explicit Data Transfer Objects (DTO) or to expose the domain models itself. Searching a bit on to see what the usual conventions and practices are around this I ended up on this stackoverflow thread, which details the same thoughts that had been juggling around in my mind (as below).

For a number of reasons, I don't want to use these domain models as my presentation models in my MVC application. At first I was just creating very similar DTOs for the models to use as presentation models. Something like this: ``` csharp public class LocationViewModel { public int ID { get; set; } public string Name { get; set; } public string Description { get; set; } public string Address { get; set; } public decimal Latitude { get; set; } public decimal Longitude { get; set; } } ``` However, that doesn't make sense for every view situation. A Create action, for example, shouldn't have an ID property. A Delete action doesn't need all of that information. And so on. So now I'm ending up with presentation models that are one-to-one with the presentations themselves.
This kind of conflicts are not just when building web api's, but occurs for any application at application boundaries or rather application concerns (view layer -> domain layer or domain layer -> persistence layer). Deciding on whether to just expose the domain model or scenario based DTO's can be quite tricky. DTO's comes with an additional cost of translating the domain model to the DTO and also vice versa and can get messy at times. Below are some of the advantages in going with explicit DTO objects for each of the interaction scenarios (some of them relevant with Asp net Web Api).

Single Responsibility Principle

Any of the view, api endpoints can change for its own reason, having a separate DTO to capture the data transferred would help adhere to Single Responsibility Principle (SRP). This would mean that even if you want to pass some extra data in or represent extra details while returning data, it can change independent of the other parts of the application.

Being Generous at the boundaries (Postels law)

Reusing the existing validation frameworks

ASP Net Web Api supports attribute based validations from DataAnnotations namespace. If you do not prefer to pollute the domain entity with all the validation logic, then you can have the attributes specified on the DTO and have the validation applied at the boundary itself. This would also ensure that an invalid instance of domain entity cannot be created, as that is always created after the validation. Going with explicit DTO's for each endpoint might also be required as the validations differ for them e.g. A Create action, for example, shouldn't have an ID property So to use the DataAnnotations we need to have different DTO classes per endppont.

-DTO or Domain object
http://martinfowler.com/bliki/LocalDTO.html
http://blog.ploeh.dk/2011/05/31/AttheBoundaries,ApplicationsareNotObject-Oriented/
