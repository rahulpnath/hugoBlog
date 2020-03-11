---
title: "Constructor and constraints"
drafts: true
comments: false
categories:
  - Testing
---

In C# or any class-based object oriented language a Constructor is used to create an object. The constructor is responsible for initializing the object's data members and establishing the class invariants. A constructor fails and throws an exception when the class invariants are not met. An invariant is an assertion that is always held true.

### Simple Invariants

For e.g If a constructor takes in a string and checks it to be not null before assigning it to it's property, the invariant is that the string _Value_ can never be null.

```csharp
public class Name
{
	public string Value { get; set; }

	public Name(string name)
	{
		Value = name ?? throw new ArgumentNullException(nameof(name));
	}
}
```

However in the above case one can easily break the invariant on an instance by setting the _Value_ property to null after creating the object.

```csharp
var name = new Name("Rahul");
name.Value = null;
```

To prevent this from happening the set on the Value property can be made to private. This will prevent anyone setting the property directly on the object.

```csharp
public class Name
{
  public string Value { get; private set; }
  ...
}
```

The Value property cannot be set again on the object. However there is nothing stopping us to add a new method on Name class that does this.

```csharp
public class Name
{
  ...
  public void PrintName()
	{
		Console.WriteLine(Value);
		Value = null;
	}
}
```

To enforce the invariant we can either make sure that we never do something like above inside of a class or mark the property as readonly. By marking it readonly we ensure that it is set only inside the constructor and no where else within the class.

```csharp
public class Name
{
  public readonly string Value;
  ...
}
```

By marking it as readonly we enforce that _Value_ can no longer be set to Null even within the class. The only place you can set the property is the constructor. This makes Name an immutable - _one whose value cannot be changed after it is created_.

### Not-So Simple Invariants

The NotNull constrint is something we see very often and something most of us are used to adding in by default any time we write a new class. However those are not the only constraints that you can write. For e.g let's take a DateRange class

```csharp
public class DateRange
{
	public readonly DateTime StartDate;
	public readonly DateTime EndDate;

	public DateRange(DateTime startDate, DateTime endDate)
	{
		// Ignoring null checks
		if (endDate < startDate)
			throw new ArgumentException("End Date cannot be less than Start Date");

		this.StartDate = startDate;
		this.EndDate = endDate;
	}
}
```

In addition to StartDate and EndDate not being null, we have an additional invariant here that the end date cannot be less than the start date. This ensures that the date range is valid. If you want to adjust the range to a new one you need to create a new DateRange instance.

### Business Invariants

Taking this to the next level let's see how we can factor in some business level invariants into our code. Lets say we have a Quote class

```csharp
public class Quote
{
	public int Id { get; set; }
	public QuoteStatus Status { get; set; }
	public Customer Customer { get; set; }
	public MobilePhone Phone { get; set; }
	public List<Accessories> Accessories { get; set; }
}

public enum QuoteStatus
{
	Draft,
	Open,
	Accepted
}

```

One of the most common things that I come across in code these days is class Constructors that just sets values that are passed to it and not checking

> In class-based object-oriented programming, a [constructor](<https://en.wikipedia.org/wiki/Constructor_(object-oriented_programming)>) is a special type of subroutine called to create an object. They have the task of initializing the object's data members and of establishing the invariant of the class, failing if the invariant is invalid.

### Is EF reflection magic only way to create object

### Constructor constraints

Make illegal states irrepresentable
This is very
