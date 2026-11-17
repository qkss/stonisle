const assert=require('node:assert/strict'),R=require('./quantum-railgun-core.js'),Core=require('./core.js');
assert.deepEqual(R.tiers.map(t=>t.range),[16,32,64,100]);
const all=[];
for(let rank=0;rank<4;rank++)for(let dir=0;dir<6;dir++){
 const id=R.encode(rank,dir),t=R.tiers[rank];all.push(id);assert.equal(R.tier(id),t);assert.equal(R.direction(id),dir);assert.equal(R.canonical(id),t.base);
 const p=R.cells(10,40,10,id),d=R.DIRS[dir];assert.equal(p.length,t.range*4);assert.equal(new Set(p.map(p=>p.join(','))).size,t.range*4);assert(!p.some(p=>p.join(',')==='10,40,10'));
 const depths=p.map(p=>(p[0]-10)*d[0]+(p[1]-40)*d[1]+(p[2]-10)*d[2]);assert.equal(Math.min(...depths),1);assert.equal(Math.max(...depths),t.range);assert.equal(Core.BLOCKS[id].name,t.name+'量子轨道炮');
 for(const q of R.parts(id))for(let a=0;a<3;a++){assert(q[a]>=0&&q[a+3]<=1);assert(q[a]<q[a+3]);}assert.deepEqual(Core.shapeBoxes(id),R.parts(id));
}
assert.equal(new Set(all).size,24);for(const id of [459,466,467,468,469,488,NaN])assert.equal(R.tier(id),null);
for(const args of [[-1,0],[4,0],[0,6],[1,1.5]])assert.equal(R.encode(...args),null);assert.equal(R.canonical(466),466);
for(let i=1;i<4;i++)assert(R.parts(R.tiers[i].base).length>R.parts(R.tiers[i-1].base).length);
const inv={135:5,466:4,267:5},before={...inv};assert(!R.pay(inv));assert.deepEqual(inv,before);inv[466]=5;assert(R.pay(inv));assert.deepEqual(inv,{135:0,466:0,267:0});assert(!R.pay(inv));assert.deepEqual(R.cells(0,0,0,400),[]);
const data=new Uint16Array(Core.CH*Core.CH*Core.H);all.forEach((id,i)=>data[(i%12+2)+(Math.floor(i/12)+2)*Core.CH+40*Core.CH*Core.CH]=id);const world={chunk:()=>data,get:(x,y,z)=>x>=0&&x<16&&z>=0&&z<16&&y>=0&&y<96?data[x+z*16+y*256]:0},mesh=Core.meshChunk(world,0,0);assert(mesh.solid.pos.length>0);assert(mesh.solid.pos.every(Number.isFinite));
console.log('Railgun: four tiers × six directions, 16/32/64/100 range, unique cells, canonical tier, ornament geometry, atomic cost and world mesh passed');
for(let i=0;i<4;i++){const id=R.tiers[i].base,n=[5,10,20,30][i];assert.deepEqual(R.cost(id),{135:n,466:n,267:5});for(const missing of [135,466,267]){const inv={135:n,466:n,267:5};inv[missing]--;const before={...inv};assert(!R.affordable(inv,id));assert(!R.pay(inv,id));assert.deepEqual(inv,before);}const inv={135:n+2,466:n+1,267:8};assert(R.pay(inv,id+5));assert.deepEqual(inv,{135:2,466:1,267:3});}assert.equal(R.cost(466),null);assert(!R.pay({135:99,466:99,267:99},466));console.log('Tier crystal costs 5/10/20/30, fixed powder 5 and atomic insufficient payment passed');
const map=new Map(),k=(x,y,z)=>[x,y,z].join(','),get=(x,y,z)=>map.get(k(x,y,z))||0,commit=list=>list.forEach(([x,y,z,id])=>id?map.set(k(x,y,z),id):map.delete(k(x,y,z)));
for(const t of R.tiers)for(let d=0;d<6;d++){
 const h={x:20,y:40,z:20},id=t.base+d,fp=R.footprint(h,id);assert.equal(fp.length,2);assert.equal(R.primaryId(fp[1].id),id);assert(R.isSecondary(fp[1].id));map.clear();const plan=R.planPlace(get,h,id);assert.equal(plan.length,2);commit(plan);assert.deepEqual(R.resolve(get,fp[1]),{...h,id});
 const removal=R.expandEdits(get,[[fp[1].x,fp[1].y,fp[1].z,0]]);assert.equal(removal.length,2);commit(removal);assert.equal(map.size,0);
 map.clear();map.set(k(fp[1].x,fp[1].y,fp[1].z),3);assert.equal(R.planPlace(get,h,id),null);assert.equal(map.size,1);map.clear();assert.equal(R.planPlace(get,h,id,[fp[1].x+.1,40,fp[1].z+.1,fp[1].x+.8,41.8,fp[1].z+.8]),null);
 commit(plan);for(let next=0;next<6;next++){const result=R.planRotate(get,h,t.base+next);assert(result);commit(R.expandEdits(get,result));assert.equal(map.size,2);assert.equal(get(h.x,h.y,h.z),t.base+next);assert.deepEqual(R.resolve(get,R.footprint(h,t.base+next)[1]),{...h,id:t.base+next});}
 const axis=R.DIRS[d],mouth=R.muzzle(h,id),first=R.cells(h.x,h.y,h.z,id).slice(0,4).reduce((s,p)=>s.map((v,i)=>v+(p[i]+.5)/4),[0,0,0]);for(let a=0;a<3;a++)assert(Math.abs(first[a]-mouth[a]-axis[a]*.5)<1e-9);
 for(const half of [id,R.secondaryId(id)])for(const q of R.parts(half))for(let a=0;a<3;a++)assert(q[a]>=0&&q[a+3]<=1&&q[a+3]>q[a]);
 const full=R.wholeParts(id),max=[0,1,2].map(a=>Math.max(...full.map(p=>p[a+3])));assert(max.some(v=>v>1));
}
map.clear();map.set(k(20,40,20),460);assert.equal(R.resolve(get,{x:20,y:40,z:20}).id,460);assert(R.planRotate(get,{x:20,y:40,z:20},460));map.set(k(21,40,20),3);assert.equal(R.planRotate(get,{x:20,y:40,z:20},460),null);
map.clear();commit(R.planPlace(get,{x:20,y:40,z:20},460));map.set(k(20,40,21),3);assert.equal(R.planRotate(get,{x:20,y:40,z:20},461),null);assert.equal(get(21,40,20),500);
console.log('Two-cell occupancy: 24 layouts, blocked placement/rotation, player overlap, either-half removal, legacy repair, clipped meshes and straight muzzle axis passed');
{
 const slots=Array(5).fill(null),bag={135:100,466:5,267:5};
 assert.equal(R.deposit(slots,0,bag,135),64);assert.equal(bag[135],36);
 assert.equal(R.deposit(slots,0,bag,466),0);assert.equal(R.deposit(slots,10,bag,466),0);
 assert.equal(R.autoLoad(slots,bag,460),true);assert.equal(slots[0].n,59);assert.equal(bag[466],0);assert.equal(bag[267],0);
 const before=JSON.stringify([slots,bag]);assert.equal(R.autoLoad(slots,bag,460),false);assert.equal(JSON.stringify([slots,bag]),before);
 assert.deepEqual(R.turn(0,0,'left'),{dir:3,heading:3});assert.deepEqual(R.turn(3,3,'right'),{dir:0,heading:0});
 assert.deepEqual(R.turn(2,0,'up'),{dir:4,heading:2});assert.deepEqual(R.turn(4,2,'down'),{dir:2,heading:2});
 console.log('Supply slots: capacity, item matching, automatic mixed-source payment, atomic shortage and incremental rotation passed');
}

{const slots=Array(10).fill(null),bag={135:21,466:5,267:5};assert.equal(R.deposit(slots,9,bag,135,11),11);assert.equal(bag[135],10);assert.equal(R.autoLoad(slots,bag,460),true);assert.equal(slots[9].n,6);console.log("Tenth slot and half-stack supply consumption passed");}
for(const tier of R.tiers){const p=R.wholeParts(tier.base);assert.ok(p[3][2]>p.at(-2)[5],'mirror must not overlap rail');assert.ok(p[3][4]<p[6][4],'coil and rail top faces must not be coplanar');}
console.log('Mirror/rail separation and coil surface separation passed');
