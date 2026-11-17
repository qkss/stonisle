const assert=require('assert'),vm=require('vm'),fs=require('fs');
class V {constructor(x=0,y=0,z=0){Object.assign(this,{x,y,z});}copy(p){Object.assign(this,p);return this;}distanceToSquared(p){return (this.x-p.x)**2+(this.y-p.y)**2+(this.z-p.z)**2;}}
class Light {constructor(c,i,d){this.intensity=i;this.distance=d;this.position=new V();this.shadow={mapSize:{set(){}},camera:{}};}}
const ctx={window:{},THREE:{PointLight:Light,Vector3:V}};vm.runInNewContext(fs.readFileSync('src/client/world/world-lighting.js','utf8'),ctx);
const world={get:(x,y,z)=>y===10?3:0},scene={add(){}},light=new ctx.window.WorldLighting(scene,world);
assert.equal(light.skyAt(0,5,0),.015);assert.equal(light.skyAt(0,11,0),1);
world.get=(x,y,z)=>y===10?50:0;assert.equal(light.skyAt(0,5,0),1,'玻璃透天光');
world.get=()=>0;assert.equal(light.skyAt(0,0,0),1);
for(let i=0;i<100;i++){light.update(.016,true,new V(),0);assert.ok(light.torch.intensity>1.27&&light.torch.intensity<1.53,'闪烁幅度小且连续');}
light.update(.016,false,new V(),0);assert.equal(light.torch.intensity,0,'切走火把立即关闭光源');assert.equal(light.torch.distance,12);
light.update(.016,true,new V(),1);assert.ok(light.torch.intensity>.12&&light.torch.intensity<.16,'露天白天火把降到约一成');
world.get=(x,y,z)=>y===10?3:0;light.update(.016,true,new V(),1);assert.ok(light.torch.intensity>1.27,'白天有屋顶的洞穴火把不减亮');
world.get=()=>0;
assert.equal(light.torch.shadow.camera.far,light.torch.distance,'阴影覆盖完整照明范围');
assert.ok(Math.pow(1-4/light.torch.distance,light.torch.decay)>.5,'四格距离仍保留一半以上光强');
assert.equal(light.add('held-torch'),light.torch,'同名光源复用');
const mounted=new V(0,0,0);mounted.torch=true;light.lampChunks.set('torch:test',[mounted]);
light.update(.016,false,new V(),0);assert.equal(light.placed[0].distance,14);assert.equal(light.placed[0].decay,1);assert.ok(light.placed[0].intensity>1,'放置火把独立照明');
light.update(.016,false,new V(),1);assert.ok(light.placed[0].intensity<.13,'露天白天墙上火把同样减亮');
world.get=(x,y,z)=>y===10?3:0;light.update(.016,false,new V(),1);assert.ok(light.placed[0].intensity>1,'白天洞穴的放置火把仍然明亮');
light.lampChunks.clear();light.update(.016,false,new V(),0);assert.equal(light.placed[0].intensity,0,'移除后关闭放置光源');
// 遮挡处的散射光：旁边 3 格内有露天的地方就不是全黑
world.get=(x,y,z)=>y===10&&x===0&&z===0?6:0;assert.equal(light.skyAt(.5,5,.5),.55,'一根树枝下面：四周露天，55%');
world.get=(x,y,z)=>y===10&&Math.abs(x)<=1&&Math.abs(z)<=1?6:0;assert.equal(light.skyAt(.5,5,.5),.32,'3×3 遮挡的正中间：32%');
world.get=(x,y,z)=>y===10&&x>=0?3:0;assert.equal(light.skyAt(2.5,5,.5),.2,'屋檐往里第 3 格：20%');assert.equal(light.skyAt(3.5,5,.5),.015,'屋檐往里第 4 格：全黑');
world.get=()=>0;
console.log('天空遮挡、玻璃透光、火把范围、闪烁幅度与切换测试通过');
// Lava emits real warm light, is capped for large pools, and disappears after removal.
const lavaData=new Uint16Array(16*16*64);lavaData[2+2*16+4*256]=287;lavaData[6+2*16+4*256]=287;
world.chunk=()=>lavaData;world.get=(x,y,z)=>y===4&&z===2&&(x===2||x===6)?287:0;
light.chunk(0,0);light.update(.016,false,new V(3,5,3),0);
assert(light.lavaLights[0].intensity>1.7);assert.equal(light.lavaLights[0].distance,11);
const before=light.lavaLights[0].intensity;light.update(.7,false,new V(3,5,3),0);assert.notEqual(light.lavaLights[0].intensity,before);
assert(light.lavaLights.length<=4);light.drop(0,0);light.update(.016,false,new V(3,5,3),0);assert(light.lavaLights.every(l=>l.intensity===0));
console.log('Lava sources, gentle pulse, light budget and removal passed');
