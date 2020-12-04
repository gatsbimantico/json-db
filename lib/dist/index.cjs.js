'use strict';

var fs = require('fs');
var cosmiconfig = require('cosmiconfig');
var uuid = require('uuid');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);

const dbState = {
    ccName: 'json-db',
    cc: null,
    dbMap: {},
    setup: {
        load: false,
        bootstrap: false,
    },
    default: {
      folder: '.json-db',
      naming: '.db.{{name}}.json',
    }
};

const dbUtil = {
  key: (name) => String(name).toUpperCase().replace(/[^A-Za-z0-9]+/g, '_'),
  file: (name) => {
    const partialName = String(name).toLowerCase().replace(/[^A-Za-z0-9]+/g, '-');
    const folder = (dbState.cc && dbState.cc.folder) || dbState.default.folder;
    const naming = (dbState.cc && dbState.cc.naming) || dbState.default.naming;
    const fileName = naming.replace('{{name}}', partialName);

    return `./${folder}/${fileName}`;
  },
  filePath: (dbId) => {
    return `./${folder}/${fileName}`;
  },
};

const MSG = (props = {}) => ({
    NO_CONFIG: `No config found on .${dbState.ccName}rc, .${dbState.ccName}.config.js or "${dbState.ccName}" inside package.json`,
});

class JsonDB {
  create_table(name, value = {}) {
    const key = dbUtil.key(name);
    let dbId = this[key];
    let dbFile = dbState.dbMap[dbId];

    if (!dbId) {
      dbId = uuid.v4();
      this[key] = dbId;
    }
    dbFile = dbUtil.file(name);
    dbState.dbMap[dbId] = dbFile;

    if (!fs__default['default'].existsSync(dbFile)) {
      this.set(dbId, value);
    }

    return key;
  }

  show_tables() {
    return Object.keys(this);
  }

  drop_table(dbId) {
    const dbFile = dbState.dbMap[dbId];

    if (fs__default['default'].existsSync(dbFile)) {
      try {
        fs__default['default'].unlinkSync(dbFile);
        const dbName = this.show_tables().find(table => this[table] === dbId);
        delete dbState.dbMap[dbId];
        delete this[dbName];
        return true;
      } catch(error) {
        return false;
      }
    }

    return false;
  }

  create(dbId, entry) {
    const document = this.browse(dbId);
    if (Array.isArray(document)) {
      document.push(entry);
      this.set(dbId, document);
      return document.length - 1;
    } else {
      entry.__id__ = uuid.v4();
      document[entry.__id__] = entry;
      this.set(dbId, document);
      return entry.__id__;
    }
  }

  read(dbId, entryId) {
    return this.browse(dbId)[entryId];
  }

  update(...args) {
    if (args.length === 3) {
      return this.edit(...args);
    } else if (args.length === 1) {
      const dbId = args[0];
      return {
        set: (partialValue) => {
          return {
            where: (entryFilter = () => true) => {
              const document = this.browse(dbId);
              return Object.keys(document)
                .filter(entryId => {
                  return document[entryId] && entryFilter(document[entryId], entryId);
                })
                .reduce((acc, entryId) => {
                  acc[entryId] = this.edit(dbId, entryId, partialValue);
                  return acc;
                }, Array.isArray(document) ? [] : {});
            },
          };
        },
      };
    }
  }

  delete(dbId, entryId) {
    const document = this.browse(dbId);
    delete document[entryId];
    this.set(dbId, document);
    return true;
  }

  browse(dbId) {
    const dbFile = dbState.dbMap[dbId];

    return JSON.parse(fs__default['default'].readFileSync(dbFile, 'UTF-8'));
  }

  edit(dbId, entryId, partialValue) {
    const oldValue = this.read(dbId, entryId);
    const newValue = Object.assign(Array.isArray(oldValue) ? [] : {}, oldValue, partialValue);
    return this.set(dbId, entryId, newValue);
  }

