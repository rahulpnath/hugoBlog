---
title: "Scenario Selector for UI"
drafts: true
comments: false
categories:
date: 2020-05-05
---

In a previous post, [Simulating Different Scenarios Using Fake JSON Server API](TDK), I showed you how you can set up a fake API to return data based on the UI state you are interested. For e.g Given a list view of data shown on the UI, the application can be in a state to show an empty list, a list of data, a list of data that does not fit in one page, a server error etc.

### Overriding all HTTP Requests

Scenarios are determined based on the 'scenarios' header (choose a different name if you like) from the HTTP Request. To inject this header we need to be able to intercept the API requests. I usually prefer to have all API requests to be under a single folder and use an abstraction over the http library of choice. Most http libraries, provide extension points to intercept requests before sending them. Use these interception points, the scenario headers can be injected for all requests.

Below I use [axios](https://github.com/axios/axios), a promise based HTTP client to make requests to API. Using the [Interceptors](https://github.com/axios/axios#interceptors) feature of axios, I inject the _scenarios_ header for each request. It uses a _getSelectedScenario_ helper function to get the current selected sceanrio, the application is interested in.

```typescript
// http.ts
const http = axios.create();

if (process.env.NODE_ENV === "development") {
  http.interceptors.request.use(
    async (request) => {
      const selectedScenario = getSelectedScenario();
      request.headers["scenarios"] = selectedScenario
        ? selectedScenario.scenarios.join(" ")
        : "";
      return request;
    },
    (error) => Promise.reject(error)
  );
}

export default http;
```

When making requests to the API, use the exported http instance here as shown below. All requests made now flow through the interceptors and will have the _scenarios_ header injected.

```typescript
// quotes.api.ts
import http from "./http";

export async function loadAllQuotes(): Promise<QuoteSummaryDto[]> {
  const response = await http.get<QuoteSummaryDto[]>("/api/quotes");
  return response.data;
}
```

### Local Storage and Scenario Builder Form

The _getSelectedScenario_ helper function retrieves header from whereever you choose to save. This can be an in-memory object, local storage, shared JSON file or any other storage that you choose. Local Storage is my personal choice, as it allows to persist the interested values across browser sessions and also allows to easily interact with it using the browser developer tools.

The _selectedScenarioGroup_ in local storage determines the current list of scenario headers to be send to the [fake API server](TDK). We can change the list of scenarios by modifying the values for this key in the local storage.

![](/images/scenario_selector_local_storage.jpg)

To make changing and defining scenarios interactive, I created a small form that plugs into the UI and sits away nice and hidden.

![](/images/scenario_selector_ui_form.jpg)

### Prebuilt scenarios
