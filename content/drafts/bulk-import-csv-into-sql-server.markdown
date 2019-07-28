---
title: "Bulk Import CSV Files Into SQL Server Using SQLBulkCopy and CSVHelper"
drafts: true
comments: false
---

My recent project got me back into some long lost technologies including a lot of Excel sheets with vb script, Silverlight, bash scripts and what not. Amongst one of the things was a bash script that imported data from a lot of different CSV files to a data store. There were around 40-50 different CSV schemas mapped to their corresponding tables that were being imported. I had to repoint these scripts to write to a SQL Server.

### Challenges with BCP Utility

The [bcp Utility](https://docs.microsoft.com/en-us/sql/tools/bcp-utility?view=sql-server-2017) is one of the best possible option to use from a command line. However the bcp utility requires the fields (columns) in the CSV data file to match the order of the columns in the SQL table. The columns should also match exactly. Both were not the case in my scenario. The way that you can work around this using bcp is by providing a [Format File](https://docs.microsoft.com/en-us/sql/relational-databases/import-export/use-a-format-file-to-map-table-columns-to-data-file-fields-sql-server?view=sql-server-2017). 

> - CSV file columns must match order and count of the SQL table
- Requires a Format File otherwise 
    - Static generation is not extensible
    - Dynamic generation calls for a better programming language 

Format File has an XML and a Non-XML variant. It has the columns mapped out prior to the import or needs to be dynamically generated using code. I did not want to pre-generate the format file as this felt a bit flaky solution - especially because I do not own the generation of the CSV files. There could be more files, new columns and order could possibly change. Dynamic generation involved a lot more work and I would rather prefer using a stronger programming language than command line scripts.

### SqlBulkCopy

CSharp being my natural choice for programming language and having good support for [SQLBulkCopy](https://docs.microsoft.com/en-us/dotnet/api/system.data.sqlclient.sqlbulkcopy?view=netframework-4.8), I decided to rewrite the existing bash script. SQLBulkCopy is the equivalent of bcp utility and allows to write managed code solutions for similar functionality. SQLBulkCopy can only write data to SQL Server; however any data source can be used as long as it can be loaded into a DataTable instannce. This makes CSV files also a candidate as data source.

The [**ColumnMappings**](https://docs.microsoft.com/en-us/dotnet/api/system.data.sqlclient.sqlbulkcopy.columnmappings?view=netframework-4.8#System_Data_SqlClient_SqlBulkCopy_ColumnMappings) property defines the relationship between columns in the data source and the SQL table. This can be dynamically added reading the headers of the CSV data file and adding them. In my case the columns names were the same as that of the table. My initial solution involved reading the CSV file and splitting data using comma (",).

``` csharp
var lines = File.ReadAllLines(file);
if (lines.Count() == 0) 
    return;

var tableName = GetTableName(file);
var columns = lines[0].Split(',').ToList();
var table = new DataTable();
sqlBulk.ColumnMappings.Clear();

foreach (var c in columns)
{
    table.Columns.Add(c);
    sqlBulk.ColumnMappings.Add(c, c); //. Ordering of columns does not matter any more
}

for (int i = 1; i < lines.Count() - 1; i++)
{
    var line = lines[i];
    // Explicitly mark empty values as null for SQL import to work
    var row = line.Split(',').Select(a => string.IsNullOrEmpty(a) ? null : a).ToArray();
    table.Rows.Add(row);
}

sqlBulk.DestinationTableName = tableName;
sqlBulk.WriteToServer(table);
```

It is possible that CSV file has empty columns where the associated column in SQL table is NULLABLE. If the columns types are not string SQLBulkCopy can throw errors like below (depending on the column type).   
*<span style='color:red'>The given value of type String from the data source cannot be converted to type \<TYPENAME> of the specified target column</span>*

Explicitly marking the empty values as null (as in the code above) does solve the problem.

### CSV File Gotchas

The above code worked all file until there were some CSV files which had comma as valid value for few of the columns, as shown below.

``` csv
Id,Name,Address,Qty
1,Rahul,"Castlereagh St, Sydney NSW 2000",10
```

Splitting on comma no longer works. Using a Nuget package for reading the CSV data made more sense and decided to switch to [CSVHelper](https://github.com/JoshClose/CsvHelper)

``` csharp
List<dynamic> rows;
List<string> columns;
using (var reader = new StreamReader(file))
using (var csv = new CsvReader(reader))
{
    rows = csv.GetRecords<dynamic>().ToList();
    columns = csv.Context.HeaderRecord.ToList();
}

if (rows.Count == 0)
    return;

var table = new DataTable();
sqlBulk.ColumnMappings.Clear();

foreach (var c in columns)
{
    table.Columns.Add(c);
    sqlBulk.ColumnMappings.Add(c, c);
}

foreach (IDictionary<string, object> row in rows)
{
    var rowValues = row.Values.Select(a => string.IsNullOrEmpty(a.ToString()) ? null : a).ToList();
    table.Rows.Add(rowValues.ToArray());
}

sqlBulk.DestinationTableName = tableName;
sqlBulk.WriteToServer(table);
```

