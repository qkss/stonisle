const assert=require('node:assert/strict');global.Core=require('../src/client/core/core.js');const N=require('../src/client/city/guard-navigation.js'),A=require('../src/client/city/castle-access.js'),w=new Core.World();require('../src/client/city/castle-build.js').build(w);for(const [x,y,z,id] of A.blocks())w.set(x,y,z,id);const get=(...p)=>w.get(...p);
for(const [x,y,z,id] of A.blocks())if(Core.ladderInfo(id)){assert(Core.ladderSupported(get,x,y,z),`unsupported ladder ${x},${y},${z}`);}
for(const [x,z] of [[-14,-14],[14,-14],[-14,16],[14,16]])assert(N.clear(get,x+.5,54,z+.5),'archer landing');
assert(N.clear(get,5.5,55,.5),'keep landing');
for(const [s,t,y] of [[[-1.5,19.5],[.5,13.5],31],[[9.5,10.5],[9.5,3.5],31],[[-9.5,15.5],[-5.5,15.5],38],[[-12.5,.5],[-12.5,8.5],38]]){
 assert(N.clear(get,...[s[0],y,s[1]]));const route=N.path(get,s,t,y);assert(route.length,'route exists');assert(Math.hypot(...route.at(-1).map((v,i)=>v-t[i]))<1,'reaches destination');for(const p of route)assert(N.clear(get,p[0],y,p[1]));
}
const grid=(x,y,z)=>y===0?3:y===1&&x===2&&z!==3?222:0;
const route=N.path(grid,[.5,.5],[4.5,.5],1);assert(route.some(p=>p[1]===3.5),'detours through fence opening');assert(route.every(p=>N.clear(grid,p[0],1,p[1])));
const closed=(x,y,z)=>y===0?3:y===1&&x===2?222:0;assert(N.path(closed,[.5,.5],[4.5,.5],1).every(p=>p[0]<2),'cannot cross closed fence');
const ledge=(x,y,z)=>y===0&&x<2?3:0;assert(!N.clear(ledge,2.5,1,.5),'no walking off wall');
console.log('Castle access and navigation tests passed');

const sentry={x:2.5,z:3.5,home:[2.5,3.5],duty:'guard',archer:false};
assert.deepEqual(N.duty(sentry,null,Infinity),{state:'guard',goal:null});
assert.equal(N.duty(sentry,{x:7,z:3},5).state,'defend');
assert.equal(N.duty(sentry,{x:3,z:3},1).goal,null);
sentry.x=5.5;assert.deepEqual(N.duty(sentry,null,Infinity),{state:'return',goal:sentry.home});
sentry.x=2.5;assert.equal(N.duty(sentry,null,Infinity).state,'guard');
assert.equal(N.duty({...sentry,archer:true},{x:7,z:3},5).goal,null);
assert.deepEqual(N.duty({...sentry,duty:'patrol',route:[[1,2],[3,4]],index:1},null,Infinity),{state:'patrol',goal:[3,4]});
console.log('Guard duty, combat and return tests passed');
