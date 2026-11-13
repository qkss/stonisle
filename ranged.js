// 远程武器：弓、弩、猎枪。射程、伤害、两发之间的间隔、用哪种弹药都在这张表里；判定在 game.js 的 attack() 里（和近战同一套）。
// 打中是即时算的；这里另外画一支飞出去的箭或弹丸，只是给人看的。
// ponytail: 弹道是直线、不下坠、不受重力；联机时别人看不到你射出去的箭。要做抛物线或让别人也看到，再把射击做成会飞的实体。
(() => {
  // muzzle：箭头或枪口在 mount() 那个组里的位置（原点是握把，+z 是射出去的方向），飞出去的箭和弹丸从这里出发
  const WEAPONS = {
    261: { reach: 24, dmg: 5, cd: 0.8, ammo: 264, speed: 45, muzzle: [0, 0, 0.55] },   // 弓：和石剑一样疼，射 24 格
    262: { reach: 32, dmg: 9, cd: 1.4, ammo: 264, speed: 70, muzzle: [0, 0.21, 0.66] },   // 弩：更疼、更远，上弦慢
    263: { reach: 40, dmg: 12, cd: 0.6, ammo: 265, speed: 160, muzzle: [0, 0.21, 1.086] }, // 猎枪：最远最快，和黑曜剑一样疼，用弹丸
  };
  // 过了射程以后的一小步：重力往下拉，箭和弹丸飞出一条抛物线。v 会被改掉，返回新的位置
  const GRAVITY = 26, arc = (p, v, dt) => { v.y -= GRAVITY * dt; return [p.x + v.x * dt, p.y + v.y * dt, p.z + v.z * dt]; };
  if (typeof document === 'undefined') { module.exports = { WEAPONS, arc, GRAVITY }; return; }
  // 握持：这三样的模型（item-art.js）握把不在原点，射出去的方向也不一样（弓朝 +x，弩和枪朝 +z）。
  // mount() 把模型套进一个组里：组的原点 = 握把，组的 +z = 射出去的方向。第一人称和第三人称都用它来摆。
  const GRIP = { 261: { at: [0.17, 0.46, 0], yaw: -Math.PI / 2 }, 262: { at: [0, 0.29, -0.2], yaw: 0 }, 263: { at: [0, 0.28, -0.24], yaw: 0 } };
  function mount(item, id) {
    const g = new THREE.Group(), turn = new THREE.Group(), k = GRIP[id];
    item.position.set(-k.at[0], -k.at[1], -k.at[2]); turn.rotation.y = k.yaw; turn.add(item); g.add(turn);
    if (id === 261) { // 弓：把模型里那根直的弦藏起来，换成能拉开的两段弦，再加一支搭在弦上的箭（都在弓模型自己的坐标里）
      item.traverse(o => { const q = o.geometry && o.geometry.parameters; if (q && q.radiusTop === 0.005 && q.height > 0.8) o.visible = false; });
      const seg = (r, color) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 1, 6), new THREE.MeshLambertMaterial({ color })); item.add(m); return m; };
      const head = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.1, 4), new THREE.MeshLambertMaterial({ color: 0x8a9298 })); head.rotation.z = -Math.PI / 2; item.add(head);
      g.userData.bow = { top: seg(0.005, 0xcabb98), bottom: seg(0.005, 0xcabb98), shaft: seg(0.011, 0xb98a52), head };
      draw(g, 1);
    }
    return g;
  }
  // 拉弓：k = 0 刚射完（弦是直的，没有箭），k = 1 拉满。箭在 k > 0.2 时搭上去，跟着弦往后走。
  const Y = typeof THREE !== 'undefined' ? new THREE.Vector3(0, 1, 0) : null, TIP = [0.9, 0.02], PULL = 0.24, ARROW = 0.78;
  function span(m, ax, ay, bx, by) { // 把一根单位长的细棍摆在 (ax,ay)–(bx,by) 之间（弓所在的 x–y 平面里）
    const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1e-3;
    m.position.set((ax + bx) / 2, (ay + by) / 2, 0); m.scale.set(1, len, 1); m.quaternion.setFromUnitVectors(Y, new THREE.Vector3(dx / len, dy / len, 0));
  }
  const pulled = k => { const e = Math.max(0, Math.min(1, (k - 0.2) / 0.8)); return PULL * e * e * (3 - 2 * e); }; // 弦被拉开了多少
  function draw(g, k) {
    const b = g.userData.bow; if (!b) return;
    const pull = -pulled(k), mid = 0.46; // 弦被拉向 -x（射出去的方向是 +x）
    span(b.top, 0, TIP[0], pull, mid); span(b.bottom, 0, TIP[1], pull, mid);
    b.shaft.visible = b.head.visible = k > 0.2;
    span(b.shaft, pull, mid, pull + ARROW, mid); b.head.position.set(pull + ARROW + 0.04, mid, 0);
  }
  const UP = new THREE.Vector3(0, 0, 1);
  function tracer(o, d, len, id, drop, start) { // start：第一人称时 game.js 按手里那件武器的枪口算出来的起点
    // 从弓或枪口的位置飞到准星指着的那个点；drop：射程内没打中东西，飞到射程尽头后往下掉
    const w = WEAPONS[id], arrow = w.ammo === 264, dir = new THREE.Vector3(d[0], d[1], d[2]);
    const right = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 1, 0)).normalize(), up = new THREE.Vector3().crossVectors(right, dir);
    const third = window.ThirdPerson && ThirdPerson.on, p = game.p;
    // 起点：第一人称是画面右下角手里那件武器的前端；第三人称是小人平举的右手前面
    const from = start ? start.clone() : third ? new THREE.Vector3(p.x, p.y + 1.3, p.z).addScaledVector(right, 0.3).addScaledVector(dir, 0.9)
      : new THREE.Vector3(o[0], o[1], o[2]).addScaledVector(right, 0.3).addScaledVector(up, -0.24).addScaledVector(dir, 0.95);
    const to = new THREE.Vector3(o[0], o[1], o[2]).addScaledVector(dir, len), path = to.clone().sub(from), dist = path.length() || 1e-3, fly = path.clone().multiplyScalar(1 / dist);
    const m = new THREE.Mesh(new THREE.BoxGeometry(arrow ? 0.04 : 0.07, arrow ? 0.04 : 0.07, arrow ? 0.7 : 0.07), new THREE.MeshBasicMaterial({ color: arrow ? 0xc9a26a : 0x55524e }));
    m.quaternion.setFromUnitVectors(UP, fly);
    const t0 = performance.now(), dur = Math.max(0.06, dist / w.speed) * 1000;
    game.scene.add(m);
    const done = () => { game.scene.remove(m); m.geometry.dispose(); m.material.dispose(); };
    (function step() {
      const k = Math.min(1, (performance.now() - t0) / dur);
      m.position.copy(from).addScaledVector(path, k);
      if (k < 1 && game.playing) return requestAnimationFrame(step);
      if (!drop || !game.playing) return done();
      // 射程内什么都没打中：从这里开始往下掉，按抛物线飞到地上（掉下去的这一段不算伤害）
      const v = fly.clone().multiplyScalar(Math.min(w.speed, 38)), // 过了射程就没劲了：再快的弹丸也只按这个速度往前飘，三四十格内落地
         pos = to.clone(); let last = performance.now(), life = 0;
      (function fall() {
        const now = performance.now(), dt = Math.min(0.05, (now - last) / 1000); last = now; life += dt;
        const t = arc(pos, v, dt); pos.set(t[0], t[1], t[2]); m.position.copy(pos); m.quaternion.setFromUnitVectors(UP, fly.copy(v).normalize());
        const b = game.world.get(Math.floor(pos.x), Math.floor(pos.y), Math.floor(pos.z));
        if (life > 4 || pos.y < 0 || (b && !Core.PASS.has(b)) || !game.playing) return done(); // 落到方块或水里，或者飞了 4 秒
        requestAnimationFrame(fall);
      })();
    })();
  }
  // 第一人称的另一只手：枪和弩是托在前面的那只手，弓是拉弦的那只手（跟着弦往后走）。
  // 一个方块拳头加一截前臂，前臂从拳头伸向画面左下角外面；颜色跟着角色的肤色和袖子。game.js 每帧调用，id 传 0 就收起来。
  const SPOT = { 261: k => [0, 0, -0.17 - pulled(k)], 262: () => [0, 0.04, 0.3], 263: () => [0, 0.12, 0.38] }; // 在 mount() 那个组里的位置（原点握把，+z 朝前）
  let off = null;
  function offhand(holder, id, cooldown) {
    const m = holder && holder.children[1], w = WEAPONS[id];
    if (!m || !w) { if (off) off.visible = false; return; }
    if (!off) {
      off = new THREE.Group();
      off.userData.fist = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 0.13), new THREE.MeshLambertMaterial());
      off.userData.arm = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1, 0.095).translate(0, 0.5, 0), new THREE.MeshLambertMaterial());
      off.add(off.userData.fist, off.userData.arm);
    }
    if (off.parent !== holder.parent) holder.parent.add(off);
    const c = window.Avatar ? Avatar.colors(Avatar.look, game.equip) : { skin: '#e8c39e', sleeve: '#d9d2bd' };
    off.userData.fist.material.color.set(c.skin); off.userData.arm.material.color.set(c.sleeve);
    holder.updateMatrixWorld(true);
    const at = new THREE.Vector3(...SPOT[id](1 - Math.max(0, Math.min(1, cooldown / w.cd)))).applyMatrix4(m.matrixWorld), to = new THREE.Vector3(-0.55, -1.25, -0.25).sub(at);
    off.visible = true; off.userData.fist.position.copy(at); off.userData.fist.quaternion.copy(holder.quaternion); off.userData.fist.scale.copy(holder.scale);
    off.userData.arm.position.copy(at); off.userData.arm.scale.set(holder.scale.x, to.length(), holder.scale.z); off.userData.arm.quaternion.setFromUnitVectors(Y, to.normalize());
  }
  window.Ranged = { WEAPONS, tracer, mount, draw, offhand };
})();
