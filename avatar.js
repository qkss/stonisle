// 角色形象：肤色、发型、发色、上衣、裤子。设置 → World → “Your character” 里选，带一个小预览；选择记在本机。
// 联机时 net.js 用 Avatar.build() 画别的玩家，身上穿的装备也画出来。模型是方块小人，脸朝 -z（和玩家朝向一致）。
(() => {
  const KEY = 'stonisle.look';
  const SKIN = ['#f6d7bd', '#e8c39e', '#d2a077', '#b07a4f', '#8a5a36', '#5e3c24'];
  const HAIR = ['#2a2018', '#5a3a1e', '#a8743a', '#e0c070', '#c0502a', '#d8d8d8', '#4a78c8', '#c860a8'];
  const SHIRT = ['#c8483c', '#e08a2c', '#e0c040', '#58a84a', '#3c8ac8', '#6a58c0', '#c860a0', '#f0f0f0', '#404048'];
  const PANTS = ['#3a4a6a', '#4a3a2a', '#2e2e34', '#6a7a4a', '#8a6a4a', '#a8a8b0'];
  const STYLE = ['short', 'long', 'ponytail', 'buns', 'none', 'spiky'], BOTTOM = ['pants', 'skirt'], SIZE = ['tall', 'kid'];
  const OPTIONS = { skin: SKIN, style: STYLE, hair: HAIR, shirt: SHIRT, pants: PANTS, skirt: BOTTOM, size: SIZE };
  const LABEL = { skin: 'Skin', style: 'Hair', hair: 'Hair color', shirt: 'Shirt', pants: 'Pants color', skirt: 'Bottom', size: 'Body' };
  // 六个现成的角色，开局界面上选一个（之后还能在设置里随便改）。名字只是称呼，不绑定性别以外的任何东西
  const HEROES = [
    { name: 'Milo', look: { skin: 1, style: 0, hair: 1, shirt: 4, pants: 0, skirt: 0 } },
    { name: 'Kai', look: { skin: 3, style: 5, hair: 0, shirt: 3, pants: 1, skirt: 0 } },
    { name: 'Theo', look: { skin: 0, style: 0, hair: 3, shirt: 1, pants: 5, skirt: 0 } },
    { name: 'Luna', look: { skin: 1, style: 1, hair: 0, shirt: 5, pants: 2, skirt: 1 } },
    { name: 'Ivy', look: { skin: 4, style: 3, hair: 0, shirt: 2, pants: 3, skirt: 0 } },
    { name: 'Nora', look: { skin: 0, style: 2, hair: 4, shirt: 6, pants: 0, skirt: 1 } },
    // 六个小孩：个子矮一截、头大一点
    { name: 'Leo', look: { skin: 1, style: 5, hair: 2, shirt: 0, pants: 0, skirt: 0, size: 1 } },
    { name: 'Sam', look: { skin: 4, style: 0, hair: 0, shirt: 2, pants: 2, skirt: 0, size: 1 } },
    { name: 'Ben', look: { skin: 2, style: 0, hair: 4, shirt: 7, pants: 4, skirt: 0, size: 1 } },
    { name: 'Mia', look: { skin: 2, style: 3, hair: 1, shirt: 6, pants: 5, skirt: 1, size: 1 } },
    { name: 'Zoe', look: { skin: 5, style: 2, hair: 0, shirt: 3, pants: 0, skirt: 0, size: 1 } },
    { name: 'Lily', look: { skin: 0, style: 1, hair: 3, shirt: 4, pants: 3, skirt: 1, size: 1 } },
  ];
  // 装备穿在身上的颜色：[主色, 深色]。没列到的装备用灰色
  const TIER = { straw: ['#c9b25a', '#948038'], leather: ['#9a6a3e', '#74502e'], iron: ['#cdd6e2', '#8f9cac'], alloy: ['#e6c27a', '#a8803a'] };
  const GEAR = { 121: TIER.straw, 122: TIER.straw, 123: TIER.straw, 124: TIER.straw, 40: TIER.leather, 41: TIER.leather, 125: TIER.leather, 42: TIER.leather,
    43: TIER.iron, 44: TIER.iron, 126: TIER.iron, 45: TIER.iron, 127: TIER.alloy, 128: TIER.alloy, 129: TIER.alloy, 131: TIER.alloy,
    46: ['#c9a46a', '#b08a50'], 47: ['#2e2a36', '#46405a'], 48: ['#463a4e', '#2a2230'], 120: ['#c8553a', '#a8402a'], 142: ['#eef2f6', '#c8d4e0'], 146: ['#3a5a4a', '#2a4236'],
    147: ['#3484a8', '#2a6a8a'], 148: ['#6a5038', '#57402c'], 149: ['#a8b8c6', '#6c7c8c'], 150: ['#1c1828', '#463c62'], 151: ['#40506a', '#8ad0ff'] };
  const clean = l => { const o = {}; for (const k in OPTIONS) o[k] = Number.isInteger(l && l[k]) && l[k] >= 0 && l[k] < OPTIONS[k].length ? l[k] : 0; return o; }; // 别人发来的也过这一道
  let look; try { look = JSON.parse(localStorage.getItem(KEY)); } catch (e) { look = null; }
  look = look ? clean(look) : { ...HEROES[0].look };

  function build(lk, gear = []) { // gear：[头, 身, 脚, 腿] 的物品 id，和 game.equip 同序
    const l = clean(lk), g = new THREE.Group(), [head, body, feet, legsGear] = gear.map(id => GEAR[id] || (id ? ['#8a8a9a', '#6a6a78'] : null));
    const shade = (c, k) => '#' + new THREE.Color(c).multiplyScalar(k).getHexString();
    const part = (w, h, d, x, y, z, col, to = g) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshLambertMaterial({ color: col })); m.position.set(x, y, z); to.add(m); return m; };
    // Use the exact same material and construction details as the inventory model.
    const wear = (id,w,h,d,x,y,z,col,to=g) => {
      if(!id||!window.ItemArt)return part(w,h,d,x,y,z,col,to);
      const panel=ItemArt.worn(id,[[w,h,d,0,0,0,col]],!window.game||game.naturalItems);
      panel.position.set(x,y,z);panel.rotation.y=Math.PI;panel.userData.gearPart=true;
      panel.userData.gearId=id;to.add(panel);return panel;
    };
    const pivot = (x, y) => { const p = new THREE.Group(); p.position.set(x, y, 0); g.add(p); return p; };
    const skin = SKIN[l.skin], hair = HAIR[l.hair], shirt = body ? body[0] : SHIRT[l.shirt], pants = legsGear ? legsGear[0] : PANTS[l.pants], shoe = feet ? feet[0] : '#3a2e26';
    const leg = x => { // 以胯为轴：大腿、小腿（略深）、鞋（鞋头向前伸出一点）
      const p = pivot(x, 0.72);
      wear(gear[3],0.21, 0.34, 0.23, 0, -0.17, 0, pants, p); wear(gear[3],0.19, 0.24, 0.21, 0, -0.46, 0, shade(pants, 0.86), p);
      wear(gear[2],0.22, 0.14, 0.3, 0, -0.65, -0.03, shoe, p); wear(gear[2],0.22, 0.04, 0.3, 0, -0.7, -0.03, shade(shoe, 0.7), p);
      return p;
    };
    const arm = x => { // 以肩为轴：袖子、前臂（没穿护甲露出皮肤）、手
      const p = pivot(x, 1.36);
      wear(gear[1],0.17, 0.3, 0.21, 0, -0.13, 0, shirt, p); wear(gear[1],0.18, 0.05, 0.22, 0, -0.27, 0, shade(shirt, 0.8), p);
      wear(gear[1],0.14, 0.24, 0.17, 0, -0.41, 0, body ? shade(body[0], 0.9) : skin, p); part(0.15, 0.13, 0.18, 0, -0.59, 0, skin, p);
      return p;
    };
    const swing = [leg(-0.115), leg(0.115), arm(-0.335), arm(0.335)];
    wear(gear[1],0.48, 0.62, 0.26, 0, 1.07, 0, shirt);                                                  // 躯干
    wear(gear[1],0.5, 0.07, 0.28, 0, 0.78, 0, body ? body[1] : shade(pants, 0.7));                      // 腰带 / 护甲下摆
    if (body) { /* Shared chest construction already includes plates / stitching. */ }                                   // 胸甲的护心片
    else { part(0.2, 0.05, 0.02, 0, 1.35, -0.135, shade(shirt, 0.75)); part(0.04, 0.3, 0.02, 0, 1.2, -0.135, shade(shirt, 0.82)); } // 领口和门襟
    if (BOTTOM[l.skirt] === 'skirt' && !legsGear) { part(0.52, 0.16, 0.3, 0, 0.68, 0, pants); part(0.58, 0.14, 0.34, 0, 0.55, 0, shade(pants, 0.9)); } // 裙子：腰下张开的两层
    part(0.16, 0.08, 0.16, 0, 1.41, 0, shade(skin, 0.92));                                      // 脖子
    part(0.4, 0.4, 0.4, 0, 1.64, 0, skin);
    for (const x of [-0.09, 0.09]) {
      part(0.09, 0.08, 0.02, x, 1.66, -0.2, '#ffffff'); part(0.05, 0.07, 0.02, x + (x < 0 ? 0.012 : -0.012), 1.655, -0.207, '#2a2420'); // 眼白和瞳孔
      part(0.1, 0.025, 0.02, x, 1.725, -0.203, head ? shade(skin, 0.6) : hair);                 // 眉毛
      part(0.06, 0.04, 0.02, x * 1.5, 1.575, -0.202, '#e89a8a');                                // 脸颊的一点红
      part(0.03, 0.1, 0.08, x < 0 ? -0.21 : 0.21, 1.64, 0, shade(skin, 0.9));                   // 耳朵
    }
    part(0.05, 0.05, 0.04, 0, 1.61, -0.215, shade(skin, 0.88));                                 // 鼻子
    part(0.12, 0.03, 0.02, 0, 1.535, -0.203, '#9a5a4a');                                        // 嘴
    if (head) { wear(gear[0],0.46, 0.18, 0.46, 0, 1.8, 0, head[0]); wear(gear[0],0.48, 0.06, 0.48, 0, 1.71, 0, head[1]); wear(gear[0],0.3, 0.05, 0.12, 0, 1.72, -0.27, head[1]); } // 帽子：帽顶、帽圈、帽檐；戴着就不画头发
    else if (STYLE[l.style] !== 'none') {
      part(0.44, 0.12, 0.44, 0, 1.86, 0, hair); part(0.44, 0.22, 0.1, 0, 1.73, 0.19, hair);    // 头顶和后脑
      part(0.4, 0.07, 0.04, 0, 1.79, -0.2, hair); part(0.14, 0.06, 0.04, -0.12, 1.75, -0.2, hair); // 刘海
      for (const x of [-0.205, 0.205]) part(0.05, 0.18, 0.3, x, 1.75, 0.06, hair);              // 两鬓
      if (STYLE[l.style] === 'long') { part(0.44, 0.36, 0.1, 0, 1.46, 0.2, hair); for (const x of [-0.205, 0.205]) part(0.05, 0.3, 0.14, x, 1.52, 0.12, hair); }
      if (STYLE[l.style] === 'ponytail') { part(0.12, 0.12, 0.12, 0, 1.78, 0.28, shade(hair, 0.8)); part(0.1, 0.36, 0.1, 0, 1.56, 0.32, hair); }
      if (STYLE[l.style] === 'buns') for (const x of [-0.16, 0.16]) part(0.16, 0.16, 0.16, x, 1.97, 0.04, hair);
      if (STYLE[l.style] === 'spiky') for (const [x, z] of [[-0.12, -0.1], [0.1, -0.06], [0, 0.1], [-0.14, 0.14], [0.15, 0.12]]) part(0.09, 0.12, 0.09, x, 1.97, z, hair);
    }
    if (SIZE[l.size] === 'kid') { // 小孩：整体缩到 78%，脖子以上再放大 25%
      const hg = new THREE.Group(); hg.position.set(0, 1.44, 0);
      for (const c of [...g.children]) if ((c.isMesh || c.userData.gearPart) && c.position.y > 1.45) { c.position.y -= 1.44; hg.add(c); }
      hg.scale.setScalar(1.25); g.add(hg); g.scale.setScalar(0.78);
    }
    g.userData.swing = swing;
    return g;
  }
  function colors(lk, gear = []) { const l = clean(lk), body = GEAR[gear[1]] || (gear[1] ? ['#8a8a9a'] : null); return { skin: SKIN[l.skin], sleeve: body ? body[0] : SHIRT[l.shirt] }; }
  function hold(g, id) { // 右手里拿着的东西：工具用游戏里同一个模型，方块是一个小方块
    const arm = g.userData.swing[3]; if (g.userData.item) arm.remove(g.userData.item);
    g.userData.sword = [23, 26, 29, 153].includes(id); // 拿着剑：挥动是左右横扫，不是从上往下劈
    const item = g.userData.item = window.game && id ? game.itemMesh(id) : null; if (!item) return;
    const grip = new THREE.Group(); grip.add(item); grip.rotation.x = g.userData.sword ? -2.3 : -1.9; grip.position.set(0, -0.66, -0.02); grip.scale.setScalar(0.9); // 工具从手里向前伸出去（不是顺着胳膊往回指）：手垂着时指向前下方，手向前举时指向前上方
    arm.add(g.userData.item = grip);
  }
  // 摆姿势。phase 动作的相位，walk 0–1 走路的幅度，swing 0–1 右手挥动的进度（0 = 没在挥），air 在空中，swim 在水里
  function pose(g, phase, walk = 0, swing = 0, air = false, swim = false) {
    const [legL, legR, armL, armR] = g.userData.swing, s = Math.sin(phase) * 0.7 * walk, k = Math.sin(phase);
    g.rotation.order = 'YXZ'; g.rotation.x = 0;                                  // 踩水保持直立，与站立碰撞体一致，避免头部绕脚底旋进岸墙
    const u = g.userData; if (swing > 0 && !(swing >= (u.lastSw || 0) && u.lastSw > 0)) u.flip = !u.flip; u.lastSw = swing; // 每挥一下换一个方向：右到左、左到右交替
    armR.rotation.order = 'YXZ'; armR.rotation.y = 0;
    if (swim) { // 小幅蹬腿和划水，轮廓留在碰撞体附近
      legL.rotation.x = k * 0.16; legR.rotation.x = -k * 0.16;
      armL.rotation.x = -0.25 + k * 0.15; armL.rotation.z = 0;
      armR.rotation.x = -0.25 - k * 0.15; armR.rotation.z = 0;
      return;
    }
    legL.rotation.x = air ? -0.55 : s; legR.rotation.x = air ? 0.35 : -s;                       // 跳起：两腿一前一后收起
    armL.rotation.x = air ? 2.6 : -s; armL.rotation.z = air ? -0.25 : 0;                       // 跳起：双臂上举
    if (swing > 0 && u.sword) { // 横扫：手臂平举向前，从一侧扫到另一侧，中间略微下压
      const t = u.flip ? 1 - swing : swing;
      armR.rotation.x = 1.35 - Math.sin(swing * Math.PI) * 0.25; armR.rotation.y = -1.2 + t * 2.4; armR.rotation.z = 0; // 正的角度是向前抬（脸朝 -z）；之前写成负的，手臂是往身后抬的
      return;
    }
    if (swing > 0) { // 挖掘、砍、空手打：手举在身前，先抬过头顶，再向前下方敲出去，然后收回到举着的位置（不甩到身后）
      const ease = t => t * t * (3 - 2 * t), UP = 2.7, HIT = 0.95, READY = 1.5; // 都是向前抬的角度
      armR.rotation.x = swing < 0.35 ? READY + (UP - READY) * ease(swing / 0.35) : swing < 0.6 ? UP + (HIT - UP) * ease((swing - 0.35) / 0.25) : HIT + (READY - HIT) * ease((swing - 0.6) / 0.4);
      armR.rotation.z = 0;
      return;
    }
    armR.rotation.x = air ? 2.6 : s; armR.rotation.z = air ? 0.25 : 0;
  }
  const inWater = (x, y, z) => !!window.game && game.world.get(Math.floor(x), Math.floor(y + 0.5), Math.floor(z)) === Core.WATER; // 这个位置的人是不是泡在水里
  const walk = pose;

  // —— 设置里的选择和预览 ——
  const world = document.getElementById('settings-character');
  if (!world || !window.THREE) return void (window.Avatar = { build, walk, pose, hold, colors, inWater, clean, get look() { return look; } });
  world.insertAdjacentHTML('beforeend', '<h2>Your character</h2><p class="settingsHint">Other players see this when you play together.</p><div id="lookBox" style="display:flex;gap:14px;align-items:flex-start;flex-wrap:wrap"><canvas id="lookView" width="220" height="300" style="width:110px;height:150px;border-radius:8px;background:#1d1712"></canvas><div id="lookRows" style="flex:1;min-width:180px"></div></div>');
  const view = document.getElementById('lookView'), rows = document.getElementById('lookRows');
  let renderer = null, scene, cam, model;
  function draw() { // 只在选项变了、设置打开时画一帧，不占着显卡
    if (!renderer) {
      renderer = new THREE.WebGLRenderer({ canvas: view, antialias: true, alpha: true });
      scene = new THREE.Scene(); cam = new THREE.PerspectiveCamera(32, 220 / 300, 0.1, 20); cam.position.set(1.6, 1.5, -3.6); cam.lookAt(0, 0.98, 0);
      scene.add(new THREE.AmbientLight(0xffffff, 0.75)); const sun = new THREE.DirectionalLight(0xfff2d8, 0.6); sun.position.set(1, 2, -2); scene.add(sun);
    }
    if (model) scene.remove(model);
    model = build(look, window.game ? game.equip : []); model.rotation.y = spin; if (window.game) hold(model, game.held); walk(model, 0.9, 0.5); scene.add(model);
    renderer.render(scene, cam);
  }
  function renderRows() {
    rows.innerHTML = Object.keys(OPTIONS).map(k => `<div style="margin-bottom:7px"><div style="font-size:12px;opacity:.75;margin-bottom:3px">${LABEL[k]}</div>` + OPTIONS[k].map((v, i) =>
      `<button type="button" data-k="${k}" data-i="${i}" aria-label="${LABEL[k]} ${i + 1}" aria-pressed="${look[k] === i}" style="min-width:26px;height:26px;margin:0 4px 4px 0;padding:0 5px;border-radius:6px;border:2px solid ${look[k] === i ? '#ffd36b' : '#0000'};background:${v[0] === '#' ? v : '#ffffff22'};color:inherit;font-size:11px;cursor:pointer">${v[0] === '#' ? '' : v}</button>`).join('') + '</div>').join('');
    for (const b of rows.querySelectorAll('button')) b.onclick = () => {
      look[b.dataset.k] = +b.dataset.i;
      changed();
    };
  }
  let handKey = '';
  function paintHand() { // 第一人称的手和袖子用同一套颜色；形象或身上的护甲变了才重涂
    const gear = window.game ? game.equip : [], key = JSON.stringify(look) + gear[1];
    if (key === handKey || !window.FirstPersonHand) return;
    handKey = key; const c = colors(look, gear); FirstPersonHand.paint(c.skin, c.sleeve);
  }
  setInterval(paintHand, 500); paintHand();
  function changed() { localStorage.setItem(KEY, JSON.stringify(look)); renderRows(); draw(); paintHand(); renderHeroes(); if (window.Net && Net.look) Net.look(); }
  // —— 开局界面上的六个角色 ——
  const start = document.getElementById('start'), heroBox = document.createElement('div');
  if (start) { heroBox.innerHTML = '<p style="margin:16px 0 8px">Choose your character.</p><div id="heroes" style="display:grid;grid-template-columns:repeat(6,1fr);gap:6px"></div>'; start.before(heroBox); }
  const portraits = [];
  function renderHeroes() {
    const list = document.getElementById('heroes'); if (!list) return;
    const now = JSON.stringify(clean(look));
    list.innerHTML = HEROES.map((h, i) => { const sel = JSON.stringify(clean(h.look)) === now; return `<button type="button" data-i="${i}" aria-pressed="${sel}" style="display:flex;flex-direction:column;align-items:center;padding:4px 2px;background:${sel ? '#ffd36b2e' : '#ffffff14'};border:2px solid ${sel ? '#ffd36b' : '#0000'};color:inherit;font-size:12px;cursor:pointer">${portraits[i] ? `<img src="${portraits[i]}" alt="" style="width:100%;max-width:64px;aspect-ratio:4/5;object-fit:contain">` : ''}${h.name}</button>`; }).join('');
    for (const b of list.children) b.onclick = () => { look = { ...HEROES[b.dataset.i].look }; changed(); };
  }
  addEventListener('load', () => { // 用一个临时的小画布把六个角色各画一张头像，画完就释放
    const c = document.createElement('canvas'); c.width = 160; c.height = 200;
    const r = new THREE.WebGLRenderer({ canvas: c, antialias: true, alpha: true, preserveDrawingBuffer: true }), s = new THREE.Scene(), cam = new THREE.PerspectiveCamera(30, 0.8, 0.1, 20);
    cam.position.set(1.3, 1.5, -3.9); cam.lookAt(0, 1.02, 0); s.add(new THREE.AmbientLight(0xffffff, 0.8)); const sun = new THREE.DirectionalLight(0xfff2d8, 0.6); sun.position.set(1, 2, -2); s.add(sun);
    HEROES.forEach((h, i) => { const m = build(h.look); s.add(m); r.render(s, cam); portraits[i] = c.toDataURL(); s.remove(m); });
    r.dispose(); r.forceContextLoss(); renderHeroes();
  });
  renderHeroes();
  renderRows();
  let spin = 0; // 拖动预览可以转着看
  view.style.cursor = 'grab'; view.style.touchAction = 'none';
  view.onpointerdown = e => { view.setPointerCapture(e.pointerId); let x = e.clientX; view.onpointermove = m => { spin += (m.clientX - x) * 0.02; x = m.clientX; if (model) { model.rotation.y = spin; renderer.render(scene, cam); } }; };
  view.onpointerup = () => { view.onpointermove = null; };
  document.getElementById('tab-character').addEventListener('click', () => setTimeout(draw, 0)); // 切到这一页时画出来（也带上刚换的装备）
  addEventListener('load', draw);
  window.Avatar = { build, walk, pose, hold, colors, inWater, clean, get look() { return look; } };
})();

