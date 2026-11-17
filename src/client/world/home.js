// Stonisle — 家居与植物的互动（PRD FR-018）：开关门、睡觉、摘浆果、种植与生长。
// 方块外形和碰撞在 core.js；这里只管“对着它右键会怎样、放下去要满足什么、挖掉会得到什么”。
// game.js 在放置时先问 Home.use()，挖掉时问 Home.dug()，倒下重生时问 Home.spawn()。
window.Home = (() => {
  const DOOR = 60, PANE = 64, BED = 66, BUSH = 71, BUSH0 = 72, SAPLING = 73, SIGN = 74, CHEST = 76, BERRY = 32, LOG = 6, LEAF = 7, DAY = 600;
  const FOOD = { [BERRY]: 2, 112: 2, 115: 3, 177: 3, 178: 3, 256: 3, 257: 2, 258: 2 }; // 苹果、芒果、香蕉各回 3 点；葡萄、荔枝各回 2 点
  const isSign = b => b === 74 || b === 75, $ = id => document.getElementById(id);
  const isDoor = b => !!Core.doorBase(b), isBed = b => b === 66 || b === 67, isFlower = b => b >= 68 && b <= 70;
  const get = (x, y, z) => game.world.get(x, y, z), key = c => c.x + ',' + c.y + ',' + c.z;
  const wick = text => Lang.say(text, false, 1.4);

  // Keep chest contents with their world; migrate the legacy shared data once.
  const homePreview=new URLSearchParams(location.search).has('preview'),homeId=Number(new URLSearchParams(location.search).get('save'))||1,homeKey='stonisle.home'+(homeId>1?'.'+homeId:'');
  let st;try{st=game.homeState||(homePreview?{}:JSON.parse(localStorage.getItem(homeKey)||localStorage.getItem('stonisle.home')))||{};}catch(e){st={};}
  const visiting=window.Net&&Net.guest;
  if(visiting)st={...(Net.state.home||{})};
  st.grow=st.grow||{};st.leaves=st.leaves||0;st.chests=st.chests||{};st.signs=st.signs||{};
  const save=()=>{if(homePreview)return;if(!visiting){try{localStorage.setItem(homeKey,JSON.stringify(st));}catch(e){}game.saveNow();}if(window.Net)Net.home({signs:st.signs,chests:st.chests});};
  function seedChest(c,items,token){
    if(visiting)return false;st.seeded ||= {};if(st.seeded[token])return false;
    const k=key(c);st.chests[k] ||= {};for(const [id,n] of Object.entries(items))st.chests[k][id]=(st.chests[k][id]||0)+n;
    st.seeded[token]=true;save();return true;
  }

  const alongZ = () => Math.abs(Math.cos(game.yaw)) > Math.abs(Math.sin(game.yaw)); // 玩家面朝南北
  const free = (x, y, z) => { // 这一格是空气，而且不和玩家重叠
    const p = game.p;
    return get(x, y, z) === 0 && !(x + 1 > p.x - 0.3 && x < p.x + 0.3 && y + 1 > p.y && y < p.y + 1.8 && z + 1 > p.z - 0.3 && z < p.z + 0.3);
  };
  function put(cells, block, item) { // 一格或两格的物品：全部放得下才放，放不下不扣物品
    if (!cells.every(c => free(...c))) { wick('There is no room.'); return true; }
    for (const c of cells) game.setBlock(...c, block);
    if (!(window.Creative && Creative.on)) game.inv[item]--;
    return true;
  }

  const bedPreview=new URLSearchParams(location.search).has('preview');
  const bedKey='stonisle.bed.'+(bedPreview?'preview.':'')+(visiting?'guest.'+location.host+'.'+(Net.state.world||'world'):'save.'+(new URLSearchParams(location.search).get('save')||'1'));
  let personalBed;try{personalBed=JSON.parse(localStorage.getItem(bedKey));}catch(e){}
  if(!personalBed&&!visiting&&!(new URLSearchParams(location.search).get('save')>1))personalBed=st.bed;
  let resting=null;
  function sleep(h) {
    if(resting||game.dead)return;
    personalBed=[h.x,h.y,h.z];
    try{localStorage.setItem(bedKey,JSON.stringify(personalBed));}catch(e){wick('Could not save your respawn point.');return;}
    st.bed=personalBed;if(!bedPreview)save();
    const saved=game.saveNow();
    if(visiting)Net.checkpoint();
    const night=game.dayK<.1, safe=!game.mobs.some(m=>m.type.hostile&&Math.hypot(m.x-game.p.x,m.z-game.p.z)<16);
    const alone=!window.Net?.connected;
    const start=performance.now(),ns=get(h.x,h.y,h.z)===67;
    resting={start,h,ns};
    const el=document.createElement('div');el.style='position:fixed;inset:0;z-index:70;pointer-events:auto;display:grid;place-items:center;color:#eadbc1;font:18px system-ui;background:#090c16;opacity:0;transition:opacity .65s';
    el.textContent=saved===false?'Save failed — respawn point recorded':visiting?'Respawn point set · Saving with host…':'Respawn point set · Resting…';document.body.append(el);
    setTimeout(()=>{el.style.opacity='1';},500);
    setTimeout(()=>{
      if(alone&&night&&safe&&!game.dead){game.time=(Math.floor(game.time/DAY)+1)*DAY+12;st.sleeps=(st.sleeps||0)+1;if(!bedPreview)save();}
      const ok=game.saveNow();el.textContent=ok===false?'Could not save. Please try again.':'Respawn point set';el.style.opacity='0';
    },1600);
    setTimeout(()=>{resting=null;el.remove();},2300);
  }
  function sleepCamera(camera){
    if(!resting)return;
    const t=Math.min(1,(performance.now()-resting.start)/600),k=t*t*(3-2*t),h=resting.h;
    camera.position.lerp(new THREE.Vector3(h.x+.5,h.y+.78,h.z+.5),k);
    const q=new THREE.Quaternion().setFromEuler(new THREE.Euler(.85,resting.ns?0:Math.PI/2,.10,'YXZ'));camera.quaternion.slerp(q,k);
  }

  // 门开到哪一侧，开的时候看周围决定（关着的门不记方向）：
  //   旁边是另一扇门 → 门板靠远离它的一侧，两扇并排就是对开的双开门；
  //   只有一侧是墙 → 门板靠墙；
  //   两侧都是墙（或都空着）→ 看你站在门的哪一边，门板转到离你远的那一侧，开口留在你面前。
  function doorToggle(b, x, y, z) {
    const base = Core.doorBase(b), w = Core.WOODS.find(v => v.door === base), k = b - base;
    if (b >= 248) return base + (b & 1);            // 另一侧开着的 → 关上
    if (k >= 2) return b - 2;                        // 开着的 → 关上
    const lo = k ? get(x, y, z - 1) : get(x - 1, y, z), hi = k ? get(x, y, z + 1) : get(x + 1, y, z); // 门板两头挨着的方块
    const wall = n => !!n && n !== 5 && !Core.PASS.has(n) && !isDoor(n);
    let high;
    if (isDoor(lo) !== isDoor(hi)) high = isDoor(lo);
    else if (wall(lo) !== wall(hi)) high = wall(hi);
    else high = (k ? game.p.z - (z + 0.5) : game.p.x - (x + 0.5)) < 0;
    return high ? w.doorR + k : b + 2;
  }
  // 对着方块右键（h = 准星所指，id = 手里的物品）。返回 true 表示这次右键已经处理了，游戏不要再按普通方块去放
  function use(h, id) {
    if (h) {
      const b = get(h.x, h.y, h.z);
      if (isDoor(b)) { // 开 / 关：上下两格一起换
        const to = doorToggle(b, h.x, h.y, h.z);
        game.setBlock(h.x, h.y, h.z, to);
        for (const oy of [1, -1]) if (get(h.x, h.y + oy, h.z) === b) { game.setBlock(h.x, h.y + oy, h.z, to); break; }
        return true;
      }
      if (isBed(b)) { sleep(h); return true; }
      if (Core.isChest(b)) { openChest(h); return true; }
      if (isSign(b)) { write(key(h)); return true; }                                   // 再右键可以改字
      if (b === BUSH) { // 摘浆果：一丛 3 颗，两个游戏日后再结
        game.setBlock(h.x, h.y, h.z, BUSH0); game.give(BERRY, 3);
        st.grow[key(h)] = game.time; save(); wick('Berries! Yum!');
        return true;
      }
    }
    if (FOOD[id]) { game.eatFood(id); return true; } // Shared satiety and health rules.

    if (!h || !(game.inv[id] > 0) || !(h.n[0] || h.n[1] || h.n[2])) return false;
    const x = h.x + h.n[0], y = h.y + h.n[1], z = h.z + h.n[2], ns = alongZ();
    if (Core.doorBase(id)) {const base=Core.doorBase(id);return put([[x,y,z],[x,y+1,z]],base+(ns?0:1),id);}       // 门板横在玩家面前
    const ladder=Core.ladderInfo(id);
    if(ladder){
      if(h.n[1]!==0){wick('Place a ladder on a wall.');return true;}
      const dir=[[0,0,1],[-1,0,0],[0,0,-1],[1,0,0]].findIndex(n=>n[0]===h.n[0]&&n[2]===h.n[2]);
      const block=Core.WOODS[ladder.wood].ladder+dir;
      if(!Core.ladderSupported(get,x,y,z,Core.ladderInfo(block))){wick('It needs a solid wall.');return true;}
      return put([[x,y,z]],block,id);
    }
    const upside=h.n[1]<0||(h.n[1]===0&&h.point&&h.point[1]-h.y>.5);
    const stair=Core.stairInfo(id);
    if(stair){const w=Core.WOODS[stair.wood],dir=ns?(Math.cos(game.yaw)>0?0:2):(Math.sin(game.yaw)<0?1:3);return put([[x,y,z]],(upside?w.inverted:w.stairs)+dir,id);}
    const slab=Core.slabInfo(id);
    if(slab){
      const w=Core.WOODS[slab.wood],target=Core.slabInfo(get(h.x,h.y,h.z));
      let cell=[x,y,z],existing=Core.slabInfo(get(x,y,z));
      if(target&&target.wood===slab.wood&&((target.half===0&&h.n[1]===1)||(target.half===1&&h.n[1]===-1))){cell=[h.x,h.y,h.z];existing=target;}
      if(existing&&existing.wood===slab.wood&&existing.half!==2){
        const [cx,cy,cz]=cell,p=game.p;
        if(cx+1>p.x-.3&&cx<p.x+.3&&cy+1>p.y&&cy<p.y+1.8&&cz+1>p.z-.3&&cz<p.z+.3){wick('There is no room.');return true;}
        game.setBlock(...cell,w.doubleSlab);game.inv[id]--;return true;
      }
      return put([cell],upside?w.upperSlab:w.slab,id);
    }
    if (id === PANE) return put([[x, y, z]], ns ? 64 : 65, PANE);
    if (id === SIGN) { // 牌面朝着玩家；放下后马上写字，不写就不放
      const had = game.inv[SIGN];
      put([[x, y, z]], ns ? 74 : 75, SIGN);
      if (game.inv[SIGN] < had && !write(x + ',' + y + ',' + z)) { game.setBlock(x, y, z, 0); game.inv[SIGN]++; }
      return true;
    }
    if (id === BED) { // 床顺着玩家面朝的方向伸出去一格
      const dx = ns ? 0 : (Math.sin(game.yaw) < 0 ? 1 : -1), dz = ns ? (Math.cos(game.yaw) > 0 ? -1 : 1) : 0;
      return put([[x, y, z], [x + dx, y, z + dz]], ns ? 67 : 66, BED);
    }
    if (isFlower(id) || id === SAPLING || id === BUSH) {
      const soil = get(x, y - 1, z);
      if (soil !== 1 && soil !== 2) { wick('It needs dirt.'); return true; }
      const had = game.inv[id];
      put([[x, y, z]], id, id);
      if (id === SAPLING && game.inv[id] < had) { st.grow[x + ',' + y + ',' + z] = game.time; save(); wick('A little tree! It will grow.'); }
      return true;
    }
    return false;
  }

  // 挖掉一格之后（这一格已经是空气）。返回应该进背包的物品
  function dug(h, id) {
    if (isDoor(id)) { for (const oy of [1, -1]) if (get(h.x, h.y + oy, h.z)===id) { game.setBlock(h.x, h.y + oy, h.z, 0); break; } return Core.doorBase(id); }
    const ladder=Core.ladderInfo(id);if(ladder)return Core.WOODS[ladder.wood].ladder;
    const stair=Core.stairInfo(id);if(stair)return Core.WOODS[stair.wood].stairs;
    const slab=Core.slabInfo(id);if(slab){const item=Core.WOODS[slab.wood].slab;if(slab.half===2)game.give(item,1);return item;}
    if (id === 65) return PANE;
    if (isBed(id)) { // 另一半也拿走；这张床不再是重生点
      for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (get(h.x + dx, h.y, h.z + dz) === id) { game.setBlock(h.x + dx, h.y, h.z + dz, 0); break; }
      if (st.bed && Math.abs(st.bed[0] - h.x) + Math.abs(st.bed[2] - h.z) <= 1 && st.bed[1] === h.y) { delete st.bed; save(); }
      return BED;
    }
    if (id === BUSH || id === BUSH0 || id === SAPLING) { delete st.grow[key(h)]; save(); return id === SAPLING ? SAPLING : BUSH; }
    if (isSign(id)) { delete st.signs[key(h)]; save(); return SIGN; }
    if (Core.isChest(id)) { // 箱子里的东西全部回到背包，不丢
      const box = st.chests[key(h)] || {};
      for (const i in box) game.give(+i, box[i]);
      delete st.chests[key(h)]; save(); return id;
    }
    if (id === LEAF) { if (++st.leaves % 8 === 0) game.give(SAPLING); save(); }      // 每挖满 8 片树叶给 1 棵树苗（不是随机）
    return id;
  }

  const spawn = () => (personalBed && isBed(get(...personalBed)) ? { x: personalBed[0]+.5,y:personalBed[1]+1,z:personalBed[2]+.5 } : null);

  function growTree(x, y, z) { // 和自然生成的阔叶树同一个样子：4 格树干，两层大叶两层小叶
    for (let i = 1; i <= 5; i++) { const b = get(x, y + i, z); if (b !== 0 && b !== LEAF) return false; } // 头顶没地方就先不长
    const set = (a, b, c, id) => game.world.set(a, b, c, id);
    for (let dy = 2; dy <= 5; dy++) {
      const r = dy < 4 ? 2 : 1;
      for (let dz = -r; dz <= r; dz++) for (let dx = -r; dx <= r; dx++)
        if (!(Math.abs(dx) === r && Math.abs(dz) === r) && get(x + dx, y + dy, z + dz) === 0) set(x + dx, y + dy, z + dz, LEAF);
    }
    for (let i = 1; i < 4; i++) set(x, y + i, z, Core.woodLogAt(x,z));
    for (const [dx, dz] of [[2, 0], [-2, 0], [0, 2], [0, -2]]) game.setBlock(x + dx, y + 2, z + dz, get(x + dx, y + 2, z + dz)); // 让波及的区块重建网格
    game.setBlock(x, y, z, Core.woodLogAt(x,z));
    return true;
  }
  setInterval(() => { // 生长不逐帧算：每 3 秒看一眼记下的时间
    if (!window.game) return;
    let changed = false;
    for (const k in st.grow) {
      const [x, y, z] = k.split(',').map(Number), b = get(x, y, z), age = game.time - st.grow[k];
      if (b === SAPLING) { if (age < DAY || !growTree(x, y, z)) continue; if (Math.hypot(x - game.p.x, z - game.p.z) < 24) wick('The tree is big now!'); }
      else if (b === BUSH0) { if (age < 2 * DAY) continue; game.setBlock(x, y, z, BUSH); }
      delete st.grow[k]; changed = true;                                                // 长成了，或者那里已经不是它了
    }
    if (changed) save();
  }, 3000);

  // —— 告示牌：写一个英文词或短句；对准它时显示并由 Wick 读出来 ——
  function write(k) { // 返回是否写上了字
    const text = (prompt('Write on the sign:', st.signs[k] || '') || '').replace(/[^A-Za-z0-9 .,!?'-]/g, '').trim().slice(0, game.inv[49] ? 48 : 24); // 有羽毛笔可以写 48 个字符
    if (!text) return false;
    st.signs[k] = text; save(); lastRead = '';
    return true;
  }
  let lastRead = '';
  function label(h) { // game.js 每帧问：准星所指的这一格要显示什么名字（返回空则用方块自己的名字）
    if (!isSign(get(h.x, h.y, h.z))) { lastRead = ''; return ''; }
    const k = key(h), text = st.signs[k] || 'sign';
    if (k !== lastRead) { lastRead = k; if (st.signs[k]) wick(text); }
    return text;
  }

  // —— 箱子：打开的是箱子自己的界面——上面是箱子的 27 格，下面是你的背包；角色和合成两栏收起来。
  // 点背包里的东西放进箱子，点箱子里的东西拿回背包（整叠移动）。暂停、放开鼠标、关闭仍然借用背包面板那一套。
  // ponytail: 箱子里按“物品 → 数量”记，27 格就是最多 27 种物品，每种不限数量；要做成一格一叠再改存法。
  const SLOTS = 27;
  let chestKey = null;
  let chestRoot=null,chestBag=null;
  function chestSlots(){st.chestSlots ||= {};return st.chestSlots[chestKey];}
  function flushChest(){if(!chestKey)return;const items={};for(const v of chestSlots())if(v)items[v.id]=(items[v.id]||0)+v.n;st.chests[chestKey]=items;save();game.renderBar();drawChest();}
  function insertChest(index,id,n,exclude=-1){if(!chestKey||visiting)return 0;return ContainerTransfer.insert(chestSlots(),id,n,{size:SLOTS,target:index,exclude});}

  function initChest(){if(chestRoot)return;chestRoot=document.createElement('div');chestRoot.id='chestOverlay';chestRoot.hidden=true;
    chestRoot.innerHTML='<section role="dialog" aria-modal="true" aria-label="箱子与背包"><button class="station-close" aria-label="关闭箱子">×</button><div class="station-layout"><div class="station-controls"><h2>箱子</h2><p id="chestHint">点击背包存入，点击箱子物品取回。</p><div id="chestGrid" aria-label="箱子物品格"></div><p id="chestNote" role="status"></p></div></div></section>';
    document.body.append(chestRoot);const layout=chestRoot.querySelector('.station-layout'),controls=layout.firstElementChild;
    chestBag=StationInventory.create(layout,{accept:()=>!visiting,onSelect:(id,amount)=>{if(!chestKey||visiting)return;const moved=insertChest(-1,id,Math.min(game.inv[id]||0,amount??Infinity));game.inv[id]-=moved;$('chestNote').textContent=moved?'已存入 '+Lang.display(id)+' × '+moved:'箱子已满';flushChest();}});layout.append(controls);
    chestRoot.querySelector('.station-close').onclick=closeChest;
    chestRoot.addEventListener('keydown',e=>{e.stopPropagation();if(e.code==='Escape'||e.code==='KeyE'){e.preventDefault();closeChest();}if(e.code==='Tab'){const nodes=[...chestRoot.querySelectorAll('button:not(:disabled)')],first=nodes[0],last=nodes[nodes.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
  }
  function drawChest(){if(!chestKey)return;const slots=chestSlots();chestBag.render();$('chestHint').textContent=slots.filter(Boolean).length+' / '+SLOTS+' 格';$('chestGrid').replaceChildren();
    for(let i=0;i<SLOTS;i++){const v=slots[i],b=document.createElement('button');b.className='station-item';b.type='button';b.setAttribute('aria-label','箱子格 '+(i+1)+'：'+(v?Lang.display(v.id)+' × '+v.n:'空'));if(v){const img=document.createElement('img'),n=document.createElement('b');img.src=game.icon(v.id);img.alt='';n.textContent=v.n;b.append(img,n);}b.disabled=visiting;
      StationInventory.bindStack(b,half=>{const v=slots[i];if(!chestKey||visiting||!v)return;const n=half?Math.ceil(v.n/2):v.n;game.give(v.id,n);v.n-=n;if(!v.n)slots[i]=null;flushChest();},{kind:'chest',index:i,get:()=>chestKey&&!visiting?slots[i]:null,remove:n=>{slots[i].n-=n;if(!slots[i].n)slots[i]=null;},refresh:flushChest});
      StationInventory.dropTarget(b,(id,n,src)=>{if(src.kind==='chest'&&src.index===i)return 0;const accepted=insertChest(i,id,n,src.kind==='chest'?src.index:-1);if(accepted)setTimeout(flushChest,0);return accepted;});$('chestGrid').append(b);
    }
  }
  function openChest(h){initChest();chestKey=key(h);st.chests[chestKey] ||= {};st.chestSlots ||= {};const saved=st.chestSlots[chestKey],total={};for(const v of saved||[])if(v)total[v.id]=(total[v.id]||0)+v.n;const items=st.chests[chestKey];if(!saved||Object.keys({...total,...items}).some(id=>(total[id]||0)!==(items[id]||0)))st.chestSlots[chestKey]=Array.from({length:SLOTS},(_,i)=>{const id=Object.keys(items)[i];return id?{id:+id,n:items[id]}:null;});chestRoot.hidden=false;game.furnaceModal(true);chestBag.reset();$('chestNote').textContent='点击左侧背包物品即可存入。';drawChest();chestRoot.querySelector('.station-close').focus();}
  function closeChest(){if(!chestKey)return;chestKey=null;chestRoot.hidden=true;game.saveNow();game.furnaceModal(false);}
  setInterval(()=>{if(!chestKey)return;const [x,y,z]=chestKey.split(',').map(Number);if(!Core.isChest(game.world.get(x,y,z))||Math.hypot(game.p.x-x-.5,game.p.y-y,game.p.z-z-.5)>7||game.dead)closeChest();},300);

  return { openChest,closeChest,get chestOpened(){return !!chestKey;},get state(){return st;},seedChest,sleepCamera, get sleeping(){return !!resting;}, get sleeps() { return st.sleeps || 0; }, use, dug, spawn, label, sync(d) { st.signs = d.signs || {}; st.chests = d.chests || {}; lastRead = ''; if (!visiting) save(); } }; // sync：联机时别人改了告示牌或箱子
})();
