---
layout: post
title: "Exploring Redux Action Definition Type Checking with Flow"
comments: false
categories: 
draft: true
description: 
primaryImage:
---

* Setting up Flow
* Using Flow with Redux Actions
  * Less Duplication
  * Avoid Using wrong action type
  * switch case - handle all actions

// @flow
type \_ExtractReturn<B, F: (...args: any[]) => B> = B;
export type ExtractReturn<F> = \_ExtractReturn<\*, F>;

export const SET_NAME = "SET_NAME";
export const SET_AGE = "SET_AGE";

const setName = (name: string) => {
return { type: SET_NAME, payload: name };
};

const setAge = (age: number) => {
return { type: SET_AGE, payload: age };
};

export type Actions =
| { type: "SET_NAME", payload: string }
| { type: "SET_AGE", payload: number };

export type ActionsCall =
| $Call<typeof setName, string>
| $Call<typeof setAge, number>;

type ActionsExtract =
| ExtractReturn<typeof setName>
| ExtractReturn<typeof setAge>;

const g = function test(a: ActionsExtract) {
const type = a.type;
switch (a.type) {
case "SET_NAME":
const s = a.payload.length;
console.log(a.payload);
break;

    case "SET_AGE":
      const i = a.payload * 5;
      console.log(a.payload);
      break;

    default:
      (a.type: empty);
      throw new Error("Invalid");

}
};
