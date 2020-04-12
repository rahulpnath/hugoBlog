---
title: "Simulating Different Scenarios Using Fake JSON Server API"
drafts: true
comments: false
date: 2020-04-21
categories:
  - Testing
  - TypeScript
  - Cypress
---

Lets looks at how we can simulate different scenarios when building applications.

For eg. let's take an example of a simple list page of items. There are atleast 3 different states that the page can be - when there are no items in the list, with items in the list and when the request to the server errors out. Bet you there might be more relevant scenarions than that for your applications. But we have got atleast 3 to start with.

_When you are building the UI how to do you develop for these different sceanrios? _

_How many times have you had to force the API to return an empty list or throw an error?_

_How do you demo this to some one else?_

It will be good if we can simulate different application scenarios using a [FAKE JSON Server API](/blog/setting_up_a_fake_rest_api_using_json_server/). This will allow us to simulate any use case or scenario that we want, allowing us to write code to handle such cases to start with. Not to mention that demoing this becomes easier and so will be writing automated tests.

In this post, we will look at how to set up JSON Server API to return data based on scenarios we specify to it. This is more of an approach on how to do this than a one stop solution for all applications. You will need to adapt for your application and the scenarios you have. Check out how to [Set up Up A Fake REST API Using JSON Server](/blog/setting_up_a_fake_rest_api_using_json_server/) if you are new to JSON Server.

For this post I am using an application that builds Quotes for a Mobile Phone retailer. They sell phones and accessories and generate quotes for their customers. The application allows to add, edit, delete quotes and displays a list of quotes on load. We will looks at the landing page where we load the list of quotes and see how to set up the different scenarios associated with that.

### Specifying Scenarios to JSON Server

To start with, we need to specify which scenario we are interested in when calling the API. A scenario can be tied to one API endpoint or multiple. On an API endpoint the best place to pass extra data are request headers as it is least intrusive. We need to pass the scenarios only in our development and test environment and not in production. It does not hurt to add an extra header to every HTTP request. Whenever we need to request for a particular scenario to the FAKE API we pass it as part of the 'scenarios' header.

We will modify the _router.render_ in JSON Server to return the data based on the scenarios specified in the request header. We used the _router.render_ method, while [setting up JSON Server API](/blog/setting_up_a_fake_rest_api_using_json_server/) to format the data into the summary format. Based on the values in the request header we can filter the data and update the response.

```typescript
router.render = (req, res) => {
  const scenariosHeaderString = req.headers["scenarios"];
  const scenariosFromHeader = scenariosHeaderString
    ? scenariosHeaderString.split(" ")
    : [];

  ...
}
```

Below are some sample values that the header can have for our quote list scenario

```shell
// Different options that the scenarios header can have

scenarios: "open" // Returns only Quotes in open status
scenarios: "draft phone" // Returns all quotes in draft and has phone associated
scenarios: "error-quotes" // Returns a server error getting the quotes
scenarios: "no-quotes" // Returns an empty list of quotes
sceanrios: "" // Returns all quotes from mock data
```

### Organizing Scenarios and Mock Data in JSON Server

For the mock data, let's add an extra attribute to indicate the scenarios they are applicable to that particular quote. For. eg. The mock quotes defined in _quotes.ts_ is updated as below with an extra _sceanrios_ array property that takes in a list of sceanrios that each quote is associated with. Based on the mock data and the sceanrio's that it is applicable to, it will have different values. We filter out the response data based on these attributes and return only the ones that has all the attributes specified in the request header.

For eg. when the sceanrio header is \*'draft phone' only the quotes that has both these set are returned. For the header 'no-quotes' since none of the quote has this sceanrio applied, no data will be returned back which is what we want for that sceanrio. When header is '' (empty), all quotes match to that and hence all are returned. (More on error sceanrios a little later)

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

The quote type is now an [Intersection Type](https://www.typescriptlang.org/docs/handbook/advanced-types.html#intersection-types)- (QuoteDto & Scenarios<QuoteScenario>)[] - that combines multiple types into one. This allows us to maintain type safety for the mock data, while also adding the extra scenario property. We also get type safety on the possible sceanrios to avoid any typos for sceanrios.

```typescript
export type QuoteScenario = "phone" | "no-phone" | "draft" | "open";
export type UserScenario = "no-user" | "admin" | "salesrep";

export interface Scenarios<T> {
  scenarios: T[];
}
```

Based on the [generic type T](https://www.typescriptlang.org/docs/handbook/generics.html), the scenarios property can have only the associated values. Based on your application and the scenarios applicable add different types and values to represent them.

### Handling Scenarios and Modifying Response

```typescript
router.render = (req, res) => {
    let data = res.locals.data;

    if (scenariosHeaderString && Array.isArray(data) && data.length > 0) {
      const scenariosApplicableToEndPoint = getScenariosApplicableToEndpoint(
        url,
        scenariosFromHeader
      );

      const filteredByScenario = data.filter((d) =>
        scenariosApplicableToEndPoint.every(
          (scenario) => d.scenarios && d.scenarios.includes(scenario)
        )
      );
      res.jsonp(filteredByScenario);
    } else res.jsonp(data);
  }
};
```

### Handling Error Scenarios

Error responses do not depend on the mock data and has a separate flow. A list of custom responses are defined in the '_customResponses.ts_' file. If the headers match any of the code for the custom response and the request is for any of the associated urls, then the 'response' porperty is returned for that request.

For e.g, If a request is made for the '/api/quotes/' endpoint with 'error-quotes' in the scenarios header, the reponse is overridden to match the associated reponse property from the json object below. If you want to fine tune the reponse based on the request verb (GET, PUT, POST etc) feel free to extend that here.

```typescript
const responses = [
  {
    urls: ["/api/quotes"],
    code: "error-quotes",
    httpStatus: 500,
    respone: {
      errorMessage: "Unable to get Quotes data. ",
    },
  },
  {
    urls: ["/api/users/me"],
    code: "error-user",
    httpStatus: 500,
    respone: {
      errorMessage: "Unable to get user data. ",
    },
  },
];
```

The router.render method now handles this extra case to match the error responses as well. This done as the first step.

```typescript
export const getCustomReponse = (url, scenarios) => {
  if (!scenarios || scenarios.length === 0) return null;

  return responses.find(
    (response) =>
      scenarios.includes(response.code) && response.urls.includes(url)
  );
};

router.render = (req, res) => {
  ...
  const customResponse = getCustomReponse(url, scenariosFromHeader);

  if (customResponse) {
    res.status(customResponse.httpStatus).jsonp(customResponse.respone);
  } else {
    ...
  }};
```

### Testing API
