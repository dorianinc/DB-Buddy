const store = require("./index")

store.set('database.unicorn', 'selena');
// console.log(store.get('database'));
//=> '🦄'

// // Use dot-notation to access nested properties
// store.set('foo.bar', true);
// console.log(store.get('foo'));
// //=> {bar: true}

// store.delete('unicorn');
// console.log(store.get('unicorn'));
// //=> undefined