---
title: "Code Signing MSI Installer and DLLs in Azure DevOps"
categories: 
- Azure DevOps
date: 2019-04-10
description: Code Sign using Microsoft SignTool in Azure Devops build pipeline.
---

*[Code Signing](https://en.wikipedia.org/wiki/Code_signing) is the process of digitally signing executables and scripts to confirm the software author and guarantee that the code has not been altered or corrupted since it was signed.*

Code Signing is something that you need to consider if you are distributing installable software packages that are consumed by your consumers. Some of the most obvious examples would be any of the standalone applications that you install on your machine. Code signing provides authenticity of the software package distributed and ensures that it is not tampered with between when it was created and delivered to you. Code Signing usually involves using a Code Signing Certificate which follows the public/private key pair to sign and verify. You can purchase this from all certificate issuing authorities; google should help you choose one. 

At one of the recent projects, I had to set up Code Signing for the MSI installer for a windows service. The following artifacts were to be signed: Windows Service Executable, 
- Dependent DLLs, MSI Installer (that packages the above). We were using the [Azure Devops](https://azure.microsoft.com/en-au/services/devops/) for our build process and wanted to automate the code signing. We are using WIX to generate the MSI installer; Check out my previous post on [Building Windows Service Installer on Azure Devops](https://www.rahulpnath.com/blog/building-windows-service-installer-on-azure-devops/), if you want more details on setting up WIX installer in DevOps. 

Since we need to sign the executable, the DLLs and also the installer that packages them, I do this in a two-step process in the build pipeline - first sign the DLLs and executable, after which the installer project is built and signed. It ensures the artifacts included in the installer are also signed. We [self host our build agent](https://docs.microsoft.com/en-us/azure/devops/pipelines/agents/agents?view=azure-devops#install), so I installed our Code Signing certificate on the machine manually and added the certificate thumbprint as a [build variable](https://docs.microsoft.com/en-us/azure/devops/pipelines/process/variables?view=azure-devops&tabs=designer%2Cbatch) in DevOps. For a [hosted agent](https://docs.microsoft.com/en-us/azure/devops/pipelines/agents/hosted?view=azure-devops&tabs=yaml), you can upload the certificate as a [Secure File](https://docs.microsoft.com/en-us/azure/devops/pipelines/library/secure-files?view=azure-devops) and use it from there.

#### Sign DLLs
The pipeline first builds the whole project to generate all the DLLs and the service executable. Microsoft's [SignTool](https://docs.microsoft.com/en-us/windows/desktop/seccrypto/signtool) is used to sign the DLLs and executable. The tool takes in the certificate's thumbprint as a parameter and also takes in a few other parameters; [check the documentation](https://docs.microsoft.com/en-us/windows/desktop/seccrypto/signtool) to see what each what parameter does. It does accept wildcards for the files to be signed. If you follow a convention for project/DLL names (which you should), then signing them all can be done in one command.

``` cmd
c:\cert\signtool.exe sign /tr http://timestamp.digicert.com 
    /fd sha256 /td sha256 /sm /sha1 "$(CodeSignCertificateThumbprint)" 
    /d "My Project description"  MyProject.*.dll
```

![Code Signing Azure DevOps](/images/code_sign_azure_devops.jpg)

#### Sign Installer

Now that we have the DLLs and the executable signed, we need to package them in using the WIX project. By default, building a WIX project rebuilds all the dependent assemblies, which will overwrite the above-signed DLLs. To avoid this make sure to pass in parameters to the build command to not build project references (*/p:BuildProjectReferences=false*), and only package them. The MSI installer on build output can then be signed using the same tool.

![Code Signing Azure DevOps](/images/code_sign_azure_devops_installer.jpg)

#### Sign Powershell Scripts

We also had a few Powershell scripts that were packaged along in a separate application. To sign them you can use the [Set-AuthenticodeSignature](https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.security/set-authenticodesignature?view=powershell-6) cmdlet. All you need is to get the certificate from the appropriate store and pass it on to the cmdlet along with the files that need to be signed.

``` ps
$cert = Get-Childitem cert:\LocalMachine\My   `
    | where {$_.Thumbprint -eq "$(CodeSignCertificateThumbprint)"}[0]
Set-AuthenticodeSignature -TimestampServer "http://timestamp.digicert.com" `
    .\Deploy\*.ps1 $cert 
```

If you are distributing packaged software to your end users to install it is generally a good idea to Code Sign your artifacts and also publish the verifiable hash on your website along with the downloadables. 

I hope this helps!