  set(dbId, ...args) {
    let entryId, newValue, document;
    const dbFile = dbState.dbMap[dbId];

    if (args[1]) {
      [entryId, newValue] = args;
      document = this.browse(dbId);
      document[entryId] = newValue;
    } else {
      [newValue, entryId] = args;
      document = newValue;
    }

    fs__default['default'].writeFileSync(dbFile, JSON.stringify(document, null, 2), 'UTF-8');
    return newValue;
  }

  prepend(dbId, entry) {
    const collection = this.browse(dbId);
    if (Array.isArray(collection)) {
      collection.unshift(entry);
      return 0;
    } else {
      return this.create(dbId, entry);
    }
  }

  insert_into(dbId) {
    return {
      values: (...values) => values.map(value => this.create(dbId, value)),
    };
  }

  select(...attrs) {
    return {
      from: (dbId) => {
        const document = this.browse(dbId);

        if (attrs.length === 0) {
          return document;
        } else if (attrs.length === 1 && attrs[0] === null) {
          return Object.keys(document).filter(entryId => document[entryId]);
        } else {
          return Object.keys(document).reduce((acc, entryId) => {
            if (!document[entryId]) return acc;
            acc[entryId] = attrs.reduce((acc2, attr) => {
              acc2[attr] = document[entryId][attr];
              return acc2;
            }, {});
            return acc;
          }, Array.isArray(document) ? [] : {});
        }
      },
    };
  }

  delete_from(dbId) {
    return {
      where: (entryFilter = () => true) => {
        const document = this.browse(dbId);
        return Object.keys(document)
          .filter(entryId => {
            return document[entryId] && entryFilter(document[entryId], entryId);
          })
          .reduce((acc, entryId) => {
            acc[entryId] = this.delete(dbId, entryId);
            return acc;
          }, {});
      },
    };
  }

  add(...args) {
    return this.create(...args);
  }
  view(...args) {
    return this.read(...args);
  }
  get(...args) {
    return this.read(...args);
  }
  put(...args) {
    return this.edit(...args);
  }
  pop(...args) {
    return this.delete(...args);
  }
  mk(...args) {
    return this.create_table(...args);
  }
  ls() {
    return this.show_tables();
  }
  ro(...args) {
    if (args.length === 1) {
      return this.browse(...args);
    }

    if (args.length === 2) {
      return this.read(...args);
    }
  }
  rw(...args) {
      return this.set(...args);
  }
  rm(...args) {
      return this.drop_table(...args);
  }
  get fs() {
    return {
      make: (...args) => this.mk(...args),
      list: () => this.ls(),
      read: (...args) => this.ro(...args),
      write: (...args) => this.rw(...args),
      remove: (...args) => this.rm(...args),
    };
  }
  append(...args) {
    return this.create(...args);
  }
}

const DB = new JsonDB();

function setup_load() {
    if (dbState.setup.load) return;

    // Load config with cosmiconfig
    dbState.cc = cosmiconfig.cosmiconfigSync(dbState.ccName).search();
    
    // Check if config was found
    if (dbState.cc === null) {
        console.log(MSG().NO_CONFIG);
        dbState.cc = { config: {} };
    }

    dbState.setup.load = true;
}
function bootstrap(name) {
  DB.create_table(name, dbState.cc.config.data[name]);
}
function setup_bootstrap() {
    if (dbState.setup.bootstrap) return;

    const libFolder = `./${dbState.cc.config.folder || dbState.default.folder}`;
    if (!fs__default['default'].existsSync(libFolder)) {
      fs__default['default'].mkdirSync(libFolder);
    }

    if (dbState.cc.config.data) {
      Object.keys(dbState.cc.config.data).forEach(bootstrap);
    }

    dbState.setup.bootstrap = true;
}
function dbBuilder() {
    setup_load();
    setup_bootstrap();

    return DB;
}
var index = dbBuilder();

module.exports = index;
