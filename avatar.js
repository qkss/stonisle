// 角色形象：肤色、发型、发色、上衣、裤子。设置 → World → “Your character” 里选，带一个小预览；选择记在本机。
// 联机时 net.js 用 Avatar.build() 画别的玩家，身上穿的装备也画出来。模型是方块小人，脸朝 -z（和玩家朝向一致）。
(() => {
  // 形象跟着存档走：每个世界记自己的（第 1 个世界沿用原来的键；别的世界没记过就先用它的）
  const BASE = 'stonisle.look', keyOf = id => BASE + (id > 1 ? '.' + id : ''), saveId = parseInt(new URLSearchParams(location.search).get('save'), 10) || 1, KEY = keyOf(saveId);
  const SKIN = ['#f6d7bd', '#e8c39e', '#d2a077', '#b07a4f', '#8a5a36', '#5e3c24'];
  const HAIR = ['#2a2018', '#5a3a1e', '#a8743a', '#e0c070', '#c0502a', '#d8d8d8', '#4a78c8', '#c860a8'];
  const SHIRT = ['#c8483c', '#e08a2c', '#e0c040', '#58a84a', '#3c8ac8', '#6a58c0', '#c860a0', '#f0f0f0', '#404048'];
  const PANTS = ['#3a4a6a', '#4a3a2a', '#2e2e34', '#6a7a4a', '#8a6a4a', '#a8a8b0'];
  const STYLE = ['short', 'long', 'ponytail', 'buns', 'none', 'spiky', 'twin tails', 'bob', 'braid', 'side tail', 'curly', 'topknot', 'twin braids', 'hime'], BOTTOM = ['pants', 'skirt', 'dress'], SIZE = ['tall', 'kid'];
  const ACC = ['none', 'bow', 'flowers', 'cap', 'sun hat', 'scarf', 'ahoge']; // 配饰：发结、花环、鸭舌帽、宽檐草帽、围巾（戴了头盔就不画头上的）
  const OPTIONS = { skin: SKIN, style: STYLE, hair: HAIR, shirt: SHIRT, pants: PANTS, skirt: BOTTOM, size: SIZE, acc: ACC };
  const LABEL = { skin: 'Skin', style: 'Hair', hair: 'Hair color', shirt: 'Shirt', pants: 'Pants color', skirt: 'Bottom', size: 'Body', acc: 'Extra' };
  // 六个现成的角色，开局界面上选一个（之后还能在设置里随便改）。名字只是称呼，不绑定性别以外的任何东西
  const HEROES = [
    { name: 'Niko', look: { skin: 1, style: 0, hair: 1, shirt: 4, pants: 0, skirt: 0, acc: 6 } },
    { name: 'Kai', look: { skin: 3, style: 5, hair: 0, shirt: 3, pants: 1, skirt: 0, acc: 5 } },
    { name: 'Theo', look: { skin: 0, style: 0, hair: 3, shirt: 1, pants: 5, skirt: 0, acc: 3 } },
    { name: 'Luna', look: { skin: 1, style: 13, hair: 0, shirt: 5, pants: 0, skirt: 1, acc: 1 } },
    { name: 'Ivy', look: { skin: 4, style: 10, hair: 0, shirt: 2, pants: 3, skirt: 1 } },
    { name: 'Nora', look: { skin: 0, style: 12, hair: 4, shirt: 6, pants: 0, skirt: 2, acc: 4 } },
    // 六个小孩：个子矮一截、头大一点
    { name: 'Leo', look: { skin: 1, style: 5, hair: 2, shirt: 0, pants: 0, skirt: 0, size: 1, acc: 3 } },
    { name: 'Sam', look: { skin: 4, style: 0, hair: 0, shirt: 2, pants: 2, skirt: 0, size: 1 } },
    { name: 'Ben', look: { skin: 2, style: 0, hair: 4, shirt: 7, pants: 4, skirt: 0, size: 1 } },
    { name: 'Mia', look: { skin: 2, style: 3, hair: 1, shirt: 6, pants: 5, skirt: 1, size: 1, acc: 1 } },
    { name: 'Zoe', look: { skin: 5, style: 6, hair: 0, shirt: 3, pants: 0, skirt: 2, size: 1 } },
    { name: 'Lily', look: { skin: 0, style: 9, hair: 3, shirt: 4, pants: 3, skirt: 2, size: 1, acc: 2 } },
  ];
  // 装备穿在身上的颜色：[主色, 深色]。没列到的装备用灰色
  const TIER = { straw: ['#c9b25a', '#948038'], leather: ['#9a6a3e', '#74502e'], iron: ['#cdd6e2', '#8f9cac'], alloy: ['#e6c27a', '#a8803a'] };
  const GEAR = { 121: TIER.straw, 122: TIER.straw, 123: TIER.straw, 124: TIER.straw, 40: TIER.leather, 41: TIER.leather, 125: TIER.leather, 42: TIER.leather,
    43: TIER.iron, 44: TIER.iron, 126: TIER.iron, 45: TIER.iron, 127: TIER.alloy, 128: TIER.alloy, 129: TIER.alloy, 131: TIER.alloy,
    46: ['#c9a46a', '#b08a50'], 47: ['#2e2a36', '#46405a'], 48: ['#463a4e', '#2a2230'], 120: ['#c8553a', '#a8402a'], 142: ['#eef2f6', '#c8d4e0'], 146: ['#3a5a4a', '#2a4236'],
    147: ['#3484a8', '#2a6a8a'], 148: ['#6a5038', '#57402c'], 149: ['#a8b8c6', '#6c7c8c'], 150: ['#1c1828', '#463c62'], 151: ['#40506a', '#8ad0ff'] };
  const clean = l => { const o = {}; for (const k in OPTIONS) o[k] = Number.isInteger(l && l[k]) && l[k] >= 0 && l[k] < OPTIONS[k].length ? l[k] : 0; return o; }; // 别人发来的也过这一道
  const lookOf = id => { let l = null; try { l = JSON.parse(localStorage.getItem(keyOf(id)) || localStorage.getItem(BASE)); } catch (e) { /* 坏数据当没有 */ } return l ? clean(l) : { ...HEROES[0].look }; };
  let look = lookOf(saveId);

  function build(lk, gear = []) { // gear：[头, 身, 脚, 腿] 的物品 id，和 game.equip 同序
    const l = clean(lk), g = new THREE.Group(), [head, body, feet, legsGear] = gear.map(id => GEAR[id] || (id ? ['#8a8a9a', '#6a6a78'] : null));
    const shade = (c, k) => '#' + new THREE.Color(c).multiplyScalar(k).getHexString(), tint = (c, k) => '#' + new THREE.Color(c).lerp(new THREE.Color('#ffffff'), k).getHexString(); // 调暗 / 调亮
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
    const gown = !legsGear && BOTTOM[l.skirt] !== 'pants', legCol = gown ? skin : pants; // 穿裙子：腿露出来是肤色（穿了护腿就照护腿画，不画裙子）
    const leg = x => { // 以胯为轴：大腿、小腿（略深）、鞋（鞋头向前伸出一点）
      const p = pivot(x, 0.72);
      wear(gear[3],0.21, 0.34, 0.23, 0, -0.17, 0, legCol, p); wear(gear[3],0.19, 0.24, 0.21, 0, -0.46, 0, shade(legCol, gown ? 0.95 : 0.86), p);
      wear(gear[2],0.22, 0.14, 0.3, 0, -0.65, -0.03, shoe, p); wear(gear[2],0.22, 0.04, 0.3, 0, -0.7, -0.03, shade(shoe, 0.7), p);
      if (gown && !feet) { part(0.2, 0.09, 0.22, 0, -0.545, 0, '#f4f1ea', p); part(0.21, 0.025, 0.23, 0, -0.5, 0, tint(shirt, 0.25), p); } // 穿裙子配一双白短袜，袜口一道和上衣同色的边
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
    else if (BOTTOM[l.skirt] === 'dress') { // 连衣裙的上身：白色小翻领，胸口一个蝴蝶结，袖口一圈白边
      for (const x of [-0.07, 0.07]) part(0.11, 0.06, 0.03, x, 1.345, -0.135, '#f4f1ea');
      for (const x of [-0.045, 0.045]) part(0.07, 0.06, 0.025, x, 1.27, -0.14, tint(shirt, 0.45)); part(0.035, 0.045, 0.03, 0, 1.27, -0.142, shade(shirt, 0.7));
      for (const pv of [swing[2], swing[3]]) part(0.19, 0.03, 0.23, 0, -0.275, 0, '#f4f1ea', pv);
    }
    else { // 普通上衣：领口、门襟、三颗扣子、一只胸袋、下摆一道深色边
      part(0.2, 0.05, 0.02, 0, 1.35, -0.135, shade(shirt, 0.75)); part(0.04, 0.3, 0.02, 0, 1.2, -0.135, shade(shirt, 0.82));
      for (const y of [1.28, 1.19, 1.1]) part(0.025, 0.025, 0.02, 0, y, -0.146, tint(shirt, 0.6));
      part(0.11, 0.1, 0.02, 0.13, 1.16, -0.135, shade(shirt, 0.86)); part(0.11, 0.02, 0.022, 0.13, 1.2, -0.136, shade(shirt, 0.68));
      part(0.49, 0.03, 0.27, 0, 0.835, 0, shade(shirt, 0.8));
    }
    if (gown) { // 裙子：从腰往下一层比一层宽，盖到膝盖；前后都有百褶，裙摆镶浅边，后腰一个蝴蝶结。连衣裙和上衣一个颜色、再长一层
      const dress = BOTTOM[l.skirt] === 'dress', col = dress ? shirt : pants, tiers = dress ? 4 : 3;
      for (let i = 0; i < tiers; i++) {
        const w = 0.52 + i * 0.07, d = 0.34 + i * 0.07, y = 0.7 - i * 0.12; // 前后也放宽：走路时腿在裙子里面摆，不会穿出来
        part(w, 0.125, d, 0, y, 0, shade(col, i % 2 ? 0.92 : 1));
        for (let k = 0; k < 5; k++) for (const sz of [-1, 1]) part(0.035, 0.125, 0.012, (k - 2) * w / 5.4, y, sz * (d / 2 + 0.004), shade(col, 0.78)); // 百褶
      }
      const hw = 0.52 + (tiers - 1) * 0.07, hd = 0.34 + (tiers - 1) * 0.07, hy = 0.7 - (tiers - 1) * 0.12 - 0.075;
      part(hw + 0.03, 0.035, hd + 0.03, 0, hy, 0, tint(col, 0.45));                                             // 裙摆的浅边
      part(0.51, 0.045, 0.29, 0, 0.775, 0, dress ? tint(col, 0.35) : shade(col, 0.7));                           // 腰带
      for (const x of [-0.075, 0.075]) part(0.12, 0.09, 0.04, x, 0.78, 0.165, tint(col, 0.3)); part(0.05, 0.06, 0.05, 0, 0.78, 0.17, shade(col, 0.75)); // 后腰的蝴蝶结
      for (const x of [-0.05, 0.05]) part(0.05, 0.16, 0.03, x, 0.68, 0.19, tint(col, 0.3));                      // 蝴蝶结垂下来的两条带子
    }
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
      // 头发不再是几块大方砖：一顶贴头的发帽，额前一排尖尖的刘海，两鬓垂下来的细发，后面分层、发梢收尖，头顶一道高光。
      // 辫子和马尾一节一节往下变细。每一缕是一个可以歪一点的小长条（lock），所以看起来有发丝的走向。
      const st = STYLE[l.style], hi = tint(hair, 0.28), lo = shade(hair, 0.8), tie = tint(shirt, 0.15);
      const lock = (w, h, d, x, y, z, col = hair, rx = 0, rz = 0) => { const m = part(w, h, d, x, y, z, col); m.rotation.set(rx, 0, rz); m.userData.hair = true; return m; };
      lock(0.43, 0.07, 0.43, 0, 1.885, 0); lock(0.47, 0.1, 0.47, 0, 1.815, 0.004);                         // 发帽：顶上小一圈、下面大一圈，轮廓是圆的
      lock(0.47, 0.22, 0.09, 0, 1.69, 0.2); for (const x of [-0.215, 0.215]) lock(0.06, 0.2, 0.3, x, 1.72, 0.06); // 后脑和两侧
      lock(0.26, 0.012, 0.045, -0.02, 1.924, -0.09, hi); lock(0.1, 0.012, 0.04, 0.1, 1.924, -0.02, hi);     // 头顶的高光
      const fringe = st === 'hime' ? [] : st === 'spiky' ? [[-0.17, 0.3], [-0.085, -0.25], [0, 0.35], [0.085, -0.3], [0.17, 0.25]] : [[-0.17, 0.16], [-0.09, -0.1], [-0.01, 0.12], [0.07, -0.14], [0.155, -0.2]];
      for (const [x, rz] of fringe) { lock(0.09, 0.085, 0.035, x, 1.772, -0.218); lock(0.055, 0.075, 0.03, x + rz * 0.07, 1.712, -0.221, shade(hair, 0.93), 0, rz); } // 刘海：每一缕上宽下尖，方向交错
      const framing = !['short', 'spiky', 'topknot', 'hime'].includes(st);
      if (framing) for (const sx of [-1, 1]) { lock(0.05, 0.26, 0.05, sx * 0.205, 1.6, -0.165, hair, 0, sx * 0.05); lock(0.034, 0.09, 0.034, sx * 0.198, 1.435, -0.165, lo, 0, sx * 0.12); } // 两鬓垂到下巴的细发
      const tail = (n, x, y, z, w, sx = 0, dz = 0.012, drop = 0.112) => { // 一条往下变细的发束：n 节，深浅相间，sx 往外撇
        for (let k = 0; k < n; k++) lock(w - k * 0.016, drop + 0.012, w - 0.01 - k * 0.014, x + sx * k * 0.024, y - k * drop, z + k * dz, k % 2 ? lo : hair, 0.1, -sx * 0.14);
        lock(0.045, 0.07, 0.045, x + sx * n * 0.024, y - n * drop + 0.02, z + n * dz, lo, 0.1, -sx * 0.2);
      };
      const braid = (n, x, y, z, dz = 0) => { // 一条麻花辫：一节宽一节窄、左右错开，辫梢扎一个结，再留一撮
        for (let k = 0; k < n; k++) lock(k % 2 ? 0.085 : 0.108, 0.078, 0.088, x + (k % 2 ? 0.013 : -0.013), y - k * 0.072, z + k * dz, k % 2 ? lo : hair);
        lock(0.095, 0.045, 0.095, x, y - n * 0.072, z + n * dz, tie); lock(0.06, 0.07, 0.06, x, y - n * 0.072 - 0.055, z + n * dz, hair);
      };
      if (st === 'short') for (const x of [-0.13, 0, 0.13]) lock(0.1, 0.085, 0.05, x, 1.555, 0.205, lo, 0.25);                 // 短发：后颈几缕翘起的发梢
      if (st === 'spiky') { // 刺猬头：一圈往外炸开的尖刺，根粗尖细
        for (const [x, z, rx, rz] of [[-0.14, -0.12, -0.35, 0.35], [0.02, -0.14, -0.45, -0.05], [0.15, -0.1, -0.3, -0.4], [-0.17, 0.04, 0, 0.5], [0.18, 0.05, 0, -0.5], [-0.1, 0.15, 0.4, 0.25], [0.06, 0.17, 0.5, -0.1], [0, 0.02, 0, 0.1]]) {
          lock(0.1, 0.11, 0.1, x, 1.955, z, hair, rx, rz); lock(0.058, 0.1, 0.058, x - rz * 0.07, 2.04, z + rx * 0.07, hi, rx, rz);
        }
        for (const x of [-0.13, 0, 0.13]) lock(0.09, 0.08, 0.05, x, 1.56, 0.205, lo, 0.3);
      }
      if (st === 'long' || st === 'hime') { // 长发：后面三层垂到腰，一层比一层窄，发梢分成几缕
        lock(0.47, 0.3, 0.09, 0, 1.47, 0.21); lock(0.44, 0.28, 0.085, 0, 1.2, 0.215, shade(hair, 0.93)); lock(0.4, 0.14, 0.08, 0, 1.0, 0.215, lo);
        for (const [x, rz] of [[-0.15, 0.1], [-0.05, -0.06], [0.05, 0.06], [0.15, -0.1]]) lock(0.075, 0.11, 0.06, x, 0.89, 0.215, hair, 0, rz);
        if (st === 'long') for (const sx of [-1, 1]) tail(3, sx * 0.225, 1.5, 0.03, 0.075, sx * 0.3, -0.01);
      }
      if (st === 'hime') { lock(0.41, 0.105, 0.035, 0, 1.752, -0.218); lock(0.41, 0.02, 0.036, 0, 1.692, -0.219, lo); for (const sx of [-1, 1]) { lock(0.075, 0.3, 0.11, sx * 0.205, 1.57, -0.13); lock(0.076, 0.02, 0.111, sx * 0.205, 1.415, -0.13, lo); } } // 公主切：齐刘海，脸两边各一段齐下巴的直发
      if (st === 'ponytail') { lock(0.13, 0.1, 0.12, 0, 1.83, 0.27, tie); lock(0.15, 0.12, 0.13, 0, 1.8, 0.33); tail(4, 0, 1.69, 0.36, 0.13, 0, -0.008); }      // 高马尾：发绳、鼓起来的一截，再垂下去
      if (st === 'side tail') { lock(0.1, 0.1, 0.11, 0.25, 1.84, 0.03, tie); lock(0.14, 0.12, 0.13, 0.3, 1.8, 0.04); tail(4, 0.33, 1.69, 0.04, 0.12, 0.6, 0); }  // 侧马尾
      if (st === 'twin tails') for (const sx of [-1, 1]) { lock(0.09, 0.09, 0.11, sx * 0.25, 1.81, 0.09, tie); lock(0.13, 0.1, 0.12, sx * 0.29, 1.77, 0.1); tail(5, sx * 0.31, 1.66, 0.11, 0.125, sx, 0.006); } // 双马尾：往两边撇开，垂到腰
      if (st === 'buns') for (const sx of [-1, 1]) { lock(0.18, 0.15, 0.18, sx * 0.17, 1.985, 0.03); lock(0.11, 0.03, 0.11, sx * 0.17, 2.065, 0.03, hi); lock(0.19, 0.035, 0.19, sx * 0.17, 1.915, 0.03, tie); tail(2, sx * 0.25, 1.72, 0.13, 0.07, sx * 0.4, 0); } // 丸子头：两个团子，下面系着发带，再各垂一小缕
      if (st === 'bob') { lock(0.48, 0.26, 0.1, 0, 1.59, 0.2); for (const sx of [-1, 1]) { lock(0.065, 0.3, 0.37, sx * 0.218, 1.62, 0.03); lock(0.06, 0.05, 0.3, sx * 0.2, 1.465, 0.03, lo); } lock(0.44, 0.05, 0.085, 0, 1.455, 0.19, lo); } // 波波头：齐下巴一圈，发梢往里扣
      if (st === 'braid') braid(7, 0, 1.66, 0.275);                                                                                 // 麻花辫：背后一根
      if (st === 'twin braids') for (const sx of [-1, 1]) { lock(0.09, 0.07, 0.09, sx * 0.22, 1.52, -0.02); braid(6, sx * 0.225, 1.45, -0.05, -0.014); } // 双麻花辫：从耳后垂到胸前
      if (st === 'curly') { lock(0.53, 0.13, 0.53, 0, 1.895, 0); for (const sx of [-1, 1]) lock(0.1, 0.3, 0.42, sx * 0.245, 1.7, 0.03); lock(0.51, 0.36, 0.12, 0, 1.64, 0.235);
        for (const [x, y, z] of [[-0.17, 1.99, -0.13], [0.14, 2.0, -0.09], [0, 2.0, 0.1], [-0.19, 1.98, 0.15], [0.2, 1.98, 0.13], [-0.29, 1.58, 0.17], [0.29, 1.58, 0.17], [-0.28, 1.84, -0.05], [0.28, 1.84, -0.05], [0, 1.47, 0.28]]) lock(0.13, 0.11, 0.13, x, y, z, shade(hair, 0.93), 0.3, 0.3); } // 卷发：蓬蓬的一大团，一个个小卷
      if (st === 'topknot') { lock(0.2, 0.045, 0.2, 0, 1.94, 0.02, tie); lock(0.18, 0.15, 0.18, 0, 2.02, 0.02); lock(0.1, 0.03, 0.1, 0, 2.1, 0.02, hi); for (const x of [-0.13, 0, 0.13]) lock(0.09, 0.08, 0.05, x, 1.56, 0.205, lo, 0.25); } // 丸子头（一个）
    }
    const accessory = ACC[l.acc] || 'none', straw = '#e8d08a';
    if (accessory === 'scarf') { part(0.34, 0.1, 0.32, 0, 1.415, 0, tint(shirt, 0.5)); part(0.11, 0.26, 0.05, 0.1, 1.27, -0.155, tint(shirt, 0.5)); part(0.11, 0.035, 0.052, 0.1, 1.17, -0.156, shade(shirt, 0.8)); } // 围巾：绕脖子一圈，胸前垂一截
    if (!head) {
      if (accessory === 'ahoge') { const a = part(0.03, 0.13, 0.03, 0.03, 1.985, -0.04, hair), b = part(0.03, 0.09, 0.03, 0.085, 2.055, -0.04, hair); a.rotation.z = -0.45; b.rotation.z = -1.25; a.userData.hair = b.userData.hair = true; } // 呆毛：头顶翘起来弯一下的一撮
      if (accessory === 'bow') { for (const x of [-0.08, 0.08]) part(0.13, 0.11, 0.06, 0.1 + x, 1.95, 0.1, '#e8486a'); part(0.06, 0.07, 0.07, 0.1, 1.95, 0.1, '#b82e50'); } // 发结：头顶偏一侧的大蝴蝶结
      if (accessory === 'flowers') { part(0.46, 0.035, 0.46, 0, 1.9, 0, '#5c9a48'); [[-0.2, -0.2], [0, -0.23], [0.2, -0.2], [0.23, 0], [0.2, 0.2], [0, 0.23], [-0.2, 0.2], [-0.23, 0]].forEach(([x, z], i) => { part(0.09, 0.07, 0.09, x, 1.92, z, ['#f08ab0', '#f4d24a', '#ffffff', '#b890e8'][i % 4]); part(0.035, 0.075, 0.035, x, 1.925, z, '#f0b030'); }); } // 花环：一圈小花
      if (accessory === 'cap') { part(0.45, 0.13, 0.45, 0, 1.915, 0, shade(shirt, 0.85)); part(0.32, 0.03, 0.2, 0, 1.87, -0.3, shade(shirt, 0.65)); part(0.07, 0.03, 0.07, 0, 1.99, 0, tint(shirt, 0.4)); part(0.14, 0.07, 0.02, 0, 1.92, -0.227, tint(shirt, 0.5)); } // 鸭舌帽：帽顶、帽檐、顶扣、前面一块徽标
      if (accessory === 'sun hat') { part(0.8, 0.03, 0.8, 0, 1.885, 0, straw); part(0.42, 0.15, 0.42, 0, 1.97, 0, straw); part(0.44, 0.05, 0.44, 0, 1.92, 0, tint(shirt, 0.1)); part(0.1, 0.12, 0.03, 0.12, 1.86, 0.235, tint(shirt, 0.1)); } // 宽檐草帽：一圈丝带，后面垂一小截
    }
    if (SIZE[l.size] === 'kid') { // 小孩：整体缩到 78%，脖子以上再放大 25%
      const hg = new THREE.Group(); hg.position.set(0, 1.44, 0);
      for (const c of [...g.children]) if ((c.isMesh || c.userData.gearPart) && (c.position.y > 1.45 || c.userData.hair)) { c.position.y -= 1.44; hg.add(c); }
      hg.scale.setScalar(1.25); g.add(hg); g.scale.setScalar(0.78);
    }
    g.userData.swing = swing; g.userData.gown = gown;
    return g;
  }
  function colors(lk, gear = []) { const l = clean(lk), body = GEAR[gear[1]] || (gear[1] ? ['#8a8a9a'] : null); return { skin: SKIN[l.skin], sleeve: body ? body[0] : SHIRT[l.shirt] }; }
  function hold(g, id) { // 右手里拿着的东西：工具用游戏里同一个模型，方块是一个小方块
    const arm = g.userData.swing[3]; if (g.userData.item) arm.remove(g.userData.item);
    g.userData.sword = [23, 26, 29, 153].includes(id); // 拿着剑：挥动是左右横扫，不是从上往下劈
    const item = g.userData.item = window.game && id ? game.itemMesh(id) : null; if (!item) return;
    g.userData.ranged = [261, 262, 263].includes(id);  // 弓、弩、枪：模型的 +z 是射出去的方向，要顺着胳膊指出去，握把朝下
    const mounted = g.userData.ranged && window.Ranged ? Ranged.mount(item, id) : item; g.userData.aim = g.userData.ranged ? id : 0; g.userData.bowMount = id === 261 ? mounted : null;
    const grip = new THREE.Group(); grip.add(mounted); grip.position.set(0, -0.66, -0.02); grip.scale.setScalar(0.9);
    if (g.userData.ranged) { grip.rotation.order = 'YXZ'; grip.rotation.set(Math.PI / 2, Math.PI, 0); } else grip.rotation.x = g.userData.sword ? -2.3 : -1.9; // 远程武器：握把在手里，射出去的方向顺着胳膊，胳膊平举时正好朝前 // 工具从手里向前伸出去（不是顺着胳膊往回指）：手垂着时指向前下方，手向前举时指向前上方
    arm.add(g.userData.item = grip);
  }
  // 摆姿势。phase 动作的相位，walk 0–1 走路的幅度，swing 0–1 右手挥动的进度（0 = 没在挥），air 在空中，swim 在水里
  function pose(g, phase, walk = 0, swing = 0, air = false, swim = false) {
    const [legL, legR, armL, armR] = g.userData.swing, s = Math.sin(phase) * 0.7 * walk, k = Math.sin(phase), stride = g.userData.gown ? 0.36 : 1; // 穿裙子：步子迈小一点，腿留在裙子里
    g.rotation.order = 'YXZ'; g.rotation.x = 0;                                  // 踩水保持直立，与站立碰撞体一致，避免头部绕脚底旋进岸墙
    const u = g.userData; if (swing > 0 && !(swing >= (u.lastSw || 0) && u.lastSw > 0)) u.flip = !u.flip; u.lastSw = swing; // 每挥一下换一个方向：右到左、左到右交替
    armR.rotation.order = 'YXZ'; armR.rotation.y = 0; armL.rotation.y = 0; // 端着远程武器时两臂会往里收，别的姿势要归零
    if (swim) { // 小幅蹬腿和划水，轮廓留在碰撞体附近
      legL.rotation.x = k * 0.16; legR.rotation.x = -k * 0.16;
      armL.rotation.x = -0.25 + k * 0.15; armL.rotation.z = 0;
      armR.rotation.x = -0.25 - k * 0.15; armR.rotation.z = 0;
      return;
    }
    legL.rotation.x = (air ? -0.55 : s) * stride; legR.rotation.x = (air ? 0.35 : -s) * stride;                       // 跳起：两腿一前一后收起
    armL.rotation.x = air ? 2.6 : -s; armL.rotation.z = air ? -0.25 : 0;                       // 跳起：双臂上举
    if (u.ranged && !air) { // 远程武器：一直端着瞄准，不挥砍。三种姿势不一样
      if (swing > 0 && !(u.shot > 0)) u.shotAt = performance.now(); u.shot = swing;                    // 刚射出去的那一刻
      const since = (performance.now() - (u.shotAt || -1e9)) / 1000, kick = since < 0.25 ? Math.sin(since / 0.25 * Math.PI) : 0;
      armL.rotation.order = 'YXZ';
      if (u.aim === 261) { // 弓：右臂伸直举着弓，左手在弦上——射完手松开落下一点，再抬回去把弦拉到脸旁边
        const k = Math.max(0, Math.min(1, since / 0.8)), e = k * k * (3 - 2 * k);
        armR.rotation.x = 1.52; armR.rotation.y = 0.12; armR.rotation.z = 0;
        armL.rotation.x = 1.5 - 0.5 * e; armL.rotation.y = -0.75 + 0.2 * e; armL.rotation.z = 0;
        if (u.bowMount && window.Ranged) Ranged.draw(u.bowMount, k);
      } else if (u.aim === 262) { // 弩：两只手一起端平，左手在前面托着；射出去往上一跳
        armR.rotation.x = 1.42 + kick * 0.16; armR.rotation.y = 0.28; armR.rotation.z = 0;
        armL.rotation.x = 1.36 + kick * 0.16; armL.rotation.y = -0.62; armL.rotation.z = 0;
      } else { // 枪：右手举平瞄准，左手扶着右手腕；后坐更大
        armR.rotation.x = 1.5 + kick * 0.3; armR.rotation.y = 0.2; armR.rotation.z = 0;
        armL.rotation.x = 1.3 + kick * 0.24; armL.rotation.y = -0.78; armL.rotation.z = 0;
      }
      return;
    }
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
  function changed() { localStorage.setItem(KEY, JSON.stringify(look)); renderRows(); draw(); paintHand(); renderHeroes(); icons(); if (window.Net && Net.look) Net.look(); }
  // —— 开局界面：存档那一行左边是这个世界的角色头像；只有新建世界时选一次角色（之后在设置 → Character 里改）——
  // 新建世界分三步，每一步独占开始卡片，不和存档列表挤在一起：选角色（男 / 女 / 男孩 / 女孩四组）→ 起名字（点头像可以回去重选）→ Play。
  const card = document.getElementById('launchCard'), form = document.getElementById('saveForm'), $id = i => document.getElementById(i);
  const GROUPS = [['Men', 0], ['Women', 3], ['Boys', 6], ['Girls', 9]]; // HEROES 里每组 3 个，按这个顺序排
  document.head.appendChild(document.createElement('style')).textContent = `
    #launchCard.wiz > :not(.wizPage) { display: none !important; }
    .wizPage { display: none; } #launchCard.wiz > .wizPage.on { display: block; }
    .wizPage h2 { margin: 0 0 12px; font: 600 20px Georgia, serif; color: #efd6a0; }
    .heroGroups { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 18px; }
    .heroGroups h3 { margin: 0 0 4px; font-size: 12px; font-weight: normal; letter-spacing: 1px; color: #a8957c; }
    .heroGroups section > div { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
    .heroGroups section, .heroGroups button { min-width: 0; }
    .heroGroups button { display: flex; flex-direction: column; align-items: center; margin: 0; padding: 4px 2px; background: #ffffff14; border: 2px solid #0000; border-radius: 4px; color: inherit; font-size: 12px; cursor: pointer; }
    .heroGroups button[aria-pressed=true] { background: #ffd36b2e; border-color: #ffd36b; }
    .heroGroups img { width: 100%; max-height: min(84px, 16vh); aspect-ratio: 4/5; object-fit: contain; }
    .wizActions { display: flex; gap: 8px; margin-top: 14px; }
    .wizActions button { margin: 0; padding: 12px 18px; font: inherit; border-radius: 4px; cursor: pointer; background: transparent; border: 1px solid #957a50; color: #d0b782; }
    .wizActions .go { flex: 1; font-weight: bold; letter-spacing: 1px; background: linear-gradient(#657447,#455333); color: #fff1d1; border-color: #b3ab72; }
    .heroFace { display: flex; flex-direction: column; align-items: center; gap: 2px; margin: 0; padding: 6px 12px; background: #ffffff14; border: 1px solid #957a50; border-radius: 4px; color: inherit; font: inherit; cursor: pointer; }
    .heroFace img { height: min(96px, 22vh); aspect-ratio: 4/5; object-fit: contain; } .heroFace small { color: #d0b782; font-size: 11px; }
    #launchCard > .heroFace { flex-direction: row; gap: 12px; width: 100%; margin-top: 14px; } #launchCard > .heroFace img { height: 64px; } #launchCard > .heroFace b { flex: 1; text-align: left; }
    #wizName { width: 100%; box-sizing: border-box; font: inherit; padding: 11px; border: 1px solid #957a50; border-radius: 4px; background: #211b16; color: #f6e6c7; }
    @media (max-height: 540px) { .wizPage h2 { margin-bottom: 6px; font-size: 18px; } .heroGroups { gap: 4px 18px; } .heroGroups img { max-height: 12vh; } .heroGroups button { padding: 2px; } .wizActions { margin-top: 8px; } .wizActions button { padding: 9px 18px; } } /* 横屏手机：一屏放下，不用滚 */
    #wizError { min-height: 1em; margin: 6px 0 0; color: #ffb4a0; font-size: 12px; }`;
  if (card) card.insertAdjacentHTML('beforeend', `
    <div class="wizPage" id="heroPage"><h2>Choose your character</h2><div class="heroGroups" id="heroGroups"></div>
      <div class="wizActions"><button type="button" id="heroBack">Cancel</button><button type="button" id="heroNext" class="go">Next</button></div></div>
    <div class="wizPage" id="namePage"><h2>Name your world</h2>
      <div style="display:flex;gap:16px;align-items:center"><button type="button" class="heroFace" id="heroFace" aria-label="Change character"></button>
        <div style="flex:1;min-width:0"><input id="wizName" maxlength="32" autocomplete="off" aria-label="World name"><p id="wizError" role="alert"></p></div></div>
      <div class="wizActions"><button type="button" id="nameBack">Back</button><button type="button" id="wizPlay" class="go">Play</button></div></div>`);
  let canCancel = false, ready = false, draft = { ...HEROES[0].look }, direct = false; // draft：正在新建的世界要用的角色；direct：联机访客没有存档，直接改自己的形象
  const shots = {}; let studio = null;
  function portrait(lk, gear = [], held = 0) { // 一张全身像；用一个常驻的小画布画，画过的记下来。gear、held：身上的装备和手里的东西（背包里的形象预览用）
    if (!ready) return '';
    const k = JSON.stringify(clean(lk)) + '|' + gear.join() + '|' + held; if (shots[k]) return shots[k];
    if (!studio) {
      const c = document.createElement('canvas'); c.width = 160; c.height = 200;
      const r = new THREE.WebGLRenderer({ canvas: c, antialias: true, alpha: true, preserveDrawingBuffer: true }), sc = new THREE.Scene(), cam = new THREE.PerspectiveCamera(30, 0.8, 0.1, 20);
      cam.position.set(1.3, 1.5, -3.9); cam.lookAt(0, 1.02, 0); sc.add(new THREE.AmbientLight(0xffffff, 0.8)); const sun = new THREE.DirectionalLight(0xfff2d8, 0.6); sun.position.set(1, 2, -2); sc.add(sun);
      studio = { c, r, sc, cam };
    }
    const m = build(lk, gear); if (held) hold(m, held); studio.sc.add(m); studio.r.render(studio.sc, studio.cam); studio.sc.remove(m);
    return shots[k] = studio.c.toDataURL();
  }
  function icon(el) { // game.js 画存档卡片时调用：把方块图标换成这个世界的角色
    const src = portrait(+el.dataset.save === saveId ? look : lookOf(+el.dataset.save)); if (!src) return;
    el.style.cssText = 'width:44px;height:55px;font-size:0'; el.innerHTML = `<img src="${src}" alt="" style="width:100%;height:100%;object-fit:contain">`;
  }
  const icons = () => document.querySelectorAll('.worldIcon[data-save]').forEach(icon);
  const show = page => { card.classList.toggle('wiz', !!page); for (const pg of card.querySelectorAll('.wizPage')) pg.classList.toggle('on', pg.id === page); card.scrollTop = 0; renderHeroes(); };
  function renderHeroes() {
    if (!card) return;
    const shown = direct ? look : draft, now = JSON.stringify(clean(shown)), cur = HEROES.findIndex(h => JSON.stringify(clean(h.look)) === now), pic = portrait(shown);
    $id('heroGroups').innerHTML = GROUPS.map(([title, a]) => `<section><h3>${title}</h3><div>` + HEROES.slice(a, a + 3).map((h, k) => { const p = portrait(h.look); return `<button type="button" data-i="${a + k}" aria-pressed="${a + k === cur}">${p ? `<img src="${p}" alt="">` : ''}${h.name}</button>`; }).join('') + '</div></section>').join('');
    for (const b of $id('heroGroups').querySelectorAll('button')) b.onclick = () => { const pick = { ...HEROES[b.dataset.i].look }; if (direct) { look = pick; changed(); } else { draft = pick; renderHeroes(); } };
    for (const f of document.querySelectorAll('.heroFace')) f.innerHTML = (pic ? `<img src="${pic}" alt="">` : '') + `<b>${cur < 0 ? 'Custom' : HEROES[cur].name}</b><small>Change</small>`; // 在设置里自己搭的形象不在名单里，叫 Custom
    $id('heroBack').hidden = direct || !canCancel; $id('heroNext').textContent = direct ? 'Done' : 'Next';
  }
  function wizard(cancelable) { // game.js：点 “New world”，或者还没有任何世界时
    canCancel = cancelable; draft = { ...HEROES[0].look }; $id('wizName').value = 'My island'; $id('wizError').textContent = ''; form.hidden = true; show('heroPage');
  }
  function play() { // 用 game.js 原来的建世界流程：把名字填进它的表单再提交；建好后页面重新载入，带个记号直接开始玩
    const name = $id('wizName').value.trim();
    if (!name) return void ($id('wizError').textContent = 'Type a name for your world.');
    $id('saveName').value = name; $id('saveError').textContent = ''; sessionStorage.setItem('stonisle.autoplay', '1');
    form.requestSubmit();
    if ($id('saveError').textContent) { sessionStorage.removeItem('stonisle.autoplay'); $id('wizError').textContent = $id('saveError').textContent; }
  }
  if (card) {
    $id('heroBack').onclick = () => show(null);
    $id('heroNext').onclick = () => { if (direct) return show(null); show('namePage'); if (!matchMedia('(pointer:coarse)').matches) { $id('wizName').focus(); $id('wizName').select(); } }; // 触屏上不自动弹键盘
    $id('heroFace').onclick = $id('nameBack').onclick = () => show('heroPage');
    $id('wizPlay').onclick = play;
    $id('wizName').onkeydown = e => { e.stopPropagation(); if (e.key === 'Enter') play(); };
    if (form && !form.hidden) wizard(false); // 还没有世界：game.js 已经把它的表单打开了，换成这套流程
  }
  addEventListener('load', () => {
    ready = true; renderHeroes(); icons();
    if (sessionStorage.getItem('stonisle.autoplay')) { sessionStorage.removeItem('stonisle.autoplay'); setTimeout(() => $id('start').click(), 400); } // 刚建好世界：直接开始
  });
  renderHeroes();
  renderRows();
  let spin = 0; // 拖动预览可以转着看
  view.style.cursor = 'grab'; view.style.touchAction = 'none';
  view.onpointerdown = e => { view.setPointerCapture(e.pointerId); let x = e.clientX; view.onpointermove = m => { spin += (m.clientX - x) * 0.02; x = m.clientX; if (model) { model.rotation.y = spin; renderer.render(scene, cam); } }; };
  view.onpointerup = () => { view.onpointermove = null; };
  document.getElementById('tab-character').addEventListener('click', () => setTimeout(draw, 0)); // 切到这一页时画出来（也带上刚换的装备）
  addEventListener('load', draw);
  window.Avatar = { build, walk, pose, hold, colors, inWater, clean, icon, get look() { return look; },
    wizard, shot: (gear, held) => portrait(look, gear, held), // bag-tabs.js：背包角色页里穿着装备的预览
    newWorld(id) { localStorage.setItem(keyOf(id), JSON.stringify(draft)); },                                   // game.js 新建世界时调用：把刚选的角色记给它
    direct(before) { direct = true; const f = document.createElement('button'); f.type = 'button'; f.className = 'heroFace'; f.setAttribute('aria-label', 'Change character'); f.onclick = () => show('heroPage'); before.before(f); renderHeroes(); } }; // net.js：访客的加入界面上点头像选自己的形象
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
