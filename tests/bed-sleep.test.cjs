const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const Core=require('../src/client/core/core.js');
function run({guest=false,connected=false,day=.8,saveId=1,storage=new Map()}={}){
 const timers=[],node=()=>({style:{},append(){},remove(){},appendChild(e){return e;},addEventListener(){},parentElement:null});
 let saves=0,requests=0,exists=true;
 const g={world:{get:()=>exists?66:0},dayK:day,mobs:[],p:{x:1,y:2,z:3},time:500,saveNow(){saves++;return true;}};
 const Net={guest,connected,state:{world:'A'},home(){},checkpoint(){requests++;}};
 const c={Core,game:g,Net,Lang:{say(){}},location:{host:'test',search:'?save='+saveId},URLSearchParams,performance:{now:()=>0},localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},document:{createElement:node,getElementById:node,head:node(),body:node()},setInterval(){},setTimeout(fn){timers.push(fn);}};c.window=c;
 vm.runInNewContext(fs.readFileSync('src/client/world/home.js','utf8'),c);
 const h={x:4,y:5,z:6};c.Home.use(h,0);assert(c.Home.sleeping);assert.deepEqual(JSON.parse(JSON.stringify(c.Home.spawn())),{x:4.5,y:6,z:6.5});
 c.Home.use(h,0);assert.equal(timers.length,3,'Repeated click cannot stack sleep');timers.forEach(f=>f());assert(!c.Home.sleeping);assert.equal(saves,2);assert.equal(requests,guest?1:0);
 assert.equal(g.time,!connected&&day<.1?612:500,'Only solo safe nights advance');exists=false;assert.equal(c.Home.spawn(),null,'Removed beds cannot respawn');return storage;
}
run();run({day:0});run({guest:true,connected:true,day:0});run({connected:true,day:0});
const store=run({saveId:2});assert(store.has('stonisle.bed.save.2'));assert(!store.has('stonisle.bed.save.1'));
for(const head of [true,false])for(const ns of [true,false])for(const q of Core.bedParts(head,ns)){assert(q[3]>q[0]&&q[4]>q[1]&&q[5]>q[2]);assert(q[6]<Core.ATLAS_TILES);}
console.log('Bed: rest lifecycle, independent respawn storage, missing bed, solo/multiplayer time policy passed');
