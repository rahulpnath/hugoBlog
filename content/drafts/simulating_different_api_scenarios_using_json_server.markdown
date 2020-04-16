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

_How many times have you had to update the API code to return an empty list or throw an error to test edge case scenarios?_

_How do you demo these different API scenarios to someone else?_

The pages or components that we build for an application have different states. Of those, some states depend on the data returned from the server via the API. Often it's hard to simulate the different scenarios for the API, and we stick with the 'happy path scenario' - the one that happens most of the time. Writing code or testing for the happy path scenario is easy, as the endpoint is most likely to behave that way. It is tricky to develop/test the edge case scenarios and are often ignored or left untested.

Let's take an example of a simple list page of Quotes. Some of the scenarios for this endpoint are - no quotes available, some quotes available, server request errors, and more. The 'happy path scenario' here is that some quotes exist, and most of our development and testing will be against that. It will be good if we can simulate different application scenarios using a [FAKE JSON Server API](/blog/setting_up_a_fake_rest_api_using_json_server/). It will allow us to simulate any use case or scenario that we want, allowing us to write code for it. Not to mention that testing, demoing, and writing automated tests all becomes easier.

In this post, we will look at how to [set up a fake JSON Server API](/blog/setting_up_a_fake_rest_api_using_json_server/) to return data based on scenarios we specify to it. The post describes an approach that you can adapt to your application and the scenarios you have. If you are news to setting up a fake API, check out how to [Set up Up A Fake REST API Using JSON Server](/blog/setting_up_a_fake_rest_api_using_json_server/)

### Specifying Scenarios to JSON Server

To start with, we need to specify which scenario we are interested in when calling the API. A scenario could be specific to one API endpoint or multiple. On an API endpoint, the best place to pass extra data is request headers, as it is least intrusive. We need to send the scenarios only in our development and test environment and not in production. However, it does not hurt to add an extra header to every HTTP request. Whenever we need to request for a particular scenario to the FAKE API, we pass it as part of the 'scenarios' header.

We will modify the _router.render_ in JSON Server to return the data based on the scenarios specified in the request header. We used the _router.render_ method, while [setting up JSON Server API](/blog/setting_up_a_fake_rest_api_using_json_server/) to format the data into the summary format. Based on the values in the request header, we can filter the data and update the response.

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

For the mock data, let's add an extra attribute to indicate the scenarios they apply to that particular quote. Eg. The mock quotes defined in _quotes.ts_ is updated as below with an additional _sceanrios_ array property that takes in a list of scenarios associated with each quote. Based on the mock data and the scenario's that it applies to, it will have different values. We filter out the response data based on these attributes and return only the ones that have all the attributes specified in the request header.

For, e.g., when the scenario header is \*'draft phone' only the quotes that have both are returned. For the header 'no-quotes' since none of the quotes has this scenario applied, no data will be returned. When the header is empty, it returns all quotes. (More on error scenarios a little later)

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

The quote type is now an [Intersection Type](https://www.typescriptlang.org/docs/handbook/advanced-types.html#intersection-types)- (QuoteDto & Scenarios<QuoteScenario>)[] - that combines multiple types into one. This allows us to maintain type safety for the mock data, while also adding the new scenario property. We also get type safety on the possible scenarios to avoid any typos for scenarios.

```typescript
export type QuoteScenario = "phone" | "no-phone" | "draft" | "open";
export type UserScenario = "admin" | "salesrep";

export interface Scenarios<T> {
  scenarios: T[];
}
```

Based on the [generic type T](https://www.typescriptlang.org/docs/handbook/generics.html), the scenarios property can have only the associated values. Based on your application and the scenarios applicable, add different types and values to represent them.

### Handling Scenarios and Modifying Response

Based on the scenarios in the header, we filter the response data. We first filter out the scenarios in the header that apply to the current request endpoint. The _getScenariosApplicableToEndpoint_ method filters this for this. The headers are filtered so that we do not use a filter that does not apply to the current endpoint and filter out all the data. Just like we use no-quotes filters out all the data since none of the quotes will have a 'no-quotes' scenario, because of which it will always return an empty list of data. However, we don't want the presence of 'no-user' to filter out the data from the quotes endpoint; it should affect only the user endpoint.

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

// filter scenarios header based no the endpoint url
export const scenariosForEndpoint = {
  "/api/quotes": ["phone", "no-phone", "draft", "open", "no-quotes"],
  "/api/users": ["admin", "salesrep", "no-user"],
};

export const getScenariosApplicableToEndpoint = (
  endpoint: string,
  scenarios: string[]
) => {
  const endpointScenarios = (scenariosForEndpoint[endpoint] as string[]) || [];
  return scenarios.filter((a) => endpointScenarios.includes(a));
};
```

Once the scenarios are filtered, we use that to filter the response data containing only the specified headers. We can expand filtering the header scenarios to include the HTTP verbs (GET, PUT, POST, etc.) if required.

### Handling Error Scenarios

Error responses do not depend on the mock data and have a separate flow. A list of custom responses are in the '_customResponses.ts_' file. If the headers match any of the code and url's for the custom response, then the 'response' property is returned for that request.

For e.g., If a request is for the '/api/quotes/' endpoint with 'error-quotes' in the scenarios header, the response is overridden to match the associated response property from the JSON object below. If you want to fine-tune the response based on the request verb (GET, PUT, POST etc.) feel free to extend that here.

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

The router.render method now handles this additional case to match the error responses and is the first step.

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

When requesting the API, pass the scenarios header to activate the different scenarios. Based on the values in the scenarios header, JSON Server will filter out the response data.
Below is a sample request made with 'draft' in scenarios header, and it returns only quotes that have the 'draft' scenarios applied to it.

```http
GET http://localhost:5000/api/quotes HTTP/1.1
Host: localhost:5000
scenarios: draft

HTTP/1.1 200 OK
[
  {
    "id": "1",
    "scenarios": [
      "draft",
      "no-phone"
    ],
    "statusCode": "Draft",
    "lastModifiedAt": "2020-03-01T14:00:00.000Z",
    "customerName": "Rahul",
    "mobilePhoneDescription": null
  },
  {
    "id": "2",
    "scenarios": [
      "draft",
      "phone"
    ],
    "statusCode": "Draft",
    "lastModifiedAt": "2020-03-01T14:00:00.000Z",
    "customerName": "Rahul",
    "mobilePhoneDescription": "iPhone X"
  }
]
```

To test one of these edge case scenarios, it's now about adding the appropriate scenario header to the API request and adding the proper data to the mock JSON server. Passing the proper header when making the API request allows us to develop/test against these scenarios quickly. In a follow-up post, we will see how we can use this in our front end app development and automated tests.

Hope this helps you set up the different scenarios for your API.
