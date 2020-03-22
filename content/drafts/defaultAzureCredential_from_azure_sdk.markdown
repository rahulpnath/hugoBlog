---
title: "Using DefaultAzureCredential For Getting Tokens For Managed Service Identity (MSI)"
drafts: true
comments: false
categories:
  - Azure
  - Azure Key Vault
---

Azure Identity - https://github.com/Azure/azure-sdk-for-net/blob/727ab08412e60394b6fea8b13cac47d83aca1f3b/sdk/identity/Azure.Identity/README.md

![](/images/vs_azure_service_authentication.jpg)

### Azure Key Vault

```csharp
var azureCredentialOptions = new DefaultAzureCredentialOptions();
#if DEBUG
    azureCredentialOptions.SharedTokenCacheUsername = "<AD User Name>";
#endif

var credential = new DefaultAzureCredential(azureCredentialOptions);
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
...
var credential = new DefaultAzureCredential(azureCredentialOptions);
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

I did run into this issue - https://github.com/Azure/azure-sdk-for-net/issues/8658
