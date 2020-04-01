---
title: "Cypress: Azure AD Login"
drafts: true
comments: false
categories:
  - JavaScript
  - Testing
  - Azure
---

In this post lets looks at how to Authenticate a Website against Azure AD for doing end to end tests.

Visiting external websites is considered as an [Anti-Pattern as per Cypress documents.](https://docs.cypress.io/guides/references/best-practices.html#Visiting-external-sites). For [logging in](https://docs.cypress.io/guides/references/best-practices.html#When-logging-in), Cypress recommends either Stubbing out the OAuth provider or using programmatic access to get the token.

When using the OIDC cookie based authentication with Azure AD

Original -
Mine - https://gist.github.com/rahulpnath/4362ff2226ea36e056784f92c0d64434

https://github.com/cypress-io/cypress/issues/2427

- Cookie based login
- JWT login
