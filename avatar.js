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
  const clean = l => { const o = {}; for (const k in OPTIONS) o[k] = Number.isInteger(l && l[k]) && l[k] >= 0 && l[k] < OPTIONS[k].length ? l[k] : 0;
    const n = window.Skins ? Skins.list.length : 1; o.outfit = Number.isInteger(l && l.outfit) && l.outfit > 0 && l.outfit < n ? l.outfit : 0; // 皮肤的序号（skins.js），0 = 不用皮肤
    return o; }; // 别人发来的也过这一道
  const lookOf = id => { let l = null; try { l = JSON.parse(localStorage.getItem(keyOf(id)) || localStorage.getItem(BASE)); } catch (e) { /* 坏数据当没有 */ } return l ? clean(l) : { ...HEROES[0].look }; };
  let look = lookOf(saveId);

  // 圆角方块（给头发用）：圆角矩形挤出，四周再倒圆边。同尺寸共用一份几何体
  const softCache = new Map();
  // 整套模型的皮肤（skin.model 指向一个 .glb）：只读我们自己烘焙的那种——三角形 + 顶点色，不带贴图和骨骼，所以不用引 GLTFLoader。
  const models = {};
  function glb(url) {
    return models[url] ||= fetch(url).then(r => r.arrayBuffer()).then(buf => {
      const dv = new DataView(buf), jl = dv.getUint32(12, true), json = JSON.parse(new TextDecoder().decode(new Uint8Array(buf, 20, jl))), bin = 28 + jl;
      const T = { 5121: Uint8Array, 5123: Uint16Array, 5125: Uint32Array, 5126: Float32Array }, N = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 };
      const read = i => { const a = json.accessors[i], v = json.bufferViews[a.bufferView]; return new T[a.componentType](buf, bin + (v.byteOffset || 0) + (a.byteOffset || 0), a.count * N[a.type]); };
      const pr = json.meshes[0].primitives[0], geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(read(pr.attributes.POSITION), 3));
      const c = pr.attributes.COLOR_0; if (c !== undefined) geo.setAttribute('color', new THREE.BufferAttribute(read(c), N[json.accessors[c].type], json.accessors[c].componentType !== 5126));
      if (pr.attributes.TEXCOORD_0 !== undefined) geo.setAttribute('uv', new THREE.BufferAttribute(read(pr.attributes.TEXCOORD_0), 2));
      if (pr.attributes._RIBBON !== undefined) geo.setAttribute('ribbon', new THREE.BufferAttribute(read(pr.attributes._RIBBON), 1)); // 1 飘带尾巴，2 头边的蝴蝶结
      if (pr.indices !== undefined) geo.setIndex(new THREE.BufferAttribute(read(pr.indices), 1)); geo.computeVertexNormals();
      const img = json.images?.[0]; if (!img) return new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true }));
      const v = json.bufferViews[img.bufferView];
      return createImageBitmap(new Blob([new Uint8Array(buf, bin + (v.byteOffset || 0), v.byteLength)], { type: img.mimeType })).then(bmp => {
        const map = new THREE.Texture(bmp); map.flipY = false; map.anisotropy = 4; map.needsUpdate = true;
        return new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ map, color: 0xd0d0d0 }) /* 立绘本身带明暗，压一点免得被场景光照得发白 */);
      });
    });
  }
  // 模型没有骨骼：给它现搭一副（身子 / 头 / 两臂 / 两腿），每个顶点按离关节多远分一点权重给附近的骨头——
  // 交界处是渐变的，所以裙摆和腿之间不会裂开，袖子越往袖口越跟着手臂走，像布一样弯。每帧照抄方块小人对应关节的转角。
  // joints 是这个模型自己的关节位置（模型坐标）：x/z 身体中线，neck 脖子高度，shoulder [离中线, 高度]，hip [离中线, 高度]，leg 腿最高到哪、arm [袖子从多高到多高]
  const skins = new WeakMap();
  const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  function weigh(m, J) {
    if (skins.has(m)) return skins.get(m);
    const geo = m.geometry.clone(), P = geo.attributes.position, R = geo.attributes.ribbon, n = P.count, idx = new Uint16Array(n * 4), w = new Float32Array(n * 4);
    geo.translate(-J.x, 0, -J.z);
    const legW = J.hip[0] * 2.6;
    for (let i = 0; i < n; i++) {
      const x = P.getX(i), y = P.getY(i), z = P.getZ(i), ax = Math.abs(x), side = x < 0 ? 0 : 1, rib = R ? R.getX(i) : 0;
      const head = rib === 2 ? 1 : ss(J.neck - 0.04, J.neck + 0.06, y);
      const arm = rib ? 0 : ss(J.shoulder[0] - 0.04, J.shoulder[0] + 0.2, ax) * ss(J.arm[0] - 0.02, J.arm[0] + 0.08, y) * ss(J.arm[1] + 0.02, J.arm[1] - 0.08, y);
      const leg = rib ? 0 : ss(J.leg + 0.12, J.leg - 0.12, y) * ss(legW + 0.06, legW - 0.02, ax) * ss(0.14, 0.02, z), left = ss(0.05, -0.05, x); // 两腿中间渐变着分给左右腿，迈步时不会从中间撕开
      const ws = [[1, head], [2 + side, arm], [4, leg * left], [5, leg * (1 - left)]].sort((a, b) => b[1] - a[1]).slice(0, 3);
      const sum = ws.reduce((t, [, k]) => t + k, 0), sc = sum > 1 ? 1 / sum : 1;
      idx[i * 4] = 0; w[i * 4] = 1 - sum * sc; ws.forEach(([b, k], j) => { idx[i * 4 + 1 + j] = b; w[i * 4 + 1 + j] = k * sc; });
    }
    geo.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(idx, 4)); geo.setAttribute('skinWeight', new THREE.Float32BufferAttribute(w, 4)); geo.computeVertexNormals();
    const mat = m.material.clone(); mat.skinning = true; mat.side = THREE.DoubleSide;
    const out = { geo, mat }; skins.set(m, out); return out;
  }
  function rig(m, J, g, inner) {
    if (!J) { inner.add(m.clone()); return; }
    const { geo, mat } = weigh(m, J), [legL, legR, armL, armR] = g.userData.swing, hg = g.userData.head;
    const at = [[0, 0, 0], [0, J.neck, 0], [-J.shoulder[0], J.shoulder[1], 0], [J.shoulder[0], J.shoulder[1], 0], [-J.hip[0], J.hip[1], 0], [J.hip[0], J.hip[1], 0]];
    const bones = at.map(([x, y, z]) => { const b = new THREE.Bone(); b.position.set(x, y, z); b.rotation.order = 'YXZ'; return b; });
    for (const b of bones.slice(1)) bones[0].add(b);
    const mesh = new THREE.SkinnedMesh(geo, mat); mesh.add(bones[0]); mesh.updateMatrixWorld(true); mesh.bind(new THREE.Skeleton(bones));
    mesh.frustumCulled = false; inner.add(mesh); mesh.userData.model = J;
    if (g.userData.backItem) { const id = g.userData.backId; g.userData.backId = null; back(g, id, g.userData.backSkin); } // 模型比背上的剑晚加载完：重新量一下头发，剑挂到外面
    const src = [null, hg, armL, armR, legL, legR], damp = [0, 0.5, 0.7, 0.7, 0.45, 0.45]; // 抄过来的前后摆幅打个折：头一半、手七成、腿不到一半（这个模型两只靴子是连在一起生成的，步子大了中间会拉丝）
    const silk = J.ribbon ? ribbon(J.ribbon, mat, inner) : null; let stride = 0;
    mesh.onBeforeRender = () => {
      for (let i = 1; i < 6; i++) { bones[i].rotation.copy(src[i].rotation); bones[i].rotation.x *= damp[i]; }
      stride += (Math.min(1, Math.abs(legL.rotation.x) * 3) - stride) * 0.05; if (silk) silk(performance.now() / 1000, stride); // 走得越快飘带往后飘得越高
    };
  }
  // 一条连续的丝带：沿 pts 这条线铺一条窄带，根部固定，越往梢越随风摆；贴图用模型图集最右边那块丝绸（u 0.76–0.99）
  function ribbon(pts, mat, to) {
    const curve = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p))), rows = 28, pos = new Float32Array((rows + 1) * 2 * 3), uv = [], ids = [];
    for (let i = 0; i <= rows; i++) { uv.push(0.77, i / rows * 0.97, 0.98, i / rows * 0.97); if (i < rows) { const n = i * 2; ids.push(n, n + 1, n + 2, n + 1, n + 3, n + 2); } }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(ids);
    const m = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ map: mat.map, color: mat.color, side: THREE.DoubleSide })); m.frustumCulled = false; to.add(m);
    const p = new THREE.Vector3(), side = new THREE.Vector3();
    const step = (t, walk) => {
      for (let i = 0; i <= rows; i++) {
        const k = i / rows, f = k * k; curve.getPoint(k, p); const tan = curve.getTangent(k);
        p.z += f * (0.08 * Math.sin(t * 1.6 - k * 4) + walk * 0.16); p.y += f * walk * 0.05; p.x += f * 0.06 * Math.sin(t * 1.1 - k * 3); // 风吹 + 走路时往后飘
        side.set(1, 0, 0).addScaledVector(tan, -tan.x).normalize().applyAxisAngle(tan, Math.sin(t * 1.3 - k * 5) * 0.5);                                  // 带子横着铺（宽度方向取 x 去掉沿线分量，竖直段也不会算出零向量），沿途轻轻扭
        const w = 0.068 * (1 - 0.3 * k);
        pos.set([p.x - side.x * w, p.y - side.y * w, p.z - side.z * w, p.x + side.x * w, p.y + side.y * w, p.z + side.z * w], i * 6);
      }
      geo.attributes.position.needsUpdate = true; geo.computeVertexNormals();
    };
    step(0, 0); return step; // 先铺好一帧：第一次画之前就要有法线，不然着色器拿到的是空法线（全白 / 全黑）
  }
  function softBox(w, h, d) {
    const key = w + ',' + h + ',' + d; if (softCache.has(key)) return softCache.get(key);
    const r = Math.min(0.03, Math.min(w, h, d) * 0.35), W = w / 2 - r, H = h / 2 - r, k = r * 0.8, sh = new THREE.Shape();
    sh.moveTo(-W + k, -H); sh.lineTo(W - k, -H); sh.quadraticCurveTo(W, -H, W, -H + k); sh.lineTo(W, H - k); sh.quadraticCurveTo(W, H, W - k, H); sh.lineTo(-W + k, H); sh.quadraticCurveTo(-W, H, -W, H - k); sh.lineTo(-W, -H + k); sh.quadraticCurveTo(-W, -H, -W + k, -H);
    const geo = new THREE.ExtrudeGeometry(sh, { depth: d - 2 * r, bevelEnabled: true, bevelSize: r, bevelThickness: r, bevelSegments: 3, curveSegments: 3 }); geo.translate(0, 0, -(d - 2 * r) / 2);
    softCache.set(key, geo); return geo;
  }
  // 脸的像素贴图：眉毛、眼睛（上眼线、眼白、三段深浅的虹膜、瞳孔、两点高光）、腮红、鼻子、微笑。big = 动漫大眼，多一个眼尾
  const faceCache = new Map();
  function faceTex(skin, brow, eye, big) {
    const key = [skin, brow, eye, big].join(); if (faceCache.has(key)) return faceCache.get(key);
    const c = document.createElement('canvas'); c.width = c.height = 32; const x = c.getContext('2d');
    const hex = col => '#' + col.getHexString(), iris = new THREE.Color(eye), sk = new THREE.Color(skin);
    const dark = hex(iris.clone().multiplyScalar(.55)), light = hex(iris.clone().lerp(new THREE.Color('#fff'), .35)), white = '#fbf6f0', lash = '#2b1e1f', deep = '#1c1214';
    const blush = hex(sk.clone().lerp(new THREE.Color('#f07a86'), .45)), nose = hex(sk.clone().multiplyScalar(.9)), mouth = '#a4605a';
    const ew = big ? 8 : 7, eh = big ? 9 : 7, ex = big ? 4 : 5, ey = big ? 10 : 11;
    for (const s of [0, 1]) {
      const r = (col, a, b, w = 1, h = 1) => { x.fillStyle = col; x.fillRect(s ? 32 - a - w : a, b, w, h); }; // 右眼是左眼的镜像
      r(brow, ex, ey - 3, ew - 1); r(brow, ex - 1, ey - 2);                                          // 眉毛，外端往下弯
      for (let j = 1; j < eh; j++) {
        const last = j === eh - 1, t = (j - 1) / (eh - 2);
        r(white, ex + (last ? 1 : 0), ey + j, ew - (last ? 2 : 0));
        r(t < .34 ? dark : t < .7 ? eye : light, ex + 1 + (last ? 1 : 0), ey + j, ew - 2 - (last ? 2 : 0));
      }
      r(deep, ex + (ew >> 1), ey + 2, 2, eh - 4);                                                     // 瞳孔
      r('#ffffff', ex + 2, ey + 2, 1, 2); r('#ffffff', ex + ew - 3, ey + eh - 3);                       // 高光
      r(lash, ex - 1, ey, ew + 1); if (big) { r(lash, ex - 2, ey - 1, 2); r(lash, ex - 1, ey + 1); }   // 上眼线（动漫眼多一个上翘的眼尾）
      r(blush, ex - 1, ey + eh + 1, 3);                                                               // 腮红
    }
    x.fillStyle = nose; x.fillRect(15, 20, 2, 1);
    x.fillStyle = mouth; x.fillRect(15, 24, 2, 1); x.fillRect(14, 23, 1, 1); x.fillRect(17, 23, 1, 1);  // 小微笑
    const tex = new THREE.CanvasTexture(c); tex.magFilter = tex.minFilter = THREE.NearestFilter; tex.generateMipmaps = false;
    faceCache.set(key, tex); return tex;
  }
  function build(lk, gear = []) { // gear：[头, 身, 脚, 腿] 的物品 id，和 game.equip 同序
    const l = clean(lk), g = new THREE.Group(), [head, body, feet, legsGear] = gear.map(id => GEAR[id] || (id ? ['#8a8a9a', '#6a6a78'] : null));
    const outfit = window.Skins && Skins.list[l.outfit]; if (outfit && outfit.look) Object.assign(l, outfit.look); // 穿着皮肤：上衣、裤子、裙子这些按皮肤的来；肤色、发型、个子还是自己的
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
    const anime = ['hutao','change'].includes(outfit?.face) || !!outfit?.anime; // 动漫脸：大眼睛、通用的刘海和鬓发不画（皮肤自己做头发）
    const skin = anime ? '#dcbbae' : SKIN[l.skin], hair = outfit?.hairColor || (anime ? '#49383e' : HAIR[l.hair]), shirt = body ? body[0] : outfit?.shirtColor || SHIRT[l.shirt], pants = legsGear ? legsGear[0] : outfit?.pantsColor || PANTS[l.pants], shoe = feet ? feet[0] : '#3a2e26';
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
    const bodyStart=g.children.length;
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
    // Custom fitted clothing replaces the generic rectangular torso, but never equipped armor.
    if(outfit?.face==='change' && !body){for(const mesh of g.children.slice(bodyStart)){g.remove(mesh);mesh.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});}for(const [i,arm] of [swing[2],swing[3]].entries()){arm.position.x=(i?1:-1)*.285;arm.scale.set(.9,1,.95);}}
    if(outfit?.face==='change' && !legsGear && !feet)for(const leg of [swing[0],swing[1]])leg.scale.set(.88,1,.9);
    part(0.16, 0.08, 0.16, 0, 1.41, 0, shade(skin, 0.92));                                                      // 脖子
    { // 头：方脸、下巴略收，边上倒一点角，和方块身体是一个风格
      const outline = new THREE.Shape(); (outfit?.face==='change'?[[-.07,1.46],[-.12,1.49],[-.166,1.57],[-.174,1.77],[-.145,1.83],[.145,1.83],[.174,1.77],[.166,1.57],[.12,1.49],[.07,1.46]]:[[-.11,1.45],[-.16,1.48],[-.19,1.56],[-.19,1.77],[-.15,1.83],[.15,1.83],[.19,1.77],[.19,1.56],[.16,1.48],[.11,1.45]]).forEach(([x,y],i)=>i?outline.lineTo(x,y):outline.moveTo(x,y)); outline.closePath();
      const geo = new THREE.ExtrudeGeometry(outline,{depth:.35,bevelEnabled:true,bevelThickness:.012,bevelSize:.012,bevelSegments:2,steps:1}); geo.translate(0,-1.64,-.185);
      const face = new THREE.Mesh(geo,new THREE.MeshLambertMaterial({color:skin})); face.position.y = 1.64; face.userData.face = true; g.add(face);
    }
    // 五官画在一张 32×32 的像素贴图上，贴在脸前（见 faceTex）。以前是十几个小方块叠出来的眼睛，前后错位、显得呆
    const fp = new THREE.Mesh(new THREE.PlaneGeometry(.38,.38), new THREE.MeshLambertMaterial({ map: faceTex(skin, head ? shade(skin,.6) : shade(hair,.85), outfit?.eyes || '#5a4232', anime), transparent: true, alphaTest: .5 }));
    if(outfit?.face==='change')fp.scale.x=.9;
    fp.position.set(0, 1.64, -.199); fp.rotation.y = Math.PI; g.add(fp);
    for (const x of [-0.21, 0.21]) part(0.03, 0.1, 0.08, x, 1.64, 0, shade(skin, 0.9));                        // 耳朵
    if (head) { wear(gear[0],0.46, 0.18, 0.46, 0, 1.8, 0, head[0]); wear(gear[0],0.48, 0.06, 0.48, 0, 1.71, 0, head[1]); wear(gear[0],0.3, 0.05, 0.12, 0, 1.72, -0.27, head[1]); } // 帽子：帽顶、帽圈、帽檐；戴着就不画头发
    else if (STYLE[l.style] !== 'none' && outfit?.face!=='change') {
      // 头发不再是几块大方砖：一顶贴头的发帽，额前一排尖尖的刘海，两鬓垂下来的细发，后面分层、发梢收尖，头顶一道高光。
      // 辫子和马尾一节一节往下变细。每一缕是一个可以歪一点的小长条（lock），所以看起来有发丝的走向。
      const st = STYLE[l.style], hi = tint(hair, 0.28), lo = shade(hair, 0.8), tie = tint(shirt, 0.15);
      const lock = (w, h, d, x, y, z, col = hair, rx = 0, rz = 0) => { const m = part(w, h, d, x, y, z, col); m.geometry.dispose(); m.geometry = softBox(w, h, d); m.rotation.set(rx, 0, rz); m.userData.hair = true; return m; }; // 头发块都是圆角的，轮廓软，不像头盔
      lock(0.47, 0.16, 0.47, 0, 1.845, 0.004);                         // 发帽：顶上小一圈、下面大一圈，轮廓是圆的
      lock(0.43, 0.36, 0.09, 0, 1.63, 0.2); for (const x of [-0.215, 0.215]) lock(0.06, 0.2, 0.3, x, 1.72, 0.06); // 后脑和两侧
      lock(0.26, 0.012, 0.045, -0.02, 1.924, -0.09, hi); lock(0.1, 0.012, 0.04, 0.1, 1.924, -0.02, hi);     // 头顶的高光
      const fringe = anime || st === 'hime' ? [] : st === 'spiky' ? [[-0.17, 0.3], [-0.085, -0.25], [0, 0.35], [0.085, -0.3], [0.17, 0.25]] : [[-0.17, 0.16], [-0.09, -0.1], [-0.01, 0.12], [0.07, -0.14], [0.155, -0.2]];
      if (fringe.length) lock(0.43, 0.065, 0.045, 0, 1.79, -0.212); for (const [x, rz] of fringe) lock(0.07, 0.075, 0.03, x + rz * 0.05, 1.742, -0.222, shade(hair, 0.93), 0, rz * 1.4); // 刘海：每一缕上宽下尖，方向交错
      const framing = !['short', 'spiky', 'topknot', 'hime'].includes(st);
      if (framing && !anime) for (const sx of [-1, 1]) { lock(0.05, 0.26, 0.05, sx * 0.205, 1.6, -0.165, hair, 0, sx * 0.05); lock(0.034, 0.09, 0.034, sx * 0.198, 1.435, -0.165, lo, 0, sx * 0.12); } // 两鬓垂到下巴的细发
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
      if (!anime && (st === 'long' || st === 'hime')) { // 长发：后面三层垂到腰，一层比一层窄，发梢分成几缕
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
    if(outfit?.face === 'hutao' && !head){
      const strands=[];
      const nape=part(.33,.20,.08,0,1.48,.20,hair);nape.userData.hair=true;
      // Curved tapered ribbons with thickness: each root follows the head as one unit.
      const strand=(x,y,z,length,width,bend,back,phase)=>{
        const root=new THREE.Group();root.position.set(x,y,z);root.userData.hair=true;g.add(root);
        const points=[];for(let i=0;i<=10;i++){const t=i/10,long=length>.7,sign=Math.sign(x)||1;
          // Broad overlapping locks: one gentle arc, with taper confined to the short ends.
          const curve=long?sign*.018*Math.sin(t*Math.PI):bend*.25*Math.sin(t*Math.PI);
          points.push(new THREE.Vector3(bend*t*.65+curve,-length*t,back*Math.sin(t*Math.PI/2)+(long?.012*Math.sin(t*Math.PI)*t:0)));}
        const verts=[],indices=[],colors=[];
        for(let i=0;i<=10;i++){const t=i/10,w=width*(length>.7 ? (1-.14*t)*(1-.65*Math.pow(Math.max(0,(t-.72)/.28),1.4)) : (1-t*.85))/2,c=new THREE.Color('#514047').lerp(new THREE.Color('#765058'),t*t*.55),v=points[i];
          for(const [dx,dz] of [[-w,-.018],[w,-.018],[-w,.018],[w,.018]]){const twist=Math.sin(t*Math.PI+phase*.2)*.10;verts.push(v.x+dx*Math.cos(twist),v.y,v.z+dz+dx*Math.sin(twist));colors.push(c.r,c.g,c.b);}
          if(i<10)for(const [a,b] of [[0,1],[1,3],[3,2],[2,0]]){const k=i*4;indices.push(k+a,k+b,k+b+4,k+a,k+b+4,k+a+4);}
        }
        indices.push(0,2,1,1,2,3,40,41,42,41,43,42);
        const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.setIndex(indices);geo.computeVertexNormals();root.add(new THREE.Mesh(geo,new THREE.MeshLambertMaterial({vertexColors:true})));geo.attributes.position.setUsage(THREE.DynamicDrawUsage);strands.push({root,phase,length,geo,rest:new Float32Array(verts)});
      };
      for(const sign of [-1,1]){
        strand(sign*.07,1.76,.23,.99,.23,sign*.025,.10,sign*.2);
        for(let i=0;i<2;i++)strand(sign*(.195+i*.028),1.72,.22-i*.025,.91+i*.055,.058-i*.012,sign*(.055+i*.018),.095,sign*.25+i*.12);
        strand(sign*.19,1.78,-.17,.42,.075,sign*.035,-.01,sign);
        strand(sign*.145,1.82,-.223,.16,.095,sign*.045,-.025,sign+2);
      }
      strand(0,1.74,.255,.92,.23,0,.10,0);
      strand(-.055,1.83,-.228,.135,.085,.025,-.018,0);
      strand(.042,1.83,-.23,.165,.085,.065,-.022,1);
      g.userData.strands=strands;
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
    if (outfit && outfit.extra) outfit.extra({ part, tint, shade, swing, soft:(w,h,d,x,y,z,col,to)=>{const m=part(w,h,d,x,y,z,col,to);m.geometry.dispose();m.geometry=softBox(w,h,d);m.userData.hair=true;return m;}, secondary:(root,phase=0,strength=1)=>{(g.userData.secondary ||= []).push({root,phase,strength});}, head: !!head, body: !!body, legs: !!legsGear }); // 皮肤自己加的零件（兜帽、披风、盔甲片……）
    // 脖子以上（头、头发、帽子、配饰）收进一个绕脖子转的关节，转视角时头跟着转（见 aim）
    const hg = new THREE.Group(); hg.position.set(0, 1.44, 0); hg.rotation.order = 'YXZ';
    for (const c of [...g.children]) if ((c.isMesh || c.userData.gearPart || c.userData.hair) && (c.position.y > 1.45 || c.userData.hair)) { c.position.y -= 1.44; hg.add(c); }
    g.add(hg); g.userData.head = hg;
    if (SIZE[l.size] === 'kid') { hg.scale.setScalar(1.25); g.scale.setScalar(0.78); } // 小孩：整体缩到 78%，头再放大 25%
    // 全身套进一个绕腰转的关节（lean）：游泳时整个人往前俯，是绕着身体中间转，脚和头各动一半，不会整个甩出去
    const lean = new THREE.Group(), inner = new THREE.Group(); lean.position.y = 0.95; inner.position.y = -0.95;
    for (const c of [...g.children]) inner.add(c); lean.add(inner); g.add(lean);
    g.userData.swing = swing; g.userData.gown = gown; g.userData.lean = lean;
    if (outfit?.model) { // 整套模型：方块小人留着（动作、手里的东西都挂在它的关节上），只是不画；模型加载好了放进身体关节里
      g.traverse(o => { if (o.isMesh) o.visible = false; });
      glb(outfit.model).then(m => rig(m, outfit.joints, g, inner)).catch(() => g.traverse(o => { if (o.isMesh) o.visible = true; }));
    }
    return g;
  }
  function colors(lk, gear = []) { const l = clean(lk), body = GEAR[gear[1]] || (gear[1] ? ['#8a8a9a'] : null); return { skin: SKIN[l.skin], sleeve: body ? body[0] : SHIRT[l.shirt] }; }
  function hold(g, id) { // 右手里拿着的东西：工具用游戏里同一个模型，方块是一个小方块
    const arm = g.userData.swing[3]; if (g.userData.item) arm.remove(g.userData.item);
    g.userData.sword = [23, 26, 29, 153].includes(id); // 拿着剑：挥动是左右横扫，不是从上往下劈
    const item = g.userData.item = window.game && id ? game.itemMesh(id,g.userData.weaponSkin) : null; if (!item) return;
    g.userData.ranged = [261, 262, 263].includes(id);  // 弓、弩、枪：模型的 +z 是射出去的方向，要顺着胳膊指出去，握把朝下
    const mounted = g.userData.ranged && window.Ranged ? Ranged.mount(item, id) : item; g.userData.aim = g.userData.ranged ? id : 0; g.userData.bowMount = id === 261 ? mounted : null;
    const grip = new THREE.Group(); grip.add(mounted); grip.position.set(0, -0.66, -0.02); grip.scale.setScalar(0.9);
    if (g.userData.ranged) { grip.rotation.order = 'YXZ'; grip.rotation.set(Math.PI / 2, Math.PI, 0); } else grip.rotation.x = g.userData.sword ? -2.3 : -1.9; // 远程武器：握把在手里，射出去的方向顺着胳膊，胳膊平举时正好朝前 // 工具从手里向前伸出去（不是顺着胳膊往回指）：手垂着时指向前下方，手向前举时指向前上方
    arm.add(g.userData.item = grip);
  }
  function back(g, id, skin) { // 背在背上的剑：斜挂在背后，剑柄在右肩上方。挂在身体关节里，跟着身子扭、游泳时俯下去
    const u = g.userData; id = id || 0; if (u.backId === id && u.backSkin === skin) return; u.backId = id; u.backSkin = skin;
    if (u.backItem) u.backItem.parent.remove(u.backItem); u.backItem = null;
    const item = id && window.game ? game.itemMesh(id, skin || u.weaponSkin) : null; if (!item) return;
    const mount = u.backItem = new THREE.Group(); mount.add(item); const inner = u.lean.children[0]; let J = null; inner.traverse(o => { if (o.userData.model) J = o.userData.model; });
    // 按身材自动定高度：肩膀高度、头占身体的比例（成人 ≈ 0.31，幼年头放大 ≈ 0.39，Q 版模型嫦娥 V2 头几乎和身子一样高）。头越大剑柄越低，不戳进头里
    const shoulder = J ? J.shoulder[1] : u.swing[3].position.y, neck = J ? J.neck : u.head ? u.head.position.y : 1.44, headH = J ? 1.9 - J.neck : 0.46 * (u.head ? u.head.scale.y : 1), r = headH / neck;
    const len = new THREE.Box3().setFromObject(item).max.y, top = shoulder + Math.max(0.03, 0.16 - (r - 0.31) * 1.5) + Math.max(0, len - 0.87) * 0.4 * Math.max(0, Math.min(1, 1 - (r - 0.31) * 10)); // 皮肤剑更长：成人再往上提一点，剑尖不拖到腿上
    mount.position.set(0.22, top, 0.24); mount.rotation.set(0, 0, 2.6); mount.scale.setScalar(1.08 * Math.max(0.6, Math.min(1, 1 - (r - 0.31) * 0.6))); /* Q 版大头身子短：剑跟着缩小（嫦娥 V2 约六成） */ // 剑柄在原点、剑尖朝 +y：翻过来剑尖朝左下
    const head = u.head, ry = head ? head.rotation.y : 0, rx = head ? head.rotation.x : 0, inv = new THREE.Matrix4(), b = new THREE.Box3(); let z = 0.24;
    if (head) head.rotation.set(0, 0, 0); g.updateMatrixWorld(true); inv.copy(inner.matrixWorld).invert(); // 长头发披在背上：量出头发最靠后的位置，剑挂在头发外面（短发不受影响，剑贴着背）
    inner.traverse(o => { if (o.userData.model) { const P = o.geometry.attributes.position.array; for (let i = 0; i < P.length; i += 3) if (P[i + 1] > shoulder - 0.45 && P[i + 1] < top && Math.abs(P[i]) < 0.3) z = Math.max(z, P[i + 2] + 0.04); return; } // 整套模型（嫦娥 V2）：背后那一截最靠后的顶点
      if (!o.isMesh) return; let p = o; while (p && p !== inner && !p.userData.hair) p = p.parent; if (!p || p === inner) return;
      if (!o.geometry.boundingBox) o.geometry.computeBoundingBox(); b.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld).applyMatrix4(inv); if (b.min.y < top - 0.12) z = Math.max(z, b.max.z + 0.04); });
    if (head) head.rotation.set(rx, ry, 0); mount.position.z = z; inner.add(mount);
  }
  // 摆姿势。phase 动作的相位，walk 0–1 走路的幅度，swing 0–1 右手挥动的进度（0 = 没在挥），air 在空中，swim 在水里
  function pose(g, phase, walk = 0, swing = 0, air = false, swim = false) {
    const [legL, legR, armL, armR] = g.userData.swing, s = Math.sin(phase) * 0.7 * walk, k = Math.sin(phase), stride = g.userData.gown ? 0.36 : 1; // 穿裙子：步子迈小一点，腿留在裙子里
    g.rotation.order = 'YXZ'; g.rotation.x = 0;                                  // 踩水保持直立，与站立碰撞体一致，避免头部绕脚底旋进岸墙
    // Bend the strand along its length; roots stay anchored and tips lag behind each step.
    const clock=performance.now()/1000;
    for(const strand of g.userData.strands||[]){
      const {geo,rest,length}=strand,pos=geo.attributes.position,amp=Math.min(1,length),offset=strand.phase;
      for(let i=0;i<pos.count;i++){const t=Math.floor(i/4)/10,weight=t*t;
        const sway=(Math.sin(clock*1.5+offset*.2-t*.4)*.004+Math.sin(phase+offset*.15-t*.7)*walk*.018)*amp*weight;
        const trail=(Math.sin(clock*1.2+offset*.2-t*.4)*.004+(Math.sin(phase-t*.8+offset*.1)*.009+.012)*walk)*amp*weight;
        pos.setXYZ(i,rest[i*3]+sway,rest[i*3+1],rest[i*3+2]+trail);
      }
      pos.needsUpdate=true;geo.computeVertexNormals();
    }
    for(const {root,phase:offset,strength} of g.userData.secondary||[]){
      for(const animate of root.userData.fabricMotion||[])animate(clock,walk,phase);
      root.rotation.x=(Math.sin(clock*1.4+offset)*.012+Math.sin(phase-offset*.3)*walk*.075)*strength;
      root.rotation.z=(Math.sin(clock*1.7+offset)*.009+Math.sin(phase-.6-offset*.4)*walk*.055)*strength;
    }
    const u = g.userData; if (swing > 0 && !(swing >= (u.lastSw || 0) && u.lastSw > 0)) u.flip = !u.flip; u.lastSw = swing; // 每挥一下换一个方向：右到左、左到右交替
    armR.rotation.order = 'YXZ'; armR.rotation.y = 0; armL.rotation.y = 0; // 端着远程武器时两臂会往里收，别的姿势要归零
    if (u.head) { const lift = u.lean ? -u.lean.rotation.x * 0.75 : 0; u.head.rotation.y = u.lookYaw || 0; u.head.rotation.x = Math.min(1.1, (u.lookPitch || 0) + lift); } // 头：看的方向；身子俯下去游泳时头抬起来看前面
    const lean = u.lean, settle = (tilt, roll, bob) => { lean.rotation.x += (tilt - lean.rotation.x) * 0.18; lean.rotation.z += (roll - lean.rotation.z) * 0.18; lean.position.y = 0.95 + bob; }; // 姿势之间慢慢过渡，不突然翻过去
    if (!swim) settle(0, 0, 0);
    lean.rotation.y *= 0.75; // 挥完剑拧着的身子慢慢转回来
    if (swim && walk) { // 在水里游：身子往前俯下去，两臂轮流从前面划到身后、再从水面上绕回前面（自由泳），两腿上下快速打水，身体跟着左右微微滚动
      settle(-1.28, Math.sin(phase) * 0.16, Math.sin(phase * 2) * 0.02);
      armL.rotation.x = Math.PI - phase; armR.rotation.x = -phase; armL.rotation.z = -0.12; armR.rotation.z = 0.12; // 角度一直往一个方向转：前伸 → 向下划 → 贴着腿 → 出水 → 再前伸；左右差半圈
      legL.rotation.x = Math.sin(phase * 2) * 0.38; legR.rotation.x = -Math.sin(phase * 2) * 0.38;
      return;
    }
    if (swim) { // 停在水里：身子立着、略微前倾，两臂张开在身旁来回拨水，两腿一前一后慢慢蹬，整个人轻轻上下浮
      const t = phase * 0.7;
      settle(-0.14, 0, Math.sin(t) * 0.035);
      armL.rotation.x = 0.35 + Math.sin(t + 0.6) * 0.3; armL.rotation.z = -0.95 - Math.sin(t) * 0.28;
      armR.rotation.x = 0.35 + Math.sin(t + 0.6) * 0.3; armR.rotation.z = 0.95 + Math.sin(t) * 0.28;
      legL.rotation.x = Math.sin(t) * 0.42; legR.rotation.x = -Math.sin(t) * 0.42;
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
    const reach = (performance.now() - (u.reachAt || -1e9)) / 350; // 收剑/拔剑：右手伸到右肩后面握住剑柄，再放下来
    if (!swing && reach < 1) { const r = Math.sin(reach * Math.PI); armR.rotation.x = 3 * r + (air ? 2.6 : s) * (1 - r); armR.rotation.z = -0.35 * r; return; }
    if (swing > 0 && u.sword) { // 斜劈：蓄力（剑举到肩后上方、身子拧过去）→ 快速斜劈到对侧前下方 → 命中停一下 → 收回。每一下换一边
      const SW = [[0, .4, -.15, 0, 0, 0, 0], [.28, 2.6, -.95, .45, .7, -.38, .06], [.45, .55, 1.05, -.1, -.55, .38, -.2], [.56, .48, 1.12, -.1, -.6, .42, -.22], [1, .25, 0, 0, 0, 0, 0]]; // [进度, 右臂抬, 右臂左右, 右臂外展, 左臂抬, 身子扭, 身子前倾]
      const EASE = [t => t * t * (3 - 2 * t), t => 1 - (1 - t) ** 3, t => t, t => t * t * (3 - 2 * t)]; // 蓄力缓、劈出去先快后慢、顿住、收招缓
      let i = 0; while (i < SW.length - 2 && swing > SW[i + 1][0]) i++;
      const a = SW[i], b = SW[i + 1], e = EASE[i](Math.min(1, (swing - a[0]) / (b[0] - a[0]))), m = j => a[j] + (b[j] - a[j]) * e, dir = u.flip ? -1 : 1;
      armR.rotation.x = m(1); armR.rotation.y = m(2) * dir; armR.rotation.z = m(3) * dir; // 正的角度是向前抬（脸朝 -z）；y 负是往右边
      armL.rotation.x = m(4); armL.rotation.z = -0.15;                             // 左手反向摆：蓄力时伸在前面，劈出去时往后拉
      lean.rotation.y = m(5) * dir; lean.rotation.x = m(6);                        // 整个身子拧过去再拧回来，劈的时候往前压
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
  // 转视角时头跟着转，但脖子有限度：左右最多转 60°，再转身体就跟过去；往上看最多 35°，往下看最多 40°（更多的由镜头自己转）。
  // 走路、挥手的时候身体很快转正对着看的方向（不然胳膊往前挥会是斜的）。game：第三人称的自己、联机里的别人，每帧调用一次，然后再调 pose。
  const NECK_YAW = 1.05, NECK_UP = 0.6, NECK_DOWN = 0.7, wrap = a => Math.atan2(Math.sin(a), Math.cos(a));
  function aim(g, yaw, pitch = 0, dt = 1 / 60, follow = false) {
    const u = g.userData; if (u.bodyYaw === undefined) u.bodyYaw = yaw;
    let off = wrap(yaw - u.bodyYaw);
    if (off > NECK_YAW) u.bodyYaw = yaw - NECK_YAW; else if (off < -NECK_YAW) u.bodyYaw = yaw + NECK_YAW; // 转过头了：身体被带着转
    if (follow) u.bodyYaw += wrap(yaw - u.bodyYaw) * Math.min(1, dt * 10);
    u.lookYaw = wrap(yaw - u.bodyYaw); u.lookPitch = Math.max(-NECK_DOWN, Math.min(NECK_UP, pitch));
    g.rotation.y = u.bodyYaw;
  }
  const inWater = (x, y, z) => !!window.game && game.world.get(Math.floor(x), Math.floor(y + 0.5), Math.floor(z)) === Core.WATER; // 这个位置的人是不是泡在水里
  const walk = pose;

  // —— 设置里的选择和预览 ——
  const world = document.getElementById('settings-character');
  if (!world || !window.THREE) return void (window.Avatar = { aim, build, walk, pose, hold, back, colors, inWater, clean, get look() { return look; } });
  world.insertAdjacentHTML('beforeend', '<h2>Your character</h2><p class="settingsHint">Other players see this when you play together.</p><div id="lookBox" style="display:flex;gap:14px;align-items:flex-start;flex-wrap:wrap"><canvas id="lookView" width="220" height="300" style="width:110px;height:150px;border-radius:8px;background:#1d1712"></canvas><div id="lookRows" style="flex:1;min-width:180px"></div></div>');
  document.getElementById('settings-skins').insertAdjacentHTML('beforeend', '<div id="characterSkins"><h2>Skins</h2><p class="settingsHint">A skin is a whole outfit with more detail. Do what it asks to unlock it.</p><div id="skinGrid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(92px,1fr));gap:6px"></div></div>');
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
    handKey = key;
    const outfit = window.Skins?.list[look.outfit], resolved = {...look, ...outfit?.look};
    const c = colors(resolved, gear), anime = outfit?.anime || ['hutao','change'].includes(outfit?.face);
    const style = gear[1] ? null : outfit?.firstPerson;
    FirstPersonHand.paint(style?.skin || (anime ? '#f0d6cb' : c.skin), gear[1] ? c.sleeve : style?.sleeve || outfit?.shirtColor || c.sleeve, style);
  }
  setInterval(paintHand, 500); paintHand();
  function renderSkins() { // 皮肤格子：有的直接点了穿上；没解锁的发灰，下面写着怎么得到
    const grid = document.getElementById('skinGrid'); if (!grid || !window.Skins) return;
    grid.innerHTML = Skins.list.map((sk, i) => {
      const has = Skins.has(i), on = (look.outfit || 0) === i, pic = portrait({ ...look, outfit: i });
      return `<button type="button" data-i="${i}" ${has ? '' : 'disabled'} aria-pressed="${on}" style="display:flex;flex-direction:column;align-items:center;gap:2px;margin:0;padding:4px 2px;background:${on ? '#ffd36b2e' : '#ffffff14'};border:2px solid ${on ? '#ffd36b' : '#0000'};border-radius:6px;color:inherit;font-size:11px;line-height:1.25;cursor:${has ? 'pointer' : 'default'};opacity:1">${pic ? `<img src="${pic}" alt="" style="width:56px;aspect-ratio:4/5;object-fit:contain;${has ? '' : 'filter:brightness(.25) saturate(0)'}">` : ''}<b>${sk.name}</b>${has ? '' : `<small style="color:#d0b782">🔒 ${sk.how}</small>`}</button>`;
    }).join('');
    for (const b of grid.querySelectorAll('button:not([disabled])')) b.onclick = () => { look.outfit = +b.dataset.i; changed(); };
  }
  function changed() { localStorage.setItem(KEY, JSON.stringify(look)); renderSkins(); renderRows(); draw(); paintHand(); renderHeroes(); icons(); if (window.Net && Net.look) Net.look(); }
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
    const art = window.Skins && Skins.list[clean(lk).outfit]?.art; if (art) return art; // 有立绘的皮肤：菜单里直接放立绘
    const k = JSON.stringify(clean(lk)) + '|' + gear.join() + '|' + held + '|' + (window.WeaponSkins?.selected||'default'); if (shots[k]) return shots[k];
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
    ready = true; renderHeroes(); icons(); renderSkins();
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
  window.Avatar = { aim, build, walk, pose, hold, back, colors, inWater, clean, icon, get look() { return look; },
    refresh: renderSkins, wizard, shot: (gear, held) => portrait(look, gear, held), // bag-tabs.js：背包角色页里穿着装备的预览
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
    if(new URLSearchParams(location.search).has("architectureReview")&&new URLSearchParams(location.search).has("preview"))return;
    const g = window.game, p = g.p;
    if (!on && !g.dead) { if (me) me.visible = false; deadT = lie = 0; return; } // 第一人称下倒地时也临时切到身外，看得见自己
    const key = JSON.stringify(Avatar.look) + g.equip.join() + '/' + g.held + '/' + g.naturalItems + '/' + g.skinFor(g.held);
    if (key !== meKey) { // 形象、装备或手里的东西变了：重建自己的小人
      if (me) g.scene.remove(me);
      me = Avatar.build(Avatar.look, g.equip); me.userData.weaponSkin = g.skinFor(g.held); Avatar.hold(me, g.held); g.scene.add(me); meKey = key;
    }
    Avatar.back(me, g.back, g.skinFor(g.back)); me.userData.reachAt = g.sheathAt;
    const moved = last ? Math.hypot(p.x - last[0], p.z - last[1]) : 0, swim = Avatar.inWater(p.x, p.y, p.z); last = [p.x, p.z];
    phase += swim ? dt * 6 : moved > 0.002 ? dt * 12 : 0;
    me.position.set(p.x, p.y, p.z); Avatar.aim(me, g.yaw, g.pitch || 0, dt, moved > 0.002 || g.swinging || swim); me.rotation.x = 0;
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
