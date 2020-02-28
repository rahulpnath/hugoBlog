---
title: "Generating PDF: .Net Core and Azure Web Application"
drafts: true
comments: false
---

Generating a PDF is one of those features that come along in a while and gets me thinking.

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

With the HTML generated, we can use the HtmlToPdfConverter, the [NReco wrapper](https://www.nrecosite.com/pdf_generator_net.aspx) class, to convert it to PDF format. The library is free for .Net but needs a paid license for .Net Core. It is available as a [NuGet package](https://www.nuget.org/packages/NReco.PdfGenerator.LT/) and does work fine with .Net Core 3.1 as well.

> [wkhtmltopdf binaries](https://wkhtmltopdf.org/downloads.html) needs to be deployed for your target platform(s) (Windows, Linux or OS X) with your .NET Core app.

With .Net core the [wkhtmltopdf](https://wkhtmltopdf.org/) executable does not get bundled as part of the NuGet package. This is because the executable differs based on the hosting OS environment. Make sure to include the [executable](https://wkhtmltopdf.org/downloads.html) and set to be copied to the bin folder. By default the converter looks for the executable (_wkhtmltopdf.exe_) under the folder _wkhtmltopdf_. If required this path is configurable.

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
            _config.UserName,
            _config.License
        );
        if (RuntimeInformation.IsOSPlatform(OSPlatform.OSX))
        {
            htmlToPdf.WkHtmlToPdfExeName = "wkhtmltopdf";
        }
        return htmlToPdf.GeneratePdf(htmlContent);
    }
}
```

Calling the _GeneratePdf_ function with the HTML string returns back the Pdf byte array.The Pdf byte array can be returned back as a File or saved for later reference.

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

**Must run on a dedicated VM backed plan** : NReco does work fine in Azure Web App as long as it in on a dedicated VM-based plan (Basic, Standard, Premium). This means that if you are running on a Free or Shared plan NReco will not work.

**Custom fonts are not supported** : On Azure Web App there is a [limitation on the font's](https://feedback.azure.com/forums/169385-web-apps/suggestions/32622797-support-custom-web-fonts-in-azure-app-services) that can be used for the generated PDF. Custom fonts are ignored and system-installed fonts are used.

**Not all Browser features available** : wkhtmltopdf uses Qt WebKit rendering engine to render the HTML into PDF. Depending on the version of the Qt Webkit available in the executable being used you will need to play around and see what works and what doens't. I have seen this mostly affecting with CSS (as Flexbox and CSS Grid was not supported in the version I was using).

### Development Tips & Tricks

Here are a few things that helped speed up the development of the Razor file.

##### Render Razor View While Development

Once I had the PDF generation pipeline set up the biggest chanllenge was to get the formatting and more real time feedback. I didn't want to sit there clicking the link, downloading the PDF and verifying a change I make. Especially this is a lot harder when you are laying out the entire structure of the PDF the first time.

To see the output of the razor template as and when you make changes I returned the HTML content as _ContentResult_ back on the API endpoint. When calling this from a browser it will automatically render it.

```csharp
[HttpGet]
[Route("{id}")]
public async Task<IActionResult> Get(string id, [FromQuery]bool? html)
{   ...
    if (html.GetValueOrDefault())
    {
        var htmlResult = await HtmlGenerationService.Generate(model);
        return new ContentResult() {
            Content = htmlResult,
            ContentType = "text/html",
            StatusCode = 200 };
    }

    var result = await PdfGenerationService.Generate(model);
    return File(result, "application/pdf", $"Quote - {model.Number}.pdf");
}
```

Remember that you still need to make sure from the PDF on what CSS capabilities are supported by actually looking at the PDF. Since the browser you use to render the HTML might be different to what wkhtmltopdf uses. If you can get the exact version that the executable uses it will be better.

Any time you make a change to the razor view you can refresh the API endpoint to see the updated result. You will need to turn off the caching (_UseMemoryCachingProvider_) on the RazorLightEngineProvider. Also if you are using _UseEmbeddedResourcesProject_ as source for the Provider you will need to rebuild everytime. Using _UseFileSystemProject_ with caching disabled forces the _RazorLightEngineProvider_ to load the new file everytime it renders for that template key.

##### Styles in Sass

I did not want miss out on writing Sass for CSS, but also did not want to set up any automated scripts/pipeline for just the templates (on server side). [Web Compiler](https://marketplace.visualstudio.com/items?itemName=MadsKristensen.WebCompiler) a Visual Studio extension, makes it easy to compile Sass to CSS. Once you have the extension installed, right click on the scss file to Compile file. It adds a json config file to the solution and from then on automatically compiles every time a change is made to the scss.

The next time you come across a feature to generate PDF's I hope this helps you get started. THe source code for this is available [here](https://github.com/rahulpnath/Blog/tree/master/PdfNetCore/PdfNetCore). The NRecoConfig in the appsettings.json must be set before it can start creating PDF's. Hope this helps!
