---
title: "Rename SQL Table and Update all Keys/Constraints Naming Convention "
drafts: true
comments: false
categories:
- Programming
---

At work we usually use [DbUp](https://dbup.github.io/) to deploy changes to SQL Server. We follow certain naming conventions when creating table constraints and Indexes.

``` sql
create table Product
(
  Id uniqueidentifier not null unique,
  CategoryId uniqueidentifier not null,
  VendorId uniqueidentifier not null,

  constraint PK_Product primary key clustered (Id),
  constraint FK_Product_Category foreign key (CategoryId) references Category (Id),
  constraint FK_Product_Vendor foreign key (VendorId) references Vendor (Id)
)

create index IX_Product_CategoryId on Product (CategoryId);
```

I had to rename a table as part of a new feature. I could have just renamed the table name and moved on, but I wanted all the constraints and indexes also renamed to match the name convention. Looks like there is no easy way to do this - So I decide to write a script to do this. Since I have been playing around with F# for a while I chose to write it in that.

The SQL Server Management Objects (SMO) provides a collection of objects to manage SQL Server programatically. 

https://www.red-gate.com/simple-talk/blogs/life-at-the-f-end/

