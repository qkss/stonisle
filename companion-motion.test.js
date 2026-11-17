const assert=require('assert'),m=require('./companion-motion');
const wall=(x,y,z)=>y<0||x===2?3:0;
assert.equal(m.clear(wall,[1.8,1,0]),false,'翅膀体积也参与碰撞');
const stop=m.move(wall,[0,1,0],[4,1,0]);assert.ok(stop[0]<1.58&&m.clear(wall,stop),'高速移动不穿墙');
const floor=(x,y,z)=>y<1?3:0;
const down=m.move(floor,[0,3,0],[0,-2,0]);assert.ok(down[1]>=1.43,'不穿过地面');
const lifted=m.free(floor,[0,.5,0]);assert.ok(lifted&&m.clear(floor,lifted),'嵌入地面后恢复安全高度');
assert.equal(m.free(()=>3,[0,0,0]),null,'封闭空间不输出穿模位置');
console.log('宠物完整体积、连续移动、墙体地面与嵌入恢复测试通过');
