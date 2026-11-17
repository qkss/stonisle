// Stationed castle defenders; only worlds carrying castle resident data opt in.
function initializeCastleGuards(site=null){
 const g=window.game;if(!g||(!site&&!g.castleWorld)||!window.Avatar)return;
 const tier=site?ExplorationCastles.TYPES.findIndex(t=>t.name===site.name)+1:0,spec=site?ExplorationCastles.guardSpec(tier):null;
 const state=site?((g.guardState.exploration||={})[site.id]||={units:{}}):g.guardState;
 const posts=[[-3.5,31,19.5,Math.PI],[3.5,31,19.5,Math.PI],[-9.5,31,10.5,0],[9.5,31,10.5,0],[-9.5,38,16.5,Math.PI],[9.5,38,16.5,Math.PI],[-14.5,38,0.5,Math.PI/2],[14.5,38,0.5,-Math.PI/2]];
 for(const [x,z] of [[-14,-14],[14,-14],[-14,16],[14,16]])posts.push([x+.5,54,z+(z>0?2.5:-1.5),z>0?Math.PI:0]);
 if(!site&&!state.installed&&!window.Net?.guest){
  const blocks=[];
  for(const [cx,cz] of [[-14,-14],[14,-14],[-14,16],[14,16]]){
   for(let x=cx-1;x<=cx+3;x++)for(let z=cz-1;z<=cz+1;z++)for(let y=53;y<=56;y++)blocks.push([x,y,z,0]);
   for(let x=cx-1;x<=cx+1;x++)for(let z=cz-1;z<=cz+1;z++){blocks.push([x,53,z,10]);if(x!==cx&&z!==cz)blocks.push([x,54,z,155]);}
  }
  g.setBlocks(blocks);
  state.installed=true;g.saveNow();
 }
 if(!site&&state.accessVersion!==1&&!window.Net?.guest){g.setBlocks(CastleAccess.blocks());state.accessVersion=1;g.freeSpawn();g.saveNow();}
 const routes=[
  [[-1.5,19.5],[.5,13.5],[-8.5,10.5]],[[1.5,19.5],[.5,13.5],[8.5,10.5]],
  [[-9.5,10.5],[-9.5,3.5],[-3.5,4.5]],[[9.5,10.5],[9.5,3.5],[3.5,4.5]],
  [[-9.5,15.5],[-5.5,15.5]],[[9.5,15.5],[5.5,15.5]],
  [[-12.5,.5],[-12.5,8.5]],[[13.5,.5],[13.5,8.5]]
 ];
 // Outer wall archers patrol short, unobstructed stretches between gatehouses.
 const outerRoutes=[[[8.5,80.5],[27.5,80.5]],[[-8.5,80.5],[-27.5,80.5]],[[8.5,-39.5],[27.5,-39.5]],[[-8.5,-39.5],[-27.5,-39.5]],[[-41.5,-20.5],[-41.5,-1.5]],[[-41.5,44.5],[-41.5,63.5]],[[56.5,-20.5],[56.5,-1.5]],[[56.5,44.5],[56.5,63.5]]];
 routes.length=12;
 for(const route of outerRoutes){routes.push(route);posts.push([route[0][0],37,route[0][1],route[0][1]>70?Math.PI:0]);}
 if(site){
  posts.length=0;routes.length=0;
  for(let i=0;i<spec.melee;i++){const side=i%2?-1:1,z=26.5+Math.floor(i/2)*8,x=side*4.5;posts.push([site.x+x,(site.base||30)+1,site.z+z,0]);routes.push([[site.x+x,site.z+z],[site.x+x,site.z+z+4]]);}
  for(let i=0;i<spec.archers;i++){const [x,z]=[[8.5,80.5],[-8.5,80.5],[-41.5,1.5],[56.5,1.5],[-41.5,50.5],[56.5,50.5],[8.5,-39.5],[-8.5,-39.5],[30.5,80.5],[30.5,-39.5]][i];posts.push([site.x+x,(site.base||30)+7,site.z+z,Math.PI]);routes.push(null);}
 }
 const gateStart=posts.length;
 for(const post of ExplorationCastles.gateSquads(site?.x||0,site?.z||0,site?.base||30)){posts.push(post);routes.push(null);}
 const get=(x,y,z)=>g.world.get(x,y,z),arrows=[];let shots=0,hits=0,review=null,received=0,saveHealthIn=-1;
 state.units ||= {};
 function helmet(mesh){
  const head=mesh.userData.head;for(const child of head.children)child.visible=false;
  const steel=new THREE.MeshPhongMaterial({color:spec?[0,0x897d66,0x9aaab8,0x738697,0x54566c,0x3e929d][tier]:0x9aaab8,shininess:65,specular:0xabb9c6}),edge=new THREE.MeshPhongMaterial({color:0xc8d1d8,shininess:85}),dark=new THREE.MeshLambertMaterial({color:0x151c24});
  const part=(geo,mat,x,y,z)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;head.add(m);return m;};
  part(new THREE.CylinderGeometry(.255,.30,.48,8),steel,0,.23,0).rotation.y=Math.PI/8;
  const plate=(w,h,d,mat,x,y,z)=>part(new THREE.BoxGeometry(w,h,d),mat,x,y,z);
  plate(.45,.20,.07,steel,0,.12,-.273);plate(.46,.105,.085,edge,0,.355,-.268);
  plate(.38,.035,.012,dark,0,.278,-.316);plate(.045,.29,.08,edge,0,.22,-.30);
  for(const x of [-.155,.155])for(const y of [.085,.13,.175])plate(.035,.012,.012,dark,x,y,-.315);
  part(new THREE.CylinderGeometry(.305,.305,.045,8),edge,0,.005,0).rotation.y=Math.PI/8;
  if(tier>=3){plate(.055,.17,.45,new THREE.MeshPhongMaterial({color:tier===4?0xc3a161:0x50768c,shininess:60}),0,.52,0);}
  for(const x of [-.21,.21])for(const y of [.075,.365])part(new THREE.SphereGeometry(.016,6,4),edge,x,y,-.315);
 }
 const guards=posts.map(([x,y,z,yaw,team],i)=>{
  const archer=i<gateStart&&(site?i>=spec.melee:i>=8),route=routes[i];if(route)[x,z]=route[0];
  if(site&&!GuardNavigation.clear(get,x,y,z)){let found=false;for(let r=1;r<=5&&!found;r++)for(let dx=-r;dx<=r&&!found;dx++)for(let dz=-r;dz<=r;dz++)if(GuardNavigation.clear(get,x+dx,y,z+dz)){x+=dx;z+=dz;found=true;break;}if(route)route[0]=[x,z];}
  const mesh=Avatar.build({skin:i%3,style:0,hair:i%2,shirt:i<8?4:3,pants:2,size:0,skirt:0,acc:0,outfit:0},spec?spec.equipment:i<8?[43,44,45,126]:[40,41,42,125]);
  helmet(mesh);mesh.userData.weaponSkin='default';Avatar.hold(mesh,archer?261:tier>=4?29:26);mesh.position.set(x,y,z);g.scene.add(mesh);
  const maxHP=spec?spec.hp+(archer?0:12):i<8?40:28,hp=Math.max(0,Math.min(maxHP,state.units[i]?.hp??maxHP));
  const materials=new Map();mesh.traverse(o=>{if(!o.isMesh)return;const clone=m=>{if(!materials.has(m))materials.set(m,m.clone());return materials.get(m);};o.material=Array.isArray(o.material)?o.material.map(clone):clone(o.material);});
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=64;const texture=new THREE.CanvasTexture(canvas),bar=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true,depthTest:true}));bar.scale.set(1.65,.41,1);g.scene.add(bar);
  return {id:'castle-guard-'+(site?site.id+'-':'')+i,city:site?.id||'legacy',team,level:tier,slot:i,hp,maxHP,dead:hp===0,deathTime:hp===0?2:0,flash:0,kx:0,kz:0,materials:[...materials.values()].filter(m=>m.emissive).map(m=>({m,base:m.emissive.clone()})),bar,canvas,texture,barHP:-1,mesh,x,y,z,yaw,home:[x,z],route,index:1,archer,cooldown:i*.1,swing:0,path:[],repath:0,phase:0,duty:route?'patrol':'guard',homeYaw:yaw,wait:0,blocked:0,state:route?'patrol':'guard'};
 });
 function healthDisplay(a){
  if(a.barHP!==a.hp){const c=a.canvas.getContext('2d');c.clearRect(0,0,256,64);c.fillStyle='#211b18dd';c.fillRect(0,0,256,64);c.fillStyle='#f2e6cf';c.font='22px sans-serif';c.textAlign='center';c.fillText(`${a.team||''}${a.archer?'弓箭手':'护卫'}${tier?' Lv.'+tier:' '+(a.slot+1)} · ${a.hp}/${a.maxHP}`,128,26);c.fillStyle='#52362c';c.fillRect(12,39,232,13);c.fillStyle=a.hp/a.maxHP>.3?'#8baa61':'#dc6755';c.fillRect(12,39,232*a.hp/a.maxHP,13);a.texture.needsUpdate=true;a.barHP=a.hp;}
  a.bar.position.set(a.x,a.y+2.35,a.z);a.bar.visible=a.hp>0&&(a.hp<a.maxHP||Math.hypot(g.p.x-a.x,g.p.z-a.z)<9);
 }
 const solidRay=(o,d,len)=>Core.raycast((x,y,z)=>{const b=get(x,y,z);return Core.PASS.has(b)?0:b;},o,d,len);
 function visible(a,m){const o=[a.x,a.y+1.45,a.z],v=[m.x-o[0],m.y+m.type.h*.55-o[1],m.z-o[2]],d=Math.hypot(...v);const hit=solidRay(o,v.map(n=>n/d),d);return !hit||hit.t>d-.35;}
 function damage(m,amount,dx,dz){if(m.player){if(!window.CityControl?.hostile(site?.id||'legacy'))return;if(m.id==='local'){g.hurt(amount);g.push(dx*1.5,dz*1.5);}else window.Net?.hurt(m.id,amount,false,[dx*1.5,dz*1.5]);return;}hits++;g.mobState();const result=g.mobHit(m.id,amount,dx,dz);if(result?.loot)g.takeLoot(result.loot,result.sad,{x:m.x,y:m.y,z:m.z});}
 function fire(a,m){shots++;
  const o=new THREE.Vector3(a.x,a.y+1.45,a.z),target=new THREE.Vector3(m.x,m.y+m.type.h*.55,m.z),v=target.sub(o).normalize().multiplyScalar(26);
  const mesh=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,.8,5),new THREE.MeshLambertMaterial({color:0xb48b51}));
  const tip=new THREE.Mesh(new THREE.ConeGeometry(.065,.18,4),new THREE.MeshLambertMaterial({color:0xcbd6df}));tip.position.y=.46;mesh.add(tip);
  mesh.position.copy(o);mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.clone().normalize());g.scene.add(mesh);arrows.push({mesh,v,life:3,owner:a});
 }
 if(new URLSearchParams(location.search).has('guardReview')&&new URLSearchParams(location.search).has('preview')){
  const panel=document.createElement('div');panel.style='position:fixed;left:15px;top:120px;z-index:20;background:#30271fdf;color:#f0e4d0;padding:12px;border:1px solid #99794e;border-radius:8px';
  const button=document.createElement('button');button.textContent='测试怪物进攻';button.onclick=()=>{for(const [x,z] of [[0,28],[3,29],[20,16],[20,-12]])g.debug.spawnMob(g.debug.FOES.golem,{x,z});};
  const ambush=document.createElement('button');ambush.textContent='测试护卫受击';ambush.onclick=()=>{const a=guards.find(v=>v.hp>0&&!v.archer);if(!a)return;for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){const x=Math.floor(a.x)+dx,z=Math.floor(a.z)+dz;if(!GuardNavigation.clear(get,x+.5,a.y,z+.5))continue;const n=g.mobs.length;g.debug.spawnMob(g.debug.FOES.sentinel,{x,z});if(g.mobs.length>n){const m=g.mobs[g.mobs.length-1];m.awake=true;m.t=0;break;}}};
  const inspect=document.createElement('button');inspect.textContent='观察受伤护卫';inspect.onclick=()=>{const a=guards.find(v=>v.hp>0&&v.hp<v.maxHP)||guards[0];for(const [dx,dz] of [[3,3],[-3,3],[0,4],[4,0],[-4,0]]){if(!GuardNavigation.clear(get,a.x+dx,a.y,a.z+dz))continue;g.p.x=a.x+dx;g.p.y=a.y;g.p.z=a.z+dz;g.look(Math.atan2(dx,dz),-.1);break;}};
  review=document.createElement('div');panel.append(button,ambush,inspect,review);document.body.append(panel);
 }
 const players=()=>[{id:'local',x:g.p.x,y:g.p.y,z:g.p.z,hp:g.dead?0:g.hp,player:true,type:{h:1.8,foe:true}},...(window.Net?.others()||[]).map(p=>({...p,hp:20,player:true,type:{h:1.8,foe:true}}))];
 let clock=0;
 return {count:guards.length,guards,arrows,
  hire(slot){const a=guards.find(a=>a.slot===slot);if(!a||window.Net?.guest)return false;const clear=GuardNavigation.clear(get,a.home[0],a.y,a.home[1])&&!guards.some(b=>b!==a&&b.hp>0&&Math.hypot(b.x-a.home[0],b.z-a.home[1])<.7&&Math.abs(b.y-a.y)<1);
   if(!CityRules.hire(g.inv,a,tier,!window.CityControl?.hostile(site?.id||'legacy'),clear))return false;
   a.mesh.rotation.z=0;a.mesh.visible=true;a.barHP=-1;state.units[a.slot]={hp:a.hp};g.renderBar();g.saveNow();return true;},
  targetFor(m,fallback){
   if(!m.type.foe)return fallback;let best=fallback,dist=fallback.calm||fallback.dn?Infinity:Math.hypot(m.x-fallback.x,m.y-fallback.y,m.z-fallback.z);
   for(const a of guards){if(a.hp<=0||(!m.type.fly&&Math.abs(m.y-a.y)>2))continue;const d=Math.hypot(m.x-a.x,m.y-a.y,m.z-a.z);if(d>=dist||d>18||!visible(a,m))continue;best=a;dist=d;}
   return best;
  },
  hurt(a,amount,source){if(window.Net?.guest||!GuardCombat.hit(a,Math.max(1,Math.round(amount*(1-(spec?.armor||0)))),source))return false;received++;state.units[a.slot]={hp:a.hp};saveHealthIn=.3;healthDisplay(a);return true;},
  update(dt){
  if(site){const near=[g.p,...(window.Net?.others()||[])].some(p=>Math.hypot(p.x-site.x,p.z-site.z)<210);for(const a of guards){a.mesh.visible=near&&a.hp>0;a.bar.visible=near&&a.hp>0;}if(!near)return;}
  dt=Math.min(dt,.05);clock+=dt;if(saveHealthIn>=0&&(saveHealthIn-=dt)<0)g.saveNow();if(review)review.textContent=`原地守卫 ${guards.filter(a=>a.state==='guard').length} · 巡逻 ${guards.filter(a=>a.state==='patrol').length} · 战斗 ${guards.filter(a=>a.state==='defend').length} · 归位 ${guards.filter(a=>a.state==='return').length} · 怪物 ${g.mobs.filter(m=>m.type.foe&&m.hp>0).length} · 飞行箭矢 ${arrows.length} · 射箭 ${shots} · 命中 ${hits} · 护卫受击 ${received} · 存活 ${guards.filter(a=>a.hp>0).length}/${guards.length}`;
  for(const a of guards){
   a.flash=Math.max(0,a.flash-dt);for(const {m,base} of a.materials)m.emissive.copy(base).lerp(new THREE.Color(0xff2222),a.flash>0?.8:0);
   healthDisplay(a);
   if(a.hp<=0){a.deathTime+=dt;a.mesh.rotation.z=Math.min(1,a.deathTime/.55)*Math.PI/2;a.mesh.visible=a.deathTime<1.2;continue;}
   if(window.Net?.guest){a.mesh.position.set(a.x,a.y,a.z);Avatar.aim(a.mesh,a.yaw,0,dt,true);Avatar.pose(a.mesh,a.phase,a.state==='patrol'||a.state==='return'?1:0,a.swing>0?.4:0);continue;}
   GuardCombat.knock(a,dt,(x,y,z)=>GuardNavigation.clear(get,x,y,z));
   a.cooldown-=dt;a.repath-=dt;a.wait=Math.max(0,a.wait-dt);a.swing=Math.max(0,a.swing-dt);let target=null,dist=a.archer?(spec?.range||42):20;
   if(!window.Net?.guest)for(const m of [...g.mobs,...(window.CityControl?.hostile(site?.id||'legacy')?players():[])]){
    if(!m.type.foe||m.hp<=0||(!a.archer&&(Math.abs(m.y-a.y)>2||Math.hypot(m.x-a.home[0],m.z-a.home[1])>20)))continue;
    const d=Math.hypot(m.x-a.x,m.y-a.y,m.z-a.z);if(d>=dist||!visible(a,m))continue;target=m;dist=d;
   }
   let moving=false,goal=null;
   const decision=GuardNavigation.duty(a,target,dist);
   if(a.state!==decision.state){a.state=decision.state;a.path=[];a.repath=0;a.blocked=0;a.wait=0;}
   goal=decision.goal;
   if(a.state==='guard'){a.yaw=a.homeYaw;a.path=[];}
   if(goal&&a.state==='patrol'&&Math.hypot(a.x-goal[0],a.z-goal[1])<.4){
    a.index++;a.path=[];a.repath=0;a.wait=1.5+(a.slot%3)*.4;goal=null;
   }
   if(goal&&a.wait<=0){
    if(a.repath<=0){
     a.path=GuardNavigation.path(get,[a.x,a.z],goal,a.y,1800,(x,z)=>guards.some(b=>b!==a&&b.hp>0&&Math.abs(b.y-a.y)<1&&Math.hypot(b.x-x,b.z-z)<.7));a.repath=target?.75:2;
     if(!a.path.length&&Math.hypot(a.x-goal[0],a.z-goal[1])>.2&&GuardNavigation.clear(get,goal[0],a.y,goal[1])&&Math.hypot(a.x-goal[0],a.z-goal[1])<.8)a.path=[goal];
     if(!a.path.length){a.wait=1.5;if(a.state==='patrol')a.index++;}
    }
    const next=a.path[0];if(next){
     const dx=next[0]-a.x,dz=next[1]-a.z,d=Math.hypot(dx,dz),step=Math.min(d,dt*(target?2.5:1.25));
     if(d<.06)a.path.shift();else{
      const nx=a.x+dx/d*step,nz=a.z+dz/d*step;
      const crowded=guards.some(b=>b!==a&&b.hp>0&&Math.abs(b.y-a.y)<1&&Math.hypot(b.x-nx,b.z-nz)<.65);
      if(GuardNavigation.clear(get,nx,a.y,nz)&&!crowded){a.x=nx;a.z=nz;a.yaw=Math.atan2(-dx,-dz);moving=true;a.phase+=step*5;a.blocked=0;}
      else {a.blocked+=dt;if(a.blocked>1.2){a.path=[];a.repath=0;a.wait=.6+(a.slot%6)*.2;a.blocked=0;if(a.state==='patrol')a.index++;}}
     }
    }
   }else a.path=[];
   const yaw=target?Math.atan2(a.x-target.x,a.z-target.z):a.yaw;
   const pitch=target?Math.atan2(target.y+target.type.h*.55-a.y-1.45,Math.hypot(target.x-a.x,target.z-a.z)):0;
   a.mesh.position.set(a.x,a.y,a.z);Avatar.aim(a.mesh,yaw,pitch,dt,true);Avatar.pose(a.mesh,a.phase,moving?1:0,a.swing>0?1-a.swing/.35:0);
   if(target&&a.cooldown<=0&&(a.archer||dist<2.3)){
    if(a.archer)fire(a,target);else damage(target,spec?.damage||5,(target.x-a.x)/dist,(target.z-a.z)/dist);
    a.cooldown=a.archer?1.8:1;a.swing=.35;
   }
  }
  // Swept segments prevent tunnelling; terrain and bystanders stop arrows before damage.
  for(let i=arrows.length-1;i>=0;i--){const a=arrows[i],o=a.mesh.position.toArray(),len=a.v.length()*dt,d=a.v.clone().normalize().toArray();let stop=solidRay(o,d,len)?.t??Infinity,hit=null;
   for(const m of [...g.mobs,...(window.CityControl?.hostile(site?.id||'legacy')?players():[])]){if(m.hp<=0)continue;const body=m.player?{...m,a:0,bounds:{min:[-.3,0,-.3],max:[.3,1.8,.3]}}:m;const t=MobPhysics.ray(body,o,d,len);if(t!==null&&t<stop){stop=t;hit=m;}}
   for(const guard of guards){if(guard===a.owner||guard.hp<=0)continue;const t=MobPhysics.ray({x:guard.x,y:guard.y,z:guard.z,a:0,bounds:{min:[-.3,0,-.3],max:[.3,1.9,.3]}},o,d,len);if(t!==null&&t<stop){stop=t;hit=null;}}
   a.mesh.position.addScaledVector(a.v,dt);a.life-=dt;
   if(stop<=len||a.life<=0){if(hit?.type.foe)damage(hit,spec?.arrow||4,d[0],d[2]);g.scene.remove(a.mesh);a.mesh.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});arrows.splice(i,1);}
  }
 }};
}
// A single facade routes combat to the legacy town and lazily created exploration garrisons.
(function(){const groups=new Map(),remote=new Map();let syncClock=0;window.CastleGuards={
 sync(units){for(const u of units)remote.set(u.id,u);},
 get guards(){return [...groups.values()].flatMap(g=>g.guards);},get count(){return this.guards.length;},
 update(dt){const g=window.game;if(!g||!window.Avatar)return;if(g.castleWorld&&!groups.has('legacy')){const a=initializeCastleGuards();if(a)groups.set('legacy',a);}
 for(const site of g.exploration?.sites||[])if(!groups.has(site.id)&&[g.p,...(window.Net?.others()||[])].some(p=>Math.hypot(p.x-site.x,p.z-site.z)<180)){const a=initializeCastleGuards(site);if(a)groups.set(site.id,a);}
 if(window.Net?.guest)for(const a of this.guards){const r=remote.get(a.id);if(r){Object.assign(a,{hp:r.hp,x:r.x,y:r.y,z:r.z,yaw:r.yaw,state:r.state,phase:r.phase,flash:r.flash,swing:r.swing});if(a.hp>0){a.deathTime=0;a.mesh.rotation.z=0;a.mesh.visible=true;}}}
 for(const a of groups.values())a.update(dt);
 if(!window.Net?.guest&&(syncClock+=dt)>.3){syncClock=0;window.Net?.guards({cities:g.guardState.cities||{},saved:g.guardState,units:this.guards.map(a=>({id:a.id,hp:a.hp,x:a.x,y:a.y,z:a.z,yaw:a.yaw,state:a.state,phase:a.phase,flash:a.flash,swing:a.swing}))});}},
 targetFor(m,fallback){let best=fallback;for(const a of groups.values())best=a.targetFor(m,best);return best;},
 hire(city,slot){return groups.get(city)?.hire(slot)||false;},
 hurt(a,amount,source){return groups.get(a.city||'legacy')?.hurt(a,amount,source)||false;}
 };})();
