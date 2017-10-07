# Vue.js tabela Dynamica

Controção de tabelas 

### Index
* [Installation](#installation)
* [Usage](#usage)
* [Basic examples](#basic-examples)
    * [Sort](#sort)
    * [Order Columns](#order-columns)
    * [Filter by column](#filter-by-column)
    * [Pagination](#pagination)
    * [Items per page](#items-per-page)
* [Props](#props)

### Installation

``` bash
$ npm install vue-dynamic-table
```

### Usage

First, import it...

``` javascript
import VueDynamicTable from 'vue-dynamic-table'
```

Then register it globally...
``` javascript
Vue.use(VueDynamicTable);
```

### Basic examples:
``` html
<template>
    <div>
        <dyn-table 
            :fields="fields"
            :rows="rows"
        >
        </dyn-table>  
    </div>
</template>
```
``` javascript
import axios from 'axios';

export default {
    name: 'Installablesnew',
    data: () => ({
        errors: [],
        fields: {
            name: {
                label: 'Name',
            },
            email:{
                label: 'E-mail',
            },
            age: {
                label: 'Age',
            },
            gender: {
                label: 'Gender',
            },
        },
        rows: [
            {
                "name": "Medina Langley",
                "email": "medinalangley@magneato.com",
                "age": 32,
                "gender": "male"
            },
            {
                "name": "Estes Franks",
                "email": "estesfranks@magneato.com",
                "age": 23,
                "gender": "male"
            },
            {
                "name": "Sonja Durham",
                "email": "sonjadurham@magneato.com",
                "age": 27,
                "gender": "female"
            },
            {
                "name": "Fay Velasquez",
                "email": "fayvelasquez@magneato.com",
                "age": 33,
                "gender": "female"
            },
            {
                "name": "Elvia Gill",
                "email": "elviagill@magneato.com",
                "age": 23,
                "gender": "female"
            },
            {
                "name": "Lucille Gaines",
                "email": "lucillegaines@magneato.com",
                "age": 29,
                "gender": "female"
            },
            {
                "name": "Doreen Watkins",
                "email": "doreenwatkins@magneato.com",
                "age": 22,
                "gender": "female"
            },
            {
                "name": "Mayra Weaver",
                "email": "mayraweaver@magneato.com",
                "age": 24,
                "gender": "female"
            },
        ],
    }),
}
```

output

![](https://raw.githubusercontent.com/mpadinhabrandao/vue-dynamic-table/master/docs/images/img1.png)


### Sort
To enable sorting in the column, you need to pass the `sortable` parameter.

Example: enable sorting in the columns: name, email, and gender

``` javascript
//...
fields: {
    name: {
        label: 'Name',
        sortable: true,  
    },
    email:{
        label: 'E-mail',
    },
    age: {
        label: 'Age',
        sortable: true,  
    },
    gender: {
        label: 'Gender',
        sortable: true,  
    },
},
//...
```
output

![](https://raw.githubusercontent.com/mpadinhabrandao/vue-dynamic-table/master/docs/images/img2.png)


### Order Columns
you can reorder the columns with drag-and-drop. To do this, you need add paramamter `dragColumn`.

``` html
<template>
    <div>
        <dyn-table 
            :fields="fields"
            :rows="rows"
            dragColumn
        >
        </dyn-table>  
    </div>
</template>
```

output

![](https://raw.githubusercontent.com/mpadinhabrandao/vue-dynamic-table/work-in-documentation/docs/images/img3.png)

### Filter by column 
To use the filter in column, just pass the "filter" property in the fields.
if value of filter is true, create a input text and conditions is *%like%* or if input value is regex contition is regex (you can see example in column e-mail).
Or pass the object with structure:
``` javascript
//...
filter: {
    type: 'input', // OR 'select'
    logic : 'regex', // OR 'equal'
    // only need proprety options if type is select 
    options: {
      //value: text
      'opt1': 'Option 1',
      'opt2': 'Option 2',
    }
}
//...
```

``` javascript
//...
fields: {
    name: {
        label: 'Name',
    },
    email:{
        label: 'E-mail',
        filter: true,
    },
    age: {
        label: 'Age',  
        filter: {
            type: 'input',
            logic : 'equal'
        }
    },
    gender: {
        label: 'Gender',  
        filter: {
            type: 'input',
            logic : 'equal'
            options: {
               'male': 'Male',
               'female': 'Female',
            }
        }  
    },
},
//...
```
![](https://raw.githubusercontent.com/mpadinhabrandao/vue-dynamic-table/work-in-documentation/docs/images/img4.png)


### Pagination
Use parameters `perPage`, to do limit number items per page.
Automatically, insert selectbox with de page.
``` html
<template>
    <div>
        <dyn-table 
            :fields="fields"
            :rows="rows"
            :perPage="5"
        >
        </dyn-table>  
    </div>
</template>
```
![](https://raw.githubusercontent.com/mpadinhabrandao/vue-dynamic-table/work-in-documentation/docs/images/img5.png)

### Items per page


``` html
<template>
    <div>
        <dyn-table 
            :fields="fields"
            :rows="rows"
            :perPage="5"
            :perPageOptions="[3,5,10]"
        >
        </dyn-table>  
    </div>
</template>
```
![](https://raw.githubusercontent.com/mpadinhabrandao/vue-dynamic-table/work-in-documentation/docs/images/img6.png)

#### Props

| Prop | Type | Default | Description | 
| :--- | :--- | :--- | :--- |
| fields | Object | [more details](#propfields) |  |
| rows | Array | [] | Array with information to list |
| config | Object | empty [more details](#propconfig) |  |
| rowId | String | '' | field to use as id, you need this to editing inline |
| checkRows | Boolean | false | set `true` if you need add column with checkbox, this column will be first |


#### Prop/Fields
| Prop | Type | Default | Description | 
| :--- | :--- | :--- | :--- |
| label | String | '' |  |
| sortable | Boolean |  |  |
| status | String | '' | if status is empty then column is shown. status can be : | 
|  |  |  | `fixed`: show column and don't permite hide the column |
|  |  |  | `show`: show column and permite hide the column |
|  |  |  | `hide`: hide column but permite show the column |
|  |  |  | `none`: hide column and don't permite show the column |
| slot | String | '' |  if slot not empty then will be used for calling slot with same name as value |
| editable |  |  | under construction [more details](#propfieldseditable) |
| filter |  |  | under construction [more details](#propfieldsfilter) |

#### Prop/Fields/Editable
#### Prop/Fields/Filter

#### Prop/Config
| Prop | Type | Default | Description | 
| :--- | :--- | :--- | :--- |
| page | Number | 1 | numero da pagina |
| perPageOptions | Array | [5,10,25,50,100] | options to items per page |
| perPage | Number | first of list `perPageOptions` or max of rows if `perPageOptions` is empty | number of item per page |
| orderBy | String | '' | files |
| order | String | '' |  |
