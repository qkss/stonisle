const assert=require('node:assert/strict'),C=require('./furnace-core.js');
let s=C.create();assert.equal(C.insert(s,'ore',12,3),3);assert.equal(C.insert(s,'fuel',11,1),1);assert.equal(C.insert(s,'ore',13,1),0);assert.equal(C.insert(s,'fuel',4,1),0);
C.tick(s,1);assert.equal(s.progress,1);assert.equal(s.fuel,null);s=JSON.parse(JSON.stringify(s));for(let i=0;i<3;i++)C.tick(s,1);assert.deepEqual(s.output,{id:291,n:1});assert.equal(s.ore.n,2);assert.equal(s.heat,12);
s.output.n=64;const heat=s.heat;C.tick(s,1);assert.equal(s.heat,heat);assert.equal(s.ore.n,2);assert.equal(C.take(s,'output').n,64);assert.equal(s.output,null);
C.tick(s,1);assert.equal(C.take(s,'ore').n,2);assert.equal(s.progress,0);assert.equal(C.insert(s,'ore',13,1),1);for(let i=0;i<4;i++)C.tick(s,1);assert.deepEqual(s.output,{id:292,n:1});
let empty=C.create();C.insert(empty,'ore',12,1);C.tick(empty,1);assert.equal(empty.progress,0);assert.equal(C.insert(empty,'fuel',8,100),64);assert.equal(C.insert(empty,'fuel',8,1),0);
for(let i=0;i<4;i++)C.tick(empty,1);assert.equal(empty.fuel.n,63);assert.equal(empty.output.n,1);assert.equal(empty.heat,0);C.tick(empty,1);assert.equal(empty.fuel.n,63);
console.log('Furnace input validation, fuel accounting, progress reload, output blocking and collection passed');
for(const [ore,product] of [[80,135],[287,466]]){const f=C.create();C.insert(f,'ore',ore,9);C.insert(f,'fuel',11,1);C.tick(f,1);assert.equal(f.progress,0);assert.equal(f.fuel.n,1);assert.equal(f.heat,0);assert.match(C.status(f),/10/);C.insert(f,'ore',ore,12);for(let i=0;i<8;i++)C.tick(f,1);assert.deepEqual(f.output,{id:product,n:2});assert.equal(f.ore.n,1);assert.equal(f.heat,8);C.tick(f,1);assert.equal(f.heat,8);assert.equal(f.ore.n,1);}
console.log('Crystal calcination: 10:1, batch remainder and insufficient-input no-fuel consumption passed');
