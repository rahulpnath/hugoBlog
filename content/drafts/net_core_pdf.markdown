---
title: "Net Core and PDF"
drafts: true
comments: false
---

Generating a PDF is one of those features that comes along in a while and gets me thinking.

_How do I do this now?_

A while back I had written how I had [dynamically generated a large PDF from website contents](/blog/generating-a-large-pdf-from-website-contents/). With the library I had used that time it did have the limitation of not being able to run on Azure Web App. This is mostly because of [Azure sandbox restrictions](https://github.com/projectkudu/kudu/wiki/Azure-Web-App-sandbox#pdf-generation-from-html) and boils down to whether you are running it off a [shared VM or dedicated VM](https://docs.microsoft.com/en-us/azure/app-service/overview-hosting-plans).

In this post we will look at how we can generate PDF in an Azure Web App and running .Net Core, what the limitations are and some tips and tricks to help with the development. I am using the [NReco HTML-to-PDF Generator for .Net](https://www.nrecosite.com/pdf_generator_net.aspx), which is a C# wrapper over [WkHtmlToPdf](https://wkhtmltopdf.org/).

> To use NReco HTML-To-PDF Generator with .Net Core a [license needs to be purchased](https://www.nrecosite.com/pdf_generator_net.aspx).

### Generating the PDF

##### Generate HTML

To generate the PDF we first need to generate HTML. [RazorLight](https://github.com/toddams/RazorLight) is a template engine based on Razor for .Net Core. This is available as a [NuGet package](https://www.nuget.org/packages/RazorLight/). I am using the latest available pre-release version - [2.0.0-beta4](https://www.nuget.org/packages/RazorLight/2.0.0-beta4). Razor light supports templates from Files / EmbeddedResources / Strings / Database or Custom Source. This can be configured when setting the RazorLightEngine to be used in the application. For .Net core we can inject an instance of _IRazorLightEngine_ for use in the application. The [ContentRootPath](https://docs.microsoft.com/en-us/dotnet/api/microsoft.extensions.hosting.ihostenvironment.contentrootpath?view=dotnet-plat-ext-3.1) is from the IWebHostEnvironment that can be injected to the [Startup class](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/startup?view=aspnetcore-3.1#the-startup-class)

```csharp
var engine = new RazorLightEngineBuilder()
    .UseFileSystemProject($"{ContentRootPath}/PdfTemplates")
    .UseMemoryCachingProvider()
    .Build();

services.AddSingleton<IRazorLightEngine>(engine);
```

Instance of the engine can be used to generate HTML from a razor view. By using _UseFileSystemProject_ function above, RazorLight picks up the templates from the provided file path. I have all the template files under a folder 'PdfTemplates'. Make sure to set the Template files (_\*.cshtml_) and any associated resource files (css and images) are marked to '_Copy to Output Directory_'. RazorLight adds the templates in the path specified and makes them available against a template key. The template key format is different [based on the source](https://github.com/toddams/RazorLight#template-sources). e.g When using filesystem template key is the relative path to the Template file from the RootPath

The HtmlGenerationService below takes in a data object and generates the HTML string using the RazorLightEngine. By convention it expects a template file (\*.cshtml) within a folder - both with the same name as that of the type. For e.g If the data is of type 'Quote' it expects a template with key 'Quote/Quote.cshtml'.

```csharp
public class HtmlGenerationService : IHtmlGenerationService
{
    private readonly IRazorLightEngine _razorLightEngine;

    public HtmlGenerationService(IRazorLightEngine razorLightEngine)
    {
        _razorLightEngine = razorLightEngine;
    }
    public async Task<string> Generate<T>(T data)
    {
        var template = typeof(T).Name;
        return await _razorLightEngine.CompileRenderAsync($"{template}/{template}.cshtml", data);
    }
}
```

I got the following error - _InvalidOperationException: Cannot find reference assembly 'Microsoft.AspNetCore.Antiforgery.dll' file for package Microsoft.AspNetCore.Antiforgery_ and had to set _PreserveCompilationReferences and PreserveCompilationContext_ in the csproj as mentioned [here](https://github.com/toddams/RazorLight#im-getting-cannot-find-reference-assembly-microsoftaspnetcoreantiforgerydll-exception-on-net-core-app-30-or-higher). Make sure to check the FAQ's if you are facing any error using the library.

##### Generate PDF

With the HTML generated, we can use the HtmlToPdfConverter, the [NReco wrapper](https://www.nrecosite.com/pdf_generator_net.aspx) class, to convert it to PDF format. The library is free for .Net but needs a paid license for .Net Core. Calling the _GeneratePdf_ function with the HTML string returns back the Pdf byte array. With .Net core the [wkhtmltopdf](https://wkhtmltopdf.org/) executable does not get bundled as part of the NuGet package. This is because the executable differs based on the hosting OS environment. Make sure to include the executable.

```csharp
public class PdfGeneratorService : IPdfGeneratorService
{
    ...
    public PdfGeneratorService(
        IHtmlGenerationService htmlGenerationService, NRecoConfig config) {...}

    public async Task<byte[]> Generate<T>(T data)
    {
        var htmlContent = await HtmlGenerationService.Generate(data);
        return ToPdf(htmlContent);
    }

    private byte[] ToPdf(string htmlContent)
    {
        var htmlToPdf = new HtmlToPdfConverter();
        htmlToPdf.License.SetLicenseKey(
            Config.UserName,
            Config.License
        );

        return htmlToPdf.GeneratePdf(htmlContent);
    }
}
```

The Pdf byte array can be returned back as a File or saved for later reference.

```csharp
public async Task<IActionResult> Get(string id)
{
    ...
    var result = await PdfGenerationService.Generate(model);
    return File(result, "application/pdf", $"Quote - {model.Number}.pdf");
}
```

### Limitations

Before using any PDF generation library, make sure you read the associated [docs and FAQ's](https://www.nrecosite.com/pdf_generator_net.aspx) as most of them have one limitation or the other. It's about finding the library that fits the purpose and budget.

NReco does work fine in Azure Web App as long as it in on a dedicated VM-based plan (Basic, Standard, Premium). This means that if you are running on a Free or Shared plan NReco will not work.

### Development Tips & Tricks
