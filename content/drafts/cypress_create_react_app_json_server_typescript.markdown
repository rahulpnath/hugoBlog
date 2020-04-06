---
title: "Create React App + JSON Server + Cypress + Typescript "
drafts: true
comments: false
categories:
  - Cypress
  - TypeScript
  - Testing
---

### Create React App

Setting up a Create React App with TypeScript is straightforward and supported out of the box. All you need to specify is the typescript template when you create a new application (as shown below). If you already have an existing project don't worry, the documentation has [steps on how to add Typescript to an existing project](https://create-react-app.dev/docs/adding-typescript/).

```node
npx create-react-app my-app --template typescript
```

### Setting up Cypress

[Cypress](https://docs.cypress.io/guides/overview/why-cypress.html#In-a-nutshell) is a next generation front end testing tool built for the modern web. It is the next generation Selenium and enables to write tests faster, easier and reliable. The Cypress docs are great and well explained. It walksthrough each [step to set up Cypress tests](https://docs.cypress.io/guides/getting-started/installing-cypress.html) for your application. I have Cypress installed under the web application folder.

Cypress ships with TypeScript definitions making it easy to set it up with type safety. [Follow the steps here](https://docs.cypress.io/guides/tooling/typescript-support.html) and add a tsconfig.json under the Cypress folder and you should be good to go. I like to use the [Cypress Testing Library](https://github.com/testing-library/cypress-testing-library) when writing Cypress Tests, which has types defined at [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/testing-library__cypress). Install the packages using the command below and [set it up as described here](https://testing-library.com/docs/cypress-testing-library/intro).

```node
npm install --save-dev cypress @testing-library/cypress @types/testing-library__cypress
```

Cypress does with come a default set of example tests. If the example tests are not showing up for you try running 'cypress open' (or run) which should generate them. If you are like me and want to keep them under the source control for reference but not run them, you can ignore the tests in the cypress.json file.

```json
{
  "ignoreTestFiles": "**/examples/*.js",
  "baseUrl": "http://localhost:3000"
}
```

### Setting up JSON Server

In the previous post we looked at [how to set up a Fake REST API using JSON Server](/blog/setting_up_a_fake_rest_api_using_json_server/).

```node
npm install json-server @types/json-server typescript
```

Add a tsconfig.json for the TypeScript compiler.

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "baseUrl": "./",
    "target": "es6",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "lib": ["es6"],
    "allowJs": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["**.ts"]
}
```

### Wiring all Up

Below is the folder structure that I have - mockApi (JSON Server), cypress and ui (create-react-app)

![](/images/cypress_cra_jsonServer_folder_structure1.jpg)
