const store = require("./index")


store.set('potato', 'carino');

module.exports = store;
// console.log(store.get('service'));
//=> '🦄'

// // Use dot-notation to access nested properties
// store.set('foo.bar', true);
// console.log(store.get('foo'));
// //=> {bar: true}

// store.delete('unicorn');
// console.log(store.get('unicorn'));
// //=> undefined