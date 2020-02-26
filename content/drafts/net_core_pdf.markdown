---
title: "Net Core and PDF"
drafts: true
comments: false
---

Generating a PDF is one of those features that comes along in a while and gets me thinking.

_How do I do this now?_

A while back I had written how I had [dynamically generated a large PDF from website contents](/blog/generating-a-large-pdf-from-website-contents/). With the library I had used that time it did have the limitation of not being able to run on Azure Web App. This is mostly because of [Azure sandbox restrictions](https://github.com/projectkudu/kudu/wiki/Azure-Web-App-sandbox#pdf-generation-from-html) and boils down to whether you are running it off a [shared VM or dedicated VM](https://docs.microsoft.com/en-us/azure/app-service/overview-hosting-plans).

In this post we will look at how we can generate PDF using the [NReco HTML-to-PDF Generator for .Net](https://www.nrecosite.com/pdf_generator_net.aspx), which is a C# wrapper over [WkHtmlToPdf](https://wkhtmltopdf.org/).

> To use NReco HTML-To-PDF Generator with .Net Core a [license needs to be purchased](https://www.nrecosite.com/pdf_generator_net.aspx).

### HTML Templates using Razor

```
 Install-Package RazorLight -Prerelease
```

```error
InvalidOperationException: Cannot find reference assembly 'Microsoft.AspNetCore.Antiforgery.dll' file for package Microsoft.AspNetCore.Antiforgery
```

### Setting up NReco

```csharp
var engine = new RazorLightEngineBuilder()
.UseFileSystemProject(@\$"{RootPath}\PdfTemplates")
// .UseEmbeddedResourcesProject(typeof(PdfTemplatesPlaceholder))
//.UseMemoryCachingProvider()
.Build();
```

### Local Development
