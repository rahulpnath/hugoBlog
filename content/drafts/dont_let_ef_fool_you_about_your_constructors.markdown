---
title: "Don't let Entity Framework Fool You About Your Constructors!"
drafts: true
comments: false
categories:
  - Programming
  - Basics
---

In the previous post, [Back To Basics: Constructors and Enforcing Invariants](/blog/constructor_and_constraints/), we saw the importance of having well defined constructors and how they help us to maintain invariants. Most of the projects I work on use Entity Framework Core for the database interactions. EF Core does [allow to have private properties](https://docs.microsoft.com/en-us/ef/core/modeling/constructors#read-only-properties) and still have them populated when retrieving data. This is possible because of the magic of [reflection](https://docs.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/reflection) and setting properties on the objects even though they only have private setters.

With the support of [Fluent API Configuration](https://www.learnentityframeworkcore.com/configuration/fluent-api) we can have our Domain Models agnostic of all the database dependencies and mappings. We can setup the ORM mappings using these fluent configuration and separate to our Model definitions. The fluent configurations "act as a DTO class without needing to explicitly define one" and do the mapping between the Domain and ORM models.

Let us take an example below

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

Readonly properties - https://docs.microsoft.com/en-us/ef/core/modeling/constructors#read-only-properties
