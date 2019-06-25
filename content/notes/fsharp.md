---
layout: post
title: F#
date: 2019-05-16
---

- Function

    ``` fsharp
    val functionName : domain -> range
    ```

    Domain: Set of Possible inputs   
    Range: Set of possible output values (subset of Co-domain)

- Comma marks a tuple type - If you see one it's almost certainly part of a tuple

    ``` fsharp
    ("hello",1) // string * int
    ```

- Pipe Function

    - Allows to put the function argument in front of the function.   
    - For function with multiple parameters, input is the last paramerter. Function is partially applied to make it a single parameter function.   

    ``` fsharp
    let (|>) x f = f x
    ```

- Reverse Pipe Function

    - Does nothing different; Makes code cleaner

    ``` fsharp
    let (<|) f x = f x

    printf "%i" 1+2          // error
    printf "%i" (1+2)        // using parens
    printf "%i" <| 1+2       // using reverse pipe

    1+2 |> add <| 3+4        // pseudo infix
    ```
- Modules

    - Module consists of a set of related functions that act on a data type
    - Top level modules does not need an '=', nor special indentation. Must be the first declaration in file.
    - Namespace is default and no defaults
    - All function and value declarations needs to be part of module. Namespaces can have type declarations
    