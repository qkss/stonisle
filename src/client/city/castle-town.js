(function(root){
 const terrainCore=typeof module!=='undefined'?require('../core/core.js'):root.Core;
 const plots=[[-22,28,88],[-12,28,78],[-22,38,119],[-12,38,143]];
 function plan(){
  const edits=[],put=(x,y,z,id)=>edits.push([x,y,z,id]);
  const box=(x,y,z,X,Y,Z,id)=>{for(let a=x;a<=X;a++)for(let b=y;b<=Y;b++)for(let c=z;c<=Z;c++)put(a,b,c,id);};
  // Only the southern extension is graded; the castle, paddock and viewing hill stay intact.
  box(-24,31,26,24,45,61,0);box(-24,28,26,24,29,61,2);box(-24,30,26,24,30,61,1);
  box(-1,30,26,2,30,62,52);
  for(const z of [26,36,48,60])box(-24,30,z,24,30,z,52);
  for(const x of [-24,-15,-5,4,14,24])box(x,30,26,x,30,60,52);
  for(const [x,z,crop] of plots){
   box(x,30,z,x+6,30,z+5,98);
   for(let dz=0;dz<=5;dz++)put(x+3,30,z+dz,5);
   for(const dx of [1,2,4,5])for(let dz=1;dz<=4;dz++)if(crop<100||(dx+dz)%2===0)put(x+dx,31,z+dz,crop);
   put(x+3,30,z+2,94); // small bridge across each irrigation channel
  }
  function house(x,z,w,d,wood,roof){
   box(x,30,z,x+w-1,30,z+d-1,10);box(x,31,z,x+w-1,34,z+d-1,wood);box(x+1,31,z+1,x+w-2,34,z+d-2,0);
   for(const X of [x,x+w-1])for(const Z of [z,z+d-1])box(X,31,Z,X,35,Z,181);
   const door=x+Math.floor(w/2);put(door,31,z+d-1,60);put(door,32,z+d-1,60);
   for(const X of [x,x+w-1])for(const Z of [z+2,z+d-3]){put(X,32,Z,280);put(X,33,Z,280);}
   put(x+2,32,z,280);put(x+w-3,32,z,280);
   for(let r=0;r<=Math.floor(w/2);r++)box(x-1+r,35+r,z-1,x+w-r,35+r,z+d,roof);
   box(x+w-2,35,z+1,x+w-2,40,z+1,9);
   put(x+1,31,z+2,197);put(x+1,32,z+2,218);
   put(x+2,31,z+3,66);put(x+3,31,z+3,66);
   put(x+w-2,31,z+d-2,94);put(x+w-2,32,z+d-2,59);
   put(door,33,z+d,59);box(door-1,30,z+d,door+1,30,z+d+1,52);
  }
  for(const [x,z,wood] of [[6,28,8],[16,28,93],[6,41,95],[16,41,94]])house(x,z,7,7,wood,55);
  house(-22,51,9,8,8,55);house(-11,51,8,8,94,55);
  put(-9,31,53,289);put(-7,31,53,56);put(-7,32,53,56); // forge workstation
  for(const z of [53,56]){put(-20,31,z,66);put(-19,31,z,66);} // inn beds
  // Market stalls, close to the central street and away from house entrances.
  for(const [x,z] of [[-6,46],[5,38]]){
   for(const X of [x,x+4])for(const Z of [z,z+2])box(X,31,Z,X,33,Z,181);
   for(let X=x;X<=x+4;X++)box(X,34,z,X,34,z+2,X%2?93:95);
   box(x+1,31,z+1,x+3,31,z+1,94);put(x+1,32,z+1,197);put(x+3,32,z+1,119);
  }
  for(const [x,z] of [[3,27],[3,37],[3,49],[3,59],[-15,37],[-15,49],[24,37],[24,49]]){box(x,31,z,x,33,z,181);put(x,34,z,59);}
  return edits;
 }
 function expansion(){
  const e=[],put=(x,y,z,id)=>e.push([x,y,z,id]),box=(x,y,z,X,Y,Z,id)=>{for(let a=x;a<=X;a++)for(let b=y;b<=Y;b++)for(let c=z;c<=Z;c++)put(a,b,c,id);};
  // A seven-block clear sightline from the gate to the southern approach.
  box(-3,31,26,3,63,75,0);box(-3,29,26,3,29,75,2);box(-3,30,26,3,30,75,52);
  box(-8,31,46,0,35,48,0);
  for(const x of [-8,-4])for(const z of [46,48])box(x,31,z,x,33,z,181);
  box(-8,34,46,-4,34,48,93);box(-7,31,47,-5,31,47,94);put(-7,32,47,197);put(-5,32,47,119);
  for(const z of [27,37,49,59,73])for(const x of [-4,4]){box(x,31,z,x,33,z,181);put(x,34,z,59);}
  box(-29,30,61,29,30,63,52);box(-19,30,73,19,30,74,52);
  function room(x,z,wood){
   box(x-1,31,z-1,x+7,63,z+8,0);box(x-1,29,z-1,x+7,29,z+8,2);box(x-1,30,z-1,x+7,30,z+8,52);
   box(x,31,z,x+6,34,z+6,wood);box(x+1,31,z+1,x+5,34,z+5,0);
   for(const X of [x,x+6])for(const Z of [z,z+6])box(X,31,Z,X,35,Z,181);
   for(const X of [x+1,x+2,x+4,x+5]){put(X,32,z+6,280);put(X,33,z+6,280);}
   put(x+3,31,z+6,60);put(x+3,32,z+6,60);
   for(let r=0;r<4;r++)box(x-1+r,35+r,z-1,x+7-r,35+r,z+7,55);
   for(const X of [x+1,x+5]){put(X,31,z+3,197);put(X,32,z+3,218);}
   put(x+3,33,z+7,59);put(x+2,31,z+2,66);put(x+3,31,z+2,66);
   put(x+1,32,z+7,74);
  }
  room(-16,65,93);room(9,65,95);room(-35,1,8);room(-35,15,94);
  box(-27,29,-1,-27,29,63,2);box(-27,30,-1,-27,30,63,52);box(-27,31,-1,-27,36,63,0);
  for(const z of [9,23])box(-35,30,z,-24,30,z,52);
  for(const cx of [-26,26]){
   const cz=64;box(cx-3,31,cz-3,cx+3,63,cz+3,0);box(cx-3,29,cz-3,cx+3,30,cz+3,10);
   for(const x of [cx-2,cx+2])for(const z of [cz-2,cz+2])box(x,31,z,x,43,z,181);
   box(cx-3,39,cz-3,cx+3,39,cz+3,94);
   for(let d=-3;d<=3;d++)for(const side of [-3,3]){put(cx+d,40,cz+side,222);put(cx+side,40,cz+d,222);}
   for(let y=31;y<=40;y++){put(cx,y,cz-1,181);put(cx,y,cz,160);}
   box(cx-3,44,cz-3,cx+3,44,cz+3,55);box(cx-2,45,cz-2,cx+2,45,cz+2,55);
   for(const x of [cx-3,cx+3])put(x,41,cz+3,59);
  }
  return e;
 }
 function outerTown(){
  const cells=new Map(),put=(x,y,z,id)=>cells.set(`${x},${y},${z}`,[x,y,z,id]);
  const box=(x,y,z,X,Y,Z,id)=>{for(let a=x;a<=X;a++)for(let b=y;b<=Y;b++)for(let c=z;c<=Z;c++)put(a,b,c,id);};
  function road(x,z,X,Z){box(x,31,z,X,37,Z,0);box(x,29,z,X,29,Z,2);box(x,30,z,X,30,Z,52);}
  road(-3,75,3,86);road(-39,25,55,27);road(-28,28,-26,73);road(53,10,55,76);
  for(const [x,z,wood] of [[-36,30,93],[-36,44,8],[-36,58,95],[30,14,94],[30,27,93],[32,68,8]]){
   box(x-1,31,z-1,x+7,63,z+8,0);box(x-1,28,z-1,x+7,29,z+8,2);box(x-1,30,z-1,x+7,30,z+8,52);
   box(x,31,z,x+6,34,z+6,wood);box(x+1,31,z+1,x+5,34,z+5,0);
   for(const X of [x,x+6])for(const Z of [z,z+6])box(X,31,Z,X,35,Z,181);
   for(const X of [x+1,x+5]){put(X,32,z+6,280);put(X,33,z+6,280);}
   put(x+3,31,z+6,60);put(x+3,32,z+6,60);
   for(let r=0;r<4;r++)box(x-1+r,35+r,z-1,x+7-r,35+r,z+7,55);
   put(x+1,31,z+2,66);put(x+2,31,z+2,66);put(x+5,31,z+2,197);put(x+5,32,z+2,59);put(x+3,33,z+7,59);
   road(x<0?x:x+3,z+8,x<0?-26:55,z+8);
  }
  // Keep the eastern wall beyond the viewing hill and the animal paddock.
  const west=-42,east=56,north=-40,south=80;
  for(const z of [north,south])box(west-2,31,z-2,east+2,63,z+2,0);
  for(const x of [west,east])box(x-2,31,north-2,x+2,63,south+2,0);
  for(let x=west;x<=east;x++)for(const z of [north,south]){
   box(x,10,z-1,x,35,z+1,10);box(x,36,z-1,x,36,z+1,52);
   if((x-west)%3!==1)put(x,37,z+(z===north?-1:1),10);
  }
  for(let z=north;z<=south;z++)for(const x of [west,east]){
   box(x-1,10,z,x+1,35,z,10);box(x-1,36,z,x+1,36,z,52);
   if((z-north)%3!==1)put(x+(x===west?-1:1),37,z,10);
  }
  // Gate openings retain a bridge over the passage, so the wall walk is continuous.
  for(const z of [north,south]){road(-3,z-5,3,z+5);box(-3,31,z-1,3,35,z+1,0);box(-4,36,z-1,4,36,z+1,52);for(const x of [-4,4]){box(x,31,z-1,x,38,z+1,10);put(x,39,z,59);}}
  for(const x of [west,east]){road(x-5,25,x+5,27);box(x-1,31,25,x+1,35,27,0);box(x-1,36,24,x+1,36,28,52);for(const z of [24,28]){box(x-1,31,z,x+1,38,z,10);put(x,39,z,59);}}
  for(const x of [west,east])for(const z of [north,south]){
   box(x-2,10,z-2,x+2,36,z+2,10);box(x-2,37,z-2,x+2,39,z+2,0);box(x-2,36,z-2,x+2,36,z+2,52);
   for(let d=-2;d<=2;d++)if(d%2===0){put(x+d,38,z-2,10);put(x+d,38,z+2,10);put(x-2,38,z+d,10);put(x+2,38,z+d,10);}put(x,39,z,59);
  }
  // Two interior ladders at the main gate, backed by solid wall blocks.
  for(const x of [-7,7]){box(x,31,78,x,36,78,162);put(x,37,78,0);put(x,37,79,0);road(x-1,74,x+1,77);}
  return [...cells.values()];
 }
 function wallFoundations(){const cells=new Map(),put=(x,y,z)=>cells.set(`${x},${y},${z}`,[x,y,z,10]);
  for(let y=10;y<30;y++){
   for(let x=-42;x<=56;x++)for(const z of [-40,80])for(let d=-1;d<=1;d++)put(x,y,z+d);
   for(let z=-40;z<=80;z++)for(const x of [-42,56])for(let d=-1;d<=1;d++)put(x+d,y,z);
   for(const x of [-42,56])for(const z of [-40,80])for(let dx=-2;dx<=2;dx++)for(let dz=-2;dz<=2;dz++)put(x+dx,y,z+dz);
  }return [...cells.values()];}
 function perimeterGrade(get){
  const out=[];
  for(let x=-59;x<=73;x++)for(let z=-57;z<=97;z++){
   const distance=Math.max(-42-x,x-56,-40-z,z-80),eastInner=x>=49&&x<=54&&z>=-37&&z<=77;
   if(!eastInner&&(distance<3||distance>16))continue;
   const h=distance<=9||eastInner?30:Math.round(30+(terrainCore.heightAt(x,z)-30)*(distance-9)/7);
   for(let y=Math.max(1,Math.min(terrainCore.heightAt(x,z),h)-3);y<64;y++){const id=y>h?0:y===h?(get(x,y,z)===52?52:1):2;if(get(x,y,z)!==id)out.push([x,y,z,id]);}
  }return out;
 }
 function roofLights(){const out=[];for(const [x,z] of [[-14,-14],[14,-14],[-14,16],[14,16]])for(const s of [-1,1])out.push([x+s*2,55,z+s*2,59]);for(const x of [-6,6])for(const z of [-10,1])out.push([x,49,z,181],[x,50,z,59]);return out;}
 const api={plan,plots,roofLights,expansion,outerTown,perimeterGrade,wallFoundations};if(typeof module!=='undefined'){module.exports=api;return;}root.CastleTown=api;
 api.letteringReady=false;
 const inscriptionFont=new FontFace('Castle Calligraphy','url(assets/fonts/MaShanZheng-Regular.ttf)');
 inscriptionFont.load().then(font=>document.fonts.add(font)).catch(()=>{}).finally(()=>{api.letteringReady=true;});
 // Stone inscriptions are world geometry, lit by the same sun/torches as the gate.
 function gateInscriptions(g,label="云岚城",customDefinitions){
  const canvas=document.createElement('canvas');canvas.width=1536;canvas.height=256;
  const c=canvas.getContext('2d'),bump=document.createElement('canvas');bump.width=1536;bump.height=256;const b=bump.getContext('2d');
  c.fillStyle='#c3bca8';c.fillRect(0,0,1536,256);b.fillStyle='#b8b8b8';b.fillRect(0,0,1536,256);
  let seed=247;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  for(let i=0;i<34000;i++){const x=rand()*1536,y=rand()*256,v=rand();c.fillStyle=v>.5?'rgba(235,226,206,.09)':'rgba(35,35,30,.10)';c.fillRect(x,y,1+rand()*3,1+rand()*2);}
  c.strokeStyle='#45473f';c.lineWidth=5;c.strokeRect(18,18,1500,220);c.strokeStyle='#b5b0a0';c.lineWidth=2;c.strokeRect(24,24,1488,208);
  for(const ctx of [c,b]){ctx.font='192px "Castle Calligraphy", "Kaiti SC", "STKaiti", "KaiTi", "Songti SC", serif';ctx.textAlign='center';ctx.textBaseline='middle';}
  for(const [i,char] of [...label].entries()){const x=440+i*328;
   // Colour stays stone: the lettering is cut into the actual mesh below.
   b.fillStyle='#282828';b.fillText(char,x,134);
  }
  const map=new THREE.CanvasTexture(canvas),relief=new THREE.CanvasTexture(bump);map.encoding=THREE.sRGBEncoding;map.anisotropy=4;
  const material=new THREE.MeshPhongMaterial({map,bumpMap:relief,bumpScale:.035,shininess:3,specular:0x171712});
  const edge=new THREE.MeshLambertMaterial({color:0xa29e8f});
  const definitions=customDefinitions||[{p:[.5,36.5,82.025],r:0,a:[0,36,81],w:6.4,h:.88},{p:[.5,36.5,-41.025],r:Math.PI,a:[0,36,-41],w:6.4,h:.88},{p:[-43.025,36.5,26.5],r:-Math.PI/2,a:[-43,36,26],w:3.8,h:.88},{p:[58.025,36.5,26.5],r:Math.PI/2,a:[57,36,26],w:3.8,h:.88}];
  const pixels=b.getImageData(0,0,1536,256).data,geo=new THREE.PlaneGeometry(1,1,512,96),vertices=geo.attributes.position,colors=[];
  for(let i=0;i<vertices.count;i++){const u=vertices.getX(i)+.5,v=.5-vertices.getY(i),px=Math.min(1535,Math.floor(u*1536)),py=Math.min(255,Math.floor(v*256));let depth=0;
   for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const at=(Math.max(0,Math.min(255,py+dy))*1536+Math.max(0,Math.min(1535,px+dx)))*4;depth+=Math.max(0,(184-pixels[at])/156)/9;}
   vertices.setZ(i,-depth*.065);const shade=1-depth*.24;colors.push(shade,shade,shade);
  }geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.computeVertexNormals();material.vertexColors=true;material.bumpMap=null;
  return definitions.map(d=>{const group=new THREE.Group();group.position.set(...d.p);group.rotation.y=d.r;
   const frame=new THREE.Mesh(new THREE.BoxGeometry(d.w+.12,d.h+.10,.10),edge);frame.position.z=-.005;group.add(frame);
   const face=new THREE.Mesh(geo,material);face.scale.set(d.w,d.h,1);face.position.z=.12;group.add(face);
   // A projecting cap and stepped crown fill the bare lintel above the plaque.
   for(const [w,h,y,z] of [[d.w+.35,.12,d.h/2+.10,.02],[d.w+.12,.10,d.h/2+.21,-.03],[d.w*.36,.12,d.h/2+.30,-.04]]){const cap=new THREE.Mesh(new THREE.BoxGeometry(w,h,.25),edge);cap.position.set(0,y,z);group.add(cap);}
   g.scene.add(group);return {group,anchor:d.a};});
 }
 api.gateInscriptions=gateInscriptions;
 let ready=false,farmers=[],inscriptions=[],time=0,grow=0;
 api.update=function(dt){
  const g=window.game;if(!g?.castleWorld||!window.Avatar||!api.letteringReady)return;
  if(!ready){
   if(!window.Net?.guest){if(g.guardState.townVersion!==1){g.setBlocks(plan());g.guardState.townVersion=1;}if(g.guardState.expansionVersion!==1){g.setBlocks(expansion());g.guardState.expansionVersion=1;if(window.Home){Object.assign(Home.state.signs,{'-15,32,72':'Supply shop','10,32,72':'Market shop','-34,32,8':'Guest house','-34,32,22':'Guest house'});}}if(g.guardState.roofLights!==1){g.setBlocks(roofLights());g.guardState.roofLights=1;}if(g.guardState.treasureVersion!==1&&window.Home){g.setBlocks([[0,40,-9,57],[0,41,-9,196]]);Home.seedChest({x:0,y:41,z:-9},{83:6,84:4,85:4,86:4,130:12,292:12,111:8,134:4,135:2,141:2,19:1},'castle-third-floor-v1');g.guardState.treasureVersion=1;}
    if(g.guardState.blueprintVersion!==1&&window.Home){if(!Core.isChest(g.world.get(0,41,-9)))g.setBlock(0,41,-9,196);Home.seedChest({x:0,y:41,z:-9},{293:1},'castle-shotgun-blueprint-v1');g.guardState.blueprintVersion=1;}
    if(g.guardState.outerVersion!==1){g.setBlocks(outerTown());g.guardState.outerVersion=1;}
    if(g.guardState.perimeterGradeVersion!==1){g.setBlocks(perimeterGrade((...p)=>g.world.get(...p)));g.guardState.perimeterGradeVersion=1;}
    if(g.guardState.wallFoundationsVersion!==1){g.setBlocks(wallFoundations());g.guardState.wallFoundationsVersion=1;}
    g.freeSpawn();g.saveNow();}
   inscriptions=gateInscriptions(g);
   farmers=plots.map(([x,z,crop],i)=>{
    const mesh=Avatar.build({skin:i%3,style:0,hair:i%3,shirt:[3,1,2,4][i],pants:1,skirt:0,size:0,acc:4,outfit:0},[]);Avatar.hold(mesh,22);g.scene.add(mesh);
    return {mesh,x:x+.5,y:31,z:z-.5,plot:[x,z,crop],route:[[x+.5,z-.5],[x+6.5,z-.5],[x+6.5,z+6.5],[x+.5,z+6.5]],index:1,path:[],pause:0,repath:0,phase:0,yaw:0};
   });ready=true;
  }
  dt=Math.min(dt,.05);time+=dt;grow+=dt;const get=(...p)=>g.world.get(...p);
  for(const sign of inscriptions)sign.group.visible=!!get(...sign.anchor);
  for(const a of farmers){
   a.repath-=dt;a.pause-=dt;let moving=false;
   const goal=a.route[a.index%4];
   if(Math.hypot(a.x-goal[0],a.z-goal[1])<.2&&a.pause<=0){a.index++;a.pause=3;a.path=[];a.repath=0;}
   if(a.pause<=0){
    if(a.repath<=0){a.path=GuardNavigation.path(get,[a.x,a.z],a.route[a.index%4],31);a.repath=3;}
    const p=a.path[0];if(p){const dx=p[0]-a.x,dz=p[1]-a.z,d=Math.hypot(dx,dz),step=Math.min(d,dt*.8);if(d<.05)a.path.shift();else if(GuardNavigation.clear(get,a.x+dx/d*step,31,a.z+dz/d*step)){a.x+=dx/d*step;a.z+=dz/d*step;a.yaw=Math.atan2(-dx,-dz);moving=true;a.phase+=step*5;}else{a.path=[];a.repath=.5;}}
   }
   Avatar.aim(a.mesh,a.yaw,a.pause>0?-.3:0,dt,true);Avatar.pose(a.mesh,a.phase,moving?1:0,a.pause>0?(Math.sin(time*4)+1)*.35:0);a.mesh.position.set(a.x,a.y,a.z);
  }
  // Tend only empty crop beds/our sprouts; never overwrite a player's new construction.
  if(grow>30&&!window.Net?.guest){grow=0;const edits=[];for(const [x,z,crop] of plots){for(const dx of [1,2,4,5])for(let dz=1;dz<=4;dz++){if(crop>=100&&(dx+dz)%2)continue;const X=x+dx,Z=z+dz,b=get(X,31,Z);if(get(X,30,Z)===98&&(b===0||b===99))edits.push([X,31,Z,b===99?crop:99]);}}if(edits.length)g.setBlocks(edits);}
 };
})(this);
