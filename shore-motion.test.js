const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),Core=require('./core'),Shore=require('./shore-motion');
// Exercise the same standing-body collision query used by game.js.
const source=fs.readFileSync('game.js','utf8'),query=source.slice(source.indexOf('  function hits(at=p)'),source.indexOf('  function move(a,d)'));
function fixture(get){const ctx={Core,W:.3,PH:1.8,world:{get},solid:id=>id!==0&&id!==5&&!Core.PASS.has(id)};vm.createContext(ctx);vm.runInContext(query,ctx);return ctx.hits;}
for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){
 const bank=(x,z)=>dx?dx*x>=1:dz*z>=1;
 const get=(x,y,z)=>bank(x,z)&&y<3?4:y<2?5:0;
 const p={x:dx>0?.7:dx<0?.3:.5,y:1.45,z:dz>0?.7:dz<0?.3:.5};
 assert(Shore.tryExit(get,p,dx,dz,2,fixture(get)),'exit each bank direction');assert(Math.abs(p.y-3.002)<.001);
}
const p={x:.7,y:1.45,z:.5};
for(const [name,get,surface] of [
 ['high wall',(x,y)=>x>=1&&y<5?4:y<2?5:0,2],
 ['low ceiling',(x,y)=>y===4||x>=1&&y<3?4:y<2?5:0,2],
 ['deep underwater',(x,y)=>x>=1&&y<4?4:y<4?5:0,4],
 ['no bank',()=>0,2]]){
 const q={...p};assert(!Shore.tryExit(get,q,1,0,surface,fixture(get)),name);assert.deepEqual(q,p,'failed mantle leaves position unchanged');
}
console.log('Shore exit: four directions, high wall, ceiling, deep water and missing support passed');
