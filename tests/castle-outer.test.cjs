const assert=require('node:assert/strict'),Town=require('../src/client/city/castle-town.js'),Core=require('../src/client/core/core.js');
const blocks=new Map(Town.outerTown().map(e=>[e.slice(0,3).join(','),e[3]])),get=(x,y,z)=>blocks.get(`${x},${y},${z}`)||0;
for(const z of [-40,80])for(let x=-3;x<=3;x++)for(let y=31;y<=35;y++)assert.equal(get(x,y,z),0,'open main gate');
for(const x of [-42,56])for(let z=25;z<=27;z++)for(let y=31;y<=35;y++)assert.equal(get(x,y,z),0,'open side gate');
for(let z=75;z<=85;z++)for(let x=-3;x<=3;x++)assert.equal(get(x,30,z),52,'continuous avenue');
for(const x of [-7,7])for(let y=31;y<=36;y++)assert(Core.ladderSupported(get,x,y,78),'supported ladder');
for(const [x,z] of [[-36,30],[-36,44],[-36,58],[30,14],[30,27],[32,68]])assert.equal(get(x+3,31,z+6),60,'house entrance');
const roof=(x,y,z)=>y===1&&x===1&&z===0?55:0;
assert.equal(Core.roofHeight(roof,0,0,0,1,.5),1);assert.equal(Core.roofHeight(roof,0,0,0,0,.5),.04);assert.equal(Core.roofHeight(roof,0,0,0,.5,.5),.5);
console.log('Outer gates, avenue, ladders, six homes and roof profiles passed');
const fs=require('node:fs'),vm=require('node:vm'),Nav=require('../src/client/city/guard-navigation.js');
const source=fs.readFileSync('src/client/city/castle-guards.js','utf8');
const routes=vm.runInNewContext(source.match(/const outerRoutes=(\[.*?\]);/)[1]);
assert.equal(routes.length,8);
for(const route of routes){assert(Nav.clear(get,...[route[0][0],37,route[0][1]]));assert(Nav.path(get,route[0],route[1],37).length>0,'wall patrol route reachable');}
console.log('Eight outer-wall patrol routes reachable');
