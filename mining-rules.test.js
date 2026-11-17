const assert=require('assert');
const {seconds,advance}=require('./mining-rules.js');
const {BLOCKS}=require('./core.js');
for(let b=1;b<BLOCKS.length;b++){
  if(b===5||!BLOCKS[b])continue; // 方块编号不连续：16–49 留给工具和物品
  for(const tool of [0,20,21,22,23,24,25,26,30,3])assert.ok(Number.isFinite(seconds(b,tool))&&seconds(b,tool)>=.12,'可挖方块与全部工具均有有效耗时');
}
for(const b of [3,9,10,11,12,13,14]){
  assert.ok(seconds(b,25)<seconds(b,20)&&seconds(b,20)<seconds(b,0),'铁镐 > 石镐 > 空手');
  assert.ok(seconds(b,23)>seconds(b,0),'剑不是采矿工具');
}
for(const [b,best] of [[1,22],[2,22],[4,22],[15,22],[6,21],[8,21],[7,26]])
  for(const tool of [0,20,21,22,23,25,26])assert.ok(seconds(b,best)<=seconds(b,tool),'材质对应工具最快');
assert.ok(seconds(14,20)>seconds(12,20)&&seconds(12,20)>seconds(11,20),'矿物硬度递增');
assert.ok(seconds(6,0)<=3&&seconds(3,0)<=5,'空手可获得初始石工具所需材料');
assert.equal(seconds(3,24),seconds(3,0),'火把无挖掘加成');
for(const b of [0,5,999])assert.equal(seconds(b),Infinity);
const half=advance(0,3,0,seconds(3,0)/2);
assert.ok(Math.abs(half-.5)<1e-9);
assert.equal(advance(half,3,25,0),half,'换工具不跳进度');
assert.ok(Math.abs(advance(half,3,25,seconds(3,25)/4)-.75)<1e-9,'仅后续工作按新工具计速');
let simulated=0;for(let i=0;i<60;i++)simulated=advance(simulated,12,20,1/60);
assert.ok(Math.abs(simulated-1/seconds(12,20))<1e-9,'不同帧率累计工作量一致');
assert.equal(advance(.99,3,25,1),1,'完成进度封顶');
const {DamageStore}=require('./mining-rules.js');
const store=new DamageStore(),a={x:-1,y:12,z:3},b={x:2,y:12,z:3};
assert.equal(store.dig(a,3,0,seconds(3,0)*.4),.4);
store.dig(b,6,21,seconds(6,21)*.2);
assert.equal(store.get(a,3),.4,'换目标后保留原方块的进度');
assert.ok(Math.abs(store.dig(a,3,25,seconds(3,25)*.3)-.7)<1e-9,'换工具回来继续累计');
const restored=new DamageStore(JSON.parse(JSON.stringify(store.records)));
assert.ok(Math.abs(restored.get(a,3)-.7)<1e-9,'存档恢复裂纹进度');
assert.equal(restored.get(b,8),0,'方块类型变化不继承旧损伤');
restored.clear(a.x,a.y,a.z);
assert.equal(restored.get(a,3),0,'挖掉再放同种方块也必须清空');
assert.equal(Object.keys(new DamageStore({bad:{x:0,y:1,z:0,id:3,progress:NaN}}).records).length,0,'忽略无效存档损伤');
console.log('挖掘平衡、换工具与跨目标/存档持久进度测试通过');
