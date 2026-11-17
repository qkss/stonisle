// Seeded exploration landmarks. Terrain is generated lazily; player edits always win.
(function(root){
 const C=typeof module!=='undefined'?require('../core/core.js'):root.Core;
 const Build=typeof module!=='undefined'?require('./castle-build.js'):root.CastleBuild;
 const Town=typeof module!=='undefined'?require('./castle-town.js'):root.CastleTown;
 const Dragon=typeof module!=='undefined'?require('./dragon-palace.js'):root.DragonPalace;
 const Rules=typeof module!=='undefined'?require('./city-rules.js'):root.CityRules;
 const Workshops=typeof module!=='undefined'?require('./town-workshops.js'):root.TownWorkshops;
 const TYPES=[{name:'云岚城',blueprint:293,wall:10,trim:155},{name:'阗天城',blueprint:294,wall:51,trim:155},{name:'苍云城',blueprint:295,wall:81,trim:94},{name:'黑风城',blueprint:296,wall:92,trim:157},{name:'东海龙宫',blueprint:298,wall:155,trim:57}];
 function guardSpec(level){level=Math.max(1,Math.min(5,level));return {level,melee:4+level*2,archers:level*2,hp:[0,32,48,68,92,112][level],range:[0,24,32,42,54,60][level],damage:[0,4,6,8,11,13][level],arrow:[0,3,5,7,10,12][level],armor:[0,.08,.18,.28,.38,.42][level],equipment:level===1?[40,41,42,125]:level<4?[43,44,45,126]:[127,128,129,131]};}
 function gateSquads(ox=0,oz=0,base=30){const posts=[];for(const [team,gx,gz,axis] of [['南门',0,80,'z'],['北门',0,-40,'z'],['东门',56,26,'x'],['西门',-42,26,'x']])for(const side of [-1,1])for(let row=0;row<3;row++){
  const outward=team==='北门'||team==='西门'?-1:1,dx=axis==='z'?side*5.5:outward*(4.5+row*2),dz=axis==='x'?side*4.5:outward*(4.5+row*2);
  posts.push([ox+gx+dx,base+1,oz+gz+dz,axis==='z'?(outward>0?Math.PI:0):(outward>0?-Math.PI/2:Math.PI/2),team]);
 }return posts;}
 function plan(seed,edits={}){
  let state=seed>>>0;const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
  return TYPES.map((t,i)=>{let x,z,ok=false;
   for(let n=0;n<5000;n++){x=(i%2?-1:1)*(640+Math.floor(random()*1400));z=(i<2?-1:1)*(640+Math.floor(random()*1400));if(i===3){x=Math.floor((random()-.5)*5000);z=-2200-Math.floor(random()*2200);}if(i===4){x=2600+Math.floor(random()*3000);z=Math.floor((random()-.5)*4800);}ok=true;
    for(let cx=(x-(i===4?140:65))>>4;cx<=(x+(i===4?150:79))>>4;cx++)for(let cz=(z-(i===4?140:63))>>4;cz<=(z+(i===4?170:120))>>4;cz++)if(edits[cx+','+cz])ok=false;
    if(i===4){if(C.heightAt(x,z)>C.SEA-4)ok=false;}else if(i===3){if(C.heightAt(x,z)<45||C.biomeAt(x,z)!==2)ok=false;}else for(const dx of [-24,0,24])for(const dz of [-24,0,24]){const h=C.heightAt(x+dx,z+dz);if(h<C.SEA||h>36)ok=false;}
    if(ok)break;
   }if(!ok)throw new Error('No safe castle site found');return {...t,x,z,base:i===4?2:i===3?Math.max(48,C.heightAt(x,z)):30,id:'exploration-'+i};
  });
 }
 const templates=new Map();
 function getTemplate(type){
  if(templates.has(type.name))return templates.get(type.name);
  if(type.blueprint===298){const map=new Map();for(const row of [...Dragon.build(),...Workshops.plan({...type,x:0,z:0,base:30})])map.set(row.slice(0,3).join(','),row);return [...map.values()];}
  const cells=new Map(),put=(x,y,z,id)=>{if(y>=0&&y<64)cells.set(`${x},${y},${z}`,[x,y,z,id]);};
  const box=(x,y,z,X,Y,Z,id)=>{for(let a=x;a<=X;a++)for(let b=y;b<=Y;b++)for(let c=z;c<=Z;c++)put(a,b,c,id);};
  Build.build({get:()=>-1,set(x,y,z,id){if(x>=-24&&x<=24&&z>=-25&&z<=27)put(x,y,z,id===10?type.wall:id===155?type.trim:id);}});
  const roof=(x,z,w,d,y)=>{for(let r=0;r<=Math.floor(w/2);r++)box(x-r,y-r,z-r,x+w+r,y-r,z+d+r,55);};
  const hall=(x,z,w,d,wood)=>{box(x,31,z,x+w,35,z+d,wood);box(x+1,31,z+1,x+w-1,35,z+d-1,0);box(x,30,z,x+w,30,z+d,52);box(x+2,31,z+d,x+3,33,z+d,0);for(const X of [x,x+w])for(const Z of [z,z+d])box(X,31,Z,X,36,Z,181);for(let r=0;r<3;r++)box(x-1+r,36+r,z-1,x+w+1-r,36+r,z+d+1,55);put(x+1,31,z+1,67);put(x+1,31,z+2,67);put(x+w-1,32,z+1,59);};
  const pillar=(x,z,y,height,material)=>{box(x,y,z,x,y+height,z,material);put(x,y+height+1,z,59);};
  if(type.blueprint===293){
   // Yunlan: balanced stone keep, four pointed towers and a garden courtyard.
   for(const x of [-9,9]){box(x-2,30,4,x+2,30,11,1);for(const z of [4,11]){box(x-2,31,z,x+2,31,z,155);put(x,32,z,77);}for(const z of [5,10]){box(x,31,z,x,34,z,181);box(x-1,35,z-1,x+1,35,z+1,7);put(x,36,z,7);}}
   for(const x of [-11,11])for(const z of [3,12])pillar(x,z,31,3,181);
  }else if(type.blueprint===294){
   // Tiantian: pale terraced citadel, flat battlement towers, open colonnades.
   for(const [x,z] of [[-14,-14],[14,-14],[-14,16],[14,16]]){box(x-4,44,z-4,x+4,63,z+4,0);box(x-4,44,z-4,x+4,44,z+4,155);for(let d=-4;d<=4;d+=2)for(const side of [-4,4]){put(x+d,45,z+side,91);put(x+side,45,z+d,91);}pillar(x,z,45,2,51);}
   box(-8,46,-12,8,63,3,0);
   for(const [r,y] of [[7,46],[5,49],[3,52]]){box(-r,y,-10,r,y,1,155);for(const x of [-r,r])for(const z of [-10,1])box(x,y+1,z,x,y+2,z,51);}
   box(-2,53,-7,2,58,-3,81);box(-1,54,-6,1,57,-4,0);box(-3,59,-8,3,59,-2,57);put(0,60,-5,58);
   for(const x of [-10,10]){for(const z of [2,6,10])pillar(x,z,31,5,51);box(x-1,37,1,x+1,37,11,155);}
   box(-2,31,6,2,34,10,0);box(-3,30,5,3,30,11,91);box(-1,31,7,1,31,9,155);put(0,32,8,58);
  }else if(type.blueprint===295){
   // Cangyun: timber courts, low pavilions and a tall eastern pagoda.
   box(-18,31,12,-10,63,20,0);box(-18,30,12,-10,30,20,52);hall(-18,12,7,6,94);
   box(10,31,12,18,63,20,0);hall(10,12,7,6,95);
   for(const [x,z] of [[-14,-14],[14,-14]]){box(x-4,44,z-4,x+4,63,z+4,0);for(const y of (x>0?[44,50,56]:[44])){box(x-2,y,z-2,x+2,y+3,z+2,94);box(x-1,y+1,z-1,x+1,y+2,z+1,280);for(let r=0;r<3;r++)box(x-4+r,y+4+r,z-4+r,x+4-r,y+4+r,z+4-r,55);}}
   box(-8,46,-12,8,63,3,0);for(const [y,r] of [[46,8],[51,5]]){box(-r+1,y,-10,r-1,y+2,1,94);for(let k=0;k<3;k++)box(-r-1+k,y+3+k,-12+k,r+1-k,y+3+k,3-k,55);}
   box(-2,31,6,2,34,10,0);box(-8,30,5,-4,30,12,5);box(-9,30,4,-3,30,4,155);box(-9,30,13,-3,30,13,155);box(-9,30,5,-9,30,12,155);box(-3,30,5,-3,30,12,155);box(-9,31,8,-3,31,9,94);
   for(const z of [4,11]){box(7,31,z,7,34,z,181);box(5,35,z-1,9,35,z+1,144);put(7,36,z,144);}
  }else{
   // Heifeng: dark fortress, paired high front towers, forge yard and iron buttresses.
   for(const [x,z] of [[-14,-14],[14,-14],[-14,16],[14,16]]){box(x-4,44,z-4,x+4,63,z+4,0);const top=z>0?54:45;box(x-3,44,z-3,x+3,top,z+3,92);box(x-2,44,z-2,x+2,top-1,z+2,0);for(const X of [x-3,x+3])box(X,42,z-3,X,top,z+3,157);for(let d=-3;d<=3;d+=2)for(const side of [-3,3])put(x+d,top+1,z+side,80);put(x,top+2,z,59);}
   box(-8,46,-12,8,63,3,0);box(-7,46,-11,7,49,2,92);box(-6,46,-10,6,48,1,0);box(-8,50,-12,8,50,3,157);for(let x=-8;x<=8;x+=2){put(x,51,3,80);put(x,51,-12,80);}box(-2,51,-8,2,57,-4,80);put(0,58,-6,59);
   box(-2,31,6,2,34,10,0);box(-10,30,3,10,30,12,157);box(-2,30,3,2,30,15,52);
   hall(-11,3,5,7,92);for(const z of [5,8]){put(-10,31,z,289);put(-8,31,z,56);}box(-10,37,4,-10,44,4,92);
   for(const x of [7,10])for(const z of [4,9]){box(x,31,z,x,33,z,181);put(x,34,z,56);}for(const x of [-4,4]){box(x,31,18,x,38,18,157);put(x,39,19,59);}
  }
  // The landmark is the entire walled settlement, not just its central keep.
  for(const batch of [Town.plan(),Town.expansion(),Town.outerTown(),Town.wallFoundations()])for(const [x,y,z,id] of batch){
   let value=id;
   if(type.blueprint===294){if([8,94,95].includes(id))value=51;if(id===181||id===52)value=155;if(id===55)value=51;}
   if(type.blueprint===295){if(id===10)value=81;if(id===155)value=94;if(id===8)value=95;}
   if(type.blueprint===296){if(id===10)value=92;if(id===155||id===55)value=157;if([8,93,95].includes(id))value=94;if(id===1)value=15;}
   put(x,y,z,value);
  }
  if(type.blueprint===294){
   // Civic plaza and a second northern residential court.
   box(-19,30,-34,19,30,-22,155);for(const x of [-18,18])for(const z of [-32,-27,-22])pillar(x,z,31,5,51);
   for(const x of [-11,5])hall(x,-33,6,7,51);
   box(-24,31,37,-6,40,45,0);box(-24,30,37,-6,30,45,155);for(const x of [-22,-16,-10])pillar(x,41,31,4,51);
  }else if(type.blueprint===295){
   // A waterside market replaces one field; garden lanes and a northern pavilion.
   box(-23,31,37,-6,42,44,0);box(-23,30,37,-6,30,44,5);for(const z of [37,44])box(-24,30,z,-5,30,z,94);for(const x of [-24,-5])box(x,30,37,x,30,44,94);box(-24,31,40,-5,31,41,94);
   hall(-7,-32,12,7,95);for(const [x,z] of [[-30,-25],[28,-25],[-20,69],[23,53]]){box(x,31,z,x,34,z,181);box(x-2,35,z-2,x+2,35,z+2,144);box(x-1,36,z-1,x+1,36,z+1,144);}
  }else if(type.blueprint===296){
   // Barracks line the north, with an industrial yard west of the main avenue.
   for(const x of [-32,-18,10,24])hall(x,-33,8,8,92);
   box(-23,31,37,-6,43,45,0);box(-23,30,37,-6,30,45,157);for(const x of [-21,-15,-9]){put(x,31,39,289);box(x,32,38,x,41,38,92);put(x+1,31,42,56);put(x+2,31,42,197);}
  }
  // Eastern districts use the former empty viewing-hill lot.
  if(type.blueprint===293){
   for(const x of [29,39,48])for(const z of [41,52]){box(x,31,z,x,34,z,181);box(x-2,35,z-2,x+2,35,z+2,145);box(x-1,36,z-1,x+1,36,z+1,145);}box(26,30,46,50,30,47,52);
   for(const x of [27,44])for(let z=-10;z<=8;z++)put(x,31,z,222);for(let x=27;x<=44;x++)for(const z of [-10,8])put(x,31,z,222);put(27,31,0,189);hall(32,-8,7,5,8);
  }else if(type.blueprint===294){
   box(27,30,38,50,30,60,155);for(const x of [28,49])for(const z of [39,45,51,58])pillar(x,z,31,5,51);box(36,31,46,41,31,51,51);box(38,32,48,39,35,49,81);put(38,36,48,58);hall(27,-8,15,7,51);
  }else if(type.blueprint===295){
   box(28,30,39,49,30,59,5);for(const z of [38,60])box(27,30,z,50,30,z,94);for(const x of [27,50])box(x,30,39,x,30,59,94);box(27,31,48,50,31,49,94);hall(35,41,7,6,95);hall(28,-8,14,7,95);
  }else{
   box(27,30,38,50,30,60,157);for(const x of [30,36,42,48])for(const z of [42,54]){box(x,31,z,x,33,z,181);box(x-1,33,z,x+1,33,z,94);put(x,34,z,56);}hall(28,-9,15,9,92);for(const z of [-7,-4])for(const x of [30,34,38]){put(x,31,z,67);put(x,31,z+1,67);}
  }
  // Preserve the common third-floor reward and a clear internal staircase.
  put(0,41,-9,196);
  for(const q of Rules.access({...type,x:0,z:0,base:30}))put(...q);
  for(const q of Workshops.plan({...type,x:0,z:0,base:30}))put(...q);
  const result=[...cells.values()];templates.clear();templates.set(type.name,result);return result;
 }
 function generator(sites){
  const compiled=new Map();
  function parts(s){if(compiled.has(s.id))return compiled.get(s.id);const buckets=new Map(),rise=(s.base||30)-30;
   for(const [x,y,z,id] of getTemplate(TYPES.find(t=>t.name===s.name)||s)){const X=s.x+x,Z=s.z+z,Y=y+rise;if(Y<0||Y>=C.H)continue;const key=(X>>4)+','+(Z>>4);if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push((X&15)+(Z&15)*16+Y*256,id);}
   for(const [key,values] of buckets)buckets.set(key,new Uint32Array(values));compiled.set(s.id,buckets);return buckets;
  }
  return (cx,cz,version)=>{const data=new Uint16Array(C.CH*C.CH*C.H),x0=cx*16,z0=cz*16;data.set(C.genChunk(cx,cz,version));
   for(const s of sites){if(s.x+150<x0||s.x-140>=x0+16||s.z+170<z0||s.z-140>=z0+16)continue;const base=s.base||30;
    if(s.blueprint===298){
     for(let X=x0;X<x0+16;X++)for(let Z=z0;Z<z0+16;Z++){
      const d=Math.max(s.x-54-X,X-s.x-68,s.z-52-Z,Z-s.z-92);if(d>70)continue;
      const ground=C.heightAt(X,Z),h=d<=12?base:Math.round(base+(ground-base)*Math.min(1,(d-12)/58));
      for(let y=1;y<C.H;y++)data[(X&15)+(Z&15)*16+y*256]=y<=h?(y===h?4:3):y<=C.SEA?5:0;
     }
     const chunk=parts(s).get(cx+','+cz);if(chunk)for(let i=0;i<chunk.length;i+=2)data[chunk[i]]=chunk[i+1];continue;
    }
    for(let X=x0;X<x0+16;X++)for(let Z=z0;Z<z0+16;Z++){const d=Math.max(s.x-42-X,X-s.x-56,s.z-40-Z,Z-s.z-80);if(d>22)continue;const ground=C.heightAt(X,Z),h=d<=12?base:Math.round(base+(ground-base)*(d-12)/10);
     for(let y=Math.max(1,Math.min(ground,h)-3);y<C.H;y++)data[(X&15)+(Z&15)*16+y*256]=y>h?0:y===h?(s.blueprint===296?15:1):s.blueprint===296?3:2;
    }
    const chunk=parts(s).get(cx+','+cz);if(chunk)for(let i=0;i<chunk.length;i+=2)data[chunk[i]]=chunk[i+1];
    // Broad graded approach outside the southern gate; never crosses the town lots.
    const end=C.heightAt(s.x,s.z+120);for(let dz=83;dz<=120;dz++)for(let dx=-3;dx<=3;dx++){const X=s.x+dx,Z=s.z+dz;if((X>>4)!==cx||(Z>>4)!==cz)continue;const h=Math.round(base+(end-base)*(dz-83)/37),ground=C.heightAt(X,Z);for(let y=Math.max(1,Math.min(ground,h)-2);y<C.H;y++)data[(X&15)+(Z&15)*16+y*256]=y>h?0:y===h?52:3;}
   }return data;
  };
 }
 const api={TYPES,plan,generator,getTemplate,guardSpec,gateSquads};if(typeof module!=='undefined'){module.exports=api;return;}root.ExplorationCastles=api;
 let ready=new Set(),signs=[];
 api.update=function(){const g=root.game;if(!g||!root.Home||!root.CastleTown?.letteringReady)return;
  for(const site of g.exploration?.sites||[]){if(ready.has(site.id)||Math.hypot(g.p.x-site.x,g.p.z-site.z)>180)continue;
   const chest={x:site.x,y:(site.base||30)+11,z:site.z-9};
   if(!root.Net?.guest&&C.isChest(g.world.get(chest.x,chest.y,chest.z)))Home.seedChest(chest,{[site.blueprint]:1,291:6,292:2},site.id+'-reward-v1');
   signs.push(...CastleTown.gateInscriptions(g,site.name,[{p:[site.x+.5,(site.base||30)+6.5,site.z+82.025],r:0,a:[site.x,(site.base||30)+6,site.z+81],w:6.4,h:.88}]));ready.add(site.id);
  }
  const review=document.getElementById('castleReviewStatus');if(review){const all=root.CastleGuards?.guards||[],near=all.filter(a=>Math.hypot(a.x-g.p.x,a.z-g.p.z)<110);review.textContent=`护卫 ${near.length} · 等级 ${near[0]?.level||0} · 弓箭手 ${near.filter(a=>a.archer).length}`;}
  for(const sign of signs)sign.group.visible=!!g.world.get(...sign.anchor);
 };
})(this);
