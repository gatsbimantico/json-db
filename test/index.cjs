const DB = require('json-db');

/* Custom test suite */
let errors = 0;
const describe = (title) => console.log(`
⚙️  ${title.toUpperCase()}
`);
const test = (title, value) => ({ returns: (expectation) => {
  if (JSON.stringify({ returns: value }) !== JSON.stringify({ returns: expectation })) {
    console.log(`❌ ${title}`);
    console.error(`Test failed for "${title}" with:
${JSON.stringify({ value, expectation}, null, 2)}`);
    errors += 1;
  } else {
    console.log(`✅ ${title}`);
  }
}});
const didItPass = () => {
  if (errors > 0) {
    throw new Error('Test failed');
  }
}
/* End of test suite */

describe('"Table" operations as in SQL');

test('drop table',
  DB.drop_table(DB.USER)
).returns(true);

test('create table',
  DB.create_table('user', [{ name: 'David', surname: 'Smith' }])
).returns('USER');
 
test('show tables',
  DB.show_tables()
).returns(['USER']);

describe('CRUD naming');
 
test('C create',
  DB.create(DB.USER, { name: 'John', surname: 'Smith' })
).returns(1);
 
test('R read',
  DB.read(DB.USER, '1')
).returns({ name: 'John', surname: 'Smith' });

test('U update',
  DB.update(DB.USER, '0', { surname: 'Jones' })
).returns({ name: 'David', surname: 'Jones' });
 
test('D delete',
  DB.delete(DB.USER, '1')
).returns(true);
 
describe('BREAD naming');
 
test('B browse',
  DB.browse(DB.USER)
).returns([
  { name: 'David', surname: 'Jones' },
  null,
]);

console.log(`⚓︎ R read`);
 
test('E edit',
  DB.edit(DB.USER, '0', { surname: 'Smith' })
).returns({ name: 'David', surname: 'Smith' });

test('A add',
  DB.add(DB.USER, { name: 'John', surname: 'Smith' })
).returns(2);

console.log(`⚓︎ D delete`);
console.log(``);

let addedKey;
test('add to a document', (() => {
  const tableKey = DB.mk('add to document');
  addedKey = DB.add(DB[tableKey], { name: 'John', surname: 'Smith' });
  const result = DB.browse(DB[tableKey]);
  DB.rm(DB[tableKey]);
  return result;
})()).returns({
  [addedKey]: {
    name: 'John',
    surname: 'Smith',
    __id__: addedKey,
  }
});
 
describe('DAVE naming');

console.log(`⚓︎ D delete`);

console.log(`⚓︎ A add`);

test('V view',
  DB.view(DB.USER, '0')
).returns({ name: 'David', surname: 'Smith' });

console.log(`⚓︎ E edit`);
 
describe('Set/Get/Put/Pop naming');
 
test('set',
  DB.set(DB.USER, '1', { name: 'John', surname: 'Williams' })
).returns({ name: 'John', surname: 'Williams' });

test('get',
  DB.get(DB.USER, '1')
).returns({ name: 'John', surname: 'Williams' });

test('put',
  DB.put(DB.USER, '0', { surname: 'Jones' })
).returns({ name: 'David', surname: 'Jones' });

test('pop',
  DB.pop(DB.USER, '1')
).returns(true);
 
describe('file system naming');
 
test('fs.make',
  DB.fs.make('list')
).returns('LIST');

test('mk',
  DB.mk('list two')
).returns('LIST_TWO');

test('fs.list',
  DB.fs.list()
).returns(['USER', 'LIST', 'LIST_TWO']);

test('ls',
  DB.ls()
).returns(['USER', 'LIST', 'LIST_TWO']);

test('fs.write',
  DB.fs.write(DB.LIST, '0', { name: 'John', surname: 'Williams' })
).returns({ name: 'John', surname: 'Williams' });

test('rw',
  DB.rw(DB.LIST_TWO, '0', { name: 'John', surname: 'Williams' })
).returns({ name: 'John', surname: 'Williams' });

test('fs.read',
  DB.fs.read(DB.LIST, '0')
).returns({ name: 'John', surname: 'Williams' });

test('ro',
  DB.ro(DB.LIST_TWO, '0')
).returns({ name: 'John', surname: 'Williams' });

test('fs.remove',
  DB.fs.remove(DB.LIST)
).returns(true);

test('rm',
  DB.rm(DB.LIST_TWO)
).returns(true);
 
describe('Extra actions for collections only');
 
test('prepend',
  DB.prepend(DB.USER, { name: 'Andrew', surname: 'Taylor' })
).returns(0);

test('append',
  DB.append(DB.USER, { name: 'Robert', surname: 'Davies' })
).returns(3);
 
describe('Other recipes from SQL for bulk operations');
 
test('insert_into',
  DB.insert_into(DB.USER).values({ name: 'John', surname: 'Smith' })
).returns([4]);
 
test('bulk select',
  DB.select('name').from(DB.USER)
).returns([
  { name: 'David' },
  null,
  { name: 'John' },
  { name: 'Robert' },
  { name: 'John' },
]);

test('bulk select all',
  DB.select().from(DB.USER)
).returns([
  { name: 'David', surname: 'Jones' },
  null,
  { name: 'John', surname: 'Smith' },
  { name: 'Robert', surname: 'Davies' },
  { name: 'John', surname: 'Smith' },
]);

test('bulk select none',
  DB.select(null).from(DB.USER)
).returns(['0', '2', '3', '4']);
 
test('bulk update',
  DB.update(DB.USER).set({ surname: 'Jones' }).where((entry, key) => key == 0 || entry.name == 'David')
).returns([{ name: 'David', surname: 'Jones' }]);

test('bulk update without where',
  DB.update(DB.USER).set({ name: 'Paul' }).where()
).returns([
  { name: 'Paul', surname: 'Jones' },
  null,
  { name: 'Paul', surname: 'Smith' },
  { name: 'Paul', surname: 'Davies' },
  { name: 'Paul', surname: 'Smith' },
]);
 
test('bulk delete_from',
  DB.delete_from(DB.USER).where((entry, key) => entry.surname == 'Davies')
).returns({ '3': true });

test('bulk delete_from without where',
  DB.delete_from(DB.USER).where()
).returns({ '0': true, '2': true, '4': true });

console.log(``);
didItPass();
