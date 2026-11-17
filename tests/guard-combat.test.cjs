const assert=require('node:assert/strict'),C=require('../src/client/city/guard-combat.js');
let a={x:0,y:31,z:0,hp:40,path:[[1,0]],repath:2};assert(C.hit(a,7,{x:-1,z:0}));assert.equal(a.hp,33);assert(a.flash>0&&a.kx>0);assert.equal(a.path.length,0);
C.knock(a,.1,()=>true);assert(a.x>0,'actual displacement');const before=a.x;C.knock(a,.1,()=>false);assert.equal(a.x,before,'blocked knockback cannot penetrate fence');
assert(C.hit(a,99,{x:0,z:1}));assert.equal(a.hp,0);assert(a.dead);assert(!C.hit(a,5,{x:0,z:1}));assert.equal(JSON.parse(JSON.stringify({hp:a.hp})).hp,0,'death survives serialization');
const Town=require('../src/client/city/castle-town.js');global.Core=require('../src/client/core/core.js');const N=require('../src/client/city/guard-navigation.js'),w=new Core.World();require('../src/client/city/castle-build.js').build(w);for(const block of Town.plan())w.set(...block);
for(const [x,z] of Town.plots){assert.equal(w.get(x+3,30,z),5);assert(N.clear((...p)=>w.get(...p),x+.5,31,z-.5));}
for(const [x,y,z,id] of [...Town.plan(),...Town.roofLights()])assert(id===0||Core.BLOCKS[id],`unknown block ${id}`);
console.log('Guard health, knockback, death and settlement tests passed');
for(const b of Town.expansion())w.set(...b);
for(let x=-3;x<=3;x++)for(let z=26;z<=75;z++){assert.equal(w.get(x,30,z),52);for(let y=31;y<64;y++)assert.equal(w.get(x,y,z),0,'avenue sightline stays clear');}
for(const cx of [-26,26])for(let y=31;y<=40;y++)assert(Core.ladderSupported((...p)=>w.get(...p),cx,y,64),'watchtower ladder backing');
const fs=require('node:fs'),vm=require('node:vm'),home=fs.readFileSync('src/client/world/home.js','utf8'),seed=home.slice(home.indexOf('  function seedChest'),home.indexOf('  const alongZ'));
const ctx={visiting:false,st:{chests:{}},save(){},key:c=>`${c.x},${c.y},${c.z}`};vm.createContext(ctx);vm.runInContext(seed,ctx);
assert(ctx.seedChest({x:0,y:41,z:-9},{130:12},'rare'));delete ctx.st.chests['0,41,-9'][130];ctx.st=JSON.parse(JSON.stringify(ctx.st));assert(!ctx.seedChest({x:0,y:41,z:-9},{130:12},'rare'));assert.equal(ctx.st.chests['0,41,-9'][130],undefined,'collected treasure never refills');
console.log('Clear avenue, watchtower access and one-time treasure tests passed');
