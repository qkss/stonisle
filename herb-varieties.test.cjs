const assert=require('node:assert/strict'),V=require('./herb-varieties.js'),C=require('./core.js'),F=require('./herb-farming.js');
assert.equal(V.list.length,10);assert.equal(new Set(V.list.map(d=>d.id)).size,10);
const counts=[0,0,0,0,0];for(let i=0;i<100000;i++)counts[V.tier((i+.5)/100000)]++;
assert.deepEqual(counts,[70000,22000,6500,1350,150]);
for(const d of V.list){assert.ok(C.PASS.has(d.id));assert.ok(C.PLANTS[d.id].tile<C.ATLAS_TILES);assert.equal(F.byId(d.seed).rank,0);assert.equal(F.byId(d.id).name,d.name);}
assert.equal(F.byId(360).id,350);assert.equal(F.byId(361).id,355);
const ids=new Set();for(let x=0;x<1000;x++)for(let z=0;z<1000;z++){const a=C.rareHerbAt(x,z,45,15),b=C.rareHerbAt(x,z,32,1);if(a>=350)ids.add(a);if(b>=350)ids.add(b);}
for(const d of V.list)assert.ok(ids.has(d.id),'wild generation includes '+d.name);
console.log('Ten distinct age grades, decreasing rarity, valid atlas, wild generation and ordinary seed offspring passed.');
