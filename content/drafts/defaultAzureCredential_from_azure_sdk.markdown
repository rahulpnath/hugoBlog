---
title: "Using DefaultAzureCredential For Getting Tokens For Managed Service Identity (MSI)"
drafts: true
comments: false
categories:
  - Azure
  - Azure Key Vault
---

In the past, Azure had different ways to authenticate with the various resources running on it. You had to get different NuGet packages based on what you wanted to achieve. The [Azure SDK's](https://azure.github.io/azure-sdk/index.html) is bringing this all under one roof and providing a more unified approach to developers when connecting to resources on Azure.

In this post, we will look into the [DefaultAzureCredential](https://github.com/Azure/azure-sdk-for-net/blob/727ab08412e60394b6fea8b13cac47d83aca1f3b/sdk/identity/Azure.Identity/README.md#defaultazurecredential) class that is part of the [Azure Identity](https://github.com/Azure/azure-sdk-for-net/blob/727ab08412e60394b6fea8b13cac47d83aca1f3b/sdk/identity/Azure.Identity/README.md) library. It is the new and unified way to connect and retrieve tokens from Azure Active Directory and can be used along with resources that need them. We will particularly look at Azure Key Vault and Microsoft Graph Api and how to authenticate and interact with those resources.

> The Azure Identity library provides Azure Active Directory token authentication support across the Azure SDK. It provides a set of TokenCredential implementations which can be used to construct Azure SDK clients which support AAD token authentication.

The DefaultAzureCredential is very similar to the AzureServiceTokenProvider class as part of the [Microsoft.Azure.Services.AppAuthentication](https://www.nuget.org/packages/Microsoft.Azure.Services.AppAuthentication/). Check out [this post](https://www.rahulpnath.com/blog/authenticating-with-azure-key-vault-using-managed-service-identity/) to know more on how to use that. The DefaultAzureCredential gets the token based on the environment the application is running. If it's running on local machine

### Azure Key Vault

When connecting with Key Vault make sure to provide the identity (Service Principal or Managed Identity) with relevant Access Policies in the Key Vault. It can be added via the Azure portal (or cli, powershell etc.).

Using the [Azure Key Vault client library for .NET v4](https://docs.microsoft.com/en-us/azure/key-vault/quick-create-net) you can access and retrieve Key Vault Secret as below

```csharp
var secretClient = new SecretClient(
    new Uri("https://identitytest.vault.azure.net"),
    new DefaultAzureCredential());
var secret = await secretClient.GetSecretAsync("<SecretName>");
```

If you are using the v3 version of the KeyVaultClient to connect to Key Vault you can use the below snippet to connect and retrieve a secret from the Key Vault.

```csharp
var credential = new DefaultAzureCredential();
var keyVaultClient = new KeyVaultClient(async (authority, resource, scope) =>
{
    var token = credential.GetToken(
        new Azure.Core.TokenRequestContext(
            new[] { "https://vault.azure.net/.default" }));
    return token.Token;
});

var secret = await keyVaultClient
    .GetSecretAsync("<Secret Identifier>");
```

### Microsoft Graph Api

```csharp
var credential = new DefaultAzureCredential();
var token = credential.GetToken(
    new Azure.Core.TokenRequestContext(
        new[] { "https://graph.microsoft.com/User.Read" }));

var accessToken = token.Token;
var graphServiceClient = new GraphServiceClient(
    new DelegateAuthenticationProvider((requestMessage) =>
    {
        requestMessage
        .Headers
        .Authorization = new AuthenticationHeaderValue("bearer", accessToken);

        return Task.CompletedTask;
    }));
```

### Local Development

![](/images/vs_azure_service_authentication.jpg)

```csharp
var azureCredentialOptions = new DefaultAzureCredentialOptions();
#if DEBUG
    azureCredentialOptions.SharedTokenCacheUsername = "<AD User Name>";
#endif

var credential = new DefaultAzureCredential(azureCredentialOptions);
```

However at that time I ran into this [issue](https://github.com/Azure/azure-sdk-for-net/issues/8658)
