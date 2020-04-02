---
title: "Setting Up A FAKE REST API Using JSON Server"
drafts: true
comments: false
categories:
  - JavaScript
  - Testing
---

[JSON Server](https://github.com/typicode/json-server) is a great way to set up a full fake REST API for your front-end development. JSON server can be set up literally in '30 seconds' and with zero coding as the website claims. Just get some of real API's data if it already exists or create a mock data based on the API Schema and create a _db.json_ file. Thats all needs to be done and we have an API with all CRUD capabilities

However it's not always that you can use something like that straight out of the box to fix all the conditions and constraints of your API. In this post let's look at a few of such cases and how I have set up JSON Server.

### Setting up JSON Server

Any time you want to add in custom behaviour for your Mock API's you can use [JSON server as a module](https://github.com/typicode/json-server#module) in combination with the other Express middlewares. JSON server is built over [Express, a web framework for Node.js](https://expressjs.com/). To set it up as a module add a _server.js_ file to your repository with the set up code as from the docs.

```js
// server.js
const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

server.use(middlewares);

// Have all URLS prefixed with a /api
server.use(
  jsonServer.rewriter({
    "/api/*": "/$1"
  })
);

server.use(router);
server.listen(5000, () => {
  console.log("JSON Server is running");
});
```

Start up the server using '**_node server.js_**'.

Mostly I have my API's all behind the '/api' route. To set up JSON Server for this use a rewriter url to redirect all calls with '/api/\*' to the root '/$1', where the '$1' represents all that is captures by the '\_'. For e.g A call to 'localhost:5000/api/quotes' will now be redirected as 'localhost:5000/quotes' where JSON server has all the data available through the db.json file.

### Setting up and Organizing Mock Data

When using a json file (db.json) as source for mock data, any changes made to the REST resources (POST, PATCH, PUT, DELETE etc) are written back to the json file. Most likely you will be using a source control (and if not you should) and this means reverting the changes to the files every time. I don't like doing this so I decided to move my mock data to a in memory JSON object.

The router function takes in a source that is _either a path to a json file (e.g. `'db.json'`) or an object in memory_. This also allows organizing our mock data into separate files. I have all my mock data [under one folder](https://github.com/rahulpnath/quotes/tree/master/ui/mockApi/mockData) with an _index.js_ file that serves up the in memory object with all the resources.

```js
const quotes = require("./quotes");
const users = require("./user");
const products = require("./products");
const branches = require("./branches");

module.exports = {
  quotes,
  users,
  products,
  branches
};
```

Pass the in-memory object to the router as below

```js
const data = require("./mockData");
const router = jsonServer.router(data);
```

Since this is an in memory object any changes made to the object is not persistent. Every time the server starts up it uses the same data served from the 'index.js' file above.

### Summary and Detail View Endpoints

```js
router.render = (req, res) => {
  let data = res.locals.data;

  if (url === "/api/quotes" && req.method === "GET") {
    data = data.map(renderHelpers.toQuoteSummary);
  }
  res.jsonp(data);
};
```
