---
title: "Enable History for Azure DevOps Variable Groups Using Azure Key Vault"
drafts: true
comments: false
---

Recently I did something that just sucked out half of my day at work - I accidently deleted an Azure Devops Variable Group. I was lucky that it was the development environment and I had access to the previously deployed development environments. I could quickly jump on to the corresponding machines (using the Kudu console) and get the values from the appropriate config files. With all these access it still took couple of hours for me to get it fixed back.

{{< tweet 1130369563135160320>}}

All I wanted to do was to is replace a file under the Secure Files Tab which is right next to Variable groups tab. Unfortunately you cannot replace an existing file and you need to delete the existing one to upload a new file. I was on the Variable Groups tab and mistook the varibale groups for the provision file and deleted it - Guess what you do not have any way to undo the delete at the time of writing.

Since this has happened once there is a high possibility that this has been happening before (to others) and will keep happening. It can be a risky situation to be in depending on whether you have access to the deployed environment, having a back up of the required keys etc. To me, this defintely does not sound like a good place to be in.

[Azure Key Vault](https://azure.microsoft.com/en-au/services/key-vault/) enables safeguard cyptographic keys and secrets used by application. It increses security and control over keys and passwords. Check out my video on [getting started with Key Vault](https://www.youtube.com/watch?v=51Qmk3TQJ44) and other [related articles](https://www.rahulpnath.com/blog/category/azure-key-vault/) if you are new to Key Vault. In this post let us see how we can link secrets from Key Vault to DevOps Variable Groups and how it helps us from accidental deletes and similar mistakes.

### Link Variables Groups to Key Vault

[Linking Secrets from an Azure Key Vault](https://docs.microsoft.com/en-us/azure/devops/pipelines/library/variable-groups?view=azure-devops&tabs=yaml#link-secrets-from-an-azure-key-vault) is easy to set up. When creating a new variable group toggle on the 'Link secrets from an Azure keyvault as variables' option. You can now link the azure subscription and the associated Key Vault to retrieve the secrets. Clicking the Authorize button next to the Key Vault, sets the required permissions on the Key Vault for the Azure Service Connection (that what connects your DevOps account with the azure subscription).

![Azure DevOps Variable Groups and Azure Key Vault](/images/devops_variable_groups_key_vault.jpg)

The Add button pops up a dialog as shown below. It allows you to select the Secrets that needs to be available as part of the Variable Group. 

![Azure DevOps Variable Groups link secrets from Vault](/images/devops_variable_groups_key_vault_secrets.jpg)

Create an Azure Key Vault for each environment where you can manage the secrets for that environment. As per the current [pricing](https://azure.microsoft.com/en-au/pricing/details/key-vault/), creating a Key Vault does not have any cost associated. Cost is based on operations to Key Vault and is considerably less (around *USD $0.03/10,000 transactions* at the time of writing.)

### Version History for Variable Changes

Key Vault supports versioning and any time you update a Secret it creates a new version of the Secret. This helps to see the full trace of changes for a Secret. You can also set expiry dates etc on the secret if applicable. Further by having [Expiry Notification for Azure Key Vault](https://rahulpnath.com/blog/expiry-notification-for-azure-key-vault-keys-and-secrets/) set up, you can always stay on top of rotating your secrets/certificates on time. From the Azure DevOps pipeline it only referes to the Secret names in the Key Vault. Every time a release is deployed it reads the latest value of  the Secret from the associated Key Vault and uses that for the deployment. This might be slightly different to what you are used to with defining the variables directly as part of the group, where the variables are snapshot at the time of release.

> Every time a release is deployed it reads the latest value of  the Secret from the associated Key Vault and uses that for the deployment. 

Make sure you are aware that variables will have the latest value as of time of deployment, before jumping over to Key Vault using the built in Variable Groups feature. However there is a different plugin that you can use to achieve variable snapshoting even with Key Vault, which I will cover in a separate post.

### Handling Accidental Deletes

In case anyone accidentaly deletes a varible group in Azure, it is as simple as cloing one of your other environments and renaming them to be your Dev Variable group. Most of the time you would have the same set of variables across all your environments. You longer need to know the actual secret values as that is managed in Key Vault.

**For argument sake, what if I accidentally delete the Key Vault itself?**

Good news is Key Vault does have a [Recovery Option](https://blogs.technet.microsoft.com/kv/2017/05/10/azure-key-vault-recovery-options/). Assuming you create the Key Vault with the recovery options set (which you obviously will now) , using the *EnableSoftDelete* parameter from Powershell, you can recover back from any delete action on the vault/key/secret.

Hope this helps save half a day of some one else (maybe just me) who is just going to accidentaly delete that variable group!