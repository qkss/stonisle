const assert=require('assert'),C=require('./core'),M=require('./mining-rules');
for(const w of C.WOODS){
 for(const id of [w.log,w.plank,w.chest,w.slab,w.fence,...Array.from({length:4},(_,i)=>w.door+i),...Array.from({length:4},(_,i)=>w.stairs+i)]){
  assert(C.BLOCKS[id]);assert(C.BLOCKS[id].tiles.every(t=>t<C.ATLAS_TILES));assert(Number.isFinite(M.seconds(id,21)));
  const world=new C.World(()=>new Uint8Array(16*16*64));world.set(2,3,4,id);assert.equal(new C.World(undefined,JSON.parse(JSON.stringify(world.edits))).get(2,3,4),id);
 }
 for(let k=0;k<4;k++){assert.equal(C.doorBase(w.door+k),w.door);assert.equal(C.PASS.has(w.door+k),k>=2);}
 assert(C.isChest(w.chest));
 const slabGet=(x,y,z)=>x===0&&y===0&&z===0?w.slab:0;
 assert.equal(C.raycast(slabGet,[-1,.75,.5],[1,0,0],4),null,'半高上方射线穿过');
 assert.equal(C.raycast(slabGet,[.5,2,.5],[0,-1,0],4).t,1.5,'准确选中半高顶面');
 assert.equal(C.shapeBoxes(w.fence).length,1);
 assert.equal(C.shapeBoxes(w.fence,()=>w.fence).length,9,'四边双横梁');
 for(let k=0;k<4;k++)assert.equal(C.shapeBoxes(w.stairs+k).length,2);
}
const logs=new Set();for(let x=0;x<50;x++)logs.add(C.woodLogAt(x,1));assert.equal(logs.size,4);
console.log('木种ID、保存恢复、开门通行、采集、楼梯朝向、半高选中和栅栏连接测试通过');
const vm=require('vm'),fs=require('fs');
const world=new C.World(()=>new Uint8Array(16*16*64)),elements={};
const el=()=>({addEventListener(){},appendChild(x){return x;},classList:{contains(){return false;}},children:[],innerHTML:''});
const game={world,p:{x:20,y:20,z:20},yaw:0,inv:{},setBlock:(...a)=>world.set(...a),give(id,n){this.inv[id]=(this.inv[id]||0)+n;},renderBag(){}};
const homeCtx={window:{},Core:C,game,Lang:{say(){},item:String},localStorage:{getItem(){return JSON.stringify({chests:{'2,2,2':{3:7}}});},setItem(){}},document:{createElement:el,head:el(),getElementById(id){return elements[id]||(elements[id]=el());}},setInterval(){}};
vm.runInNewContext(fs.readFileSync('home.js','utf8'),homeCtx);const home=homeCtx.window.Home;
for(const w of C.WOODS){
 world.set(0,0,0,3);world.set(0,1,0,0);world.set(0,2,0,0);game.inv[w.door]=2;
 assert(home.use({x:0,y:0,z:0,n:[0,1,0]},w.door));assert.equal(world.get(0,1,0),w.door);assert.equal(game.inv[w.door],1);
 home.use({x:0,y:1,z:0},0);assert.equal(world.get(0,2,0),w.door+2);
 world.set(0,1,0,0);assert.equal(home.dug({x:0,y:1,z:0},w.door+2),w.door);assert.equal(world.get(0,2,0),0);
 assert.equal(home.dug({x:2,y:2,z:2},w.chest),w.chest);
}
assert.equal(game.inv[3],7,'拆箱保留物品');
const src=fs.readFileSync('game.js','utf8'),start=src.indexOf('  function hits()'),end=src.indexOf('  const keys =',start);
const pc={Core:C,p:{x:.5,y:1,z:1.4},v:{y:0},W:.3,PH:1.8,world:{get(x,y,z){return y===0?3:x===0&&y===1&&z===0?217:0;}},solid:id=>id!==0&&id!==5&&!C.PASS.has(id)};
vm.runInNewContext(src.slice(start,end),pc);pc.move('z',-.4);pc.move('y',-.1);assert(Math.abs(pc.p.y-1.5)<.002,'玩家走上半高台阶并落在真实顶面');
console.log('门放置/开关/回收、箱内物品回收及玩家半格步进测试通过');
const volume=boxes=>boxes.reduce((v,q)=>v+(q[3]-q[0])*(q[4]-q[1])*(q[5]-q[2]),0);
for(const w of C.WOODS){
 for(const up of [false,true])for(let dir=0;dir<4;dir++){
  const base=up?w.inverted:w.stairs,id=base+dir,[dx,dz]=[[0,-1],[1,0],[0,1],[-1,0]][dir],perp=(dir+1)%4;
  const outer=(x,y,z)=>x===dx&&y===0&&z===dz?base+perp:0;
  const inner=(x,y,z)=>x===-dx&&y===0&&z===-dz?base+perp:0;
  assert.equal(volume(C.shapeBoxes(id)),.75);
  assert.equal(volume(C.shapeBoxes(id,outer)),.625,'外转角仅保留四分之一凸起');
  assert.equal(volume(C.shapeBoxes(id,inner)),.875,'内转角补成四分之三凸起');
  const incompatible=(x,y,z)=>x===dx&&z===dz?(up?w.stairs:w.inverted)+perp:0;
  assert.equal(volume(C.shapeBoxes(id,incompatible)),.75,'上下楼梯不误连接');
 }
 assert.deepEqual(C.shapeBoxes(w.upperSlab),[[0,.5,0,1,1,1]]);assert.equal(volume(C.shapeBoxes(w.doubleSlab)),1);
 world.set(4,3,4,3);world.set(5,3,4,0);game.inv[w.slab]=4;
 home.use({x:4,y:3,z:4,n:[1,0,0],point:[5,3.8,4.5]},w.slab);assert.equal(world.get(5,3,4),w.upperSlab);
 home.use({x:5,y:3,z:4,n:[0,-1,0],point:[5.5,3.5,4.5]},w.slab);assert.equal(world.get(5,3,4),w.doubleSlab);assert.equal(game.inv[w.slab],2);
 assert.equal(home.dug({x:5,y:3,z:4},w.doubleSlab),w.slab);assert.equal(game.inv[w.slab],3,'合并块额外返还第二块台阶');
 world.set(5,3,4,0);game.inv[w.stairs]=2;
 home.use({x:4,y:3,z:4,n:[1,0,0],point:[5,3.9,4.5]},w.stairs);assert.equal(world.get(5,3,4),w.inverted);
 for(const id of [w.inverted,w.upperSlab,w.doubleSlab]){world.set(7,5,4,id);assert.equal(new C.World(undefined,JSON.parse(JSON.stringify(world.edits))).get(7,5,4),id);assert(Number.isFinite(M.seconds(id,21)));}
}
console.log('四木种/四朝向内外转角、倒置、上半台阶、合并回收与存档测试通过');
