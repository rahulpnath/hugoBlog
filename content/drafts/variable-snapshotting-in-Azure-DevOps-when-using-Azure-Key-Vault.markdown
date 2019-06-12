---
title: "Variable Snapshotting in Azure DevOps When Using Azure Key Vault"
drafts: true
comments: false
categories:
- Azure DevOps
- Azure Key Vault
---

In the previous post we saw how to [Enable History for Azure DevOps Variable Groups Using Azure Key Vault](/blog/azure-devops-variable-groups-history/). However there is one issue with using this approach. Whenever a deployment is triggered it fetches the latest Secret value from the Key Vault. This behaviour might be desireable or not depending on the nature of the Secret.

In this post we will see how we can use an alternative approach using the Azure Key Vault Pipeline task to fetch secrets and at the same time allow us to snapshot variable values against a release.

### Azure Key Vault Pipeline Task

The [Azure Key Vault task](https://docs.microsoft.com/en-us/azure/devops/pipelines/tasks/deploy/azure-key-vault?view=azure-devops0 can be used to fetch all or a subset of Secrets from the vault and set them as variables that is available in the subsequent tasks of a pipeline. Using the *secretsFilter* property on the task, it supports either downloading all the secrets as of their latest version or specify a subset of secrets (including specific versions)


PS : Version 1.0.36 of Azure Key Vault Task