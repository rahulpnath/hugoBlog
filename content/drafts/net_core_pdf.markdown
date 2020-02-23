---
title: "Net Core and PDF"
drafts: true
comments: false
---


 var engine = new RazorLightEngineBuilder()
                .UseFileSystemProject(@$"{RootPath}\PdfTemplates")
               // .UseEmbeddedResourcesProject(typeof(PdfTemplatesPlaceholder))
                //.UseMemoryCachingProvider()
                .Build();