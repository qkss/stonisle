// 种植和水桶。方块、贴图在 core.js / game.js；这里只管“右键做什么、挖掉给什么、多久长成”。
// · 种子（100–104）：对着草地、泥土或耕地的顶面右键 → 脚下变成耕地，上面长出幼苗；过一阵长成对应的花。
//   耕地 4 格内有水，长得快一倍。对幼苗用肥料（105，泥团、缠藤、鬃猪掉落）→ 马上长成。
// · 挖花：得到花，外加 1 颗种子；长在耕地上的给 2 颗（固定，不是随机）。挖幼苗：拿回种子。
// · 竹子（89）：种在土上，自己一节节往上长，最高 6 节；挖下面一节，上面的一起掉。
// · 木桶 / 铁桶（106 / 108）：对着水右键装水（变成 107 / 109），对着方块右键把水倒在那一面外。两种桶用法一样，只是材料不同。
// game.js 里三处调用：右键时 Farm.use(h, id)；挖掉后 Farm.dug(h, id)（返回 undefined 表示不归这里管）。
(() => {
  const SEED = { 100: 77, 101: 78, 102: 79, 103: 87, 104: 88, 259: 119, 260: 143 }, FRUIT = { 145: 177, 152: 178, 159: 256, 176: 257, 199: 258 }, // 259 南瓜籽 → 南瓜，260 西瓜籽 → 西瓜；结果的树叶挖下来是果子：苹果、芒果、香蕉、葡萄、荔枝
     SEED_OF = Object.fromEntries(Object.entries(SEED).map(([s, f]) => [f, +s]));
  const FARM = 98, SPROUT = 99, BAMBOO = 89, FERT = 105, WATER = 5, GRASS = 1, DIRT = 2;
  const FILL = { 106: 107, 108: 109 }, POUR = { 107: 106, 109: 108 };
  // 篝火（179）：拿着木头、木板、煤、竹子、树叶或藤对它右键 = 添柴，烧多久看燃料；烧着的时候拿生肉对它右键 = 烤成熟肉。
  const FIRE = 179, FUEL = { 6: 60, 180: 60, 181: 60, 182: 60, 8: 20, 93: 20, 94: 20, 95: 20, 11: 120, 89: 15, 7: 5, 35: 10 }, FIRE_MAX = 600; // 燃料 → 能烧的秒数；最多攒 10 分钟
  const COOK = { 30: 273, 268: 274, 269: 275, 270: 276, 271: 277, 272: 278, 112: 279 }, COOK_COST = 5;                                        // 生的 → 熟的；每烤一块用掉 5 秒的火
  const GROW = 120, BAMBOO_STEP = 45, BAMBOO_MAX = 6, REACH = 4.5; // 幼苗 120 秒长成（近水 60 秒）；竹子每 45 秒长一节
  const soil = b => b === GRASS || b === DIRT || b === FARM;
  const nearWater = (get, x, y, z) => { for (let dx = -4; dx <= 4; dx++) for (let dz = -4; dz <= 4; dz++) for (let dy = -1; dy <= 0; dy++) if (get(x + dx, y + dy, z + dz) === WATER) return true; return false; };
  const ripe = (age, wet) => age >= (wet ? GROW / 2 : GROW);
  const burning = (until, now) => until > now, stoke = (until, now, sec) => Math.min(now + FIRE_MAX, Math.max(until || 0, now) + sec); // 添柴后烧到什么时候
  if (typeof document === 'undefined') { module.exports = { ripe, soil, nearWater, SEED, FUEL, COOK, burning, stoke }; return; }

  const KEY = 'stonisle.farm';
  let st; try { st = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { st = {}; }
  st.crops = st.crops || {}; st.bamboo = st.bamboo || {}; st.fires = st.fires || {}; // fires：篝火的位置 → 烧到什么时候（游戏时间）
    // 位置 → { to: 长成什么, t: 种下的时间 }；竹根的位置 → 上次长高的时间
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { /* 存不下就不记 */ } };
  const get = (x, y, z) => game.world.get(x, y, z), key = (x, y, z) => x + ',' + y + ',' + z;
  const wick = t => Lang.say(t, false, 1.4), free = () => window.Creative && Creative.on;
  const spend = id => { if (!free()) game.inv[id]--; };
  const swap = (from, to) => { game.inv[from]--; game.give(to, 1); const i = game.slots.indexOf(from); if (i >= 0 && !(game.inv[from] > 0)) game.slots[i] = to; }; // 桶换成另一种状态，还留在原来那一格

  function waterAhead() { // 准星前面第一格水（比挡路的方块近才算）
    const p = game.p, d = game.lookDir(), o = [p.x, p.y + game.eye, p.z];
    for (let t = 0.3; t <= REACH; t += 0.1) {
      const x = Math.floor(o[0] + d[0] * t), y = Math.floor(o[1] + d[1] * t), z = Math.floor(o[2] + d[2] * t), b = get(x, y, z);
      if (b === WATER) return [x, y, z];
      if (b && !Core.PASS.has(b)) return null;
    }
    return null;
  }

  function use(h, id) {
    if (!(game.inv[id] > 0)) return false;
    if (FILL[id]) { // 空桶：装水
      const w = waterAhead();
      if (!w) return wick('Point at water to fill the bucket.'), true;
      game.setBlock(w[0], w[1], w[2], 0); swap(id, FILL[id]);
      return true;
    }
    if (POUR[id]) { // 装了水的桶：倒在准星指着的那一面外
      if (!h || !(h.n[0] || h.n[1] || h.n[2])) return true;
      const x = h.x + h.n[0], y = h.y + h.n[1], z = h.z + h.n[2], b = get(x, y, z);
      if (b && !Core.PASS.has(b)) return true;
      game.setBlock(x, y, z, WATER); swap(id, POUR[id]);
      return true;
    }
    if (!h) return false;
    const b = get(h.x, h.y, h.z);
    if (b === FIRE) { // 对着篝火：添柴或者烤肉
      const k = key(h.x, h.y, h.z), lit = burning(st.fires[k] || 0, game.time);
      if (FUEL[id]) { st.fires[k] = stoke(st.fires[k], game.time, FUEL[id]); spend(id); save(); flames(); if (!lit) wick('The fire is burning!'); return true; }
      if (COOK[id]) {
        if (!lit) return wick('The fire is out. Put wood on it.'), true;
        game.inv[id]--; game.give(COOK[id], 1); st.fires[k] -= COOK_COST; save(); flames(); wick('It smells good!');
        return true;
      }
      return wick(lit ? 'Hold meat to cook it.' : 'It needs wood.'), true;
    }
    if (id === FERT) { // 肥料：幼苗马上长成
      const c = b === SPROUT && st.crops[key(h.x, h.y, h.z)];
      if (!c) return wick('Use this on a little plant.'), true;
      game.setBlock(h.x, h.y, h.z, c.to); delete st.crops[key(h.x, h.y, h.z)]; spend(id); save();
      return true;
    }
    const top = h.n[1] === 1, x = h.x, y = h.y + 1, z = h.z;
    if (SEED[id]) { // 种子：种在土的顶面上，土变成耕地
      if (!top || !soil(b)) return wick('Seeds need dirt.'), true;
      if (get(x, y, z)) return true;
      if (b !== FARM) game.setBlock(h.x, h.y, h.z, FARM);
      game.setBlock(x, y, z, SPROUT); st.crops[key(x, y, z)] = { to: SEED[id], t: game.time }; spend(id); save();
      wick(nearWater(get, h.x, h.y, h.z) ? 'It is near water. It will grow fast.' : 'A seed! Water helps it grow.');
      return true;
    }
    if (Core.PLANTS[id] && id !== SPROUT) { // 直接放花和竹子：要放在土上；竹子还能接在竹子上
      if (!top || !(soil(b) || (id === BAMBOO && b === BAMBOO))) return wick('It needs dirt.'), true;
      if (get(x, y, z)) return true;
      game.setBlock(x, y, z, id); spend(id);
      if (id === BAMBOO && b !== BAMBOO) { st.bamboo[key(x, y, z)] = game.time; save(); }
      return true;
    }
    return false;
  }

  function dug(h, id) { // 这一格已经是空气了
    const k = key(h.x, h.y, h.z);
    if (FRUIT[id]) return FRUIT[id];                // 结果的树叶：摘到 1 个果子，叶子不留（免得摆回去再摘）
    if (id === FIRE) { delete st.fires[k]; save(); flames(); return FIRE; }
    if (id === SPROUT) { const c = st.crops[k]; delete st.crops[k]; save(); return c ? SEED_OF[c.to] : 0; }
    if (SEED_OF[id]) { game.give(SEED_OF[id], get(h.x, h.y - 1, h.z) === FARM ? 2 : 1); return id; }
    if (id === BAMBOO) { // 上面的竹节一起掉下来
      delete st.bamboo[k]; save();
      for (let y = h.y + 1; get(h.x, y, h.z) === BAMBOO; y++) { game.setBlock(h.x, y, h.z, 0); game.give(BAMBOO, 1); }
      return BAMBOO;
    }
    if (id === FARM || id === GRASS || id === DIRT) { // 脚下的土没了：上面的幼苗变回种子
      const up = key(h.x, h.y + 1, h.z), c = st.crops[up];
      if (c && get(h.x, h.y + 1, h.z) === SPROUT) { game.setBlock(h.x, h.y + 1, h.z, 0); game.give(SEED_OF[c.to], 1); delete st.crops[up]; save(); }
      return id === FARM ? DIRT : undefined; // 耕地挖起来是泥土；草地和泥土照原来的规则
    }
    return undefined;
  }

  // 火苗：烧着的篝火上画几片会跳的火舌；最近的一堆火带一盏暖光。火熄了就拿掉
  const fireMeshes = new Map(); let fireLight = null;
  function flames() {
    if (!window.game || !game.scene) return;
    const p = game.p; let near = null, nd = 1e9;
    for (const k in st.fires) {
      const [x, y, z] = k.split(',').map(Number), lit = burning(st.fires[k], game.time) && get(x, y, z) === FIRE;
      if (lit && !fireMeshes.has(k)) {
        const g = new THREE.Group();
        for (const [r, h, c, dx, dz] of [[0.2, 0.62, 0xff7a18, 0, 0], [0.13, 0.44, 0xffc040, 0.05, -0.04], [0.11, 0.36, 0xff9a20, -0.12, 0.08], [0.07, 0.26, 0xfff0a0, 0, 0.02]]) {
          const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, 5), new THREE.MeshBasicMaterial({ color: c })); m.position.set(dx, 0.2 + h / 2, dz); g.add(m);
        }
        g.position.set(x + 0.5, y, z + 0.5); game.scene.add(g); fireMeshes.set(k, g);
      } else if (!lit && fireMeshes.has(k)) { const g = fireMeshes.get(k); game.scene.remove(g); g.traverse(o => { if (o.geometry) { o.geometry.dispose(); o.material.dispose(); } }); fireMeshes.delete(k); }
      if (lit) { const d = Math.hypot(x - p.x, z - p.z); if (d < nd) { nd = d; near = [x + 0.5, y + 0.7, z + 0.5]; } }
    }
    for (const k of [...fireMeshes.keys()]) if (!(k in st.fires)) { const g = fireMeshes.get(k); game.scene.remove(g); fireMeshes.delete(k); } // 篝火被挖走了
    if (fireLight) { fireLight.intensity = near && nd < 24 ? 1.3 : 0; if (near) fireLight.position.set(...near); }
  }
  addEventListener('load', () => { // 光源开局就建好（亮度 0），以后只改位置和亮度，不会让材质重新编译
    if (!window.game || !game.lighting) return;
    fireLight = game.lighting.add('campfire', { color: 0xff9a40, intensity: 0, range: 9 });
    (function flicker() { const t = performance.now() / 1000; for (const g of fireMeshes.values()) g.children.forEach((m, i) => { m.scale.y = 1 + 0.18 * Math.sin(t * (7 + i * 2.3) + i); m.rotation.y = t * (0.6 + i * 0.3); }); requestAnimationFrame(flicker); })();
  });
  setInterval(() => { // 生长不逐帧算：每 3 秒看一眼记下的时间
    if (!window.game || !game.playing) return;
    flames();
    let changed = false;
    for (const k in st.fires) { const [x, y, z] = k.split(',').map(Number), b = get(x, y, z); if (b !== undefined && b !== FIRE) { delete st.fires[k]; changed = true; } } // 那里已经不是篝火了
    for (const k in st.crops) {
      const [x, y, z] = k.split(',').map(Number), c = st.crops[k], b = get(x, y, z);
      if (b === undefined) continue;                                           // 那一片还没载入
      if (b !== SPROUT) { delete st.crops[k]; changed = true; continue; }      // 那里已经不是幼苗了
      if (ripe(game.time - c.t, nearWater(get, x, y - 1, z))) { game.setBlock(x, y, z, c.to); delete st.crops[k]; changed = true; }
    }
    for (const k in st.bamboo) {
      const [x, y, z] = k.split(',').map(Number), b = get(x, y, z);
      if (b === undefined) continue;
      if (b !== BAMBOO) { delete st.bamboo[k]; changed = true; continue; }
      if (game.time - st.bamboo[k] < BAMBOO_STEP) continue;
      let n = 1; while (get(x, y + n, z) === BAMBOO) n++;
      if (n >= BAMBOO_MAX || get(x, y + n, z)) { delete st.bamboo[k]; changed = true; continue; } // 长够了，或者上面被挡住
      game.setBlock(x, y + n, z, BAMBOO); st.bamboo[k] = game.time; changed = true;
    }
    if (changed) save();
  }, 3000);

  window.Farm = { use, dug };
})();
