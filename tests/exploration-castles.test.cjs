const assert=require('node:assert/strict'),X=require('../src/client/city/exploration-castles.js'),C=require('../src/client/core/core.js');
const sites=X.plan(20261115);assert.deepEqual(X.plan(20261115),sites);assert.notDeepEqual(X.plan(12),sites);
assert.deepEqual(sites.map(s=>s.name),['云岚城','阗天城','苍云城','黑风城','东海龙宫']);assert.deepEqual(sites.map(s=>s.blueprint),[293,294,295,296,298]);
const blocked={};const first=sites[0];blocked[(first.x>>4)+','+(first.z>>4)]={g:'v2',1:3};assert.notEqual(X.plan(20261115,blocked)[0].x,first.x);
for(let seed=0;seed<50;seed++)assert.equal(X.plan(seed).length,5);
const world=new C.World(X.generator(sites));
for(const site of sites){assert.equal(world.get(site.x,(site.base||30)+11,site.z-9),196);if(site.blueprint!==298)assert.equal(world.get(site.x,(site.base||30)+9,site.z+18),site.wall);assert.equal(world.get(site.x,(site.base||30)+1,site.z+17),0);}
world.set(first.x,41,first.z-9,0);const restored=new C.World(X.generator(JSON.parse(JSON.stringify(sites))),JSON.parse(JSON.stringify(world.edits)));assert.equal(restored.get(first.x,41,first.z-9),0,'destroyed chest stays destroyed');
const a=X.generator(sites),b=X.generator(sites);for(const s of [...sites].reverse()){const cx=s.x>>4,cz=s.z>>4;assert.deepEqual(a(cx,cz,2),b(cx,cz,2),'chunk order independent');}
console.log('Four seeded castles, unique rewards, protected edits, stable reload and chunk order passed');
const signatures=[];
for(let i=0;i<4;i++){
 const spec=X.guardSpec(i+1);assert.equal(spec.melee+spec.archers,8+i*4);if(i)assert(spec.range>X.guardSpec(i).range);
 const data=X.getTemplate(X.TYPES[i]),map=new Map(data.map(e=>[e.slice(0,3).join(','),e[3]]));signatures.push(data.filter(e=>e[3]&&e[1]>=44).length);
 assert.equal(map.get('0,41,-9'),196);assert.equal(map.get('0,31,17'),0);
 const s=sites[i];for(const [dx,dz] of [[-50,0],[64,0],[0,-48]]){assert.equal(world.get(s.x+dx,s.base||30,s.z+dz),s.blueprint===296?15:1);for(let y=(s.base||30)+1;y<C.H;y++)assert.equal(world.get(s.x+dx,y,s.z+dz),0,'flat defensive clearance');}
}
assert.equal(new Set(signatures).size,4,'four different roof/tower silhouettes');
console.log('Four distinct silhouettes, guard tiers and flat defensive clearances passed');

const snow=sites[3];assert(snow.z<-2200);assert(snow.base>=48);assert.equal(C.biomeAt(snow.x,snow.z),2);
for(const s of sites){assert.notEqual(world.get(s.x+56,s.base,s.z+50),0);if(s.blueprint!==298)assert.equal(world.get(s.x+9,s.base+1,s.z+34),60);}
console.log('Full residential towns, outer walls and northern summit site passed');

const Nav=require('../src/client/city/guard-navigation');for(const site of sites){const posts=X.gateSquads(site.x,site.z,site.base);assert.equal(posts.length,24);for(const team of ['南门','北门','东门','西门'])assert.equal(posts.filter(p=>p[4]===team).length,6);for(const [x,y,z] of posts)assert(Nav.clear((...p)=>world.get(...p),x,y,z),'gate squad has solid footing and free body space');}
console.log('All four gate squads have six guards and safe, unobstructed positions');

for(const site of sites.filter(s=>s.blueprint!==298))for(const [dx,dz] of [[-42,0],[56,0],[0,-40],[0,80],[-42,-40],[56,80]])for(let y=site.base-20;y<site.base;y++)assert.equal(world.get(site.x+dx,y,site.z+dz),site.blueprint===295?81:site.blueprint===296?92:10,'continuous twenty-block underground curtain wall');
console.log('Twenty-block wall foundations verified on all sides, gates and corners');
