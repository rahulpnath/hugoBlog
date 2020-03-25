---
title: "Don't Let Entity Framework Fool Your Constructors!"
drafts: true
comments: false
categories:
  - Programming
  - Basics
description: Any state that an object can be in must be reproducible through the constructor of the object
---

In the previous post, [Back To Basics: Constructors and Enforcing Invariants](/blog/constructor_and_constraints/), we saw the importance of having well defined constructors and how they help us to maintain invariants. Most of the projects I work on use Entity Framework Core for the database interactions.

With the support of [Fluent API Configuration](https://www.learnentityframeworkcore.com/configuration/fluent-api) we can have our Domain Models agnostic of all the database dependencies and mappings. We can setup the ORM mappings using these fluent configuration and separate to our Model definitions. The fluent configurations "act as a DTO class without needing to explicitly define one" and do the mapping between the Domain and ORM models.

Let us look into a Quote class below for example. It has the following [invariants enforced by the constructor](/blog/constructor_and_constraints/).

- A quote cannot be created without associating a Customer
- A newly created quote always starts in Draft Status

```csharp
public class Quote
{
    public Guid Id { get; private set; }
    public QuoteStatus Status { get; private set; }
    public Customer Customer { get;}
    public MobilePhone Phone { get; private set; }
    private readonly List<Accessorry> _accessories = new List<Accessorry>();
    public IReadOnlyCollection<Accessorry> Accessories => _accessories;

    private Quote() { }

    public Quote(Guid id, Customer customer)
    {
        Id = id;
        Customer = customer ?? throw new ArgumentNullException(nameof(customer));
        Phone = MobilePhone.Empty;
        Status = QuoteStatus.Draft;
    }

    public void UpdatePhone(MobilePhone phone)
    {
        Phone = phone ?? throw new ArgumentNullException(nameof(phone));
    }

    public void OpenQuote()
    {
        if (Phone == MobilePhone.Empty)
            throw new DomainException("Cannot set quote to open with empty phone");

        Status = QuoteStatus.Open;
    }
    ...
}
```

Once you have a Quote, you can go an and add a phone that the customer is interested in and then open the quote. Many more actions can be performed on the Quote, but you get the idea. The Quote class is like an 'Aggregate Root' that enforces the constraints on it's properties through the methods and constructor's it exposes. You can see that a Quote cannot be put to Open state without having a Phone associated.

Below is a sample usage of this class to create and open a quote within a console application. I create a new context to mimic that in a Web application, where each of that using statement would be a different controller endpoint. All of it works as expected and allows us to create, add a phone and open a Quote for a customer.

```csharp
var quoteId = Guid.NewGuid();
using (var context = new QuoteContext(optionsBuilder.Options))
{ // Create a New Draft Quote
    var customer = new Customer("Rahul", "rahul@rahul.com", "123 Fake Address");
    var quote = new Quote(quoteId, customer);
    context.Quotes.Add(quote);
    context.SaveChanges();
}

using (var context = new QuoteContext(optionsBuilder.Options))
{ // Add Phone to the Quote
    var quote = context.Quotes.First(a => a.Id == quoteId);
    var phone = new MobilePhone("IPhone", "X", 1000.00m);
    quote.UpdatePhone(phone);
    context.SaveChanges();
}
```

### EF Core and it's Reflection Magic

Let's not open the quote and save it back. Since the Quote has a phone attached already, the below works fine.

```csharp
using (var context = new QuoteContext(optionsBuilder.Options))
{ // Open quote
    var quote = context.Quotes.First(a => a.Id == quoteId);
    quote.OpenQuote();
    context.SaveChanges();
}
```

> **We do not have a constructor to create Quote along with a Phone and with status Open.**

How is EF loading the data?

EF Core does [allow to have private properties](https://docs.microsoft.com/en-us/ef/core/modeling/constructors#read-only-properties) and still have them populated when retrieving data. This is possible because of the magic of [reflection](https://docs.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/reflection) and setting properties on the objects even though they only have private setters.
However, we don't notice this if we don't start writing tests or have other use cases in our code to start creating a Quote in different states.

No offence to the magic, don't get me wrong here. I like it and use it a lot and makes it easier writing code to retrieve data from the database. However, let's not allow the magic to drive our Constructors and the class definitions. Let's write a test to make this more evident.

### EF Magic Makes Tests Fragile

Below is a test to verify that calling _OpenQuote_, sets the quote to Open Status. However note that we have to call the _UpdatePhone_ method to update the Quote object before calling _OpenQuote_.

```csharp
[Fact]
public void OpenQuoteSetsStatusToOpen()
{
    var customer = new Customer(
        "Rahul", "rahul@rahul.com", "123 Fake Address");
    var quote = new Quote(Guid.NewGuid(), customer);
    var phone = new MobilePhone("IPhone", "X", 1000.00m);
    quote.UpdatePhone(phone);

    quote.OpenQuote();

    Assert.Equal(QuoteStatus.Open, quote.Status);
}
```

This seems to be a trivial problem in isolation. However, any time we need a Quote object which has anything more than an id and a customer, we need to call these methods. In order to write tests, we need to invoke a series of methods to put it into the correct state. This makes the tests fragile.

To fix this we need to add more constructors to Quote class that allows us to create Quote in the desired state. The constructor that we had before now calls on to the new one with the same parameters. We also have an added constraint check in the constructor to ensure that a Quote in a status other than Draft needs to have a phone associated.

> Any state that an object can be in must be reproducible through the constructor of the object.

```csharp
public Quote(Guid id, Customer customer)
    : this(id, customer, MobilePhone.Empty, QuoteStatus.Draft) { }

public Quote(Guid id, Customer customer, MobilePhone phone, QuoteStatus status)
{
    Id = id;
    Customer = customer ?? throw new ArgumentNullException(nameof(customer));
    Phone = phone ?? throw new ArgumentNullException(nameof(phone));

    if (status != QuoteStatus.Draft && phone == MobilePhone.Empty)
        throw new DomainException($"Cannot set quote to {status} with empty phone");

    Status = status;
}
```

We can now rewrite the test to use the new constructor. We don't need to call the _UpdatePhone_ method here to get the quote in the correct state.

```csharp
[Fact]
public void OpenQuoteSetsStatusToOpen()
{
    var customer = new Customer(
        "Rahul", "rahul@rahul.com", "123 Fake Address");
    var phone = new MobilePhone("IPhone", "X", 1000.00m);
    var quote = new Quote(Guid.NewGuid(), customer, phone, QuoteStatus.Draft);

    quote.OpenQuote();

    Assert.Equal(QuoteStatus.Open, quote.Status);
}
```

The constructor will have to be modified when you start adding accessories to the Quote. But I leave that to you. Constructors are the gateway to creating objects. Make sure those are not tied to other frameworks that you use in the project. Make all states are representable through the constructor and not by invoking functions in a order.

Does your constructor allow representing all states?
