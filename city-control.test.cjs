const assert=require('node:assert/strict'),C=require('./core.js'),R=require('./city-rules.js'),E=require('./exploration-castles.js');global.Core=C;
const state={},r=R.record(state,'a');assert.equal(r.owned,false);r.owned=true;assert.equal(R.record(JSON.parse(JSON.stringify(state)),'a').owned,true);
const c={elapsed:0},valid={near:true,alive:true,playing:true,hurt:false};for(let n=0;n<299;n++)assert.equal(R.tick(c,.1,valid),false);assert(R.tick(c,.1,valid)||R.tick(c,.1,valid));
for(const invalid of [{near:false},{alive:false},{playing:false},{hurt:true}]){c.elapsed=29;assert.equal(R.tick(c,.1,{...valid,...invalid}),false);assert.equal(c.elapsed,0);}
const inv={292:2};assert(R.mint(inv));assert.deepEqual(inv,{292:1,297:10});assert(R.mint(inv));assert(!R.mint(inv));assert.equal(inv[297],20);
const a={hp:0,maxHP:40,archer:false,home:[1,2],duty:'guard'};assert(!R.hire(inv,a,1,true,true));inv[297]=100;assert(!R.hire(inv,a,1,false,true));assert(!R.hire(inv,a,1,true,false));assert.equal(inv[297],100);assert(R.hire(inv,a,1,true,true));assert.equal(inv[297],75);assert.equal(a.hp,40);assert(!R.hire(inv,a,1,true,true));assert.equal(inv[297],75);
const sites=E.plan(20261115),sea=sites[4],w=new C.World(E.generator(sites));assert(sea.x>2500);assert(sea.base<C.SEA-10);assert.equal(w.get(sea.x,sea.base+11,sea.z-9),196);
const N=require('./guard-navigation.js');for(const site of sites){const flag=R.flag(site);assert(N.clear((...p)=>w.get(...p),flag.x,flag.y,flag.z),'walkable flag platform '+site.name);}
for(let y=sea.base+1;y<=25;y++)assert(C.ladderInfo(w.get(sea.x,y,sea.z+86)),'surface ladder '+y);
assert.equal(w.get(sea.x+20,21,sea.z+25),5,'sea above glazed roof');assert.equal(w.get(sea.x,sea.base+1,sea.z+25),0,'dry central avenue');
for(let x=-11;x<=11;x++)for(let z=-18;z<=5;z++)assert.equal(w.get(sea.x+x,21,sea.z+z),282,'palace rooftop sealed above flag and stairs');
for(let x=-54;x<=68;x+=6)for(let z=-52;z<=92;z+=6){let glass=false;for(let y=sea.base+10;y<=22;y++)if(w.get(sea.x+x,y,sea.z+z)===282)glass=true;assert(glass||(x===0&&z===86),'sealed underwater roof outside dry access shaft');}
assert(C.BLOCKS[R.MINT]);assert(C.shapeBoxes(R.MINT).length>4);
console.log('Occupation interruption, persistence, mint economy, recruitment, fifth city, dry dome, roof access and surface ladder passed');
