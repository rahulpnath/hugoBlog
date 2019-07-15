---
title: "F# Collection Types For C# Devs: Choose"
drafts: true
comments: false
categories:
- FSharp
---

In this post let us explore the choose method available on [Seq](https://msdn.microsoft.com/en-us/visualfsharpdocs/conceptual/seq.choose%5B't%2C'u%5D-function-%5Bfsharp%5D), [List](https://msdn.microsoft.com/en-us/visualfsharpdocs/conceptual/list.choose%5B't%2C'u%5D-function-%5Bfsharp%5D) and[Array](https://msdn.microsoft.com/en-us/visualfsharpdocs/conceptual/array.choose%5B't%2C'u%5D-function-%5Bfsharp%5D) module. Choose method re

> ***Choose***:  Applies the given function f to each element x of the list. Returns the list that contains the results for each element where the function returns Some(f(x)).

The below [table](https://docs.microsoft.com/en-us/dotnet/fsharp/language-reference/fsharp-collection-types#table-of-functions) shows the computational complexity of the function for a collection of size N.

Function    | Array | List | Sequence |
------------|-------|------|----------|
choose      | O(N)  | O(N) | O(N)     |