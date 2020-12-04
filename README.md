# JSON-DB
Tiny JavaScript Object Notation as DataBase node module

![Test and release](https://github.com/gatsbimantico/json-db/workflows/Test/badge.svg?branch=main)

## ✅ When to use json-db

- To mock a functional persistence layer quickly.
- To develop json editors such as: configuration dashboards, translations managers,... anything with the purpose of generating a json file to be later consumed by another app or api.
- To support local apps such as an electron app. Keeping the data open and human readable such as: settings, preferences, user owned data in a local context,... anything the user could manually edit and which doesn't need to be shared.

## 🚫 When NOT to use json-db

- When you need to store information secure, efficient or reliable.
- When you have more than one entity updating your data (more than one user, more than one api or app,...), it's ok if many consume the json files though

## ⚙️ How does it work?

### Configuration

This module uses [davidtheclark/cosmiconfig](https://github.com/davidtheclark/cosmiconfig) with the namespace `json-db`.
This means that you set the configuration in any of the following files:

> `.json-dbrc` (json format), `json-db.config.js` (js format), or inside `package.json` in an attribute `json-db`

This optional configuration allows you to quickly create separate documents/collections, and add/generate default values.

```js
// This example will generate a json file with the version of our app
// the time when json-db was initialised
// and if it's deployed in DEV mode or PRD mode
module.exports = {
  folder: '.json-db', // path where to store the json files
  naming: '.db.{{name}}.json', // name of the documents
  data: { // object with the different document names (key) and their default value
    APP: {
      version: require('./package.json').version,
      deployed: Date.now(),
      env: process.env.DEV ? 'DEV' : 'PRD',
    },
  },
};
// It will be accessible as easy as DB.browse(DB.APP) anywhere in your node app
```

### Usage

There's only one object exported, I like to call it DB, it looks like this:

```js
import DB from 'json-db';

// DB contains as attributes the names of the documents/collections in snake case (all caps)
console.log(DB); // return something like JsonDB { USER: '0d0779ca-539a-4f28-aefd-c1289ba5329d' }

/* "Table" operations as in SQL */

DB.create_table(
  'user', // string, name for the document/collection
  [{ name: 'David', surname: 'Smith' }], // [optional] object or array of items, the default value for the document/collection
); // returns the key added to the DB object: USER

DB.show_tables(); // returns an array with the "table" names

DB.drop_table(
  DB.USER, // id of the document/collection
); // returns true/false if it was deleted

/* CRUD naming */

DB.create(
  DB.USER, // id of the document/collection
  { name: 'John', surname: 'Smith' }, // new value in the document/collection
); // returns the key/id for the new value: '1'

DB.read(
  DB.USER, // id of the document/collection
  '1', // key/id to be read
); // returns the value of that key/id: { name: 'John', surname: 'Smith' }

DB.update(
  DB.USER, // id of the document/collection
  '0', // key/id to be updated
  { surname: 'Jones' }, // partial new value
); // returns the combined new value: { name: 'David', surname: 'Jones' }

DB.delete(
  DB.USER, // id of the document/collection
  '1', // key/id to be deleted
); // returns true/false if it was deleted

/* BREAD naming */

DB.browse(
  DB.USER, // id of the document/collection
); // returns the entire document {} or collection []

DB.read // is the same Read as in CRUD
DB.edit // is an alias of Update from CRUD
DB.add // is an alias of Create from CRUD
DB.delete // is the same Delete as in CRUD

/* DAVE naming */

DB.delete // is the same Delete as in CRUD
DB.add // is the same Add as in BREAD
DB.view // is an alias of Read from CRUD
DB.edit // is the same Edit as in BREAD

/*  Set/Get/Put/Pop naming */

DB.set(
  DB.USER, // id of the document/collection
  '1', // key/id to be set
  { name: 'John', surname: 'Williams' }, // new value to overwrite/create the key/id
); // returns the new value: { name: 'John', surname: 'Williams' }
DB.get // is an alias of Read from CRUD
DB.put // is an alias of Update from CRUD
DB.pop // is an alias of Delete from CRUD

/* file system naming */

DB.fs.make || DB.mk // is an alias of Create_Table from SQL
DB.fs.list || DB.ls // is an alias of Show_Tables from SQL
DB.fs.read || DB.ro // can be an alias of Browse from BREAD or Read from CRUD, if it includes the second param with a key/id
DB.fs.write || DB.rw // is an alias of Set from SGPP
DB.fs.remove || DB.rm // is an alias of Drop_Table from SQL

/* Extra actions for collections only */

DB.prepend // is an alias of Create from CRUD, but the item is included at the begining
DB.append // is an alias of Create from CRUD

/* And a few other recipes from SQL for bulk operations */

// Similar to Create from CRUD
DB.insert_into(
  DB.USER, // id of the document/collection
).values(
  { name: 'John', surname: 'Smith' }, // multiple new values in the document/collection
  ...
); // returns an array of key/ids of the new elements

// Similar to Browse from BREAD
DB.select(
  'name', // multiple attributes to be read
  ...
).from(
  DB.USER, // id of the document/collection
); // returns the entire document {} or collection [], but just with the selected attributes.
DB.select().from(DB.USER); // returns all the attributes, just like an alias of DB.browse(DB.USER)
DB.select(null).from(DB.USER); // returns no attributes, just an array with the available key/ids

// Similar to Update from CRUD
DB.update(
  DB.USER, // id of the document/collection
).set(
  { surname: 'Jones' }, // partial new value
).where(
  (entry, key) => key == 0 || entry.name == 'David', // condition to select the entries to be updated.
); // returns an object/array with the updated entries
DB.update(DB.USER).set({ name: 'John' }); // Without a WHEN clause all the entries will be updated.

// Similar to Delete from CRUD
DB.delete_from(
  DB.USER, // id of the document/collection
).where(
  (entry, key) => key == 0 || entry.name == 'David', // condition to select the entries to be deleted.
); // returns true/false if it was deleted
DB.delete_from(DB.USER); // Without a WHEN clause all the entries will be deleted.
```

See [test/index.cjs](https://github.com/gatsbimantico/json-db/blob/main/test/index.cjs) for a more complete list of scenarios.
