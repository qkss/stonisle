// 地上的掉落物：打死动物、怪物以后，掉的东西先落在地上，要走过去才捡得起来。
// 每样东西一个小模型，在原地往外蹦一下、落地后慢慢转着上下浮；走到 2.5 格内会被吸过来，1.2 格内进背包。放 5 分钟没人捡就消失。
// game.js 的 takeLoot(loot, sad, at) 调 Drops.spawn；背包满不满不管（背包不限格数）。
// 怪物掉落仍为本地；主动丢弃物由服务器登记并独占领取。掉落物 5 分钟过期，不写入世界存档。
(() => {
  const PICK = 1.2, PULL = 2.5, LIFE = 300, G = 18;
  const near = (d, p) => Math.hypot(d.x - p.x, d.y - (p.y + 0.6), d.z - p.z);
  // 一步物理：往下掉，落到实心方块上停住；返回落没落地
  function fall(d, dt, solid) {
    d.vy -= G * dt; d.x += d.vx * dt; d.z += d.vz * dt; d.vx *= 0.92; d.vz *= 0.92;
    const ny = d.y + d.vy * dt;
    if (d.vy < 0 && solid(Math.floor(d.x), Math.floor(ny), Math.floor(d.z))) { d.y = Math.floor(ny) + 1; d.vy = 0; d.vx = d.vz = 0; return true; }
    d.y = ny; return false;
  }
  if (typeof document === 'undefined') { module.exports = { fall, near, PICK, PULL }; return; }
  const list = [];
  function spawn(loot, at) {
    let k = 0;
    for (const id in loot) {
      const n = loot[id]; if (!(n > 0)) continue;
      const model = game.itemMesh(+id); if (!model) { game.give(+id, n); continue; } // 没有模型的东西直接进背包
      const g = new THREE.Group(), spin = new THREE.Group(); spin.add(model); g.add(spin);
      const box = new THREE.Box3().setFromObject(spin), size = box.getSize(new THREE.Vector3()), s = 0.32 / Math.max(size.x, size.y, size.z, 0.01);
      spin.scale.setScalar(s); model.position.y -= box.min.y; // 模型的底贴着地
      const a = k++ * 2.4 + Math.random();
      list.push({ id: +id, n, g, spin, x: at.x, y: at.y + 0.6, z: at.z, vx: Math.sin(a) * 1.6, vy: 4, vz: Math.cos(a) * 1.6, t0: game.time, ph: Math.random() * 6 });
      game.scene.add(g);
    }
  }
  // Thrown items have one shared resting position; only their short toss arc is cosmetic.
  function landing(p,yaw){
    const solid=(x,y,z)=>{const b=game.world.get(Math.floor(x),Math.floor(y),Math.floor(z));return !!b&&b!==5&&!Core.PASS.has(b);};
    let x=p.x,z=p.z;
    for(let step=.2;step<=1.8;step+=.2){const nx=p.x-Math.sin(yaw)*step,nz=p.z-Math.cos(yaw)*step;if(solid(nx,p.y+.7,nz)||solid(nx,p.y+1.2,nz))break;x=nx;z=nz;}
    let y=Math.min(63,Math.floor(p.y+.6));while(y>=0&&!solid(x,y,z))y--;
    return {x,y:y+1.04,z};
  }
  const removedShared=new Map();
  function addShared(item){
    for(const [key,at] of removedShared)if(Date.now()-at>300000)removedShared.delete(key);
    if(removedShared.has(item.key))return;
    if(list.some(d=>d.key===item.key))return;
    const model=game.itemMesh(item.id,item.skin||'default');if(!model)return; // 扔出来的剑按扔的人的皮肤显示，不是看的人自己的
    const g=new THREE.Group(),spin=new THREE.Group();spin.add(model);g.add(spin);
    const box=new THREE.Box3().setFromObject(spin),size=box.getSize(new THREE.Vector3());
    spin.scale.setScalar(.48/Math.max(size.x,size.y,size.z,.01));model.position.y-=box.min.y;
    list.push({...item,created:Date.now()-(item.age||0),g,spin,shared:true,ph:0,t0:game.time,pending:false});game.scene.add(g);
  }
  function removeShared(key){removedShared.set(key,Date.now());const i=list.findIndex(d=>d.key===key);if(i>=0)drop(i);}
  function syncShared(items){for(let i=list.length-1;i>=0;i--)if(list[i].shared)drop(i);for(const item of items)addShared(item);}
  function thrown(id,at,ammo=0,n=1,skin='default'){const item={...at,id,n,ammo,skin,key:'local-'+Math.random().toString(36).slice(2),owner:'local',created:Date.now(),local:true};addShared(item);}
  async function claim(d){
    d.pending=true;
    try{const item=d.local?d:await Net.pickItem(d.key);if(item){removeShared(d.key);game.give(item.id,item.n);if(item.skin)game.setItemSkin(item.id,item.skin);const gun=window.Ranged&&Ranged.WEAPONS[item.id];if(gun&&item.ammo>0)game.give(gun.ammo,item.ammo);CombatAudio.pickup();}}
    catch(e){/* Retry the same key: server receipts make a lost response safe. */}
    finally{d.pending=false;d.nextClaim=Date.now()+500;}
  }
  function drop(i) { const d = list[i]; game.scene.remove(d.g); d.g.traverse(o => { if (o.geometry) o.geometry.dispose(); }); list.splice(i, 1); }
  let last = 0;
  (function tick(now) {
    requestAnimationFrame(tick);
    const dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
    if (!window.game || !list.length) return;
    const p = game.p, solid = (x, y, z) => { const b = game.world.get(x, y, z); return !!b && b !== 5 && !Core.PASS.has(b); };
    let got = false;
    for (let i = list.length - 1; i >= 0; i--) {
      const d = list[i], dist = near(d, p);
      if(d.shared){
        const age=(Date.now()-d.created)/1000,mine=d.local||window.Net&&d.owner===Net.playerId;
        if(age>300){drop(i);continue;}
        if(game.playing&&!game.dead&&age>(mine?2.5:.6)&&dist<1.2&&!d.pending&&Date.now()>(d.nextClaim||0)&&(d.local||window.Net&&Net.connected))claim(d);
        const arc=age<.6?Math.sin(age/.6*Math.PI)*.6:0;
        d.ph+=dt*1.5;d.g.position.set(d.x,d.y+.1+arc+Math.sin(d.ph*1.5)*.04,d.z);d.spin.rotation.y=d.ph;continue;
      }
      if (game.time - d.t0 > LIFE) { drop(i); continue; }
      if (game.playing && !game.dead && dist < PICK) { game.give(d.id, d.n); drop(i); got = true; continue; }
      if (game.playing && !game.dead && dist < PULL) { const k = Math.min(1, dt * 9); d.x += (p.x - d.x) * k; d.y += (p.y + 0.6 - d.y) * k; d.z += (p.z - d.z) * k; } // 被吸过来
      else if (game.playing) d.rest = fall(d, dt, solid) || d.rest && d.vy === 0;
      d.ph += dt * 2;
      d.g.position.set(d.x, d.y + (d.rest ? 0.12 + Math.sin(d.ph * 1.5) * 0.06 : 0), d.z); d.spin.rotation.y = d.ph;
    }
    if (got) { game.renderBar(); if (window.CombatAudio && CombatAudio.pickup) CombatAudio.pickup(); }
  })();
  window.Drops = { spawn, landing, thrown, addShared, removeShared, syncShared, get count() { return list.length; } };
})();
