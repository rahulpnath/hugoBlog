---
title: "Simulating Different Scenarios Using Fake JSON Server API"
drafts: true
comments: false
categories:
  - Testing
  - TypeScript
---

Lets looks at how we can simulate different scenarios when building applications.

For eg. let's take an example of a simple list page of items. There are atleast 3 different states that the page can be - when there are no items in the list, with items in the list and when the request to the server errors out. Bet you there might be more relevant scenarions than that for your applications. But we have got atleast 3 to start with.

When you are building the UI how to do you develop for these different sceanrios? How many times have you had to force the API to return an empty list or throw an error. How do you demo this to some one else?

It will be good if we can simulate different application scenarios using a FAKE JSON Server API. This will allow us to simulate any use case or scenario that we want allowing us to write code to handle such cases to start with. Not to mention that demoing this becomes easier and also writing automated tests for them. In this post, we will look at how to set up JSON Server API to return data based on scenarios we specify to it.

This is more of an approach on how to do this than a one stop solution for all applications. You will need to adapt for your application and the scenarios you have

If you are new to JSON check out this blog post (TDK) on how to set up a Fake JSON Server.

For this post I am using an application that builds Quotes for a Mobile Phone retailer. They sell phones and accessories and generate quotes for their customers. The application allows to add, edit, delete quotes and displays a list of quotes on load.

### Specifying Scenarios to JSON Server

For starters we need to specify which scenario we are interested in when calling the API. A scenario can be tied to one API endpoint or multiple. On an API endpoint the best place to pass extra data are request headers as it is least intrusive. We need to pass the scenarios only in our development and test environment and not in production. It does not hurt to add an extra header to every HTTP request. Whenever we need to request for a particular scenario to the FAKE API we pass it as part of the 'scenarios' header.

In JSON Server we can retrieve the Request header in the render method (where will be slicing and dicing the data to match the scenarios requested). We used the router.render method, while setting up JSON SErver API to format the data into the summary format. This happens to the end of the request pipeline, is the best place to filter/modify data based on the scenarios we recieve.

```typescript
router.render = (req, res) => {
const scenariosHeaderString = req.headers["scenarios"];
```

### Organizing Scenarios and Mock Data in JSON Server

For the mock data, let's add an extra attribute to indicate the scenarios they are applicable to. For. eg. In _quotes.ts_ where we had the mock quotes served by JSON Server lets add in the scenarios that each quote is associated with.

```typescript
const quotes: (QuoteDto & Scenarios<QuoteScenario>)[] = [
  {
    scenarios: ["draft", "no-phone"],
    statusCode: QuoteStatusCode.Draft,
    customer: { ... },
    mobilePhone: null,
    ...
  },
  {
    scenarios: ["draft", "phone"],
    statusCode: QuoteStatusCode.Draft,
    customer: { ... },
    mobilePhone: { ... }
    ...
  },
  {
    scenarios: ["open", "phone"],
    statusCode: QuoteStatusCode.Open,
    customer: { ... }
    mobilePhone: { ... }
    ...
  },
];
```

The quote type is now an [Intersection Type](https://www.typescriptlang.org/docs/handbook/advanced-types.html#intersection-types), that combines multiple types into one. Since the data has an extra attribute, 'scenarios' in our case. Based on your endpoint and the kind of sceanrios you are interested, the actual values or the Scenarios will differ. In this case I am interested to get data for a few different scenarios - no quotes exists, quotes that are all in draft but does not have a phone, only quotes that have a phone attached, quotes without phone etc. For this hypothetical application the UI behaves differently for these cases and hence I am interested in those scenarios. Feel free to have whatever scenarios you want. We can conbine multiple of these scenarios, so it will be possible to get quotes that are 'draft open', which will return us quotes that are d

```typescript
export type QuoteScenario =
  | "phone"
  | "no-phone"
  | "draft"
  | "open"
  | "no-quotes";

export type UserScenario = "no-user" | "admin" | "salesrep";

export interface Scenarios<T> {
  scenarios: T[];
}
```

Based on the scenarios that are applicable to your applicable you will need to add different string's here, that will identify the kind of data you need.

### Handling Scenarios and Modifying Response

### Testing API
