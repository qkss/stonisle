const assert=require('node:assert/strict'),{insert}=require('./container-transfer.js');
let slots=[null,{id:1,n:60},null];assert.equal(insert(slots,1,10),10);assert.deepEqual(slots,[{id:1,n:6},{id:1,n:64},null]);
slots=[null,{id:2,n:5},null,null];assert.equal(insert(slots,1,70,{target:1}),70);assert.deepEqual(slots,[null,{id:2,n:5},{id:1,n:64},{id:1,n:6}]);
slots=[null,{id:2,n:5}];assert.equal(insert(slots,1,4,{target:1}),4);assert.equal(slots[0].n,4);
slots=[{id:1,n:10},{id:2,n:4}];assert.equal(insert(slots,1,5,{target:1,exclude:0}),0);assert.equal(slots[0].n,10);
slots=[{id:1,n:63},{id:2,n:64}];assert.equal(insert(slots,1,20),1);assert.equal(insert(slots,1,20),0);
console.log('Container placement: merge priority, mismatched target, overflow, wraparound, full slots and source exclusion passed');
