const assert=require('assert');
const {World,CH,H,meshChunk,raycast}=require('./core.js');
const world=new World(()=>new Uint8Array(CH*CH*H));
world.set(15,3,2,1);
const grass=meshChunk(world,0,0).grass;
assert.ok(grass.idx.length>126,'草簇有更丰富的草叶覆盖');
assert.equal(grass.wind.length,grass.pos.length/3*2);
assert.ok([...grass.pos,...grass.nor,...grass.uv,...grass.col].every(Number.isFinite));
for(let i=0;i<grass.pos.length/3;i++){
  assert.ok(grass.pos[i*3+1]>=3.6&&grass.pos[i*3+1]<4.4);
  if(grass.wind[i*2]===0)assert.ok(Math.abs(grass.pos[i*3+1]-4)<.02,'草根固定在地表');
}
assert.deepStrictEqual(grass,meshChunk(world,0,0).grass,'区块重建保持草叶形状');
assert.equal(raycast((x,y,z)=>world.get(x,y,z),[15.5,6,2.5],[0,-1,0],4).y,3,'草叶不阻挡方块采集');
for(const cover of [3,5,7]){
  world.set(15,4,2,cover);
  assert.equal(meshChunk(world,0,0).grass.idx.length,0,'实体、水和紧贴的树叶下不长草');
}
world.set(15,4,2,0);
assert.ok([...grass.pos].some((v,i)=>i%3===1&&v<3.8),'边缘草叶自然下垂');
world.set(16,3,2,3);
const sealed=meshChunk(world,0,0).grass;
assert.ok(sealed.idx.length<grass.idx.length,'跨区块实体邻居遮住边缘后不生成垂草');
world.set(15,3,2,2);
assert.equal(meshChunk(world,0,0).grass.idx.length,0,'泥土不生成草叶');
console.log('草叶几何、稳定性、覆盖移除、风摆锚点与采集测试通过');
