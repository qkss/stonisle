const assert=require('assert'),{World,CH,H,STONE,raycast}=require('../src/client/core/core.js');
const w=new World(()=>new Uint8Array(CH*CH*H)),get=(x,y,z)=>w.get(x,y,z);
w.set(0,2,5,STONE);
assert.equal(raycast(get,[.5,2.5,.5],[0,0,1],4),null,'4.5 格之外不可操作');
w.set(0,2,4,STONE);
assert.equal(raycast(get,[.5,2.5,.5],[0,0,1],4).t,3.5,'范围内可操作');
assert.equal(raycast(get,[.5,2.5,0],[0,0,1],4).t,4,'边界 4 格允许操作');
assert.equal(raycast(get,[.5,2.5,-.01],[0,0,1],4),null,'超过边界不可操作');
console.log('4 格交互射线边界测试通过');
