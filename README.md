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
This means that you add a configuration in any of the following:

> `.json-dbrc` (json format), `json-db.config.js` (js format), or inside `package.json` in an attribute `json-db`

This configuration allows you to quickly create separate documents/collections, and add/generate default values.

```js
// This example will generate a json file with the version of our app
// the time when json-db was initialised
// and if it's deployed in DEV mode or PRD mode
module.exports = {
  APP: {
    version: require('./package.json').version,
    deployed: Date.now(),
    env: process.env.DEV ? 'DEV' : 'PRD',
  },
};
// It will be accessible as easy as DB.get(DB.APP) anywhere in your node app
```

### Usage

There's only one object exported, I like to call it DB, it looks like this:

```js
import DB from 'json-db';

// DB contains as attributes the names of the documents/collections in snake case (all caps)
console.log(DB); // return something like JsonDB { USER: '0d0779ca-539a-4f28-aefd-c1289ba5329d', LIST: '595eb375-f0d6-4c7e-b261-7ae9cf0a9677' }

DB.get(
  DB.USER, // id of the document/collection
); // returns the document {} or collection []

DB.set(
  DB.USER, // id of the document/collection
  { name: 'John', surname: 'Doe' }, // new value to overwrite the document/collection
); // returns the new value: { name: 'John', surname: 'Doe' }

DB.put(
  DB.USER, // id of the document/collection
  { surname: 'Smith' }, // partial new value
); // returns the combined new value: { name: 'John', surname: 'Smith' }

DB.create(
  'my fancy document', // string, name for the document/collection
  [], // [optional] object or array of items, the default value for the document/collection
); // returns the key added to the DB object: MY_FANCY_DOCUMENT
```

See [test/index.cjs](https://github.com/gatsbimantico/json-db/blob/main/test/index.cjs) for a more complete list of scenarios.
