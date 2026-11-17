const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),R=require('./herb-farming.js');
for(const d of R.defs){assert.equal(R.stage(d,0),d.young);assert.equal(R.stage(d,d.seconds*.4),d.growing);assert.equal(R.stage(d,d.seconds),d.id);assert.equal(R.loot(d,false,false,.34).seeds,1);assert.equal(R.loot(d,false,false,.35).seeds,0);assert.equal(R.loot(d,true,false,.9).seeds,1);assert.equal(R.loot(d,true,true,0).seeds,0);}
const cells=new Map(),get=(x,y,z)=>cells.get([x,y,z].join(','))||0,set=(x,y,z,b)=>cells.set([x,y,z].join(','),b);
const game={herbState:{crops:{},transplants:{}},inv:{320:2},world:{get},setBlock:set,give(id,n){this.inv[id]=(this.inv[id]||0)+n;},renderBar(){},saveNow(){}};
const c={game,CerealCrops:require('./cereal-crops.js'),HerbVarieties:require('./herb-varieties.js'),Lang:{say(){}},Math};c.window=c;c.root=c;vm.runInNewContext(fs.readFileSync('herb-farming.js','utf8'),c);const F=c.HerbFarming;let notices=0;F.onMature=()=>notices++;const h={x:0,y:1,z:0,n:[0,1,0]};set(0,1,0,98);
assert.ok(F.use(h,320));assert.equal(get(0,2,0),330);assert.equal(game.inv[320],1);F.tick(170);assert.equal(get(0,2,0),331);
game.herbState=JSON.parse(JSON.stringify(game.herbState));F.tick(310);assert.equal(get(0,2,0),310);assert.equal(notices,1);set(0,2,0,0);assert.equal(F.dug({x:0,y:2,z:0},310),310);assert.ok(game.inv[320]>=2);
F.use(h,320);set(0,1,0,0);F.tick(1);assert.equal(get(0,2,0),0);assert.equal(Object.keys(game.herbState.crops).length,0);
console.log('Six herbs: seed probability, three stages, save/reload, mature harvest and removed soil passed.');

for(const d of require('./cereal-crops.js').list){game.inv[d.seed]=1;set(0,1,0,98);set(0,2,0,0);assert(F.use(h,d.seed));assert.equal(get(0,2,0),d.young);F.tick(d.seconds);assert.equal(get(0,2,0),d.id);assert.equal(F.dug({x:0,y:2,z:0},d.id),d.product);assert.equal(game.inv[d.product],2);assert.ok(game.inv[d.seed]>=1);}
console.log('Four cereals plant, grow, retain state, return grain and seeds.');
