const assert=require('node:assert/strict'),C=require('./core.js'),craft=require('./city-crafts.js');
for(const id of [310,311,312]){assert.ok(C.PLANTS[id].full);assert.ok(C.PASS.has(id));assert.ok(C.BLOCKS[id].tiles[0]<C.ATLAS_TILES);}
const seen=new Set();for(let x=-200;x<200;x++)for(let z=-200;z<200;z++){const a=C.rareHerbAt(x,z,45,15),b=C.rareHerbAt(x,z,25,1);const high=C.rareHerbAt(x,z,32,1);if(high)seen.add(high);if(a)seen.add(a);if(b)seen.add(b);assert.equal(C.rareHerbAt(x,z,20,4),0);}
for(const id of [310,311,312,313,314,315])assert.ok(seen.has(id));
for(const id of [304,305,306])assert.ok(Object.keys(craft.items[id].need).some(n=>+n>=310&&+n<=312));
const chunk=C.genChunk(1,1);assert.deepEqual(C.genChunk(1,1),chunk);
console.log('Rare herb definitions, distinct habitats, stable generation and alchemy ingredients passed.');
