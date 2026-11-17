const assert=require('node:assert/strict'),C=require('./city-crafts.js');
assert.equal(Object.keys(C.cities).length,5);
assert.equal(C.cityFor(128),'黑风城');assert.equal(C.cityFor(263),'阗天城');assert.equal(C.cityFor(25),null);
const g={p:{x:2.5,y:31,z:-5.5},exploration:{sites:[{id:'test',name:'云岚城',x:0,z:0,base:30}]},guardState:{cities:{test:{owned:true}}}};
assert.equal(C.canCraft(g,'云岚城'),true);assert.equal(C.canCraft(g,'苍云城'),false);
assert.equal(C.canCraft({...g,guest:true},'云岚城'),false);assert.equal(C.canCraft({...g,p:{x:100,y:31,z:0}},'云岚城'),false);
g.guardState.cities.test.owned=false;assert.equal(C.canCraft(g,'云岚城'),false);
const effects=new C.Effects();effects.use(307);effects.tick(20);effects.use(307);assert.equal(effects.active.speed,60);assert.equal(effects.factor('speed'),1.2);
effects.tick(60);assert.equal(effects.factor('speed'),1);effects.use(305);assert.equal(effects.tick(50),10);assert.deepEqual(effects.active,{});
effects.use(308);const restored=new C.Effects(JSON.parse(JSON.stringify(effects)));assert.equal(restored.factor('guard'),.85);restored.clear();assert.equal(restored.factor('guard'),1);
for(const id of [293,294,295,296,298]){const recipe=C.recipes.find(r=>r[0]===id);assert.equal(recipe[1]-recipe[2][id],1);}
assert.equal(new C.Effects({speed:Infinity,mining:999,invalid:20}).active.mining,90);
console.log('Workshop ownership/location, recipe routing, blueprint copies, buff expiry, non-stacking and persistence passed.');
