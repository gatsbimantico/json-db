const DB = require('json-db');

console.log(

    // Check the list of documents
    DB,
    // JsonDB { USER: '0d0779ca-539a-4f28-aefd-c1289ba5329d' }

    // Check the document USER
    DB.get(DB.USER),
    // [ { name: 'John Smith', age: 99 }, ... ]

    // Create a document LIST with an empty array
    DB.create('list', []),
    // LIST

    // Check the list of documents (now LIST exists)
    DB,
    // JsonDB { USER: '0d0779ca-539a-4f28-aefd-c1289ba5329d', LIST: '595eb375-f0d6-4c7e-b261-7ae9cf0a9677' }

    // Check the document LIST (and it has an empty array)
    DB.get(DB.LIST),
    // []

    // Update the LIST to modify an item
    DB.put(DB.LIST, { 2: 'third' }),
    // [ <2 empty items>, 'third' ]

    // Check the value again to verify it was updated
    DB.get(DB.LIST),
    // [ null, null, "third" ]

    // Set LIST to be an empty array again
    DB.set(DB.LIST, []),
    // []

);
