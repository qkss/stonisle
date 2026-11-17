const assert=require('assert'),P=require('./mob-physics.js');
const make=()=>({x:0,y:0,z:.5,a:0,vy:0,ground:true,bounds:{min:[-.3,0,-.45],max:[.3,1.2,.45]}});
const floor=(x,y,z)=>y<0?3:0;
for(const dt of [1/60,.05]){
  const step=(x,y,z)=>y<0||(x>=2&&y===0)?3:0,m=make();
  for(let i=0;i<Math.ceil(3/dt);i++){P.step(m,2,0,dt,step);assert.ok(!P.intersects(m,step),'跳台阶全程不与方块相交');}
  assert.ok(m.x>3&&Math.abs(m.y-1)<.03,'完整跳上一格台阶 '+JSON.stringify(m));
}
const wall=(x,y,z)=>y<0||(x>=2&&y<4)?3:0;
for(const bounds of [
  {min:[-.2,0,-.3],max:[.2,.82,.4]},
  {min:[-.3,-.035,-.6],max:[.3,2.2,1.04]},
  {min:[-.18,0,-1.035],max:[.18,1.23,.9]},
]){
  const large=make();large.bounds=bounds;large.y=-bounds.min[1];large.a=Math.PI/2;
  const stairs=(x,y,z)=>y<0||(x>=2&&y===0)?3:0;
  for(let i=0;i<240;i++){P.step(large,2,0,1/60,stairs);assert.ok(!P.intersects(large,stairs),'兔/鹿/放大狼完整体积不穿模');}
  assert.ok(large.x>3,'不同大小动物均可完成跳台阶');
}
const m=make();for(let i=0;i<120;i++)P.step(m,5,0,1/60,wall);
assert.ok(m.x<=1.7001&&!P.intersects(m,wall),'高墙不能穿越');
const ceiling=(x,y,z)=>y<0||y===2||(x>=2&&y===0)?3:0;
const low=make();for(let i=0;i<120;i++)P.step(low,2,0,1/60,ceiling);
assert.ok(low.x<=1.7001&&!P.intersects(low,ceiling),'低顶下不能跳穿天花板');
const knock=make();P.move(knock,'x',12,wall);assert.ok(knock.x<=1.7001,'高速击退不穿墙');
const fall=make();fall.y=5;P.move(fall,'y',-10,floor);assert.ok(Math.abs(fall.y)<.001,'长距离下落不穿地');
const water=(x,y,z)=>x>=2&&y===-1?5:floor(x,y,z),wet=make();
for(let i=0;i<120;i++)P.step(wet,2,0,1/60,water);
assert.ok(wet.x<1.71,'整个身体在岸边停下');
const target=make();target.z=3;
assert.ok(Math.abs(P.ray(target,[0,.8,0],[0,0,1],4)-2.55)<1e-9,'正前方命中');
assert.notEqual(P.ray(target,[.3,.8,0],[0,0,1],4),null,'射线平行且贴边时不产生 NaN');
assert.equal(P.ray(target,[.31,.8,0],[0,0,1],4),null,'平行射线在框外不命中');
assert.equal(P.ray(target,[0,.8,0],[0,0,1],2),null,'墙体或射程限制遮挡目标');
target.bounds.max[2]=1.1;target.a=Math.PI/2;
assert.notEqual(P.ray(target,[.9,.8,0],[0,0,1],4),null,'转向后的头部也可以被击中');
assert.equal(P.ray(target,[0,1.21,0],[0,0,1],4),null,'模型高度外不命中');
console.log('动物台阶、墙体、低顶、击退、落地和攻击射线测试通过');
