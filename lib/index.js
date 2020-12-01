import fs from 'fs';
import { cosmiconfigSync } from 'cosmiconfig';
import { v4 as uuidv4 } from 'uuid';

const dbState = {
    ccName: 'json-db',
    cc: null,
    dbMap: {},
    setup: {
        load: false,
        bootstrap: false,
    },
};
const dbKey = (name) => String(name).toUpperCase().replace(/[^A-Za-z0-9]+/g, '_');
const dbName = (name) => String(name).toLowerCase().replace(/[^A-Za-z0-9]+/g, '-');
const dbFolder = (dbId) => `./.${dbState.ccName}/.db.${dbState[dbId]}.json`;

const MSG = (props = {}) => ({
    NO_CONFIG: `No config found on .${dbState.ccName}rc, .${dbState.ccName}.config.js or "${dbState.ccName}" inside package.json`,
});

class JsonDB {
    get(db) {
        return JSON.parse(fs.readFileSync(dbFolder(db), 'UTF-8'));
    }
    set(db, data) {
        fs.writeFileSync(dbFolder(db), JSON.stringify(data, null, 2), 'UTF-8');
        return data;
    }
    put(db, data) {
        const oldValue = DB.get(db);
        return DB.set(db, Object.assign(Array.isArray(oldValue) ? [] : {}, oldValue, data));
    }
    create(name, value = {}) {
        const key = dbKey(name);
        if (!DB[key]) {
            const dbId = uuidv4();
            DB[key] = dbId;
            dbState[dbId] = dbName(name);
        }

        if (!fs.existsSync(dbFolder(name))) {
            DB.set(DB[key], value);
        }
        return key;
    }
}

const DB = new JsonDB();

function setup_load() {
    if (dbState.setup.load) return;

    // Load config with cosmiconfig
    dbState.cc = cosmiconfigSync(dbState.ccName).search();
    
    // Check if config was found
    if (dbState.cc === null) {
        console.log(MSG().NO_CONFIG);
        dbState.cc = { config: {} };
    }

    dbState.setup.load = true;
}
function bootstrap(name) {
    if (!DB[dbKey(name)]) {
        const dbId = uuidv4();
        DB[dbKey(name)] = dbId;
        dbState[dbId] = dbName(name);
    }

    if (!fs.existsSync(dbFolder(name))) {
        DB.set(DB[dbKey(name)], dbState.cc.config[name]);
    }
}
function setup_bootstrap() {
    if (dbState.setup.bootstrap) return;

    const libFolder = `./.${dbState.ccName}`;
    if (!fs.existsSync(libFolder)) fs.mkdirSync(libFolder);

    Object.keys(dbState.cc.config).forEach(bootstrap);

    dbState.setup.bootstrap = true;
}
function dbBuilder() {
    setup_load();
    setup_bootstrap();

    return DB;
};

export default dbBuilder();
