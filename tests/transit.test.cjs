const assert=require('node:assert/strict'),T=require('../src/client/machines/transit-core.js');
const world=new Map(),set=(x,y,z,id)=>world.set([x,y,z].join(','),id),get=(x,y,z)=>world.get([x,y,z].join(','))||0;
set(0,10,-5,601);let r=T.trace(get,{x:0,y:10,z:0},0,16);assert.equal(r.segments.length,2);assert.equal(r.segments[0].length,5);assert.equal(r.segments[1].length,16);assert.equal(r.segments[1].dir,1);assert.ok(r.cells.some(p=>p[0]===16&&p[2]===-5));assert.ok(!r.cells.some(p=>p.join(',')==='0,10,-5'));
set(5,10,-5,603);r=T.trace(get,{x:0,y:10,z:0},0,16);assert.ok(r.segments.length<=16);assert.equal(r.truncated,true);
world.clear();for(const [x,y,z] of [[0,10,0],[0,10,-1],[1,10,-1],[2,11,-1]])set(x,y,z,610);
assert.equal(T.next(get,{x:0,y:10,z:0},null,0).z,-1);assert.equal(T.next(get,{x:0,y:10,z:-1},'0,10,0',0).x,1);assert.equal(T.next(get,{x:1,y:10,z:-1},'0,10,-1',1).y,11);
assert.ok(T.clear(get,.5,10,.5));set(0,11,0,3);assert.equal(T.clear(get,.5,10,.5),false);
for(const id of [600,601,602,603,604,605,610])assert.ok(T.parts(id,get,0,10,0).flat().every(Number.isFinite));
console.log('Transit: full-range relay turning, relay preservation/cycle termination, rail corners/slopes, obstacle clearance and model coordinates passed');

world.clear();set(0,10,0,610);set(0,10,1,610);set(1,10,0,610);const curved=T.parts(610,get,0,10,0),steel=curved.filter(q=>q[6]===123);assert.equal(steel.length,96);assert.ok(new Set(steel.map(q=>q[8].toFixed(3))).size>10,'curve has continuous changing tangents');assert.ok(curved.every(q=>q[6]!==65),'rail never uses quartz');console.log('Rail geometry: curved tangents, twin steel rails and separate tread surfaces passed');
