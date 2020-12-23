const names = ['David', 'John', 'Michael', 'Paul', 'Andrew', 'Robert', 'Peter', 'Susan', 'Margaret', 'Patricia', 'Sarah', 'Elizabeth', 'Christine', 'Mary'];
const surnames = ['Smith', 'Jones', 'Williams', 'Taylor', 'Davies', 'Brown', 'Wilson', 'Evans', 'Thomas', 'Johnson', 'Roberts', 'Walker', 'Wright', 'Robinson', 'Thompson', 'White', 'Hughes', 'Edwards', 'Green', 'Lewis', 'Wood', 'Harris', 'Martin', 'Jackson', 'Clarke'];

const randItem = (list) => list[Math.floor(Math.random() * list.length)];

module.exports = {
  data: {
    USER: (new Array(100)).fill(0).map(() => ({
        name: `${randItem(names)} ${randItem(surnames)}`,
        age: Math.floor(Math.random() * 100),
    })),
  },
};
