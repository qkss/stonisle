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

  // 要记住的事：种下/摘取的时间、已挖的树叶数、最后睡过的床
  // ponytail: 这份记录不分世界（和任务进度一样）；存档系统按世界分开学习数据时一起迁过去
  let st; try { st = JSON.parse(localStorage.getItem('stonisle.home')) || {}; } catch (e) { st = {}; }
  const visiting = window.Net && Net.guest; // 局域网访客：告示牌和箱子用主机的，不动自己的记录
  if (visiting) st = { ...(Net.state.home || {}) };
  st.grow = st.grow || {}; st.leaves = st.leaves || 0;
  st.chests = st.chests || {}; st.signs = st.signs || {};   // 箱子里的东西、告示牌上的字，按位置记
  const save = () => { if (!visiting) try { localStorage.setItem('stonisle.home', JSON.stringify(st)); } catch (e) { /* 存不下就不记 */ } if (window.Net) Net.home({ signs: st.signs, chests: st.chests }); };

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

  function sleep(h) {
    st.bed = [h.x, h.y, h.z]; save(); // 点一下床就把它记成存档点（倒下后在这里醒来），不管白天黑夜；夜里且附近没有怪物才真的睡到天亮
    if (game.dayK >= 0.1) return wick('This is your bed now. Come back at night to sleep.');
    if (game.mobs.some(m => m.type.hostile && Math.hypot(m.x - game.p.x, m.z - game.p.z) < 16)) return wick('This is your bed now. A monster is near. We can not sleep.');
    wick('Good night!'); st.sleeps = (st.sleeps || 0) + 1; save(); // 记一次“真的睡着了”，任务引导看这个数
    const el = document.body.appendChild(Object.assign(document.createElement('div'), { style: 'position:fixed;inset:0;background:#05040a;opacity:0;transition:opacity .8s;z-index:7;pointer-events:none' }));
    requestAnimationFrame(() => { el.style.opacity = 1; });
    setTimeout(() => { game.time = (Math.floor(game.time / DAY) + 1) * DAY + 12; el.style.opacity = 0; }, 1100); // 跳到第二天清晨；时钟只往前走，工序和生长照常结算
    setTimeout(() => el.remove(), 2200);
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

  const spawn = () => (st.bed && isBed(get(...st.bed)) ? { x: st.bed[0] + 0.5, y: st.bed[1] + 1, z: st.bed[2] + 0.5 } : null);

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
  const css = document.createElement('style');
  css.textContent = `
    #bag.chest > #sack { flex-direction: column; gap: 14px; flex-wrap: nowrap; }
    #bag.chest > #sack > section:not(.chestKeep) { display: none; }
    #chestBox { order: -1; }
    #chestGrid { display: grid; grid-template-columns: repeat(9, 40px); gap: 5px; }
    #chestGrid div { position: relative; width: 40px; height: 40px; border-radius: 6px; background: #1d1712 center/cover; box-shadow: inset 0 0 0 1px #6b513a, inset 0 2px 5px #000c; }
    #chestGrid div[data-id] { cursor: pointer; }
    #chestGrid b { position: absolute; right: 3px; bottom: 0; font: 10px ui-monospace, monospace; color: #fff; text-shadow: 0 0 2px #000; }
    body.mobile #chestGrid { grid-template-columns: repeat(9, 32px); gap: 3px; } body.mobile #chestGrid div { width: 32px; height: 32px; }`;
  document.head.appendChild(css);
  const bagBox = $('grid').parentElement, bagHint = (bagBox && bagBox.querySelector('small')) || { textContent: '' }, HINT = bagHint.textContent; // 测试里的假页面没有这些节点
  if (bagBox) bagBox.classList.add('chestKeep');
  function drawChest() {
    let box = $('chestBox');
    if (!box) {
      box = $('sack').appendChild(Object.assign(document.createElement('section'), { id: 'chestBox', className: 'chestKeep' }));
      box.innerHTML = '<h3>Chest<small id="chestHint"></small></h3><div id="chestGrid"></div>';
      $('bag').classList.add('chest'); bagHint.textContent = 'Click an item to put it in the chest.';
    }
    const items = st.chests[chestKey], ids = Object.keys(items);
    $('chestHint').textContent = ids.length >= SLOTS ? 'The chest is full.' : 'Click an item to take it out.';
    $('chestGrid').innerHTML = ids.map(id => `<div data-id="${id}" title="${Lang.item(+id)}" style="background-image:url(${game.icon(+id)})"><b>${items[id]}</b></div>`).join('') + '<div></div>'.repeat(Math.max(0, SLOTS - ids.length));
    for (const d of $('chestGrid').querySelectorAll('[data-id]')) d.onclick = () => { const id = +d.dataset.id; game.give(id, items[id]); delete items[id]; save(); game.renderBag(); drawChest(); };
  }
  function openChest(h) {
    chestKey = key(h); st.chests[chestKey] = st.chests[chestKey] || {};
    if ($('bag').classList.contains('off')) dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyE' })); // 让游戏自己打开背包（暂停、放开鼠标都由它处理）
    drawChest();
  }
  $('grid').addEventListener('click', e => { // 箱子开着时，点背包里的物品 = 放进箱子（抢在游戏“放进快捷栏”之前）
    const cell = chestKey && e.target.closest('#grid > div[title]'); if (!cell) return;
    const id = Object.keys(game.inv).map(Number).find(i => game.inv[i] > 0 && Lang.item(i) === cell.title); if (!id) return;
    e.stopPropagation();
    const items = st.chests[chestKey]; if (!(id in items) && Object.keys(items).length >= SLOTS) return; /* 满了：放不进去 */
    items[id] = (items[id] || 0) + game.inv[id]; delete game.inv[id];
    save(); game.renderBar(); game.renderBag(); drawChest();
  }, true);
  setInterval(() => { if (chestKey && $('bag').classList.contains('off')) { chestKey = null; if ($('chestBox')) $('chestBox').remove(); $('bag').classList.remove('chest'); bagHint.textContent = HINT; } }, 300); // 背包关了，箱子栏跟着收起

  return { get sleeps() { return st.sleeps || 0; }, use, dug, spawn, label, sync(d) { st.signs = d.signs || {}; st.chests = d.chests || {}; lastRead = ''; if (!visiting) save(); } }; // sync：联机时别人改了告示牌或箱子
})();
