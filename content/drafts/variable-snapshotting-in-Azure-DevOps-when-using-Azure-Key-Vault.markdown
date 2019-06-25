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

### Secrets in Key Vault

Before we go any further lets looks look at how Secrets looks like in Key Vault. You can create secret in Key Vault via various machanisms including powershell, cli, portal etc. From the portal you can create a new Secret as shown below (from the Secrets section under the Key Vault). A Secret is uniquely identifiable by the name of the Vault, Secret Name and the version identifier. When the version identifier is not specified the latest value is used. 

Since we have only one Secret Version created this can be identified using the full SecretName/Identifier or just the SecretName as both are the same. 

> Depending on how you want your consuming application to get a Secret Vaule you should choose how to refer a Secret - using the name only (to always get the latest version) or using the SecretName/Identifier to get the specific version.

### Azure Key Vault Pipeline Task

The [Azure Key Vault task](https://docs.microsoft.com/en-us/azure/devops/pipelines/tasks/deploy/azure-key-vault?view=azure-devops0 can be used to fetch all or a subset of Secrets from the vault and set them as variables that is available in the subsequent tasks of a pipeline. Using the *secretsFilter* property on the task, it supports either downloading all the Secrets (as of their latest version) or specify a subset of Secrets (including specific versions)

We are more interested with the part where we can specify the specific version and download that. The Secret name along with the version looks like this - TDK





![](/images/keyvault_task_azure_devops.jpg)

PS : Version 1.0.36 of Azure Key Vault Task