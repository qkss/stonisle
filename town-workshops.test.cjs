const assert=require('node:assert/strict'),W=require('./town-workshops.js'),C=require('./core.js'),E=require('./exploration-castles.js'),Craft=require('./city-crafts.js');
for(const type of E.TYPES){
 const site={...type,id:type.name,x:160,z:160,base:type.blueprint===298?2:type.blueprint===296?48:30};
 const cells=W.plan(site),map=new Map(cells.map(q=>[q.slice(0,3).join(','),q[3]]));
 assert(cells.length>0);assert(cells.every(([x,y,z,id])=>y>=0&&y<C.H&&(id===0||C.BLOCKS[id])));
 assert(cells.every(([x,y,z])=>x>=site.x+33&&x<=site.x+49&&z>=site.z+7&&z<=site.z+24),'keeps main avenue and gates clear');
 for(let z=15;z<=24;z++)for(let y=1;y<=2;y++){const key=[site.x+41,site.base+y,site.z+z].join(',');assert(!map.get(key),'walkable entrance '+key);}
 const g={p:{x:site.x+41.5,y:site.base+1,z:site.z+17.1},exploration:{sites:[site]},guardState:{cities:{[site.id]:{owned:true}}}};
 assert(Craft.canCraft(g,site.name));assert(!Craft.canCraft({...g,guest:true},site.name));g.guardState.cities[site.id].owned=false;assert(!Craft.canCraft(g,site.name));
 const world=new C.World(E.generator([site]));assert.equal(world.get(site.x+34,site.base+2,site.z+8),W.specs[site.name].trim);assert.equal(world.get(site.x+41,site.base+1,site.z+21),0);
}
console.log('Five workshop plots, material IDs, world heights, avenue clearance, entrances, generated buildings and ownership gates passed.');