// —— 第三人称视角 ——按 V 或在设置 → Controls 里切换。镜头退到身后约 4 格，被方块挡住就往前收；
// 这时不画第一人称的手，改画自己的小人。挖、放、打仍然从角色眼睛出发判定，手感不变。
// game.js 里两处调用：渲染前 ThirdPerson.apply(camera, dt)；画手之前看 ThirdPerson.on。
(() => {
  if (!window.Avatar || !window.THREE) return;
  const KEY = 'stonisle.third', BACK = 4, fwd = new THREE.Vector3(), eye = new THREE.Vector3(), right = new THREE.Vector3();
  let on = localStorage.getItem(KEY) === '1', me = null, meKey = '', last = null, phase = 0, dist = BACK, deadT = 0, lie = 0, cam = null;
  function set(v) { on = v; localStorage.setItem(KEY, on ? '1' : '0'); const box = document.getElementById('third'); if (box) box.checked = on; if (me) me.visible = false; }
  function apply(camera, dt) {
    const g = window.game, p = g.p;
    if (!on && !g.dead) { if (me) me.visible = false; deadT = lie = 0; return; } // 第一人称下倒地时也临时切到身外，看得见自己
    const key = JSON.stringify(Avatar.look) + g.equip.join() + '/' + g.held + '/' + g.naturalItems;
    if (key !== meKey) { // 形象、装备或手里的东西变了：重建自己的小人
      if (me) g.scene.remove(me);
      me = Avatar.build(Avatar.look, g.equip); Avatar.hold(me, g.held); g.scene.add(me); meKey = key;
    }
    const moved = last ? Math.hypot(p.x - last[0], p.z - last[1]) : 0, swim = Avatar.inWater(p.x, p.y, p.z); last = [p.x, p.z];
    phase += swim ? dt * 6 : moved > 0.002 ? dt * 12 : 0;
    me.position.set(p.x, p.y, p.z); me.rotation.y = g.yaw; me.rotation.x = 0;
    Avatar.pose(me, phase, moved > 0.002 ? 1 : 0, g.swinging ? g.swingPhase + 0.01 : 0, g.air && !swim, swim); // 挥动进度直接取游戏里的，按住连挥时每一下都从头挥
    if (g.dead) { // 倒下：仰面躺着；镜头在 1.5 秒里升到身后上方俯视，头顶有方块就停在它下面
      me.rotation.x = 1.5; me.position.y += 0.25; me.visible = (lie += dt) < 2.5; /* 倒下 2.5 秒后身体消失，醒来时不会留下第二个身体 */
      deadT = Math.min(1, deadT + dt / 1.5); const e = deadT * deadT * (3 - 2 * deadT);
      const roof = Core.raycast((x, y, z) => g.world.get(x, y, z), [p.x, p.y + 1, p.z], [0, 1, 0], 6), h = 1 + Math.min(4.5 * e, roof ? Math.max(0, roof.t - 0.4) : 9);
      camera.position.set(p.x + Math.sin(g.yaw) * 2.2 * e, p.y + h, p.z + Math.cos(g.yaw) * 2.2 * e); camera.lookAt(p.x, p.y + 0.3, p.z);
      return;
    }
    deadT = lie = 0;
    fwd.set(0, 0, -1).applyQuaternion(camera.quaternion); eye.copy(camera.position);
    const hit = Core.raycast((x, y, z) => g.world.get(x, y, z), eye.toArray(), [-fwd.x, -fwd.y, -fwd.z], BACK + 0.3); // 身后有没有方块挡着
    const want = hit ? Math.max(0.3, hit.t - 0.3) : BACK;
    dist += (want - dist) * Math.min(1, dt * (want < dist ? 30 : 6));                                             // 收近要快（不穿墙），放远慢慢来
    const k = Math.min(1, dist / BACK);                                                                            // 越过右肩看出去：小人不挡准星；镜头被墙顶近时偏移跟着缩小
    camera.position.addScaledVector(fwd, -dist).addScaledVector(right.set(1, 0, 0).applyQuaternion(camera.quaternion), 0.7 * k).y += 0.3 * k;
    cam = [camera.position.x, camera.position.y, camera.position.z, dist];
    me.visible = dist > 0.9;                                                                                       // 镜头贴到身上时不画，免得看到脑袋内部
  }
  addEventListener('keydown', e => { if (e.code === 'KeyV' && !e.repeat && window.game && game.playing) set(!on); });
  const controls = document.getElementById('settings-controls');
  if (controls) {
    controls.insertAdjacentHTML('afterbegin', '<h2>View</h2><label><input id="third" type="checkbox"> Third-person view <small>(press V to switch)</small></label>');
    const box = document.getElementById('third'); box.checked = on; box.onchange = () => set(box.checked);
  }
  // 准星对着哪里：沿镜头的视线找第一个方块或生物（只算玩家身前的），返回从眼睛指向那个点的方向
  function aim(eye, d, mobs) {
    if (!on || !cam || (window.game && game.dead)) return d;
    const o = cam.slice(0, 3), min = cam[3] + 0.3, hit = Core.raycast((x, y, z) => game.world.get(x, y, z), o, d, cam[3] + 12);
    let t = hit && hit.t > min ? hit.t : 40;
    for (const m of mobs) if (m.hp > 0) { const q = MobPhysics.ray(m, o, d, t); if (q !== null && q > min) t = q; }
    const v = [o[0] + d[0] * t - eye[0], o[1] + d[1] * t - eye[1], o[2] + d[2] * t - eye[2]], l = Math.hypot(...v) || 1;
    return [v[0] / l, v[1] / l, v[2] / l];
  }
  window.ThirdPerson = { apply, set, aim, get on() { return on || !!(window.game && game.dead); } }; // 倒地时也算在身外（不画第一人称的手）
})();
