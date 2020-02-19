---
title: "TypeScript: Use Sum Types To Your Advantage When Modelling Data"
drafts: true
comments: false
categories:
  - TypeScript
---

Recently I was working at a client and we had to take in payment for a servive they provide. There were two options to pay - either in partial or in full. When paying in full the payment included a total amount and a refundable amount. When paying in partial there was a minimum amount required to be paid at the time of purchase, the remaining amount with a surcharge (optional based on the card used for payment) amount and a refundable amount.

Intially I started modelling the data using one interface as below - _PaymentdOptions_. It had a type to determine whether it was a partial or a full payment. The properties totalRental, payNow and refundableBond were applicable in both scenarios. payNow and totalRental are same in case of 'full' payment. The properties balance, balanceSurcharge and payLater are only applicable when the payment option is of type 'partial'.

```ts
export interface PaymentOption {
  type: "partial" | "full";
  totalRental: number;
  payNow: number;
  refundableBond: number;
  balance?: number;
  balanceSurcharge?: number;
  payLater?: number;
}
```

As you can this is exactly the problem - I had to explain a lot to convey the across and this is still confusing and you need to go back and forth to understand how all these data fit together. It is not expressive enough. I am sure when I go back to this code couple of weeks from now it will be hard to understand. I bet this will be the same, if not harder for anyone new who has to look into the same code and maintain it.

I decided to split out the payment options into two different definitions. [Sum Types](https://www.typescriptlang.org/docs/handbook/advanced-types.html#discriminated-unions) (or Discriminated Union or Algebraic Data Types) are a great way to represent data when they can take mutiple options or forms. Here I define a 'PaymentOption' type which can either be a 'FullPaymentOption or a 'PartPaymentOption'. I can then go on and define the properties on both of those options separately as shown below.

> You can combine singleton types, union types, type guards, and type aliases to build an advanced pattern called discriminated unions, also known as tagged unions or algebraic data types Or Sum Types.

The data is now expressive and indicates what fields are applicable to the relevant payment option. Since 'balanceSurcharge' is optional based on the card type used for payment I have it as optional on 'PartPaymentOption' type.

```ts
export type PaymentOption = FullPaymentOption | PartPaymentOption;

export interface FullPaymentOption {
  type: "full";
  totalRental: number;
  payNow: number;
  refundableBond: number;
}

export interface PartPaymentOption {
  type: "partial";
  totalRental: number;
  payNow: number;
  refundableBond: number;
  balance: number;
  balanceSurcharge?: number;
  payLater: number;
}
```

When using the PaymentOption Sum Type we can conditionally check for the type of option it represents using the 'type' property, also referred to as the '_discriminant_'. Once we case it to a specific type, TypeScript is intelligent enough to restrict us to the properties that type has defined. For eg. if it a 'full' payment I cannot access refundableBond or any of the other properties that are only applicable to a 'part' payment option. This makes it extrmely useful when consuming sum types and makes it less error prone. I don't have to necessarily know all the options applicable when data will and will not be populated.

Having conditional properties on an interface or on a class always tend to lead problems down the line. Tend to avoid this as much as possible.


https://codesandbox.io/s/paymentoptions-esl5j