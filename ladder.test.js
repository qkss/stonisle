const assert=require('assert'),C=require('./core'),L=require('./ladder-motion'),M=require('./mining-rules');
for(const w of C.WOODS)for(let d=0;d<4;d++){
 const id=w.ladder+d,info=C.ladderInfo(id),n=info.normal;
 const get=(x,y,z)=>x===0&&z===0&&y>=0&&y<5?id:x===-n[0]&&z===-n[2]&&y>=0&&y<5?3:0;
 const p={x:.5+n[0]*-.2,y:1,z:.5+n[2]*-.2};
 assert(C.PASS.has(id));assert.equal(C.shapeBoxes(id).length,6);assert(C.ladderSupported(get,0,1,0));
 assert(L.contact(get,p));assert(!L.contact(()=>0,p));assert(!L.contact(get,{...p,x:4,z:4}));
 const control=new L.Controller();assert.equal(control.update(.016,get,p,1,false).vy,2.6);assert.equal(control.update(.016,get,p,-1,false).vy,-2.6);assert.equal(control.update(.016,get,p,0,false).vy,0);
 assert(control.update(.016,get,p,0,true).jump);assert.equal(control.update(.1,get,p,0,false),null);assert.equal(control.update(.31,get,p,0,false).vy,0);
 const world=new C.World(()=>new Uint8Array(16*16*64));world.set(1,3,1,id);assert.equal(new C.World(undefined,JSON.parse(JSON.stringify(world.edits))).get(1,3,1),id);
 assert(Number.isFinite(M.seconds(id,21)));assert(C.BLOCKS[id].tiles.every(t=>t<C.ATLAS_TILES));
}
console.log('四木种四方向爬梯模型、贴墙检测、上下攀爬、停住、跳离冷却、回存档测试通过');
