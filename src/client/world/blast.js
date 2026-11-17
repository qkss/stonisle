// 岩浆烫伤、炸药、手雷、熔炉。方块和贴图在 core.js / game.js（287 岩浆 288 炸药 289 熔炉；290 手雷 291 铁锭 292 金锭）。
// game.js 里两处调用：右键时 Blast.use(h, id)（返回 true 表示归这里管）；放下方块后 Blast.placed(x, y, z, id)。
// ponytail: 引线、手雷只在点着它的那台机器上算；爆炸改掉的方块照常经 Net 同步，但别的玩家不掉血、看不到飞行中的手雷。要做就把爆炸做成服务器消息。
(() => {
  const LAVA = 287, TNT = 288, FURNACE = 289, GRENADE = 290;
  const FUSE = 3, NADE_FUSE = 2.2, BURN_EVERY = 0.5;
  const say = t => Lang.say(t, false, 1.4), free = () => window.Creative && Creative.on;
  const fuses = new Map(); // 正在烧引线的炸药：位置 → { x, y, z, t, mesh }
  const nades = [];

  // —— 声音：一团低沉的噪声 + 一个往下掉的低音 ——
  let ctx;
  function boom(big) {
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); if (ctx.state === 'suspended') ctx.resume();
      const now = ctx.currentTime, len = big ? 1.1 : 0.7, buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * len), ctx.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2);
      const src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(), o = ctx.createOscillator(), og = ctx.createGain();
      src.buffer = buf; f.type = 'lowpass'; f.frequency.setValueAtTime(1200, now); f.frequency.exponentialRampToValueAtTime(120, now + len);
      g.gain.setValueAtTime(big ? 0.5 : 0.35, now); src.connect(f); f.connect(g); g.connect(ctx.destination); src.start(now);
      o.frequency.setValueAtTime(90, now); o.frequency.exponentialRampToValueAtTime(30, now + 0.5); og.gain.setValueAtTime(0.4, now); og.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      o.connect(og); og.connect(ctx.destination); o.start(now); o.stop(now + 0.6);
    } catch (e) { /* 没有声音也照样炸 */ }
  }

  // —— 画面：一团橙色火球往外胀开变淡 + 一把飞出去的碎块 ——
  const fx = [];
  function fireball(x, y, z, r) {
    const ball = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffa040, transparent: true, opacity: 0.9, depthWrite: false }));
    ball.position.set(x, y, z); game.scene.add(ball); fx.push({ m: ball, t: 0, life: 0.45, grow: r * 1.4 });
    for (let i = 0; i < 26; i++) {
      const c = [0xffd060, 0xff7a20, 0x6a6460, 0x3a3634][i % 4], m = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.14), new THREE.MeshBasicMaterial({ color: c }));
      const a = Math.random() * Math.PI * 2, up = Math.random() * 0.9 + 0.2, s = 5 + Math.random() * 6;
      m.position.set(x, y, z); game.scene.add(m); fx.push({ m, t: 0, life: 0.7 + Math.random() * 0.5, v: [Math.cos(a) * s, up * s, Math.sin(a) * s] });
    }
  }
  function tickFx(dt) {
    for (let i = fx.length - 1; i >= 0; i--) {
      const e = fx[i]; e.t += dt; const k = e.t / e.life;
      if (k >= 1) { game.scene.remove(e.m); e.m.geometry.dispose(); e.m.material.dispose(); fx.splice(i, 1); continue; }
      if (e.grow) { e.m.scale.setScalar(0.3 + e.grow * Math.sqrt(k)); e.m.material.opacity = 0.9 * (1 - k); continue; }
      e.v[1] -= 20 * dt; e.m.position.x += e.v[0] * dt; e.m.position.y += e.v[1] * dt; e.m.position.z += e.v[2] * dt; e.m.rotation.x += dt * 8;
    }
  }

  // —— 爆炸：炸药和手雷共用。半径内的方块变空气（底层、水、岩浆、箱子不炸），附近的炸药跟着点着；人和动物按距离掉血、被推开 ——
  function explode(x, y, z, r) {
    const w = game.world, list = [], cx = Math.floor(x), cy = Math.floor(y), cz = Math.floor(z), R = Math.ceil(r);
    for (let dx = -R; dx <= R; dx++) for (let dy = -R; dy <= R; dy++) for (let dz = -R; dz <= R; dz++) {
      const bx = cx + dx, by = cy + dy, bz = cz + dz;
      if (by <= 0 || Math.hypot(bx + 0.5 - x, by + 0.5 - y, bz + 0.5 - z) > r + 0.3) continue;
      const b = w.get(bx, by, bz);
      if (!b || b === Core.WATER || b === LAVA || Core.isChest(b)) continue;
      if (b === TNT) { light(bx, by, bz, 0.25 + Math.random() * 0.3); continue; } // 连锁：旁边的炸药很快也炸
      list.push([bx, by, bz, 0]);
    }
    game.setBlocks(list);
    fireball(x, y, z, r); boom(r >= 3);
    const reach = r + 2, p = game.p;
    const pd = Math.hypot(p.x - x, p.y + 0.9 - y, p.z - z);
    if (pd < reach && !game.dead) { const k = 1 - pd / reach; game.hurt(Math.ceil(14 * k)); if (pd > 0.01) game.push((p.x - x) / pd * 10 * k, (p.z - z) / pd * 10 * k); }
    for (const m of game.mobs) {
      if (!(m.hp > 0)) continue;
      const d = Math.hypot(m.x - x, m.y + 0.5 - y, m.z - z); if (d >= reach) continue;
      const dealt = Math.ceil(24 * (1 - d / reach)), dx = (m.x - x) / (d || 1), dz = (m.z - z) / (d || 1);
      if (window.Net && Net.guest) Net.hit(m.id, dealt, dx, dz); else game.strikeMob(m, dealt, dx, dz);
    }
  }

  // —— 炸药：放下就点着，引线 3 秒，白光一闪一闪；被挖掉就灭了 ——
  function light(x, y, z, t = FUSE) {
    const k = x + ',' + y + ',' + z; if (fuses.has(k)) { const f = fuses.get(k); f.t = Math.min(f.t, t); return; }
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(1.02, 1.02, 1.02), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false }));
    mesh.position.set(x + 0.5, y + 0.5, z + 0.5); game.scene.add(mesh); fuses.set(k, { x, y, z, t, mesh });
  }
  function tickFuses(dt) {
    for (const [k, f] of fuses) {
      f.t -= dt; f.mesh.material.opacity = Math.sin(f.t * (f.t < 1 ? 30 : 12)) > 0 ? 0.55 : 0;
      const gone = game.world.get(f.x, f.y, f.z) !== TNT;
      if (gone || f.t <= 0) {
        fuses.delete(k); game.scene.remove(f.mesh); f.mesh.geometry.dispose(); f.mesh.material.dispose();
        if (!gone) { game.setBlock(f.x, f.y, f.z, 0); explode(f.x + 0.5, f.y + 0.5, f.z + 0.5, 3); }
      }
    }
  }

  // —— 手雷：沿准星方向扔出一道抛物线，碰到方块弹一下，2.2 秒后炸（半径小一点）——
  function throwNade() {
    const p = game.p, d = game.lookDir(), mesh = game.itemMesh(GRENADE); if (!mesh) return;
    const g = new THREE.Group(); g.add(mesh); g.scale.setScalar(0.5); game.scene.add(g);
    nades.push({ g, x: p.x + d[0] * 0.6, y: p.y + game.eye - 0.2 + d[1] * 0.6, z: p.z + d[2] * 0.6, v: [d[0] * 13, d[1] * 13 + 3, d[2] * 13], t: NADE_FUSE });
  }
  const blocked = (x, y, z) => { const b = game.world.get(Math.floor(x), Math.floor(y), Math.floor(z)); return !!b && b !== Core.WATER && !Core.PASS.has(b); };
  function tickNades(dt) {
    for (let i = nades.length - 1; i >= 0; i--) {
      const n = nades[i]; n.t -= dt; n.v[1] -= 22 * dt;
      for (const [a, j] of [['x', 0], ['y', 1], ['z', 2]]) { // 每个轴分开走：撞到哪个轴就在哪个轴弹回来，速度打折
        const to = n[a] + n.v[j] * dt, at = { x: n.x, y: n.y, z: n.z, [a]: to };
        if (blocked(at.x, at.y, at.z)) { n.v[j] *= -0.35; if (j === 1) { n.v[0] *= 0.7; n.v[2] *= 0.7; } } else n[a] = to;
      }
      n.g.position.set(n.x, n.y - 0.15, n.z); n.g.rotation.x += dt * 6;
      if (n.t <= 0) { game.scene.remove(n.g); nades.splice(i, 1); explode(n.x, n.y, n.z, 2.5); }
    }
  }

  // —— 岩浆：人和动物碰到就一直掉血（离开后还要烫一小会儿）——
  let burnT = 0, burnClock = 0, mobClock = 0;
  const inLava = (x, y, z) => game.world.get(Math.floor(x), Math.floor(y), Math.floor(z)) === LAVA;
  function tickLava(dt) {
    const p = game.p;
    if (game.playing && !game.dead && (inLava(p.x, p.y + 0.1, p.z) || inLava(p.x, p.y + 1, p.z))) burnT = 1.5;
    if (burnT > 0) { burnT -= dt; if ((burnClock += dt) >= BURN_EVERY) { burnClock = 0; if (!game.dead) game.hurt(2, true); } } else burnClock = BURN_EVERY; // 一踩进去马上烫一下
    if ((mobClock += dt) < BURN_EVERY || (window.Net && Net.guest)) return; // 访客那边的动物是主机算的
    mobClock = 0;
    for (const m of game.mobs) if (m.hp > 0 && (inLava(m.x, m.y + 0.2, m.z) || inLava(m.x, m.y + 0.8, m.z))) game.strikeMob(m, 3, 0, 0);
  }

  function use(h, id) {
    if (id === GRENADE && game.inv[id] > 0) { throwNade(); if (!free()) game.inv[id]--; return true; }
    if (h && !h.torch && game.world.get(h.x, h.y, h.z) === FURNACE) return window.Furnace ? Furnace.open(h) : false;
    return false;
  }
  function placed(x, y, z, id) { if (id === TNT) { light(x, y, z); say('Run! It will blow up.'); } }

  let last = 0;
  (function tick(now) {
    requestAnimationFrame(tick);
    const dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
    if (!window.game) return;
    tickFx(dt); tickFuses(dt); tickNades(dt); tickLava(dt);
  })();
  window.Blast = { use, placed, explode, light, get fuses() { return fuses.size; }, get grenades() { return nades.length; } };
})();
