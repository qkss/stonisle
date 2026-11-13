// 岩屿 Stonisle — 渲染、输入、玩家物理、存档
(() => {
  const { CH, H, AIR, WATER, BLOCKS, ATLAS_TILES, World, meshChunk, raycast, hash } = Core;
  const $ = id => document.getElementById(id);

  // ---- 存档 ----
  const selectedSave = Math.max(1,Math.min(10000,parseInt(new URLSearchParams(location.search).get('save'),10)||1));
  const SAVE = 'stonisle.save.v2'+(selectedSave===1?'':'.'+selectedSave), OLD = 'stonisle.save.v1';
  const saveLibrary=new SaveLibrary(localStorage);
  let hasStarted=false, settingsOpen=false;
  let save = {};
  try {
    save = JSON.parse(localStorage.getItem(SAVE));
    if (!save) { // 地形改版（矿石、群系、山地）：旧世界的改动对不上新地形，作废；背包和设置带过来
      const o = selectedSave===1 ? JSON.parse(localStorage.getItem(OLD)) || {} : {};
      save = { inv: o.inv, slots: o.slots, hq: o.hq, view: o.view, pack: o.pack };
    }
  } catch (e) { save = {}; /* 坏档当新档 */ }
  if (window.Net && Net.guest) save = Net.guestSave(); // 局域网访客：用主机的世界，不读自己的存档（net.js）
  // 材质预览是独立的临时世界，不读写玩家存档。
  const animalPreview = new URLSearchParams(location.search).get('preview') === 'animals';
  const waterPreview = new URLSearchParams(location.search).get('preview') === 'water';
  const materialPreview = animalPreview || waterPreview || new URLSearchParams(location.search).get('preview') === 'materials';
  if (materialPreview) save = { pack: 'natural', inv: {20:1,21:1,22:1,23:1,24:1,25:1,26:1,8:64,3:64}, slots: [25,26,20,21,22,23,24,8,3] };
  const world = new World(undefined, save.edits || {});
  if (window.Net) Net.world(world);
  if(materialPreview&&new URLSearchParams(location.search).get('blocks')==='1'){
    save.pos=[10,37,18,0,-.14];save.sel=0;
    for(let x=0;x<=22;x++)for(let z=0;z<=24;z++)for(let y=30;y<56;y++)world.set(x,y,z,y===30?3:AIR);
    for(let x=9;x<=11;x++)for(let z=17;z<=19;z++)world.set(x,36,z,3);
    const samples=[51,52,53,54,55,56,57,58,59,60,66,80,81,82,83,84,85,86,90,91,92,93,94,95,76,74];
    samples.forEach((id,i)=>world.set(4+(i%6)*2,40-Math.floor(i/6)*2,4,id));
  }

  if(materialPreview&&new URLSearchParams(location.search).get('wood')==='1'){
    save.pos=[11,33,19,0,-.22];save.slots=[6,180,181,182,184,196,204,217,221];save.inv={6:8,180:8,181:8,182:8,184:8,196:8,204:8,217:8,221:8};
    for(let x=0;x<=22;x++)for(let z=0;z<=22;z++)for(let y=30;y<55;y++)world.set(x,y,z,y===30?3:AIR);
    for(let x=10;x<=12;x++)for(let z=18;z<=20;z++)world.set(x,32,z,3);
    Core.WOODS.forEach((w,i)=>{const x=4+i*4;world.set(x,31,5,w.log);world.set(x+1,31,5,w.plank);world.set(x,31,7,w.door);world.set(x,32,7,w.door);world.set(x+1,31,7,w.chest);world.set(x,31,9,w.stairs);world.set(x,32,8,w.stairs);world.set(x+1,31,9,w.slab);world.set(x+2,31,7,w.fence);world.set(x+2,31,8,w.fence);world.set(x+2,31,9,w.fence);});
  }
  if(materialPreview&&new URLSearchParams(location.search).get('stairs')==='1'){
    save.pos=[10,33,18,0,-.24];save.slots=[204,217,208,218,3,184,196,221,8];save.inv={204:32,217:32,208:32,218:32,3:64,184:4,196:4,221:16,8:64};
    for(let x=0;x<=22;x++)for(let z=0;z<=22;z++)for(let y=30;y<55;y++)world.set(x,y,z,y===30?3:AIR);
    for(let x=9;x<=11;x++)for(let z=17;z<=19;z++)world.set(x,32,z,3);
    // Outer and inner corners; a raised inverted corner forms an eave.
    world.set(4,31,7,204);world.set(4,31,6,205);
    world.set(8,31,7,204);world.set(8,31,8,205);
    world.set(13,33,7,232);world.set(13,33,6,233);
    for(let y=31;y<33;y++)world.set(13,y,6,94);
    world.set(5,31,11,217);world.set(7,31,11,241);world.set(9,31,11,245);
    world.set(12,31,11,204);world.set(12,32,10,204);world.set(12,31,10,93);
  }
  if(materialPreview&&new URLSearchParams(location.search).get('ladder')==='1'){
    save.pos=[9.5,31,8,0,.12];save.slots=[160,164,168,172,3,204,217,184,196];save.inv={160:24,164:24,168:24,172:24,3:64,204:8,217:8,184:4,196:4};
    for(let x=3;x<=17;x++)for(let z=2;z<=18;z++)for(let y=30;y<50;y++)world.set(x,y,z,y===30?3:AIR);
    for(let x=7;x<=12;x++)for(let y=31;y<=36;y++)world.set(x,y,5,3);
    for(let x=7;x<=12;x++)for(let z=3;z<5;z++)world.set(x,36,z,8);
    Core.WOODS.forEach((w,i)=>{for(let y=31;y<=36;y++)world.set(8+i,y,6,w.ladder);});
  }
  if(materialPreview&&new URLSearchParams(location.search).get('shore')==='1'){
    save.pos=[10.5,32.45,8.32,0,-.12];
    for(let x=4;x<=17;x++)for(let z=2;z<=16;z++)for(let y=30;y<=40;y++)world.set(x,y,z,y===30?3:y<34&&z<8?4:y<33?WATER:AIR);
  }
  const blockDamage = new MiningRules.DamageStore(save.mining);
  if(waterPreview){
    save.pos=[12.5,35,16.5,.46,-.30];
    for(let x=0;x<=20;x++)for(let z=0;z<=20;z++){
      world.set(x,30,z,3);
      for(let y=31;y<=42;y++)world.set(x,y,z,AIR);
    }
    for(let x=6;x<=10;x++)for(let z=2;z<=9;z++){
      for(let y=31;y<=33;y++)world.set(x,y,z,3);
      if(x===6||x===10||z===2||z===6)world.set(x,34,z,3);
      else if(z<=5)world.set(x,34,z,WATER);
    }
    for(let x=11;x<=14;x++)for(let z=14;z<=18;z++)for(let y=31;y<=34;y++)world.set(x,y,z,3);
  }
  if(materialPreview&&new URLSearchParams(location.search).get('cave')==='1'){
    save.pos=[8.5,31,12.5,0,-.1];save.sel=6;
    if(new URLSearchParams(location.search).get('walltorch')==='1'){save.pos=[8.5,31,9.5,0,-.08];save.sel=0;save.torches={'6,32,3':{x:6,y:32,z:3,n:[0,0,1]}};}
    for(let x=2;x<=14;x++)for(let z=2;z<=14;z++)for(let y=30;y<=36;y++)world.set(x,y,z,y===30||y===36||x===2||x===14||z===2||z===14?3:AIR);
  }
  if(animalPreview){
    save.pos=[8.5,31,9.5,0,-.10];
    for(let x=3;x<=14;x++)for(let z=0;z<=14;z++){
      world.set(x,30,z,1);
      for(let y=31;y<=37;y++)world.set(x,y,z,z<=3&&y===31?3:AIR);
    }
  }
  let R = save.view || 4;                      // 视距（区块）
  let hq = !!save.hq;                          // 高画质：实时阴影 + 水面反光（默认关）
  let pack = save.pack || 'auto';              // 材质包：auto（高画质用精细）| std | fine | custom
  const PACK = 'stonisle.pack.custom';         // 自定义材质包（一张 PNG 的 dataURL）单独存
  let sel = save.sel || 0;
  let hotbarActive=false; // 每次进游戏手都是收起的、物品栏不选中；按 1–9、滚轮或点一格才拿出来
  const selectedItem=()=>hotbarActive?(slots[sel]||0):0;                     // 快捷栏选中格

  // ---- 物品：1–10 是方块，20+ 是工具/武器，30 是掉落物 ----
  const PICK = 20, AXE = 21, SHOVEL = 22, SWORD = 23, TORCH = 24, PICK2 = 25, SWORD2 = 26, MEAT = 30, HIDE = 31;
  const NAMES = { [PICK]: '石镐', [AXE]: '石斧', [SHOVEL]: '石铲', [SWORD]: '石剑', [TORCH]: '火把', [PICK2]: '铁镐', [SWORD2]: '铁剑', [MEAT]: '生肉', [HIDE]: '兽皮',
    40: '皮帽', 41: '皮衣', 42: '皮靴', 43: '铁盔', 44: '铁甲', 45: '铁靴' };
  // 四个部位 × 四种材质（草编 121–124、皮革 40/41/125/42、铁 43/44/126/45、合金 127/128/129/131），每点护甲减伤 4%，全套合金 76%
  const ARMOR = { 121: [0, 1], 122: [1, 2], 123: [3, 1], 124: [2, 1], 40: [0, 2], 41: [1, 3], 125: [3, 2], 42: [2, 2], 43: [0, 3], 44: [1, 5], 126: [3, 4], 45: [2, 3],
    127: [0, 4], 128: [1, 6], 129: [3, 5], 131: [2, 4], 46: [2, 2], 47: [1, 2], 48: [1, 1], 120: [0, 2],
    142: [2, 3], 146: [1, 3], 147: [1, 7], 148: [1, 2], 149: [2, 3], 150: [1, 4], 151: [0, 5] }; // 142 雪行靴 146 潜水衣 147 潮鳞甲 148 长翼披风 149 风行靴 150 影行斗篷 151 风暴冠（5 级以上怪物的掉落做的） // 46 蝎壳靴、47 夜行斗篷（怪物掉落做的） // 装备 → [部位 0 头 1 身 2 脚 3 腿, 护甲值]（腿是后加的，排在最后，旧存档的三格不用挪）
  const PARTS = ['head', 'body', 'feet', 'legs'], PART_ORDER = [0, 1, 3, 2], MAXHP = 20; // 界面上按 头、身、腿、脚 排
  const equip = save.equip || [0, 0, 0, 0]; while (equip.length < 4) equip.push(0);
  let hp = save.hp || MAXHP;
  const armor = () => equip.reduce((a, id) => a + (id ? ARMOR[id][1] : 0), 0);
  const itemName = id => Lang.item(id); // 游戏内一律英文名，见 lang.js
  const isBlock = id => !!BLOCKS[id];           // 1–15 和 50–59 是方块
  const inv = save.inv || {};                                  // 背包：物品 id → 数量。新档空手起步，工具靠合成
  const slots = save.slots || [0, 0, 0, 0, 0, 0, 0, 0, 0];     // 快捷栏 9 格放的物品
  const RECIPES = [ // [产物, 数量, {材料 id: 数量}]；工具不会坏，已有就不能再做
    [8, 4, { 6: 1 }], [10, 4, { 3: 4 }], [9, 4, { 2: 2, 4: 2 }],
    [16, 1, { 8: 4 }], [17, 1, { 8: 4 }], [18, 1, { 8: 2 }], [153, 1, { 8: 3 }], // 木质工具：只用木板，砍一棵树就能做——木镐、木斧、木铲、木剑。比空手快一倍左右，比石器慢
    [PICK, 1, { 8: 2, 3: 3 }], [AXE, 1, { 8: 2, 3: 3 }], [SHOVEL, 1, { 8: 2, 3: 1 }], [SWORD, 1, { 8: 1, 3: 2 }],
    [TORCH, 1, { 8: 1, 11: 1 }], [PICK2, 1, { 8: 2, 12: 3 }], [SWORD2, 1, { 8: 1, 12: 2 }], // 煤 → 火把；铁 → 更快的镐、更狠的剑
    [40, 1, { 31: 2 }], [41, 1, { 31: 4 }], [42, 1, { 31: 2 }], [43, 1, { 12: 3 }], [44, 1, { 12: 6 }], [45, 1, { 12: 3 }],
    [121, 1, { 53: 2 }], [122, 1, { 53: 4 }], [123, 1, { 53: 3 }], [124, 1, { 53: 2 }], [125, 1, { 31: 3 }], [126, 1, { 12: 5 }],            // 茅草 → 草编四件；皮裤、铁护腿
    [130, 2, { 12: 2, 13: 1, 11: 1 }], [127, 1, { 130: 3 }], [128, 1, { 130: 6 }], [129, 1, { 130: 5 }], [131, 1, { 130: 3 }], // 铁矿 ×2 + 金矿 + 煤 → 合金锭 ×2；合金锭 → 合金四件 // 兽皮 → 皮甲；铁 → 铁甲
    // 第一批建筑方块（PRD FR-019）：玻璃 砂岩 磨光石 茅草 雪砖 屋瓦 铁块 金块 晶块 灯
    [50, 2, { 4: 2, 11: 1 }], [51, 4, { 4: 4 }], [52, 4, { 3: 4 }], [53, 4, { 7: 4 }], [54, 4, { 15: 4 }], [55, 4, { 9: 4 }],
    [56, 1, { 12: 4 }], [57, 1, { 13: 4 }], [58, 1, { 14: 4 }], [59, 2, { 8: 1, 11: 1, 12: 1 }],
    // 不同颜色的建材：水泥、黄砖、深色砖；木板掺方解石变浅、掺煤变深、掺红砖变红
    [60, 1, { 8: 6 }], [64, 2, { 50: 4, 8: 2 }], [66, 1, { 8: 3, 31: 2 }], [76, 1, { 8: 8 }], [74, 1, { 8: 2 }], // 门、窗、床、箱子、告示牌
    [48, 1, { 38: 4, 31: 2 }], [49, 1, { 39: 1, 8: 1 }], [96, 2, { 110: 2, 50: 1 }], [97, 2, { 111: 2, 59: 1 }], [59, 1, { 113: 1, 50: 1 }], [120, 1, { 114: 3 }], // 蝠翼 → 滑翔披风；黑羽 → 羽毛笔；荧粉 → 荧光玻璃；霜晶 → 冰灯；水母胶 → 灯；蟹壳 → 蟹壳盔
    [142, 1, { 132: 4 }], [19, 1, { 133: 4, 12: 2 }], [28, 1, { 134: 1, 12: 3, 8: 2 }], [29, 1, { 135: 1, 80: 4 }], [146, 1, { 136: 4 }], [147, 1, { 137: 6 }],
    [148, 1, { 138: 4, 48: 1 }], [149, 1, { 139: 3 }], [150, 1, { 140: 2, 47: 1 }], [151, 1, { 141: 1 }], // 第三步怪物的掉落：白绒 虫牙 岩心 黑曜核 鳗皮 潮鳞 鹫羽 风羽 影膜 风暴羽
    [9, 4, { 33: 2 }], [46, 1, { 34: 3 }], [27, 1, { 36: 2, 8: 2 }], [47, 1, { 37: 4 }], // 怪物掉落：黏土 → 红砖；蝎壳 → 蝎壳靴；獠牙 → 长矛；影毛 → 夜行斗篷
    [90, 4, { 4: 2, 3: 2 }], [91, 4, { 4: 3, 2: 1 }], [92, 4, { 9: 4, 11: 1 }], 
  ];
  for(const w of Core.WOODS){
    if(w.log!==6)RECIPES.push([w.plank,4,{[w.log]:1}],[w.door,1,{[w.plank]:6}],[w.chest,1,{[w.plank]:8}]);
    RECIPES.push([w.ladder,3,{[w.plank]:4}],[w.stairs,4,{[w.plank]:6}],[w.slab,6,{[w.plank]:3}],[w.fence,3,{[w.plank]:4}]);
  }
  const DAY = 600;                                             // 一昼夜的秒数（白天占 65%）
  let time = save.time == null ? 60 : save.time;
  if(materialPreview&&new URLSearchParams(location.search).get('night')==='1')time=DAY*.82;
  // 挖掘耗时由 mining-rules.js 按工具与方块材质统一计算。
  const DMG = { [PICK]: 2, [AXE]: 4, [SHOVEL]: 2, [SWORD]: 5, [PICK2]: 3, [SWORD2]: 10, 27: 6, 19: 2, 28: 4, 29: 12, 17: 2, 153: 3 }; // 17 木斧 153 木剑（木镐、木铲和空手一样是 1） // 19 钻镐 28 岩心镐 29 黑曜剑 // 27 长矛 // 空手及其他物品 1 点

  // ---- 玩家 ----
  const W = 0.3, PH = 1.8, EYE = 1.62;
  const p = { x: 8.5, y: 0, z: 8.5 }, v = { x: 0, y: 0, z: 0 };
  let yaw = 0, pitch = -0.2, onGround = false;
  if (save.pos) [p.x, p.y, p.z, yaw, pitch] = save.pos;
  else Object.assign(p, spawnPos());
  function spawnPos() { // 出生点：从原点向 +x 找第一块陆地
    let x = 8.5, y = H; while (Core.heightAt(Math.floor(x), 8) <= Core.SEA) x++;
    while (world.get(Math.floor(x), y - 1, 8) === AIR) y--;
    return { x, y, z: 8.5 };
  }

  let saveTimer = 0;
  function saveNow() {
    clearTimeout(saveTimer); saveTimer = 0;
    if (materialPreview || !hasStarted || (window.Net && Net.guest)) return; // 访客不写世界存档
    try { saveLibrary.save(selectedSave, { edits: world.edits, torches: placedTorches.records, water: waterFlow.cells, mining: blockDamage.records, pos: [p.x, p.y, p.z, yaw, pitch], sel, hotbarActive, view: R, hq, pack, inv, slots, time, hp, equip }); }
    catch (e) { console.warn('存档失败', e); }
  }
  const saveSoon = () => { if (!saveTimer) saveTimer = setTimeout(saveNow, 400); };
  addEventListener('pagehide', saveNow);

  // ---- 程序生成贴图集（一行 16 格；全部由噪声算出，无外部素材）----
  // 生成器都写在 64 单位的坐标系里，按实际分辨率 TS 采样；fine = 精细包：多一层细颗粒 + 烘焙浮雕受光
  let TS = 64;
  const atlas = document.createElement('canvas'), U = 64;
  function drawAtlas(size, fine, from = 0) { // from > 0：只补画第 from 格之后的贴图（材质包图片里没有的新方块）
    TS = size; if (!from) { atlas.width = TS * ATLAS_TILES; atlas.height = TS; }
    // 可平铺的周期值噪声：px/py 为一格贴图内的噪声格数
    const pn = (x, y, px, py, seed) => {
      const fx = x / U * px, fy = y / U * py, xi = Math.floor(fx), yi = Math.floor(fy);
      const h = (a, b) => hash(((a % px) + px) % px, ((b % py) + py) % py, seed);
      let u = fx - xi, w = fy - yi; u = u * u * (3 - 2 * u); w = w * w * (3 - 2 * w);
      const a = h(xi, yi), b = h(xi + 1, yi), c = h(xi, yi + 1), d = h(xi + 1, yi + 1);
      return a + (b - a) * u + (c - a) * w + (a - b - c + d) * u * w;
    };
    const fbm = (x, y, s) => pn(x, y, 4, 4, s) * 0.45 + pn(x, y, 8, 8, s + 1) * 0.3 + pn(x, y, 16, 16, s + 2) * 0.15 + pn(x, y, 32, 32, s + 3) * 0.1;
    const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
    const mul = (c, k) => [c[0] * k, c[1] * k, c[2] * k];
    const grass = (x, y) => mul(mix([52, 98, 36], [112, 150, 62], fbm(x, y, 20)), 0.72 + 0.45 * pn(x, y, 32, 32, 25));
    const dirt = (x, y) => {
      const c = mix([92, 64, 40], [140, 104, 70], fbm(x, y, 30));
      return pn(x, y, 16, 16, 35) > 0.8 ? mix(c, [150, 138, 122], 0.7) : mul(c, 0.85 + 0.25 * pn(x, y, 32, 32, 36));
    };
    const rock = (x, y, s) => {
      const c = mix([96, 96, 96], [160, 156, 150], fbm(x, y, s));
      return mul(c, Math.abs(pn(x, y, 5, 5, s + 7) - 0.5) < 0.012 ? 0.72 : 0.9 + 0.15 * pn(x, y, 32, 32, s + 8));
    };
    // 矿石：岩石底 + 噪声团块状的矿斑（暗色到亮色渐变，像嵌在石头里的颗粒）
    const ore = (s, lo, hi) => (x, y) => {
      const v = pn(x, y, 5, 5, s) * 0.7 + pn(x, y, 11, 11, s + 1) * 0.3;
      return v > 0.6 ? mix(lo, hi, Math.min(1, (v - 0.6) * 5 + pn(x, y, 32, 32, s + 2) * 0.3)) : mul(rock(x, y, 40), v > 0.56 ? 0.7 : 1);
    };
    const bevel = (s, lo, hi) => (x, y) => mul(mix(lo, hi, pn(x, y, 4, 4, s) * 0.6 + pn(x, y, 24, 24, s + 1) * 0.4), // 金属块：四边倒角 + 四宫格接缝
      x < 4 || y < 4 ? 1.12 : x > 59 || y > 59 ? 0.72 : x % 32 < 2 || y % 32 < 2 ? 0.86 : 1);
    const plank = (lo, hi, s) => (x, y) => { // 木板：四条横板，接缝错开；颜色由参数决定
      const board = y >> 4, seam = (x + board * 23) % U < 1;
      const c = mul(mix(lo, hi, hash(board, 0, s) * 0.6 + pn(x, y, 3, 32, s + 1) * 0.4), 0.9 + 0.15 * pn(x, y, 8, 32, s + 2));
      return y % 16 < 1 || seam ? mul(c, 0.5) : c;
    };
    const bricks = (s, lo, hi, mortar) => (x, y) => { const b = brickCell(x, y); return b === null ? mortar : mul(mix(lo, hi, b * 0.6 + fbm(x, y, s) * 0.4), 0.88 + 0.2 * pn(x, y, 32, 32, s + 1)); };
    const bark = (x, y) => mul(mix([62, 46, 30], [124, 96, 66], pn(x, y, 16, 3, 60)), 0.8 + 0.3 * pn(x, y, 32, 8, 61));
    // 砖/石砖：行高 16px、砖长 32px、隔行错半块；返回 null 表示灰缝
    const brickCell = (x, y) => {
      const row = y >> 4, xx = (x + (row % 2) * 16) % U;
      return y % 16 < 2 || xx % 32 < 2 ? null : hash(xx >> 5, row, 70);
    };
    const tiles = [
      grass,
      (x, y) => { const e = 9 + pn(x, 0, 16, 1, 21) * 12; return y < e ? mul(grass(x, y), y > e - 3 ? 0.7 : 1) : dirt(x, y); },
      dirt,
      (x, y) => rock(x, y, 40),
      (x, y) => mul(mix([198, 176, 128], [232, 214, 170], fbm(x, y, 50)), 0.9 + 0.2 * pn(x, y, 32, 32, 51)),
      (x, y) => mix([22, 72, 96], [52, 118, 138], fbm(x, y, 55)),
      bark,
      (x, y) => {
        const d = Math.hypot(x - 31.5, y - 31.5) + pn(x, y, 6, 6, 62) * 3;
        return d > 27 ? bark(x, y) : mix([186, 150, 100], [140, 104, 64], 0.5 + 0.5 * Math.sin(d * 1.3));
      },
      (x, y) => { const c = mul(mix([30, 70, 24], [96, 140, 52], fbm(x, y, 80)), 0.7 + 0.5 * pn(x, y, 32, 32, 81)); c[3] = pn(x, y, 10, 10, 82) < 0.3 ? 0 : 255; return c; },
      (x, y) => {
        const board = y >> 4, seam = (x + board * 23) % U < 1;
        const c = mul(mix([150, 108, 62], [190, 148, 96], hash(board, 0, 90) * 0.6 + pn(x, y, 3, 32, 91) * 0.4), 0.9 + 0.15 * pn(x, y, 8, 32, 92));
        return y % 16 < 1 || seam ? mul(c, 0.5) : c;
      },
      (x, y) => { const b = brickCell(x, y); return b === null ? mix([150, 144, 132], [186, 180, 168], pn(x, y, 32, 32, 71)) : mul(mix([122, 54, 40], [168, 88, 62], b * 0.6 + fbm(x, y, 72) * 0.4), 0.88 + 0.2 * pn(x, y, 32, 32, 73)); },
      (x, y) => { const b = brickCell(x, y); return b === null ? [70, 70, 70] : mul(rock(x, y, 45), 0.85 + b * 0.25); },
      ore(100, [34, 34, 38], [70, 70, 78]), ore(110, [150, 98, 70], [222, 176, 142]), ore(120, [196, 150, 40], [255, 226, 110]), ore(130, [60, 170, 190], [190, 250, 255]),
      (x, y) => mix([222, 230, 240], [252, 254, 255], fbm(x, y, 140)),
      // —— 17–26：第一批建筑方块（PRD FR-019）——
      (x, y) => { // 玻璃：一圈边框加两道反光，中间镂空
        const edge = x < 4 || y < 4 || x > 59 || y > 59;
        const glint = (Math.abs(x - y - 14) < 2.2 && x > 14 && x < 34) || (Math.abs(x - y - 22) < 1.2 && x > 26 && x < 40);
        return edge ? [222, 238, 244] : glint ? [255, 255, 255] : [0, 0, 0, 0];
      },
      (x, y) => mul(mix([190, 164, 112], [228, 206, 160], pn(x, y, 2, 12, 150)), y % 16 < 1.2 ? 0.82 : 0.94 + 0.12 * pn(x, y, 32, 32, 151)),   // 砂岩：横向层理
      (x, y) => mul(mix([146, 148, 150], [178, 180, 180], fbm(x, y, 155)), x < 2 || y < 2 ? 1.1 : x > 61 || y > 61 ? 0.8 : 1),                  // 磨光石
      (x, y) => mul(mix([150, 122, 50], [220, 192, 100], pn(x, y, 32, 5, 160)), 0.78 + 0.3 * pn(x, y, 12, 3, 161)),                             // 茅草：横向草秆
      (x, y) => { const b = brickCell(x, y); return b === null ? [176, 190, 206] : mix([226, 234, 244], [250, 252, 255], b * 0.5 + pn(x, y, 16, 16, 165) * 0.5); }, // 雪砖
      (x, y) => { // 屋瓦：错位排列的弧形瓦片
        const r = y >> 4, xx = (x + (r % 2) * 8) % 16, yy = y % 16, edge = yy > 13 || Math.hypot(xx - 8, yy - 2) > 12.5;
        return mul(mix([142, 62, 42], [196, 100, 66], pn(x, y, 8, 8, 170)), edge ? 0.62 : 0.85 + yy / 60);
      },
      bevel(175, [150, 156, 166], [208, 214, 222]), bevel(180, [206, 158, 36], [255, 222, 100]),                                                // 铁块、金块
      (x, y) => mix([56, 160, 186], [196, 252, 255], Math.abs(pn(x, y, 5, 5, 185) - 0.5) * 2),                                                  // 晶块：棱面
      (x, y) => { // 灯：深色木框，中间由亮到暖
        const d = Math.max(Math.abs(x - 31.5), Math.abs(y - 31.5));
        return d > 26 ? [52, 38, 24] : d > 23 ? [92, 68, 40] : mix([255, 244, 196], [255, 176, 70], Math.hypot(x - 31.5, y - 31.5) / 34);
      },
      // —— 27–31：门、被子、花、浆果丛、树苗（PRD FR-018）——
      (x, y) => { // 门：深色门框，竖木板，一个把手
        if (x < 4 || x > 59 || y < 3 || y > 60) return [84, 58, 34];
        if (Math.hypot(x - 50, y - 34) < 3) return [214, 180, 80];
        return mul(mix([150, 108, 62], [186, 142, 90], pn(x, y, 8, 3, 190)), (x - 4) % 14 < 1 ? 0.6 : 0.95 + 0.1 * pn(x, y, 32, 8, 191));
      },
      (x, y) => mul(mix([168, 56, 56], [206, 92, 80], pn(x, y, 16, 16, 195)), x % 16 < 1.5 || y % 16 < 1.5 ? 0.78 : 1),   // 被子：红色格子
      (x, y) => { // 花（镂空）：上半朵白花（建网格时染成红黄蓝），下半绿茎
        const d = Math.hypot(x - 32, y - 16), petal = d < 13 && Math.cos(Math.atan2(y - 16, x - 32) * 5) > -0.35 - (13 - d) / 10;
        if (y < 32) return d < 4 ? [255, 214, 90] : petal ? [255, 255, 255] : [0, 0, 0, 0];
        return Math.abs(x - 32) < 2 || (y > 40 && y < 50 && Math.abs(x - 32 - (y - 45)) < 3 && Math.abs(x - 32) < 12) ? [70, 140, 54] : [0, 0, 0, 0];
      },
      (x, y) => { // 浆果丛（镂空）：叶子里点缀红浆果
        if (pn(x, y, 9, 9, 200) < 0.24) return [0, 0, 0, 0];
        if (Math.hypot((x % 16) - 8, (y % 16) - 8) < 3.2 && hash(x >> 4, y >> 4, 201) < 0.55) return [200, 40, 70];
        return mul(mix([40, 96, 36], [92, 150, 60], fbm(x, y, 202)), 0.75 + 0.45 * pn(x, y, 32, 32, 203));
      },
      (x, y) => { // 树苗（镂空）：细干加三团小叶子
        if (Math.abs(x - 32) < 2 && y > 22) return [110, 80, 50];
        const leaf = (cx, cy, r) => Math.hypot(x - cx, y - cy) < r;
        return leaf(32, 16, 11) || leaf(20, 30, 8) || leaf(44, 32, 8) ? mul([70, 150, 60], 0.75 + 0.45 * pn(x, y, 24, 24, 205)) : [0, 0, 0, 0];
      },
      // —— 32–38：黑曜石、方解石、紫水晶、钻石矿、红宝石矿、绿宝石矿、蓝宝石矿 ——
      (x, y) => mul(mix([16, 12, 24], [56, 44, 78], fbm(x, y, 240)), pn(x, y, 3, 9, 241) > 0.78 ? 1.7 : 1),                  // 黑曜石：黑里带紫的反光纹
      (x, y) => mul(mix([222, 216, 204], [252, 250, 244], pn(x, y, 3, 10, 245)), 0.94 + 0.1 * pn(x, y, 32, 32, 246)),          // 方解石：白色层纹
      (x, y) => mix([80, 36, 136], [220, 166, 255], Math.abs(pn(x, y, 6, 6, 250) - 0.5) * 2),                                // 紫水晶：棱面
      ore(260, [120, 216, 232], [240, 255, 255]), ore(270, [140, 16, 36], [255, 96, 116]), ore(280, [8, 116, 56], [96, 240, 150]), ore(290, [20, 48, 168], [116, 164, 255]),
      // —— 39–44：水泥块、黄砖、深色砖、浅色木板、深色木板、红木板 ——
      (x, y) => mul(mix([146, 146, 144], [174, 174, 170], pn(x, y, 32, 32, 300)), x % 32 < 1 || y % 32 < 1 ? 0.86 : 0.96 + 0.08 * pn(x, y, 6, 6, 301)),
      bricks(310, [190, 152, 76], [230, 198, 122], [150, 140, 118]), bricks(320, [66, 48, 46], [108, 82, 78], [38, 34, 34]),
      plank([204, 184, 144], [240, 224, 188], 330), plank([66, 46, 28], [106, 76, 48], 340), plank([130, 54, 38], [178, 86, 58], 350),
      // —— 45–46：箱子、告示牌的牌面 ——
      (x, y) => { // 箱子：木板箱，深色包边和中间一道箍，正中一个锁扣
        if (Math.abs(x - 32) < 4 && Math.abs(y - 28) < 5) return [214, 180, 80];
        const band = x < 4 || x > 59 || y < 4 || y > 59 || Math.abs(y - 26) < 2;
        return mul(mix([132, 92, 50], [176, 130, 78], pn(x, y, 3, 16, 360)), band ? 0.55 : y % 12 < 1 ? 0.7 : 0.95 + 0.1 * pn(x, y, 32, 8, 361));
      },
      (x, y) => mul(mix([206, 178, 128], [234, 212, 166], pn(x, y, 4, 20, 365)), x < 3 || x > 60 || y < 5 || y > 58 ? 0.6 : 1), // 牌面：浅色木板加深色边
      // —— 47–48：荧光玻璃、冰灯 ——
      (x, y) => (x < 4 || y < 4 || x > 59 || y > 59 ? [226, 214, 150] : mix([244, 236, 170], [255, 252, 214], pn(x, y, 9, 9, 370) > 0.62 ? 1 : pn(x, y, 3, 3, 371) * 0.5)),
      (x, y) => { const d = Math.max(Math.abs(x - 31.5), Math.abs(y - 31.5)); return d > 26 ? [40, 52, 70] : d > 23 ? [70, 96, 130] : mix([232, 250, 255], [110, 190, 255], Math.hypot(x - 31.5, y - 31.5) / 34); },
    ];
    for(let i=0;i<3;i++){const tint=[[1.5,1.5,1.4],[.65,.65,.65],[1.1,.72,.6]][i];for(const source of [6,7,27,45])tiles.push((x,y)=>{const c=tiles[source](x,y);return c.map((v,k)=>k<3?Math.min(255,v*tint[k]):v);});}
    const ctx = atlas.getContext('2d'), img = ctx.createImageData(atlas.width, TS);
    const k = U / TS, lum = new Float32Array(TS * TS);
    tiles.forEach((fn, t) => {
      if (t < from) return;
      for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) {
        const ux = (x + 0.5) * k - 0.5, uy = (y + 0.5) * k - 0.5;
        const c = fn(ux, uy), i = (t * TS + x + y * atlas.width) * 4, g = fine ? 0.9 + 0.2 * pn(ux, uy, 64, 64, 99) : 1;
        img.data[i] = c[0] * g; img.data[i + 1] = c[1] * g; img.data[i + 2] = c[2] * g; img.data[i + 3] = c[3] === 0 ? 0 : 255;
        lum[x + y * TS] = c[0] + c[1] + c[2];
      }
      if (!fine || t === 5) return; // 水不做浮雕
      for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) { // 左上受光的浮雕：亮度差当高度差
        const a = lum[(x + TS - 1) % TS + (y + TS - 1) % TS * TS], b = lum[(x + 1) % TS + (y + 1) % TS * TS];
        const f = 1 + Math.max(-0.28, Math.min(0.28, (a - b) / 260)), i = (t * TS + x + y * atlas.width) * 4;
        for (let j = 0; j < 3; j++) img.data[i + j] = Math.min(255, img.data[i + j] * f);
      }
    });
    ctx.putImageData(img, 0, 0, from * TS, 0, atlas.width - from * TS, TS); // 只写回新画的那一段
  }
  let packRequest = 0;
  function applyPack() {
    const request = ++packRequest;
    const custom = localStorage.getItem(PACK);
    if (pack === 'custom' && !custom) pack = 'auto';
    $('pack').value = pack; $('pack').querySelector('[value=custom]').disabled = !custom;
    const done = () => { tex.needsUpdate = true; foliage.setPack(pack==='natural'); placedTorches.refresh(); for (const k in icons) delete icons[k]; heldId = -1; renderBar(); schedule(); };
    if (pack === 'custom' || pack === 'natural') {
      const img = new Image();
      const natural = pack === 'natural';
      img.onload = async () => {
        try { if (natural) await Promise.all([NaturalTools.load(),NaturalBlocks.load()]); }
        catch (err) { console.warn(err); }
        if (request !== packRequest) return;
        TS = img.height; atlas.width = TS * ATLAS_TILES; atlas.height = TS;
        atlas.getContext('2d').drawImage(img, 0, 0);
        drawAtlas(TS, true, 17);                                  // 材质包图片只到第 16 格：后面的新方块用程序贴图补上
        if(natural)NaturalBlocks.draw(atlas.getContext('2d'),TS);
        done();
      };
      img.onerror = () => {
        if (request !== packRequest) return;
        console.warn('材质包加载失败，恢复标准材质');
        pack = 'std'; applyPack();
      };
      img.src = natural ? 'texture-packs/natural-v1/stonisle-natural-128.png' : custom;
    } else { const fine = pack === 'fine' || (pack === 'auto' && hq); drawAtlas(fine ? 128 : 64, fine); done(); }
  }

  // ---- Three.js：无灯光、无实时阴影、无后期；日照方向 + 环境光遮蔽烘在顶点色里 ----
  const SKY = 0xc4d9ea;
  const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  document.body.prepend(renderer.domElement);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(SKY);
  scene.fog = new THREE.Fog(SKY, 1, 2);
  const camera = new THREE.PerspectiveCamera(70, 1, 0.1, 200);
  camera.rotation.order = 'YXZ';
  const tex = new THREE.CanvasTexture(atlas);
  tex.anisotropy = 4;
  const solidMat = new THREE.MeshBasicMaterial({ map: tex, vertexColors: true, alphaTest: 0.5 });
  const waterMat = new THREE.MeshBasicMaterial({ map: tex, vertexColors: true, transparent: true, opacity: 0.78, depthWrite: false });
  // 天空：一个渐变球 + 一个太阳贴片，共 2 次绘制
  const sky = new THREE.Mesh(new THREE.SphereGeometry(40, 16, 10), new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthTest: false, depthWrite: false }));
  {
    const pos = sky.geometry.attributes.position, col = new Float32Array(pos.count * 3);
    const hz = new THREE.Color(SKY), zen = new THREE.Color(0x3f7fd0), c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) c.copy(hz).lerp(zen, Math.sqrt(Math.max(0, pos.getY(i) / 40))).toArray(col, i * 3);
    sky.geometry.setAttribute('color', new THREE.BufferAttribute(col, 3));
  }
  sky.renderOrder = -2; sky.frustumCulled = false; scene.add(sky);
  const sunCv = document.createElement('canvas'); sunCv.width = sunCv.height = 64;
  {
    const g = sunCv.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, '#fff'); gr.addColorStop(0.12, '#fff8dc'); gr.addColorStop(0.3, 'rgba(255,236,170,.35)'); gr.addColorStop(1, 'rgba(255,236,170,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  }
  const sun = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(sunCv), fog: false, depthWrite: false, blending: THREE.AdditiveBlending }));
  sun.scale.setScalar(22); sun.renderOrder = -1; scene.add(sun);
  const moon = new THREE.Sprite(new THREE.SpriteMaterial({ map: sun.material.map, color: 0xbfd0ff, fog: false, depthWrite: false, blending: THREE.AdditiveBlending }));
  moon.scale.setScalar(10); moon.renderOrder = -1; scene.add(moon);
  const starGeo = new THREE.BufferGeometry();
  {
    const sp = [], v = new THREE.Vector3();
    for (let i = 0; i < 400; i++) { v.set(hash(i, 1, 5) - 0.5, hash(i, 2, 5) * 0.5 + 0.02, hash(i, 3, 5) - 0.5).normalize().multiplyScalar(39); sp.push(v.x, v.y, v.z); }
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
  }
  const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 1.6, sizeAttenuation: false, fog: false, transparent: true, depthWrite: false }));
  stars.renderOrder = -1.5; stars.frustumCulled = false; scene.add(stars);
  const sunDir = new THREE.Vector3(), tint = new THREE.Color(), skyTint = new THREE.Color();
  let sunA = 0, dayK = 1;
  // 高画质档：受光材质 + 一盏投影的平行光。太阳不动，所以阴影贴图只在走远/改方块/建区块时重画，不是每帧
  const MATS = [[solidMat, waterMat], [
    new THREE.MeshLambertMaterial({ map: tex, vertexColors: true, alphaTest: 0.5 }),
    new THREE.MeshPhongMaterial({ map: tex, vertexColors: true, transparent: true, opacity: 0.8, depthWrite: false, specular: 0xfff4d0, shininess: 120 }),
  ]];
  const foliage=new Foliage(tex,ATLAS_TILES,()=>{renderer.shadowMap.needsUpdate=true;schedule();});
  MATS[0].push(foliage.basic,foliage.grassBasic);MATS[1].push(foliage.lit,foliage.grassLit);
  for(const materials of MATS)WaterMaterial.decorate(materials[1],ATLAS_TILES);
  const lighting=new WorldLighting(scene,world);
  const placedTorches=new PlacedTorches(scene,world,lighting,save.torches);
  for(const material of MATS[1])WorldLighting.decorate(material);
  const torchWorld=new THREE.Vector3(),torchDirection=new THREE.Vector3();
  const leafDepth = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: tex, alphaTest: 0.5 }); // 让镂空树叶投出镂空的影子
  const ambient = new THREE.AmbientLight(0xdfe8ff, 0.85); scene.add(ambient);
  const light = new THREE.DirectionalLight(0xfff2d8, 0.5);
  light.castShadow = true; light.shadow.mapSize.set(2048, 2048);
  light.shadow.bias = -0.0005; light.shadow.normalBias = 0.04;
  Object.assign(light.shadow.camera, { left: -56, right: 56, top: 56, bottom: -56, near: 1, far: 220 });
  light.shadow.camera.updateProjectionMatrix();
  scene.add(light, light.target);
  renderer.shadowMap.autoUpdate = false;
  const shadowAt = new THREE.Vector3(1e9, 0, 0);
  let shadowA = 0;
  function updateShadow() { // 玩家离开阴影中心 8 格以上才移动并重画
    if (Math.abs(p.x - shadowAt.x) < 8 && Math.abs(p.z - shadowAt.z) < 8 && Math.abs(p.y - shadowAt.y) < 8 && Math.abs(sunA - shadowA) < 0.02) return;
    shadowA = sunA; // 太阳每转过约 1° 也重画一次（几秒一次）
    shadowAt.set(Math.round(p.x / 4) * 4, Math.round(p.y / 4) * 4, Math.round(p.z / 4) * 4);
    light.target.position.copy(shadowAt);
    light.position.copy(sunDir).multiplyScalar(114).add(shadowAt);
    renderer.shadowMap.needsUpdate = true;
  }
  // 昼夜：不重建网格。普通档给材质乘一个天光色，高画质档调灯光；天空球、雾、日月星跟着变
  function updateSky() {
    const f = time / DAY % 1; sunA = f < 0.65 ? Math.PI * f / 0.65 : Math.PI * (1 + (f - 0.65) / 0.35);
    const s = Math.sin(sunA), k = Math.min(1, Math.max(0, (s + 0.15) / 0.4)), dusk = Math.max(0, 1 - Math.abs(s) / 0.3);
    dayK = k * k * (3 - 2 * k);
    sunDir.set(Math.cos(sunA) * 0.8, s, 0.45).normalize();
    tint.setRGB(0.2 + 0.8 * dayK + 0.12 * dusk * dayK, 0.26 + 0.74 * dayK, 0.45 + 0.55 * dayK - 0.2 * dusk * dayK);
    skyTint.setRGB(0.05 + 0.95 * dayK + 0.2 * dusk, 0.07 + 0.93 * dayK - 0.05 * dusk, 0.14 + 0.86 * dayK - 0.3 * dusk * dayK);
    MATS[0][0].color.copy(tint); MATS[0][1].color.copy(tint);foliage.basic.color.copy(tint);foliage.grassBasic.color.copy(tint);
    ambient.color.set(0xdfe8ff).multiply(tint); light.intensity = 0.5 * dayK;
    handAmb.color.copy(tint); handLight.intensity = 0.6 * dayK;
    sky.material.color.copy(skyTint); scene.fog.color.setHex(SKY).multiply(skyTint); scene.background.copy(scene.fog.color);
    const D = camera.far * 0.9; // 日月星放在视距尽头并做深度测试，才会被地形和树挡住
    sky.position.copy(camera.position); stars.position.copy(camera.position); stars.scale.setScalar(D / 39);
    sun.position.copy(sunDir).multiplyScalar(D).add(camera.position); sun.scale.setScalar(22 * D / 38); sun.visible = sunDir.y > -0.12;
    moon.position.copy(sunDir).multiplyScalar(-D).add(camera.position); moon.scale.setScalar(10 * D / 38); moon.visible = sunDir.y < 0.12;
    stars.material.opacity = 1 - dayK; stars.visible = dayK < 0.98;
  }
  function setHQ(on) {
    const changed = hq !== on;
    hq = on; $('hq').checked = on;
    renderer.shadowMap.enabled = on;
    for (const ms of meshes.values()) for (const m of ms) m.material = MATS[1][m.userData.w];
    for (const m of MATS[1]) m.needsUpdate = true;
    shadowAt.x = 1e9; schedule();
    if (changed && pack === 'auto') applyPack();
  }
  const box = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.004, 1.004, 1.004)), new THREE.LineBasicMaterial({ color: 0x111111 }));
  box.visible = false; scene.add(box);

  function resize() {
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = handCam.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); handCam.updateProjectionMatrix();
    // 窄预览窗也保留手持工具，避免固定位置把模型推到画面外。
    holder.position.x = Math.min(0.5, handCam.aspect * (heldId === PICK || heldId === PICK2 ? 0.09 : 0.24));
    schedule();
  }
  function setView(n) {
    R = n; $('view').value = n; $('viewN').textContent = n;
    scene.fog.near = R * CH * 0.55; scene.fog.far = (R - 0.4) * CH;
    camera.far = Math.max(64, R * CH + 24); camera.updateProjectionMatrix();
    lastC = null; schedule();
  }

  // ---- 区块网格管理：每区块最多 2 个 Mesh（实心 + 水），每帧最多建 2 个 ----
  const meshes = new Map(); let queue = [], lastC = null;
  const waterDirty=new Set();let waterClock=0;
  const waterFlow=new WaterFlow(world,save.water,(x,z)=>meshes.has((x>>4)+','+(z>>4)),(x,y,z)=>{
    blockDamage.clear(x,y,z);
    for(const dx of [-1,0,1])for(const dz of [-1,0,1])waterDirty.add(((x+dx)>>4)+','+((z+dz)>>4));
    saveSoon();
  });
  function updateWater(dt){
    waterClock+=dt;WaterMaterial.update(dt);
    if(waterClock>=.12){waterClock%=.12;waterFlow.tick(256);}
    for(const k of waterDirty){waterDirty.delete(k);if(meshes.has(k)){const [x,z]=k.split(',').map(Number);build(x,z);break;}}
  }
  function drop(k) {
    for (const m of meshes.get(k) || []) { scene.remove(m); m.geometry.dispose(); }
    meshes.delete(k);lighting.drop(...k.split(',').map(Number));
  }
  function build(cx, cz) {
    const k = cx + ',' + cz; drop(k);
    lighting.chunk(cx,cz);
    const parts = meshChunk(world, cx, cz), out = [];
    [parts.solid, parts.water, parts.leaves, parts.grass].forEach((g, w) => {
      if (!g.idx.length) return;
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(g.pos, 3));
      geo.setAttribute('normal', new THREE.BufferAttribute(g.nor, 3));
      geo.setAttribute('uv', new THREE.BufferAttribute(g.uv, 2));
      geo.setAttribute('color', new THREE.BufferAttribute(g.col, 3));
      geo.setIndex(new THREE.BufferAttribute(g.idx, 1));
      if(w===1){geo.setAttribute('waterFlow',new THREE.BufferAttribute(g.flow,4));geo.setAttribute('waterFoam',new THREE.BufferAttribute(g.foam,1));geo.computeVertexNormals();}
      if(w>=2)geo.setAttribute('leafWind',new THREE.BufferAttribute(g.wind,2));
      lighting.geometry(geo,cx,cz,w===0);
      const m = new THREE.Mesh(geo, MATS[1][w]);
      m.userData.w = w; m.receiveShadow = true; m.castShadow = w!==1; m.customDepthMaterial = w===3?foliage.grassDepth:w===2?foliage.depth:leafDepth;
      m.position.set(cx * CH, 0, cz * CH);
      scene.add(m); out.push(m);
    });
    meshes.set(k, out);
    waterFlow.activate(cx,cz);
    renderer.shadowMap.needsUpdate = true;
  }
  function updateChunks() {
    const pcx = Math.floor(p.x / CH), pcz = Math.floor(p.z / CH), c = pcx + ',' + pcz;
    if (c !== lastC) {
      lastC = c; queue = [];
      for (let dz = -R; dz <= R; dz++) for (let dx = -R; dx <= R; dx++) {
        const d = dx * dx + dz * dz;
        if (d <= R * R && !meshes.has((pcx + dx) + ',' + (pcz + dz))) queue.push([d, pcx + dx, pcz + dz]);
      }
      queue.sort((a, b) => a[0] - b[0]);
      for (const k of meshes.keys()) {
        const [x, z] = k.split(',').map(Number);
        if ((x - pcx) ** 2 + (z - pcz) ** 2 > (R + 1) ** 2) { drop(k);waterFlow.deactivate(x,z); }
      }
    }
    for (let i = 0; i < 2 && queue.length; i++) { const q = queue.shift(); build(q[1], q[2]); }
  }
  function setBlock(x, y, z, id) {
    blockDamage.clear(x,y,z);
    const lamp = id === Core.LAMP || world.get(x, y, z) === Core.LAMP;   // 放下或挖掉灯：光照范围会跨到相邻区块
    world.set(x, y, z, id); saveSoon(); if (window.Net) Net.block(x, y, z, id);
    for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){const b=world.get(x+dx,y,z+dz),info=Core.ladderInfo(b);if(info&&!Core.ladderSupported((a,c,d)=>world.get(a,c,d),x+dx,y,z+dz,info)){setBlock(x+dx,y,z+dz,AIR);give(Core.WOODS[info.wood].ladder);}}

    waterFlow.edited(x,y,z);
    for(const dx of [-1,0,1])for(const dz of [-1,0,1])waterDirty.add(((x+dx)>>4)+','+((z+dz)>>4));
    const cx = x >> 4, cz = z >> 4, lx = x & 15, lz = z & 15;
    const touch = (a, b) => { if (meshes.has(a + ',' + b)) build(a, b); };
    touch(cx, cz);
    if (lx === 0) touch(cx - 1, cz); if (lx === 15) touch(cx + 1, cz);
    if (lz === 0) touch(cx, cz - 1); if (lz === 15) touch(cx, cz + 1);
    if (lamp) for (const dx of [-1, 0, 1]) for (const dz of [-1, 0, 1]) if (dx || dz) touch(cx + dx, cz + dz);
  }

  // ---- 物理：AABB 分轴移动 ----
  const solid = id => id !== AIR && id !== WATER && !Core.PASS.has(id); // 打开的门和植物可以走过去
  function hits(at=p) {
    const lo=[at.x-W,at.y,at.z-W],hi=[at.x+W,at.y+PH,at.z+W],get=(x,y,z)=>world.get(x,y,z);
    for(let y=Math.floor(lo[1]+1e-5);y<=Math.floor(hi[1]-1e-5);y++)for(let z=Math.floor(lo[2]+1e-5);z<=Math.floor(hi[2]-1e-5);z++)for(let x=Math.floor(lo[0]+1e-5);x<=Math.floor(hi[0]-1e-5);x++){
      const id=get(x,y,z);if(!solid(id))continue;
      for(const q of Core.shapeBoxes(id,get,x,y,z))if(lo[0]<x+q[3]-1e-5&&hi[0]>x+q[0]+1e-5&&lo[1]<y+q[4]-1e-5&&hi[1]>y+q[1]+1e-5&&lo[2]<z+q[5]-1e-5&&hi[2]>z+q[2]+1e-5)return true;
    }
    return false;
  }
  function move(a,d){
    const steps=Math.max(1,Math.ceil(Math.abs(d)/.15)),delta=d/steps;
    for(let step=0;step<steps;step++){
      const start=p[a];p[a]+=delta;if(!hits())continue;p[a]=start;
      if(a!=='y'&&v.y<=0){const groundY=p.y;p.y-=.03;const grounded=hits();p.y=groundY;
        if(grounded){p.y+=.501;const clearRise=!hits();p[a]+=delta;if(clearRise&&!hits())continue;p[a]=start;p.y=groundY;}
      }
      let lo=0,hi=1;for(let i=0;i<14;i++){const t=(lo+hi)/2;p[a]=start+delta*t;if(hits())hi=t;else lo=t;}p[a]=start+delta*lo;return true;
    }
    return false;
  }
  const keys = {}, touchKeys = {}, touchMove = {x:0,forward:0};
  const pressed = code => keys[code] || touchKeys[code];
  let fallFrom = p.y, regenT = 0;
  function renderHP() { $('hpfill').style.width = hp / MAXHP * 100 + '%'; $('hptxt').textContent = `HP ${Math.ceil(hp)}/${MAXHP} · Armor ${armor()}`; }
  const creative = () => !!(window.Creative && Creative.on); // 创造模式：不掉血、放置不消耗、一下挖掉（creative.js）
  // —— 死亡 ——血量归零：人倒下不能动，画面变暗，逐字打出 “You are dead.”；打完后按任意键、点一下或碰一下屏幕，在床边或出生点醒来。背包保留。
  let dead = false, deadReady = false, deadTimer = 0;
  const deadBox = document.body.appendChild(document.createElement('div'));
  deadBox.style.cssText = 'position:fixed;inset:0;z-index:40;display:none;place-items:center;text-align:center;pointer-events:none;background:#1a0606;opacity:0;transition:opacity 1.2s;color:#fff;font:bold 44px ui-monospace,Menlo,Consolas,monospace;letter-spacing:2px';
  deadBox.innerHTML = '<div style="transform:translateY(-22vh)"><span id="deadText"></span><span style="opacity:.8">▌</span><div id="deadHint" style="margin-top:22px;font:16px system-ui;letter-spacing:0;opacity:0;transition:opacity .6s">Press any key to wake up</div></div>';
  function die() {
    if (dead) return;
    dead = true; deadReady = false; held = false; hp = 0; for (const k in keys) keys[k] = false;
    const text = 'You are dead.', out = $('deadText'); out.textContent = ''; $('deadHint').style.opacity = 0;
    deadBox.style.display = 'grid'; requestAnimationFrame(() => { deadBox.style.opacity = 0.82; });
    Lang.say(text);
    let i = 0; clearInterval(deadTimer);
    deadTimer = setInterval(() => { // 一个字一个字打出来
      out.textContent = text.slice(0, ++i);
      if (i >= text.length) { clearInterval(deadTimer); setTimeout(() => { if (dead) { deadReady = true; $('deadHint').style.opacity = 0.85; } }, 700); }
    }, 110);
  }
  function wake() {
    if (!dead || !deadReady) return;
    dead = deadReady = false; hp = MAXHP; Object.assign(p, (window.Home && Home.spawn()) || spawnPos()); v.y = 0; fallFrom = p.y; // 睡过的床优先
    deadBox.style.opacity = 0; setTimeout(() => { if (!dead) deadBox.style.display = 'none'; }, 1200);
    Lang.say('You are back. Be careful!', false, 1.4); renderHP(); saveSoon(); schedule();
  }
  addEventListener('keydown', e => { if (dead) { e.stopImmediatePropagation(); e.preventDefault(); wake(); } }, true);
  for (const ev of ['mousedown', 'touchstart']) addEventListener(ev, e => { if (dead) { e.stopImmediatePropagation(); wake(); } }, true);
  function hurt(d) {
    if (creative() || dead) return;
    hp -= d * (1 - armor() * 0.04);
    $('hurt').style.opacity = 0.6; setTimeout(() => { $('hurt').style.opacity = 0; }, 120);
    if (hp <= 0) die();
    renderHP(); saveSoon();
  }
  const ladderMotion=new LadderMotion.Controller();
  function step(dt) {
    yaw += ((keys.ArrowLeft ? 1 : 0) - (keys.ArrowRight ? 1 : 0)) * 1.8 * dt;
    pitch = Math.max(-1.55, Math.min(1.55, pitch + ((keys.ArrowUp ? 1 : 0) - (keys.ArrowDown ? 1 : 0)) * 1.4 * dt));
    if (!document.pointerLockElement && !mobileControls.mobile && (edgeX || edgeY)) { yaw -= edgeX * 2.4 * dt; pitch = Math.max(-1.55, Math.min(1.55, pitch - edgeY * 1.6 * dt)); } // 鼠标没锁住：光标在边缘时继续转
    const f = (pressed('KeyW') ? 1 : 0) - (pressed('KeyS') ? 1 : 0) + touchMove.forward, s = (pressed('KeyD') ? 1 : 0) - (pressed('KeyA') ? 1 : 0) + touchMove.x;
    const sampleY=p.y+.5,wy=Math.floor(sampleY);
    const wet = waterFlow.height(Math.floor(p.x),wy,Math.floor(p.z)) > sampleY-wy;
    const sp = (wet ? 2.6 * (equip.includes(120) ? 1.3 : 1) * (equip.includes(146) ? 1.5 : 1) : 4.6) * (time < slowUntil ? 0.5 : 1) / Math.max(1,Math.hypot(f, s)), // 蟹壳盔：游得快三成；被霜灵碰到：3 秒内减半
      sin = Math.sin(yaw), cos = Math.cos(yaw);
    v.x = (-sin * f + cos * s) * sp; v.z = (-cos * f - sin * s) * sp;
    v.x += pushX; v.z += pushZ; { const k = Math.exp(-4 * dt); pushX *= k; pushZ *= k; } // 被风隼、风暴鹏撞退
    const climb=ladderMotion.update(dt,(x,y,z)=>world.get(x,y,z),p,f,pressed('Space'));
    if(ladderMotion.cooldown>0){v.x=ladderMotion.kickX;v.z=ladderMotion.kickZ;}
    if(climb){v.y=climb.vy;fallFrom=p.y;if(!climb.jump&&f<0){v.x=cos*s*sp;v.z=-sin*s*sp;}if(climb.jump){v.x=climb.vx;v.z=climb.vz;}}
    else if (wet) { v.y = pressed('Space') ? 3 : Math.max(v.y - 8 * dt, -2.5); }
    else { if (pressed('Space') && onGround) v.y = equip.includes(149) ? 10.5 : 8; /* 风行靴：跳得高 1 格 */ v.y = Math.max(v.y - 26 * dt, -18); }
    const hitX=move('x', v.x * dt),hitZ=move('z', v.z * dt);
    if(wet&&!climb&&pressed('Space')&&(hitX||hitZ)&&Math.hypot(f,s)>.1){
      const surface=wy+waterFlow.height(Math.floor(p.x),wy,Math.floor(p.z));
      if(ShoreMotion.tryExit((x,y,z)=>world.get(x,y,z),p,v.x,v.z,surface,hits)){v.y=0;onGround=true;fallFrom=p.y;}
    }
    const hitY = move('y', v.y * dt);
    if (hitY && v.y < 0 && fallFrom - p.y > 4) hurt(Math.floor((fallFrom - p.y - 3) * (equip.includes(148) ? 0 : equip.includes(48) ? 0.5 : 1))); // 摔落：超过 4 格开始掉血；穿滑翔披风减半
    onGround = hitY && v.y < 0;
    fallFrom = onGround || wet || climb ? p.y : Math.max(fallFrom, p.y);
    if ((regenT += dt) > 6) { regenT = 0; if (hp < MAXHP) { hp = Math.min(MAXHP, hp + 1); renderHP(); } } // 每 6 秒回 1 点
    if (hitY) v.y = 0;
  }
  const viewDir = () => [-Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch)];
  // 挖、放、打用的方向。第一人称就是视线方向；第三人称镜头在右肩后面，要改成“从眼睛指向准星实际对着的那个点”，否则近处的东西打不中
  const lookDir = () => { const d = viewDir(); return window.ThirdPerson ? ThirdPerson.aim([p.x, p.y + EYE, p.z], d, mobs) : d; };
  const REACH = 4; // 挖掘、放置、目标高亮统一使用 4 格距离
  const aim = () => { const origin=[p.x,p.y+EYE,p.z], direction=lookDir(), block=raycast((x,y,z)=>world.get(x,y,z),origin,direction,REACH); return placedTorches.hit(origin,direction,block?block.t:REACH)||block; };

  // ---- 挖（累计已完成工作量，换工具只改变后续速度）/ 放 ----
  let held = false, digKey = '', digProgress = 0;
  const miningFX = new MiningFX(scene);
  let attackCooldown=0,hitNoticeTime=0;
  const hitNotice=document.createElement('div');
  hitNotice.style.cssText='position:fixed;left:50%;top:calc(50% + 30px);transform:translateX(-50%);color:#fff2cb;background:#382b24cc;padding:4px 10px;border-radius:6px;pointer-events:none;display:none;font:13px system-ui';
  document.body.appendChild(hitNotice);
  function give(id, n = 1) {
    inv[id] = (inv[id] || 0) + n;
    if ((id < 31 || id === 32 || id === 153 || isBlock(id)) && !slots.includes(id)) { const i = slots.indexOf(0); if (i >= 0) slots[i] = id; } // 兽皮和装备不占快捷栏
    renderBar(); saveSoon();
  }
  function digStep(dt) {
    attackCooldown=Math.max(0,attackCooldown-dt);
    hitNoticeTime=Math.max(0,hitNoticeTime-dt);hitNotice.style.display=hitNoticeTime>0?'block':'none';
    if(held&&attack()) {digKey='';digProgress=0;miningFX.reset();$('prog').style.width='0px';return;}
    const h = held && hotbarActive && aim(), k = h ? h.x + ',' + h.y + ',' + h.z : '';
    if(h&&h.torch){placedTorches.remove(h.torch);give(TORCH);held=false;miningFX.reset();$('prog').style.width='0px';return;}
    if (k !== digKey) { digKey = k; digProgress = h ? blockDamage.get(h,world.get(h.x,h.y,h.z)) : 0; }
    let prog = 0;
    if (h && h.y > 0) { // y=0 是不可挖的底层
      const id = world.get(h.x, h.y, h.z);
      digProgress = creative() ? 1 : blockDamage.dig(h,id,selectedItem(),dt); prog = digProgress; if (creative()) held = false; // 创造模式点一下挖一块 saveSoon();
      miningFX.damage(h,id,prog,dt);
      if (prog >= 1) { miningFX.break(h,id); setBlock(h.x, h.y, h.z, AIR); give(window.Home ? Home.dug(h, id) : id); digKey = ''; prog = 0; }
    } else miningFX.reset();
    $('prog').style.width = prog * 40 + 'px';
  }
  function place() {
    const id = selectedItem(), h = aim();
    if (window.Home && Home.use(h, id)) { swing = 0.3; renderHP(); renderBar(); return saveSoon(); } // 门、床、浆果丛、种植等：见 home.js
    if (id === MEAT && inv[id] && hp < MAXHP) { inv[id]--; hp = Math.min(MAXHP, hp + 4); swing = 0.3; renderHP(); renderBar(); return saveSoon(); } // 右键吃肉回 4 点
    if(h&&id===TORCH&&inv[id]){if(placedTorches.place(h)){if(!creative())inv[id]--;swing=.3;renderBar();saveSoon();}return;}
    if (!h || h.torch || !isBlock(id) || !inv[id]) return;
    const x = h.x + h.n[0], y = h.y + h.n[1], z = h.z + h.n[2];
    // Check the new block itself as well as the face that was clicked.
    const nearest = (v,lo) => Math.max(lo,Math.min(lo+1,v));
    if(Math.hypot(p.x-nearest(p.x,x),p.y+EYE-nearest(p.y+EYE,y),p.z-nearest(p.z,z))>REACH)return;
    if (y >= H || solid(world.get(x, y, z)) || (!h.n[0] && !h.n[1] && !h.n[2])) return;
    if (x + 1 > p.x - W && x < p.x + W && y + 1 > p.y && y < p.y + PH && z + 1 > p.z - W && z < p.z + W) return; // 不能把自己埋了
    setBlock(x, y, z, id); if (!creative()) inv[id]--; swing = 0.3; renderBar();
  }

  // ---- 动物：方块小兽，上限 8 只，在玩家周围的露天草地上补刷，离远了消失；不存档 ----
  const grainCv = document.createElement('canvas'); grainCv.width = grainCv.height = 32;
  { // 一小块灰度噪声当毛皮/木纹/金属的质感，乘在顶点色上
    const g = grainCv.getContext('2d'), im = g.createImageData(32, 32);
    for (let i = 0; i < 1024; i++) { const v = 185 + hash(i % 32, i >> 5, 7) * 70; im.data.set([v, v, v, 255], i * 4); }
    g.putImageData(im, 0, 0);
  }
  const itemMat = new THREE.MeshLambertMaterial({ vertexColors: true, map: new THREE.CanvasTexture(grainCv) });
  function boxes(list) { // [宽,高,长, x,y,z, 颜色]… 合并成一个几何体（一次绘制），头朝 +z
    const pos = [], nor = [], uv = [], col = [], c = new THREE.Color();
    for (const [w, h, l, x, y, z, hex] of list) {
      const g = new THREE.BoxGeometry(w, h, l).translate(x, y, z).toNonIndexed();
      pos.push(...g.attributes.position.array); nor.push(...g.attributes.normal.array); uv.push(...g.attributes.uv.array);
      c.set(hex); for (let i = 0; i < g.attributes.position.count; i++) col.push(c.r, c.g, c.b);
    }
    const g = new THREE.BufferGeometry(); g.userData.list = list;
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    return g;
  }
  const both = b => [b, [b[0], b[1], b[2], -b[3], b[4], b[5], b[6]]]; // 左右对称的一对
  const DEER = '#9a6a3e', DEER2 = '#855832', CREAM = '#e8d6b4', DARK = '#1c1410', FUR = '#a89880', FUR2 = '#978770';
  const TYPES = [
    { name: '野兔', hp: 4, speed: 1.5, run: 4.5, r: 0.3, h: 0.75, hop: true, meat: 1, geo: boxes([
      [0.26, 0.24, 0.4, 0, 0.22, 0, FUR], [0.3, 0.27, 0.22, 0, 0.23, -0.12, FUR2], [0.2, 0.1, 0.3, 0, 0.1, 0.02, CREAM],
      [0.2, 0.2, 0.2, 0, 0.42, 0.24, FUR], [0.12, 0.1, 0.08, 0, 0.38, 0.36, '#b8a890'], [0.05, 0.04, 0.03, 0, 0.41, 0.4, '#c98080'],
      ...both([0.02, 0.05, 0.05, 0.1, 0.46, 0.28, DARK]),
      ...both([0.05, 0.26, 0.07, 0.055, 0.64, 0.19, FUR2]), ...both([0.02, 0.2, 0.04, 0.055, 0.64, 0.225, '#d9a9a0']),
      ...both([0.06, 0.1, 0.08, 0.08, 0.05, 0.14, FUR2]), ...both([0.08, 0.1, 0.18, 0.11, 0.05, -0.1, FUR2]),
      [0.11, 0.11, 0.09, 0, 0.28, -0.25, '#f6f2ea']]) },
    { name: '鹿', hp: 10, speed: 1.2, run: 5, r: 0.5, h: 1.95, meat: 3,
      legs: [[0.16, 0.74, 0.36], [-0.16, 0.74, 0.36], [0.16, 0.74, -0.38], [-0.16, 0.74, -0.38]], // 四条腿各自一个 Mesh，绕髋部摆动
      legGeo: boxes([[0.13, 0.4, 0.16, 0, -0.18, 0, DEER], [0.09, 0.32, 0.1, 0, -0.52, 0, DEER2], [0.1, 0.07, 0.12, 0, -0.705, 0.01, DARK]]),
      geo: boxes([
        [0.44, 0.48, 1.0, 0, 0.96, 0, DEER], [0.5, 0.54, 0.34, 0, 0.99, 0.36, DEER2], [0.5, 0.52, 0.3, 0, 0.98, -0.38, DEER2],
        [0.38, 0.1, 0.86, 0, 0.7, 0, CREAM],
        ...both([0.07, 0.02, 0.07, 0.1, 1.205, 0.1, CREAM]), ...both([0.07, 0.02, 0.07, 0.14, 1.205, -0.14, CREAM]), [0.07, 0.02, 0.07, 0, 1.205, -0.02, CREAM],
        [0.2, 0.34, 0.22, 0, 1.34, 0.5, DEER], [0.17, 0.3, 0.19, 0, 1.56, 0.58, DEER], [0.12, 0.3, 0.06, 0, 1.4, 0.63, CREAM],
        [0.24, 0.24, 0.3, 0, 1.76, 0.68, DEER], [0.16, 0.15, 0.2, 0, 1.71, 0.9, '#b48a5c'], [0.11, 0.07, 0.04, 0, 1.74, 1.01, DARK],
        ...both([0.03, 0.07, 0.07, 0.115, 1.8, 0.74, DARK]), ...both([0.05, 0.15, 0.1, 0.16, 1.9, 0.58, DEER2]),
        ...both([0.04, 0.3, 0.04, 0.08, 2.02, 0.62, CREAM]), ...both([0.04, 0.04, 0.2, 0.08, 2.13, 0.72, CREAM]), ...both([0.14, 0.04, 0.04, 0.17, 2.04, 0.62, CREAM]),
        [0.1, 0.16, 0.08, 0, 1.12, -0.55, '#f6f0e2']]) },
  ];
  // 沙漠、雪原的动物：同款模型换毛色，外加一只沙狐。on = 能刷在哪种地表方块上（1 草 / 4 沙 / 15 雪）
  const dye = (g, map) => boxes(g.userData.list.map(b => [...b.slice(0, 6), map[b[6]] || b[6]]));
  const SNOWY = { [FUR]: '#f2f4f6', [FUR2]: '#e0e5ea', [DEER]: '#b9b2a8', [DEER2]: '#9a938a' }, SANDY = { [DEER]: '#d6ac6c', [DEER2]: '#b98f54' };
  const FOX = '#dcb47c', FOX2 = '#c2985e';
  TYPES[0].on = TYPES[1].on = 1; TYPES[1].hide = 2;
  TYPES.push(
    { ...TYPES[0], name: '雪兔', on: 15, geo: dye(TYPES[0].geo, SNOWY) },
    { ...TYPES[1], name: '驯鹿', on: 15, hide: 2, geo: dye(TYPES[1].geo, SNOWY), legGeo: dye(TYPES[1].legGeo, SNOWY) },
    { name: '沙狐', on: 4, hide: 1, hp: 5, speed: 1.6, run: 5, r: 0.3, h: 0.85, meat: 1, geo: boxes([
      [0.24, 0.24, 0.56, 0, 0.36, 0, FOX], [0.2, 0.06, 0.5, 0, 0.23, 0, CREAM],
      ...both([0.07, 0.24, 0.07, 0.08, 0.12, 0.2, FOX2]), ...both([0.07, 0.24, 0.07, 0.08, 0.12, -0.2, FOX2]),
      [0.22, 0.2, 0.2, 0, 0.52, 0.34, FOX], [0.1, 0.09, 0.14, 0, 0.48, 0.5, CREAM], [0.05, 0.04, 0.03, 0, 0.5, 0.58, DARK],
      ...both([0.02, 0.045, 0.045, 0.11, 0.56, 0.4, DARK]), ...both([0.09, 0.2, 0.04, 0.08, 0.72, 0.3, FOX2]),
      [0.14, 0.14, 0.34, 0, 0.4, -0.44, FOX], [0.12, 0.12, 0.1, 0, 0.4, -0.64, CREAM]]) },
    { ...TYPES[1], name: '羚羊', on: 4, speed: 1.6, run: 6, hide: 2, geo: dye(TYPES[1].geo, SANDY), legGeo: dye(TYPES[1].legGeo, SANDY) },
  );
  // 影狼：只在夜里出现，追着玩家咬，天亮消散。沙狐模型放大、染黑、红眼
  const WOLF = { name: '影狼', hostile: true, hp: 12, speed: 2.2, run: 3.8, r: 0.45, h: 1.2, scale: 1.5,
    geo: dye(TYPES.find(t => t.name === '沙狐').geo, { [FOX]: '#2e2a36', [FOX2]: '#201c28', [CREAM]: '#5a5466', [DARK]: '#e23a2a' }) };
  Object.assign(WOLF, { foe: true, lv: 3, dmg: 3, drops: { 37: 1 } });
  // —— 怪物（PRD FR-021 第一步：1–3 级陆地）。字段：lv 等级；dmg 攻击；day 白天也在；still 不会走；charge 靠近到几格内才发怒；kb 被击退的倍数；weak 哪种工具伤害加倍；drops 固定掉落 ——
  const FOES = {
    blob: { name: '泥团', foe: true, hostile: true, lv: 1, hp: 8, dmg: 1, speed: 1.4, run: 1.9, hop: true, r: 0.35, h: 0.7, kb: 2.5, drops: { 33: 2 }, geo: boxes([
      [0.6, 0.42, 0.6, 0, 0.21, 0, '#7a5a3c'], [0.44, 0.2, 0.44, 0, 0.5, 0, '#8a6a48'], [0.2, 0.1, 0.2, 0.12, 0.62, -0.08, '#96744e'],
      ...both([0.08, 0.1, 0.03, 0.13, 0.36, 0.305, DARK]), [0.22, 0.045, 0.03, 0, 0.2, 0.305, '#3a2a1a']]) },
    scorpion: { name: '沙蝎', foe: true, hostile: true, lv: 2, hp: 10, dmg: 2, speed: 2.2, run: 3.9, r: 0.35, h: 0.5, drops: { 34: 1 }, geo: boxes([
      [0.4, 0.14, 0.5, 0, 0.13, 0, '#c9a46a'], [0.3, 0.06, 0.4, 0, 0.23, 0, '#dcb87c'], ...both([0.12, 0.09, 0.24, 0.26, 0.11, 0.36, '#b08a50']), ...both([0.03, 0.05, 0.05, 0.08, 0.2, 0.27, DARK]),
      ...[0.18, 0, -0.18].flatMap(z => both([0.22, 0.04, 0.05, 0.3, 0.07, z, '#b08a50'])),
      [0.1, 0.1, 0.16, 0, 0.22, -0.3, '#c9a46a'], [0.09, 0.16, 0.09, 0, 0.36, -0.38, '#c9a46a'], [0.08, 0.08, 0.14, 0, 0.47, -0.33, '#b08a50'], [0.05, 0.06, 0.1, 0, 0.47, -0.22, '#5a2a1a']]) },
    vine: { name: '缠藤', foe: true, hostile: true, still: true, day: true, lv: 2, hp: 8, dmg: 1, speed: 0, run: 0, r: 0.4, h: 1.05, kb: 0, weak: AXE, drops: { 35: 2 }, geo: boxes([
      [0.56, 0.14, 0.56, 0, 0.07, 0, '#3e6a2c'], [0.1, 0.7, 0.1, -0.15, 0.48, 0.1, '#4e8a38'], [0.1, 0.62, 0.1, 0.16, 0.44, -0.06, '#3e6a2c'], [0.1, 0.78, 0.1, 0, 0.52, -0.16, '#4e8a38'],
      [0.3, 0.06, 0.06, 0.1, 0.5, 0.1, '#5ea040'], [0.06, 0.06, 0.3, -0.15, 0.66, 0, '#5ea040'], [0.22, 0.12, 0.22, 0, 0.9, 0, '#2e5a24'], [0.12, 0.12, 0.12, 0, 1.0, 0, '#b8405a']]) },
    boar: { name: '鬃猪', foe: true, day: true, charge: 4, lv: 3, hp: 16, dmg: 3, speed: 1.2, run: 4.2, r: 0.5, h: 1.0, meat: 2, drops: { 36: 1 }, geo: boxes([
      [0.5, 0.5, 0.9, 0, 0.58, 0, '#6a4a34'], [0.1, 0.12, 0.7, 0, 0.88, -0.05, '#3a2a20'], [0.4, 0.38, 0.3, 0, 0.52, 0.56, '#74523a'], [0.2, 0.16, 0.14, 0, 0.44, 0.76, '#b08878'],
      ...both([0.05, 0.14, 0.05, 0.13, 0.46, 0.73, CREAM]), ...both([0.03, 0.05, 0.05, 0.2, 0.62, 0.6, DARK]), ...both([0.08, 0.1, 0.05, 0.16, 0.76, 0.5, '#5a3e2c']),
      ...both([0.13, 0.34, 0.13, 0.16, 0.17, 0.3, '#4e3626']), ...both([0.13, 0.34, 0.13, 0.16, 0.17, -0.3, '#4e3626']), [0.05, 0.05, 0.12, 0, 0.7, -0.5, '#3a2a20']]) },
  };
  // —— 第二步：会飞的和浅水里的（PRD FR-021）。fly 飞 / swim 游 / ghost 能穿过方块 / erratic 飞得飘忽 / drift 随水漂、不追人 / cave 只在洞里
  //    fearsLight 怕火把 / wantsFood 你拿着食物才来 / likesLight 绕着灯飞 / slows 碰到后减速 / shell 正面有壳 / sad 打它 Wick 会难过 ——
  Object.assign(FOES, {
    bat: { name: '洞蝠', foe: true, hostile: true, fly: true, cave: true, erratic: true, fearsLight: true, day: true, lv: 1, hp: 4, dmg: 1, speed: 3, run: 4, r: 0.25, h: 0.3, drops: { 38: 1 }, geo: boxes([
      [0.14, 0.14, 0.2, 0, 0, 0, '#3a3040'], [0.12, 0.12, 0.1, 0, 0.02, 0.14, '#463a4e'], ...both([0.04, 0.07, 0.03, 0.04, 0.11, 0.15, '#463a4e']),
      ...both([0.3, 0.03, 0.18, 0.22, 0.02, 0, '#2a2230']), ...both([0.02, 0.02, 0.02, 0.035, 0.04, 0.195, '#e23a2a'])]) },
    crow: { name: '啄鸦', foe: true, hostile: true, fly: true, wantsFood: true, day: true, lv: 2, hp: 6, dmg: 1, speed: 2.5, run: 4.2, r: 0.3, h: 0.35, drops: { 39: 1 }, geo: boxes([
      [0.16, 0.16, 0.3, 0, 0, 0, '#1c1a22'], [0.13, 0.13, 0.13, 0, 0.08, 0.2, '#1c1a22'], [0.05, 0.04, 0.1, 0, 0.06, 0.31, '#e0a030'],
      ...both([0.34, 0.03, 0.2, 0.25, 0.03, -0.02, '#26232e']), [0.1, 0.03, 0.14, 0, 0.02, -0.2, '#26232e'], ...both([0.02, 0.03, 0.03, 0.065, 0.11, 0.24, '#f0f0f0'])]) },
    moth: { name: '灯蛾', fly: true, erratic: true, likesLight: true, sad: true, lv: 0, hp: 2, dmg: 0, speed: 2, run: 2.5, r: 0.2, h: 0.2, drops: { 110: 1 }, geo: boxes([
      [0.06, 0.06, 0.16, 0, 0, 0, '#d8c8a0'], ...both([0.16, 0.02, 0.14, 0.11, 0.01, 0, '#f2e6c0']), ...both([0.06, 0.025, 0.06, 0.15, 0.012, 0.03, '#ffe890'])]) },
    wisp: { name: '霜灵', foe: true, hostile: true, fly: true, ghost: true, slows: true, fearsLight: true, lv: 4, hp: 10, dmg: 2, speed: 1.2, run: 2, r: 0.35, h: 0.6, drops: { 111: 1 }, geo: boxes([
      [0.3, 0.3, 0.3, 0, 0, 0, '#bfe6ff'], [0.18, 0.18, 0.18, 0.2, 0.12, 0, '#e8f6ff'], [0.16, 0.16, 0.16, -0.18, -0.1, 0.06, '#e8f6ff'], [0.14, 0.14, 0.14, 0.04, 0.24, -0.12, '#8fd0ff'],
      [0.12, 0.2, 0.12, 0, -0.26, 0, '#8fd0ff'], ...both([0.05, 0.07, 0.03, 0.07, 0.03, 0.155, '#20406a'])]) },
    fish: { name: '咬咬鱼', foe: true, hostile: true, swim: true, day: true, lv: 1, hp: 3, dmg: 1, speed: 1.5, run: 2.3, r: 0.2, h: 0.2, drops: { 112: 1 }, geo: boxes([
      [0.1, 0.14, 0.3, 0, 0, 0, '#7a9aa8'], [0.03, 0.14, 0.1, 0, 0, -0.19, '#5a7a88'], [0.02, 0.06, 0.1, 0, 0.1, 0, '#5a7a88'], [0.08, 0.03, 0.03, 0, -0.04, 0.15, '#ffffff'],
      ...both([0.02, 0.03, 0.03, 0.05, 0.03, 0.1, DARK])]) },
    jelly: { name: '刺水母', foe: true, hostile: true, swim: true, drift: true, lv: 2, hp: 6, dmg: 2, speed: 0.3, run: 0.3, r: 0.3, h: 0.5, drops: { 113: 1 }, geo: boxes([
      [0.36, 0.2, 0.36, 0, 0, 0, '#ff9ad8'], [0.26, 0.1, 0.26, 0, 0.14, 0, '#ffb8e6'], ...both([0.04, 0.3, 0.04, 0.1, -0.24, 0.1, '#e070c0']), ...both([0.04, 0.3, 0.04, 0.1, -0.24, -0.1, '#e070c0'])]) },
    crab: { name: '钳蟹', foe: true, hostile: true, shell: true, lv: 3, hp: 14, dmg: 3, speed: 1.4, run: 2.6, r: 0.4, h: 0.45, meat: 0, drops: { 114: 1, 115: 1 }, geo: boxes([
      [0.5, 0.2, 0.36, 0, 0.2, 0, '#c8553a'], [0.4, 0.06, 0.3, 0, 0.33, 0, '#d86a4a'], ...both([0.16, 0.14, 0.2, 0.34, 0.22, 0.2, '#d86a4a']), ...both([0.04, 0.1, 0.04, 0.1, 0.36, 0.14, '#c8553a']),
      ...both([0.05, 0.05, 0.05, 0.1, 0.43, 0.15, DARK]), ...[0.1, 0, -0.1].flatMap(z => both([0.2, 0.05, 0.05, 0.34, 0.08, z, '#a8402a']))]) },
  });
  // —— 第三步：5 级以上（PRD FR-021）。stealth 多少格外看不见 / burrow 在沙下游走，只追站在沙子上的人 / sleeper 走近才醒，起身 2 秒 / plate 每次受击减伤
  //    deep 不会游到离水面这么近 / cycle [盘旋秒, 俯冲秒, 休息秒, 盘旋半径, 盘旋高度]：盘旋 → 发亮预警 1 秒 → 俯冲 → 休息 / wantsWeak 你的生命不到一半才俯冲 / push 撞退 ——
  Object.assign(FOES, {
    prowler: { name: '雪爪', foe: true, hostile: true, stealth: 8, lv: 5, hp: 20, dmg: 4, speed: 2, run: 3.9, r: 0.45, h: 0.9, drops: { 132: 2 }, geo: boxes([
      [0.4, 0.4, 1, 0, 0.5, 0, '#eef2f6'], [0.36, 0.36, 0.4, 0, 0.66, 0.62, '#f8fafc'], ...both([0.1, 0.14, 0.08, 0.12, 0.9, 0.7, '#dfe6ee']), ...both([0.05, 0.05, 0.03, 0.09, 0.7, 0.83, '#58c8ff']),
      [0.12, 0.12, 0.5, 0, 0.6, -0.72, '#dfe6ee'], ...[0.34, -0.34].flatMap(z => both([0.13, 0.34, 0.13, 0.14, 0.17, z, '#dfe6ee']))]) },
    worm: { name: '沙虫', foe: true, hostile: true, burrow: true, day: true, kb: 0, lv: 6, hp: 26, dmg: 5, speed: 2.4, run: 3.6, r: 0.45, h: 1.6, drops: { 133: 2 }, geo: boxes([
      [0.6, 0.4, 0.6, 0, 0.2, 0, '#c8a060'], [0.52, 0.4, 0.52, 0, 0.6, 0, '#d4ae70'], [0.46, 0.4, 0.46, 0, 1, 0, '#c8a060'], [0.42, 0.3, 0.42, 0, 1.34, 0.04, '#b88c50'],
      [0.3, 0.1, 0.12, 0, 1.36, 0.26, '#40201a'], ...both([0.05, 0.1, 0.05, 0.1, 1.42, 0.3, '#fffaf0']), ...both([0.05, 0.1, 0.05, 0.1, 1.3, 0.3, '#fffaf0'])]) },
    golem: { name: '岩偶', foe: true, hostile: true, sleeper: 3, day: true, kb: 0.2, lv: 7, hp: 30, dmg: 5, speed: 0.8, run: 1.5, r: 0.6, h: 1.9, drops: { 134: 1 }, geo: boxes([
      [0.9, 0.8, 0.6, 0, 1.1, 0, '#8c8c8a'], [0.5, 0.44, 0.46, 0, 1.72, 0.02, '#9a9a96'], ...both([0.3, 0.9, 0.34, 0.6, 1, 0, '#7c7c7a']), ...both([0.34, 0.7, 0.36, 0.24, 0.35, 0, '#74746f']),
      ...both([0.08, 0.06, 0.03, 0.12, 1.76, 0.25, '#ffb040']), [0.3, 0.2, 0.05, 0.1, 1.2, 0.3, '#6a8a4a']]) },
    sentinel: { name: '黑曜卫士', foe: true, hostile: true, plate: 3, day: true, kb: 0.2, lv: 9, hp: 40, dmg: 7, speed: 1.2, run: 2.2, r: 0.5, h: 1.9, drops: { 135: 1 }, geo: boxes([
      [0.7, 0.8, 0.44, 0, 1.1, 0, '#241c34'], [0.4, 0.4, 0.4, 0, 1.7, 0, '#342a4a'], ...both([0.22, 0.86, 0.26, 0.48, 1.04, 0, '#1a1426']), ...both([0.26, 0.7, 0.28, 0.18, 0.35, 0, '#1a1426']),
      [0.24, 0.06, 0.03, 0, 1.72, 0.21, '#c070ff'], [0.2, 0.2, 0.03, 0, 1.2, 0.23, '#8a4ad0'], ...both([0.12, 0.2, 0.12, 0.3, 1.62, 0, '#4a3a6a'])]) },
    eel: { name: '潜鳗', foe: true, hostile: true, swim: true, deep: 3, day: true, lv: 5, hp: 18, dmg: 4, speed: 1.5, run: 2.4, r: 0.3, h: 0.3, drops: { 136: 1 }, geo: boxes([
      [0.16, 0.18, 0.5, 0, 0, 0.3, '#3a5a4a'], [0.14, 0.16, 0.5, 0, 0, -0.2, '#44685a'], [0.1, 0.12, 0.4, 0, 0, -0.64, '#3a5a4a'], [0.03, 0.1, 0.9, 0, 0.12, -0.1, '#2a4236'],
      [0.14, 0.04, 0.1, 0, -0.06, 0.56, '#f0f0e0'], ...both([0.03, 0.04, 0.04, 0.08, 0.04, 0.48, '#ffd040'])]) },
    serpent: { name: '潮蛇', foe: true, hostile: true, swim: true, cycle: [5, 1.5, 0, 4, -0.5], reach: 1.8, lv: 8, hp: 36, dmg: 6, speed: 3.5, run: 3.6, r: 0.4, h: 0.4, drops: { 137: 2 }, geo: boxes([
      [0.3, 0.3, 0.6, 0, 0, 0.5, '#2a6a8a'], [0.26, 0.26, 0.7, 0, 0, -0.1, '#3484a8'], [0.2, 0.2, 0.7, 0, 0, -0.78, '#2a6a8a'], [0.12, 0.12, 0.5, 0, 0, -1.36, '#3484a8'],
      [0.04, 0.16, 1.6, 0, 0.2, -0.3, '#7ad0e8'], [0.26, 0.06, 0.14, 0, -0.1, 0.84, '#f0f0e0'], ...both([0.04, 0.06, 0.06, 0.14, 0.08, 0.74, '#ffe040'])]) },
    vulture: { name: '沙鹫', foe: true, hostile: true, fly: true, day: true, cycle: [4, 1.5, 0, 5, 6], wantsWeak: true, lv: 5, hp: 16, dmg: 4, speed: 4, run: 6, r: 0.4, h: 0.4, drops: { 138: 2 }, geo: boxes([
      [0.24, 0.22, 0.44, 0, 0, 0, '#6a5038'], [0.14, 0.14, 0.16, 0, 0.12, 0.3, '#d8b8a0'], [0.06, 0.06, 0.12, 0, 0.08, 0.42, '#40342a'], ...both([0.56, 0.04, 0.3, 0.4, 0.04, -0.02, '#57402c']),
      [0.2, 0.06, 0.08, 0, 0.06, 0.2, '#f4ece0'], [0.16, 0.03, 0.2, 0, 0.02, -0.3, '#57402c']]) },
    hawk: { name: '风隼', foe: true, hostile: true, fly: true, day: true, cycle: [3, 1.2, 0, 5, 6], push: 16, lv: 6, hp: 18, dmg: 3, speed: 5, run: 7, r: 0.35, h: 0.35, drops: { 139: 1 }, geo: boxes([
      [0.18, 0.18, 0.4, 0, 0, 0, '#8a9aa8'], [0.14, 0.14, 0.14, 0, 0.08, 0.26, '#a8b8c6'], [0.05, 0.05, 0.1, 0, 0.05, 0.37, '#e8b030'], ...both([0.5, 0.03, 0.2, 0.34, 0.03, 0, '#6c7c8c']),
      ...both([0.2, 0.03, 0.1, 0.66, 0.03, -0.08, '#eef4f8']), [0.12, 0.03, 0.2, 0, 0.02, -0.28, '#6c7c8c']]) },
    shade: { name: '影翼', foe: true, hostile: true, fly: true, cycle: [4, 1.5, 0, 6, 7], lv: 7, hp: 24, dmg: 5, speed: 4.5, run: 6.5, r: 0.45, h: 0.4, drops: { 140: 1 }, geo: boxes([
      [0.22, 0.2, 0.5, 0, 0, 0, '#2a2438'], [0.18, 0.16, 0.18, 0, 0.06, 0.32, '#3a3250'], ...both([0.7, 0.03, 0.4, 0.46, 0.02, 0, '#1c1828']), ...both([0.2, 0.03, 0.2, 0.9, 0.02, -0.14, '#463c62']),
      ...both([0.04, 0.04, 0.03, 0.05, 0.08, 0.42, '#c070ff'])]) },
    roc: { name: '风暴鹏', foe: true, hostile: true, fly: true, day: true, cycle: [4, 2, 5, 6, 6], push: 20, reach: 2.2, scale: 1.8, lv: 10, hp: 60, dmg: 8, speed: 4, run: 6, r: 0.8, h: 0.8, drops: { 141: 1 }, geo: boxes([
      [0.34, 0.3, 0.6, 0, 0, 0, '#40506a'], [0.22, 0.22, 0.22, 0, 0.14, 0.38, '#f0f4f8'], [0.08, 0.08, 0.16, 0, 0.1, 0.54, '#f0c030'], ...both([0.8, 0.05, 0.44, 0.56, 0.04, 0, '#34425a']),
      ...both([0.3, 0.04, 0.24, 1.08, 0.04, -0.1, '#8ad0ff']), [0.26, 0.04, 0.3, 0, 0.02, -0.42, '#34425a'], [0.1, 0.14, 0.2, 0, 0.3, 0.3, '#8ad0ff']]) },
  });
  // 速度：玩家走路 4.6、游泳 2.6。会追人的怪物都比玩家慢，转身跑就能甩开；只有四种猛禽的俯冲（6–7，有发亮预警）和潮蛇的冲刺（3.6）更快。
  let pushX = 0, pushZ = 0;
  // 扑击动作：咬人的那一下身体向前冲出去再收回（0.35 秒），头往下点。返回这一帧前冲的距离
  const lunge = (m, dt) => { m.lunge = Math.max(0, (m.lunge || 0) - dt); return m.lunge > 0 ? Math.sin(Math.PI * (1 - m.lunge / 0.35)) * 0.55 : 0; };
  const poseMob = (m, y, f) => { m.mesh.rotation.order = 'YXZ'; m.mesh.position.set(m.x + Math.sin(m.a) * f, y, m.z + Math.cos(m.a) * f); m.mesh.rotation.y = m.a; m.mesh.rotation.x = f * 0.5; };
  const slowMe = () => { if (!equip.includes(142)) slowUntil = time + 3; };                 // 雪行靴：不会被霜灵减速
  const pushMe = (x, z) => { if (!equip.includes(151)) { pushX = x; pushZ = z; } };          // 风暴冠：不会被撞退
  const seen = m => !m.type.stealth || Math.hypot(m.x - p.x, m.z - p.z) < (selectedItem() === TORCH ? 14 : m.type.stealth); // 雪爪：8 格内才看得见，举着火把 14 格
  let slowUntil = 0; // 游戏时钟的这个时刻之前，玩家移动减半（被霜灵碰到）
  const covered = (x, y, z) => { for (let k = 1; k <= 6; k++) if (solid(world.get(Math.floor(x), Math.floor(y) + k, Math.floor(z)))) return true; return false; }; // 头顶 6 格内有实心方块
  function spawnAt(type, x, y, z) { // 飞的、游的不落在地面上，位置自己指定（建网格的做法和 spawnMob 相同）
    const mesh = new THREE.Group(), mobMat = itemMat.clone(); mobMat.userData.skyExposure = WorldLighting.object(mobMat);
    mesh.scale.setScalar(type.scale || 1); mesh.add(new THREE.Mesh(type.geo, mobMat));
    const legs = (type.legs || []).map(([lx, ly, lz]) => { const l = new THREE.Mesh(type.legGeo, mobMat); l.position.set(lx, ly, lz); mesh.add(l); return l; });
    mesh.updateMatrixWorld(true);
    const extent = new THREE.Box3().setFromObject(mesh);
    const mob = { type, mesh, mobMat, bounds: { min: extent.min.toArray(), max: extent.max.toArray() }, x, y, z, vy: 0, a: Math.random() * 6.283, t: 0, walk: false, flee: 0, hp: type.hp, kx: 0, kz: 0, ground: false, sq: 0, legs, ph: Math.random() * 6, bite: 0, goal: [x, y, z] };
    mesh.position.set(x, y, z); scene.add(mesh); mobs.push(mob);
    return mob;
  }
  function spawnDrifter() { // 每次只试一种，按玩家所在的环境
    const count = t => mobs.filter(m => m.type === t).length, ang = Math.random() * 6.283, d = 8 + Math.random() * 12;
    const x = Math.floor(p.x + Math.sin(ang) * d), z = Math.floor(p.z + Math.cos(ang) * d), h = Core.heightAt(x, z), biome = Core.biomeAt(x, z);
    if (p.y < Core.heightAt(Math.floor(p.x), Math.floor(p.z)) - 3 && covered(p.x, p.y + 1, p.z)) { // 洞蝠：玩家在洞里时，在附近有遮挡的空处出现，最多 3 只
      for (let i = 0; i < 12 && count(FOES.bat) < 3; i++) {
        const bx = p.x + (Math.random() - 0.5) * 16, by = p.y + 1 + Math.random() * 2, bz = p.z + (Math.random() - 0.5) * 16;
        if (Math.hypot(bx - p.x, bz - p.z) > 5 && world.get(Math.floor(bx), Math.floor(by), Math.floor(bz)) === AIR && covered(bx, by, bz)) spawnAt(FOES.bat, bx, by, bz);
      }
      if (p.y <= 12 && !count(FOES.sentinel)) for (let i = 0; i < 20; i++) { // 黑曜卫士：很深的洞里，离玩家 7 格外的一块能站的地面，最多 1 个
        const bx = Math.floor(p.x + (Math.random() - 0.5) * 24), bz = Math.floor(p.z + (Math.random() - 0.5) * 24), by = Math.floor(p.y + (Math.random() - 0.5) * 6), g = k => world.get(bx, by + k, bz);
        if (Math.hypot(bx - p.x, bz - p.z) > 7 && g(0) === AIR && g(1) === AIR && g(2) === AIR && solid(g(-1))) { spawnAt(FOES.sentinel, bx + 0.5, by, bz + 0.5); break; }
      }
      return;
    }
    if (world.get(x, Core.SEA, z) === WATER) {
      if (dayK < 0.1 && Core.SEA - h >= 6 && !count(FOES.serpent) && Math.random() < 0.4) return void spawnAt(FOES.serpent, x + 0.5, Core.SEA - 2, z + 0.5); // 潮蛇：夜晚的深水，最多 1 条
      if (Core.SEA - h >= 4 && count(FOES.eel) < 2) return void spawnAt(FOES.eel, x + 0.5, h + 1.3, z + 0.5);                                              // 潜鳗：深 4 格以上的水底
      if (dayK < 0.1 && count(FOES.jelly) < 2 && Math.random() < 0.5) return void spawnAt(FOES.jelly, x + 0.5, Core.SEA + 0.55, z + 0.5);   // 刺水母：夜晚的水面
      if (Core.SEA - h <= 3 && count(FOES.fish) < 3) for (let i = 0; i < 3 && count(FOES.fish) < 3; i++)                              // 咬咬鱼：浅水，三条一群
        spawnAt(FOES.fish, x + 0.3 + i * 0.2, h + 1.2 + Math.random() * Math.max(0, Core.SEA - h - 0.6), z + 0.5);
      return;
    }
    if (h >= 54 && !count(FOES.roc)) return void spawnAt(FOES.roc, x + 0.5, h + 8, z + 0.5);                                    // 风暴鹏：最高的山顶，全图至多一只
    if (dayK > 0.6 && h >= 45 && count(FOES.hawk) < 2) return void spawnAt(FOES.hawk, x + 0.5, h + 8, z + 0.5);                 // 风隼：白天的高山
    if (dayK > 0.6 && biome === 1 && count(FOES.vulture) < 2) return void spawnAt(FOES.vulture, x + 0.5, h + 10, z + 0.5);      // 沙鹫：白天的沙漠上空
    if (dayK < 0.1 && !count(FOES.shade) && Math.random() < 0.15) return void spawnAt(FOES.shade, x + 0.5, h + 10, z + 0.5);    // 影翼：夜里偶尔出现，哪里都可能
    if (dayK > 0.6 && biome === 0 && h > Core.SEA + 1 && count(FOES.crow) < 2) return void spawnAt(FOES.crow, x + 0.5, h + 7 + Math.random() * 3, z + 0.5); // 啄鸦：白天草原上空
    if (dayK < 0.1 && biome === 2 && count(FOES.wisp) < 2) return void spawnAt(FOES.wisp, x + 0.5, h + 2.5, z + 0.5);                 // 霜灵：雪原的夜晚
    if (dayK < 0.1 && count(FOES.moth) < 3) { // 灯蛾：夜里附近有灯就绕着灯飞；没有灯但你举着火把，就绕着你飞
      const lamp = [...lighting.lampChunks.values()].flat().filter(l => Math.hypot(l.x - p.x, l.z - p.z) < 24)[0];
      if (lamp) spawnAt(FOES.moth, lamp.x, lamp.y + 1.2, lamp.z).home = [lamp.x, lamp.y + 0.8, lamp.z];
      else if (selectedItem() === TORCH) spawnAt(FOES.moth, p.x + Math.sin(ang) * 6, p.y + 2, p.z + Math.cos(ang) * 6);
    }
  }
  function drift(m, dt, q, bite) { // 会飞和会游的：没有重力，朝一个目标点靠拢。飞的不进实心方块，游的不出水，霜灵什么都能穿
    const T = m.type, dd = Math.hypot(m.x - q.x, m.y - (q.y + 1), m.z - q.z), torch = q.held === TORCH;
    if (!T.day && dayK > 0.5) { m.hp = 0; return; }                                                   // 夜行的天亮消散
    const food = [MEAT, 32, 112, 115].includes(q.held), inWater = world.get(Math.floor(q.x), Math.floor(q.y + 0.5), Math.floor(q.z)) === WATER;
    let mean = !q.dn && !!T.hostile && !T.drift && dd < 14 && !(T.wantsFood && !food) && !(T.swim && !inWater); // 啄鸦只在你拿着食物时来；鱼只在你下水时追
    const scared = (T.fearsLight && torch && dd < 6) || (q.dn && !!T.hostile && dd < 10); /* 对手倒下了：飞走 */                                                   // 洞蝠、霜灵怕火把
    const near = j => { const hx = m.x - q.x, hz = m.z - q.z, hd = Math.hypot(hx, hz) || 1, r = (T.reach || 1.3) - 0.15; return [q.x + hx / hd * r + (Math.random() - 0.5) * j * 0.4, q.y + 1 + (Math.random() - 0.5) * j, q.z + hz / hd * r + (Math.random() - 0.5) * j * 0.4]; }; // 扑向玩家时停在够得着的距离上，不钻进身体里
    let warn = false;
    if (T.cycle && !q.dn && dd < 24 && !(T.swim && !inWater)) { // 盘旋 → 发亮预警 1 秒 → 俯冲 → 休息
      const [orbit, dive, rest, r, up] = T.cycle;
      m.cy = ((m.cy || 0) + dt) % (orbit + 1 + dive + rest);
      if (T.wantsWeak && !q.low && m.cy > orbit - 0.2) m.cy = 0;                                       // 沙鹫：你的生命不到一半才下来，否则一直盘旋
      const c = m.cy; warn = c >= orbit && c < orbit + 1; mean = c >= orbit + 1 && c < orbit + 1 + dive;
      m.t = 1; m.goal = mean ? near(0) : c < orbit + 1 ? [q.x + Math.sin(m.ph * 0.07) * r, q.y + 1 + up, q.z + Math.cos(m.ph * 0.07) * r] : [m.x, m.y, m.z];
    }
    m.warn = warn;
    if ((m.t -= dt) < 0) { // 隔一小会儿换一次目标点
      m.t = T.erratic ? 0.4 + Math.random() * 0.5 : 1 + Math.random() * 2;
      const j = T.erratic ? 1.6 : 0.4, rnd = () => (Math.random() - 0.5) * 2, a = Math.random() * 6.283;
      if (scared) m.goal = [m.x + (m.x - q.x) * 2, m.y + 1, m.z + (m.z - q.z) * 2];
      else if (mean) m.goal = near(j);
      else if (m.home) m.goal = [m.home[0] + Math.sin(a) * 1.5, m.home[1] + 0.5 + rnd() * 0.6, m.home[2] + Math.cos(a) * 1.5];
      else if (T.likesLight && torch) m.goal = [q.x + Math.sin(a) * 1.8, q.y + 1.6 + rnd() * 0.5, q.z + Math.cos(a) * 1.8];
      else m.goal = [m.x + rnd() * 4, m.y + (T.drift ? 0 : rnd() * (T.swim ? 0.6 : 1.5)), m.z + rnd() * 4];
    }
    const gx = m.goal[0] - m.x, gy = m.goal[1] - m.y, gz = m.goal[2] - m.z, gl = Math.hypot(gx, gy, gz) || 1, sp = Math.min((mean || scared ? T.run : T.speed) * dt, gl);
    const nx = m.x + gx / gl * sp + m.kx * dt, ny = m.y + gy / gl * sp, nz = m.z + gz / gl * sp + m.kz * dt, free = (x, y, z) => { const cell = world.get(Math.floor(x), Math.floor(y), Math.floor(z)); return T.ghost || (T.swim ? cell === WATER && !(T.deep && y > Core.SEA - T.deep) : cell === AIR || Core.PASS.has(cell)); };
    const to = free(nx, ny, nz) ? [nx, ny, nz] : free(nx, m.y, nz) ? [nx, m.y, nz] : free(m.x, ny, m.z) ? [m.x, ny, m.z] : null; // 正前方被挡（树冠、山壁）：先试只平移，再试只升降
    if (to) { if (sp > 1e-4 && (to[0] !== m.x || to[2] !== m.z)) m.a = Math.atan2(to[0] - m.x, to[2] - m.z); m.x = to[0]; m.y = to[1]; m.z = to[2]; }
    else m.t = 0;                                                                                     // 去不了：马上换个目标
    const drag = Math.exp(-6 * dt); m.kx *= drag; m.kz *= drag;
    if (T.hostile && !q.dn && (mean || T.drift) && dd < (T.reach || 1.3) && (m.bite -= dt) < 0) { m.bite = 1; m.lunge = 0.35; if (!T.drift) m.a = Math.atan2(q.x - m.x, q.z - m.z); bite(q, T.dmg, T.slows, T.push && [(q.x - m.x) / (dd || 1) * T.push, (q.z - m.z) / (dd || 1) * T.push]); } // 碰到才受伤；霜灵再加 3 秒减速
    if (T.cave && !covered(m.x, m.y, m.z)) { if ((m.out = (m.out || 0) + dt) > 4) m.hp = 0; } else m.out = 0; // 洞蝠离开洞穴 4 秒就散
    m.sq -= dt; m.ph += dt * 10;
    m.mobMat.emissive.setRGB(Math.max(0,m.sq)/.24*.85,0,0); if (warn && m.sq <= 0) m.mobMat.emissive.setHex(0xaa8800); // 俯冲前发亮
    poseMob(m, m.y + Math.sin(m.ph) * (T.swim ? 0.02 : 0.06), T.drift ? 0 : lunge(m, dt)); m.mesh.rotation.z = T.fly ? Math.sin(m.ph * 1.7) * 0.25 : 0;
  }
  function spawnFoe() { // 在玩家 14–28 格外挑一个位置，按那里的地形和现在的时间决定出什么
    const ang = Math.random() * 6.283, d = 14 + Math.random() * 14, x = Math.floor(p.x + Math.sin(ang) * d), z = Math.floor(p.z + Math.cos(ang) * d);
    let y = H - 1; while (y > 0 && (world.get(x, y, z) === AIR || Core.PASS.has(world.get(x, y, z)))) y--;
    const top = world.get(x, y, z), count = t => mobs.filter(m => m.type === t).length;
    const pick = [];
    const shore = [3, 6].some(r => [[r, 0], [-r, 0], [0, r], [0, -r]].some(([dx, dz]) => world.get(x + dx, Core.SEA, z + dz) === WATER)); // 6 格内有水面
    const trunk = () => { for (let dx = -3; dx <= 3; dx++) for (let dz = -3; dz <= 3; dz++) if (world.get(x + dx, y + 1, z + dz) === 6) return true; return false; }; // 3 格内有树干
    if (dayK < 0.45 && shore && (top === 1 || top === 4) && Core.biomeAt(x, z) === 0) pick.push(FOES.blob);               // 泥团：黄昏和夜晚，草原的水边（草地或沙滩）
    if (dayK < 0.45 && top === 4 && Core.biomeAt(x, z) === 1) pick.push(FOES.scorpion);                                  // 沙蝎：黄昏和夜晚，沙漠
    if (top === 1 && count(FOES.vine) < 2 && trunk()) pick.push(FOES.vine);                                               // 缠藤：树下，任何时间
    if (dayK > 0.6 && top === 1 && count(FOES.boar) < 2) pick.push(FOES.boar);                                            // 鬃猪：白天的草原
    if (dayK < 0.6 && top === 4 && y <= Core.SEA + 1) pick.push(FOES.crab);                                              // 钳蟹：黄昏和夜晚的海滩
    if (dayK < 0.1 && Core.biomeAt(x, z) === 2 && count(FOES.prowler) < 2) pick.push(FOES.prowler);                      // 雪爪：雪原的夜晚
    if (top === 4 && Core.biomeAt(x, z) === 1 && Math.hypot(x, z) > 150 && !count(FOES.worm)) pick.push(FOES.worm);       // 沙虫：离出生点 150 格外的沙漠
    if (top === 3 && y >= 40 && count(FOES.golem) < 2) pick.push(FOES.golem);                                             // 岩偶：山上的岩石地面
    if (dayK < 0.1) pick.push(WOLF);                                                                                      // 影狼：夜晚，哪里都有
    const ok = pick.filter(t => count(t) < 3); if (!ok.length) return;
    const n = mobs.length; spawnMob(ok[Math.floor(Math.random() * ok.length)], { x, z });
    if (mobs.length > n) { mobs[n].t = 0; mobs[n].a = ang; }
  }
  const mobs = []; let spawnT = 0;
  function spawnMob(force,point) {
    const ang = Math.random() * 6.283, d = 14 + Math.random() * Math.min(16, R * CH - 22);
    const x = point ? point.x : Math.floor(p.x + Math.sin(ang) * d), z = point ? point.z : Math.floor(p.z + Math.cos(ang) * d);
    let y = H - 1; while (y > 0 && world.get(x, y, z) === AIR) y--;
    const top = world.get(x, y, z), kinds = TYPES.filter(t => t.on === top); // 最上面一块决定刷什么（树冠、水、岩石不刷）
    if (force ? top === AIR || top === WATER || top === 7 : !kinds.length || (top === 4 && Core.biomeAt(x, z) !== 1)) return; // 沙子只认沙漠，海滩不算
    const type = force || kinds[Math.random() < 0.6 ? 0 : 1], mesh = new THREE.Group();
    mesh.scale.setScalar(type.scale || 1);
    const mobMat=itemMat.clone();mobMat.userData.skyExposure=WorldLighting.object(mobMat);
    mesh.add(new THREE.Mesh(type.geo, mobMat));
    const legs = (type.legs || []).map(([lx, ly, lz]) => { const l = new THREE.Mesh(type.legGeo, mobMat); l.position.set(lx, ly, lz); mesh.add(l); return l; });
    for (const c of mesh.children) c.castShadow = true;
    mesh.updateMatrixWorld(true);const extent=new THREE.Box3().setFromObject(mesh);
    const bounds={min:extent.min.toArray(),max:extent.max.toArray()};
    const mob={ type, mesh, mobMat, bounds, x: x + 0.5, y: y + 1, z: z + 0.5, vy: 0, a: point ? Math.PI : ang, t: point ? 60 : 0, walk: false, flee: 0, hp: type.hp, kx: 0, kz: 0, ground: false, sq: 0, legs, ph: 0, bite: 0 };
    if(MobPhysics.intersects(mob,(x,y,z)=>world.get(x,y,z))){mobMat.dispose();return;}
    mesh.position.set(mob.x,mob.y,mob.z);scene.add(mesh);mobs.push(mob);
  }
  // —— 联机 ——（net.js 调用）主机把全部生物的状态报出去；访客照着建、挪、删
  const MOBTYPE = {}; let mobSeq = 1;
  function mobState() { return mobs.map(m => [m.id || (m.id = mobSeq++), m.type.name, +m.x.toFixed(2), +(m.y + (m.off || 0)).toFixed(2), +m.z.toFixed(2), +m.a.toFixed(2), m.hp, m.sq > 0 ? 1 : m.lunge > 0.2 ? 3 : m.warn ? 2 : 0]); }
  function mobSync(list) {
    if (!MOBTYPE.ready) { for (const T of [...TYPES, WOLF, ...Object.values(FOES)]) MOBTYPE[T.name] = T; MOBTYPE.ready = true; }
    const seen = new Set();
    for (const [id, name, x, y, z, a, hp, sq] of list) {
      seen.add(id);
      let m = mobs.find(m => m.id === id);
      if (!m) { if (!MOBTYPE[name]) continue; m = spawnAt(MOBTYPE[name], x, y, z); m.id = id; m.a = a; }
      m.to = [x, y, z, a]; m.hp = hp; if (sq === 1) m.sq = 0.15; m.warn = sq === 2; if (sq === 3 && !(m.lunge > 0)) m.lunge = 0.35;
    }
    for (const m of mobs) if (!seen.has(m.id)) m.hp = 0;
    schedule();
  }
  function mirrorMobs(dt) {
    for (let i = mobs.length - 1; i >= 0; i--) {
      const m = mobs[i], T = m.type;
      if (m.hp <= 0 || !m.to) { scene.remove(m.mesh); m.mobMat.dispose(); mobs.splice(i, 1); continue; }
      const k = Math.min(1, dt * 12), moved = Math.hypot(m.to[0] - m.x, m.to[2] - m.z);
      m.x += (m.to[0] - m.x) * k; m.y += (m.to[1] - m.y) * k; m.z += (m.to[2] - m.z) * k; m.a = m.to[3];
      m.sq -= dt; m.ph += (T.fly || T.swim ? 10 : moved > 0.02 ? 8 : 0) * dt;
      m.mobMat.emissive.setRGB(Math.max(0,m.sq)/.24*.85,0,0); if (m.warn && m.sq <= 0) m.mobMat.emissive.setHex(0xaa8800); m.mesh.visible = seen(m);
      m.legs.forEach((l, j) => { l.rotation.x = moved > 0.02 ? Math.sin(m.ph + (j % 3 ? Math.PI : 0)) * 0.55 : 0; });
      poseMob(m, m.y + (T.fly ? Math.sin(m.ph) * 0.06 : 0), lunge(m, dt)); m.mesh.rotation.z = T.fly ? Math.sin(m.ph * 1.7) * 0.25 : 0;
    }
  }
  // 打中一只生物：扣血、击退；死了返回掉落物 { 物品 id: 数量 }（只返回一次）。主机自己打、访客报来的命中都走这里
  function strike(m, dealt, dx, dz) {
    const kb = m.type.kb == null ? 1 : m.type.kb;
    m.hp -= dealt; m.flee = m.type.foe ? 0 : 4; if (m.type.charge) m.angry = 6; m.sq = 0.15; if (kb) { m.vy = 5; m.ground = false; } m.kx = dx * 6 * kb; m.kz = dz * 6 * kb;
    if (m.hp > 0 || m.looted) return null;
    m.looted = true;
    const loot = { ...(m.type.drops || {}) }; if (m.type.meat) loot[MEAT] = m.type.meat; if (m.type.hide) loot[HIDE] = m.type.hide;
    return loot;
  }
  function mobHit(id, dealt, dx, dz) { const m = mobs.find(m => m.id === id && m.hp > 0); return m ? { loot: strike(m, dealt, dx, dz), sad: !!m.type.sad } : null; }
  function takeLoot(loot, sad) { for (const id in loot) give(+id, loot[id]); if (sad) Lang.say('Oh no. Poor moth.', false, 1.4); }
  function tickMobs(dt) {
    if (window.Net && Net.guest) return mirrorMobs(dt);                       // 联机访客：生物由主机计算，这里只显示
    p.held = selectedItem(); p.cloak = equip.includes(150) ? 2 : equip.includes(47) ? 1 : 0; p.low = hp < MAXHP / 2; p.dn = dead;                        // 怪物看的是“最近的那个玩家”，联机时可能是别人
    const everyone = window.Net ? [p, ...Net.others()] : [p];
    const alive = everyone.filter(e => !e.dn), targets = alive.length ? alive : everyone; /* 倒下的玩家不算目标；全都倒下了才看倒下的（只为算距离，不会再咬） */
    const near = m => targets.reduce((a, b) => Math.hypot(b.x - m.x, b.z - m.z) < Math.hypot(a.x - m.x, a.z - m.z) ? b : a);
    const bite = (q, d, slow, push) => { if (q === p) { hurt(d); if (slow) slowMe(); if (push) pushMe(push[0], push[1]); } else Net.hurt(q.id, d, slow, push); };
    if (!animalPreview && (spawnT -= dt) < 0) { // 夜里优先补影狼（最多 3 只），其余时间补普通动物（最多 8 只）
      spawnT = 1.5; const c = everyone[Math.floor(Math.random() * everyone.length)], keep = [p.x, p.y, p.z]; p.x = c.x; p.y = c.y; p.z = c.z; // ponytail: 刷怪函数都围着 p 找位置，联机时临时把 p 挪到被选中的玩家那里，刷完挪回来
      const foes = mobs.filter(m => m.type.foe).length;
      if (foes < 6) { spawnFoe(); spawnDrifter(); } // 怪物同时最多 6 只，同一种最多 3 只
      if (mobs.length - foes < 8) spawnMob();       // 普通动物最多 8 只
      p.x = keep[0]; p.y = keep[1]; p.z = keep[2];
    }
    for (let i = mobs.length - 1; i >= 0; i--) {
      const m = mobs[i], q = near(m);
      if (m.hp <= 0 || Math.hypot(m.x - q.x, m.z - q.z) > R * CH + 8 || m.y < -5) { scene.remove(m.mesh); m.mobMat.dispose(); mobs.splice(i, 1); continue; }
      if (m.type.fly || m.type.swim) { drift(m, dt, q, bite); continue; }
      const oldAngle=m.a;
      if ((m.t -= dt) < 0) { m.t = 1.5 + Math.random() * 3; m.walk = Math.random() < 0.65; m.a = Math.random() * 6.283; } // 闲逛
      m.detour = Math.max(0, (m.detour || 0) - dt);                                                                    // 绕路期间不被逃跑/追击的朝向覆盖
      if (m.flee > 0) { m.flee -= dt; m.walk = true; if (!m.detour) m.a = Math.atan2(m.x - q.x, m.z - q.z); }                        // 挨打后逃离玩家
      let chase = false, back = false; const stand = 1 + (m.type.r || 0.4); // 和玩家保持的距离：身体前沿离你大约一格
      if (m.type.foe) {
        const T = m.type, dd = Math.hypot(m.x - q.x, m.z - q.z);
        if (q.dn && dd < 10 && !T.still) m.flee = 0.5;                                        // 对手已经倒下：不再攻击，转身走开
        if (T.charge && dd < T.charge) m.angry = 3;                                            // 鬃猪：靠近到 4 格内就发怒 3 秒
        m.angry = Math.max(0, (m.angry || 0) - dt);
        if (T.sleeper && !m.awake) { if (m.wake) { if ((m.wake -= dt) <= 0) m.awake = true; } else if (dd < T.sleeper) m.wake = 2; m.walk = false; m.t = 9; } // 岩偶：走到 3 格内才醒，起身要 2 秒
        if (T.burrow) m.up = dd < 2.5 ? (m.up || 0) + dt : 0;                                   // 沙虫：到你身边才钻出来，钻出 1 秒后才咬
        const onSand = !T.burrow || world.get(Math.floor(q.x), Math.floor(q.y - 0.5), Math.floor(q.z)) === 4; // 你站在岩石或砖上它上不来
        const mean = !q.dn && (T.hostile || m.angry > 0) && !(T.sleeper && !m.awake) && onSand && !(T.burrow && dd < 2.5 && m.up < 1),
          sight = q.cloak === 2 ? 12 : T === WOLF && q.cloak ? 8 : 18; // 影行斗篷：所有怪物 12 格外不发现你 // 穿着夜行斗篷，影狼 8 格外不发现你
        if (!T.day && dayK > 0.5) m.hp = 0;                                                    // 夜行的怪物天亮消散
        else if (T.still) { m.walk = false; m.t = 9; }                                         // 缠藤不会走
        else if (mean && dd < sight) { // 发现玩家就追；追到身前一格停下，不钻到脚底下；被挤得太近就退开
          chase = true; if (!m.detour) m.a = Math.atan2(q.x - m.x, q.z - m.z);
          m.walk = dd > stand || dd < stand - 0.4; back = dd < stand - 0.4; if (!m.walk) m.t = Math.max(m.t, 0.5);
        }
        if (mean && dd < (T.still ? 1.6 : stand + 0.45) && Math.abs(m.y - q.y) < 2 && (m.bite -= dt) < 0) { m.bite = 1; m.lunge = 0.35; bite(q, T.dmg || 3); } // 够得着就扑一下，每秒一次
      }
      const sp = m.walk ? (back ? -m.type.speed : m.flee > 0 || chase ? m.type.run : m.type.speed) : 0;
      const get=(x,y,z)=>world.get(x,y,z);
      if(MobPhysics.intersects(m,get))m.a=oldAngle; // 转身时头尾也不能旋进墙里
      MobPhysics.step(m,Math.sin(m.a)*sp+m.kx,Math.cos(m.a)*sp+m.kz,dt,get,m.type.hop);
      const drag=Math.exp(-6*dt);m.kx*=drag;m.kz*=drag;
      if(m.turnBlocked){ // 被挡住：选一个走得通的朝向并保持一小段时间；四面都不通就原地歇着。不再每帧随机换向（那会原地转圈）
        m.turnBlocked=false;const a=MobPhysics.freeHeading(m,get);
        if(a===null){m.walk=false;m.t=1+Math.random()*2;}else{m.a=a;m.detour=.8;m.t=Math.max(m.t,1);}
      }
      m.sq -= dt; m.ph += sp * dt * 5;
      m.mobMat.emissive.setRGB(Math.max(0,m.sq)/.24*.85,0,0);
      m.legs.forEach((l, i) => { l.rotation.x = sp ? Math.sin(m.ph + (i % 3 ? Math.PI : 0)) * 0.55 : 0; }); // 对角的腿同相
      m.off = m.type.burrow && !(m.up > 0) ? -1.2 : 0;                                         // 沙虫在沙下时只露出一个头
      poseMob(m, m.y + m.off, lunge(m, dt)); m.mesh.scale.y = (m.sq > 0 ? 0.8 : 1) * (m.type.sleeper && !m.awake && !m.wake ? 0.5 : 1) * (m.type.scale || 1);
      m.mesh.visible = seen(m);
    }
  }
  function attack() { // 准星射线对动物包围盒；比方块近才算打中。打中返回 true
    if(!hotbarActive)return false;
    const o = [p.x, p.y + EYE, p.z], d = lookDir(), h = aim();
    let best = null, bt = Math.min(4, h ? h.t : 4);
    for (const m of mobs) {
      if(m.hp<=0)continue;
      const t=MobPhysics.ray(m,o,d,bt);
      if(t!==null && (!h||t<h.t-1e-4)){best=m;bt=t;}
    }
    const rival = window.Net && Net.pkTarget(o, d, bt);                        // 联机且主机允许互相攻击：准星上更近的是别的玩家
    if (rival) { if (attackCooldown > 0) return true; attackCooldown = .4; swing = 0.3; const dealt = DMG[selectedItem()] || 1; Net.pkHit(rival.id, dealt);
      hitNotice.textContent = `${rival.name} −${dealt}`; hitNoticeTime = .9; hitNotice.style.display = 'block'; return true; }
    if (!best) return false;
    if(attackCooldown>0)return true;
    attackCooldown=.4;
    const front = best.type.shell && d[0] * Math.sin(best.a) + d[2] * Math.cos(best.a) < -0.3;   // 钳蟹：迎着它的正面打，只掉 1 点
    let dealt = front ? 1 : (DMG[selectedItem()] || 1) * (best.type.weak === selectedItem() ? 2 : 1); // weak：这种工具对它伤害加倍
    if (best.type.plate && ![28, 29].includes(selectedItem())) dealt = Math.max(1, dealt - best.type.plate); // 黑曜卫士：每下先减 3 点；岩心镐和黑曜剑不受影响
    swing = 0.3;
    if (window.Net && Net.guest) { best.sq = 0.15; best.hp -= dealt; Net.hit(best.id, dealt, d[0], d[2]); } // 访客：报给主机，掉落由主机发回来
    else { const loot = strike(best, dealt, d[0], d[2]); if (loot) takeLoot(loot, best.type.sad); }
    hitNotice.textContent=`${Lang.mob(best.type.name)}${best.type.lv ? ' Lv ' + best.type.lv : ''} −${dealt} · ${Math.max(0,best.hp)}/${best.type.hp}`; // 名字、等级、这一下的伤害、剩余生命
    hitNoticeTime=.9;hitNotice.style.display='block';
    return true;
  }

  // ---- UI：快捷栏 + 背包 ----
  // 工具/武器/掉落物的模型（握柄朝下）：手里拿的 3D 模型和快捷栏图标都由同一份方块列表生成
  const WOOD = '#8a5a2c', WOOD2 = '#6e4420', IRON = '#9a968e', EDGE = '#bcb8ae', STEEL = '#6c6a66', GOLD = '#c9a23a'; // 默认是石质的灰
  const TOOLS = {
    [PICK]: [[0.05, 0.62, 0.05, 0, 0.31, 0, WOOD], [0.07, 0.1, 0.22, 0, 0.62, 0, STEEL], ...[1, -1].flatMap(s => [
      [0.06, 0.08, 0.16, 0, 0.6, s * 0.18, IRON], [0.05, 0.07, 0.12, 0, 0.56, s * 0.3, IRON], [0.04, 0.06, 0.08, 0, 0.51, s * 0.38, EDGE]])],
    [AXE]: [[0.05, 0.66, 0.05, 0, 0.33, 0, WOOD], [0.07, 0.14, 0.1, 0, 0.56, 0, STEEL], [0.06, 0.2, 0.12, 0, 0.56, 0.1, IRON],
      [0.05, 0.26, 0.08, 0, 0.56, 0.19, IRON], [0.03, 0.3, 0.04, 0, 0.56, 0.25, EDGE]],
    [SHOVEL]: [[0.045, 0.6, 0.045, 0, 0.3, 0, WOOD], [0.14, 0.04, 0.05, 0, 0.01, 0, WOOD2], [0.07, 0.08, 0.05, 0, 0.61, 0, STEEL],
      [0.2, 0.2, 0.025, 0, 0.74, 0, IRON], [0.14, 0.06, 0.025, 0, 0.87, 0, IRON], [0.07, 0.04, 0.025, 0, 0.92, 0, EDGE]],
    [SWORD]: [[0.07, 0.05, 0.07, 0, 0, 0, GOLD], [0.045, 0.18, 0.045, 0, 0.11, 0, WOOD2], [0.26, 0.045, 0.07, 0, 0.22, 0, GOLD],
      [0.09, 0.52, 0.025, 0, 0.5, 0, IRON], [0.025, 0.5, 0.032, 0, 0.5, 0, EDGE], [0.06, 0.06, 0.025, 0, 0.79, 0, IRON], [0.03, 0.05, 0.025, 0, 0.84, 0, EDGE]],
    38: [[0.36, 0.05, 0.2, 0.06, 0.44, 0, '#2a2230'], [0.1, 0.3, 0.04, -0.14, 0.44, 0, '#463a4e'], [0.16, 0.05, 0.12, 0.1, 0.3, 0, '#3a3040']],                 // 蝠翼
    39: [[0.05, 0.62, 0.03, 0, 0.42, 0, '#efe6d6'], [0.16, 0.36, 0.03, 0.02, 0.54, 0, '#1c1a22'], [0.1, 0.14, 0.03, 0.01, 0.3, 0, '#26232e']],                  // 黑羽
    48: [[0.4, 0.16, 0.2, 0, 0.6, 0, '#463a4e'], [0.22, 0.3, 0.2, 0.22, 0.38, 0, '#2a2230'], [0.22, 0.3, 0.2, -0.22, 0.38, 0, '#2a2230'], [0.1, 0.1, 0.2, 0, 0.72, 0, '#e8d6b4']], // 滑翔披风
    49: [[0.05, 0.6, 0.03, 0, 0.44, 0, '#1c1a22'], [0.12, 0.3, 0.03, 0.03, 0.56, 0, '#26232e'], [0.03, 0.1, 0.03, 0, 0.1, 0, '#c9a23a']],                       // 羽毛笔
    110: [[0.1, 0.1, 0.1, -0.1, 0.34, 0, '#fff0a0'], [0.12, 0.12, 0.1, 0.06, 0.44, 0, '#ffe060'], [0.08, 0.08, 0.1, -0.02, 0.58, 0, '#fff8c8'], [0.06, 0.06, 0.1, 0.14, 0.62, 0, '#ffe890']], // 荧粉
    111: [[0.12, 0.4, 0.1, 0, 0.44, 0, '#bfe6ff'], [0.1, 0.24, 0.1, -0.12, 0.36, 0, '#8fd0ff'], [0.1, 0.2, 0.1, 0.12, 0.34, 0, '#e8f6ff']],                      // 霜晶
    112: [[0.4, 0.18, 0.1, 0, 0.44, 0, '#7a9aa8'], [0.1, 0.24, 0.1, -0.26, 0.44, 0, '#5a7a88'], [0.04, 0.05, 0.11, 0.12, 0.47, 0, '#1c1410']],                   // 生鱼
    113: [[0.32, 0.2, 0.1, 0, 0.52, 0, '#ff9ad8'], [0.05, 0.22, 0.1, -0.1, 0.3, 0, '#e070c0'], [0.05, 0.22, 0.1, 0.1, 0.3, 0, '#e070c0'], [0.05, 0.18, 0.1, 0, 0.32, 0, '#e070c0']], // 水母胶
    114: [[0.4, 0.2, 0.1, 0, 0.42, 0, '#c8553a'], [0.3, 0.1, 0.1, 0, 0.57, 0, '#d86a4a'], [0.08, 0.08, 0.1, 0.2, 0.3, 0, '#c8553a'], [0.08, 0.08, 0.1, -0.2, 0.3, 0, '#c8553a']], // 蟹壳
    115: [[0.3, 0.2, 0.1, 0, 0.42, 0, '#f6ede2'], [0.3, 0.06, 0.11, 0, 0.55, 0, '#d86a4a']],                                                                    // 蟹肉
    120: [[0.36, 0.22, 0.3, 0, 0.5, 0, '#c8553a'], [0.44, 0.07, 0.3, 0, 0.37, 0, '#a8402a'], [0.08, 0.12, 0.3, 0.12, 0.66, 0, '#d86a4a'], [0.08, 0.12, 0.3, -0.12, 0.66, 0, '#d86a4a']], // 蟹壳盔
    27: [[0.045, 0.8, 0.045, 0, 0.4, 0, WOOD], [0.07, 0.06, 0.07, 0, 0.8, 0, WOOD2], [0.06, 0.2, 0.03, 0, 0.92, 0, '#efe6d6'], [0.03, 0.08, 0.03, 0, 1.04, 0, '#fffaf0']], // 长矛：木杆 + 獠牙尖
    33: [[0.34, 0.24, 0.3, 0, 0.36, 0, '#b0705a'], [0.24, 0.12, 0.22, 0, 0.54, 0, '#c08468']],                                                                   // 黏土
    34: [[0.36, 0.2, 0.1, 0, 0.4, 0, '#c9a46a'], [0.28, 0.12, 0.1, 0, 0.56, 0, '#dcb87c'], [0.16, 0.08, 0.1, 0, 0.66, 0, '#b08a50']],                           // 蝎壳
    35: [[0.06, 0.5, 0.06, -0.1, 0.42, 0, '#4e8a38'], [0.06, 0.4, 0.06, 0.06, 0.4, 0, '#3e6a2c'], [0.2, 0.06, 0.06, 0, 0.62, 0, '#4e8a38'], [0.1, 0.1, 0.06, 0.14, 0.24, 0, '#5ea040']], // 藤条
    36: [[0.12, 0.2, 0.1, -0.04, 0.3, 0, '#efe6d6'], [0.1, 0.2, 0.1, 0.04, 0.48, 0, '#f6f0e2'], [0.07, 0.14, 0.08, 0.1, 0.63, 0, '#fffaf0']],                    // 獠牙
    37: [[0.4, 0.3, 0.08, 0, 0.42, 0, '#2e2a36'], [0.3, 0.2, 0.09, 0, 0.42, 0, '#46405a'], [0.1, 0.1, 0.08, 0.2, 0.62, 0, '#2e2a36'], [0.1, 0.1, 0.08, -0.2, 0.62, 0, '#2e2a36']], // 影毛
    46: [0.12, -0.12].flatMap(x => [[0.15, 0.28, 0.14, x, 0.5, 0, '#c9a46a'], [0.2, 0.11, 0.14, x + 0.025, 0.32, 0, '#b08a50']]),                                 // 蝎壳靴
    47: [[0.36, 0.44, 0.2, 0, 0.42, 0, '#2e2a36'], [0.13, 0.16, 0.2, 0.24, 0.56, 0, '#46405a'], [0.13, 0.16, 0.2, -0.24, 0.56, 0, '#46405a'], [0.2, 0.12, 0.2, 0, 0.7, 0, '#201c28']], // 夜行斗篷
    32: [[0.16, 0.16, 0.16, -0.09, 0.38, 0, '#c0304a'], [0.16, 0.16, 0.16, 0.09, 0.42, 0, '#d2445c'], [0.14, 0.14, 0.14, 0, 0.54, 0, '#ac2440'], [0.04, 0.1, 0.04, 0, 0.66, 0, '#4a8a3a']], // 浆果
    [MEAT]: [[0.05, 0.1, 0.05, 0, 0.2, 0, '#efe6d6'], [0.1, 0.06, 0.07, 0, 0.14, 0, '#efe6d6'], [0.3, 0.3, 0.12, 0, 0.42, 0, '#b8463c'],
      [0.22, 0.22, 0.13, 0, 0.42, 0, '#d0655a'], [0.3, 0.05, 0.125, 0, 0.59, 0, '#f1d9c8']],
    [TORCH]: [[0.05, 0.5, 0.05, 0, 0.25, 0, WOOD], [0.09, 0.1, 0.09, 0, 0.54, 0, '#3a2a1a'], [0.08, 0.12, 0.08, 0, 0.64, 0, '#ff9a20'], [0.045, 0.1, 0.045, 0, 0.73, 0, '#ffe890']],
  };
  const LEA = '#9a6a3e', LEA2 = '#74502e', PLATE = '#cdd6e2', PLATE2 = '#8f9cac';
  const helm = (c, d) => [[0.34, 0.22, 0.3, 0, 0.5, 0, c], [0.42, 0.07, 0.3, 0, 0.37, 0, d], [0.1, 0.1, 0.3, 0, 0.65, 0, d]];
  const vest = (c, d) => [[0.34, 0.42, 0.2, 0, 0.42, 0, c], [0.13, 0.16, 0.2, 0.23, 0.55, 0, d], [0.13, 0.16, 0.2, -0.23, 0.55, 0, d], [0.34, 0.07, 0.2, 0, 0.23, 0, d]];
  const boot = (c, d) => [0.12, -0.12].flatMap(x => [[0.15, 0.28, 0.14, x, 0.5, 0, c], [0.2, 0.11, 0.14, x + 0.025, 0.32, 0, d]]);
  const legs = (c, d) => [[0.34, 0.12, 0.2, 0, 0.64, 0, d], ...[0.1, -0.1].map(x => [0.14, 0.42, 0.2, x, 0.38, 0, c])];
  const STRAW = '#c9b25a', STRAW2 = '#948038', ALLOY = '#e6c27a', ALLOY2 = '#a8803a';
  Object.assign(TOOLS, { 121: helm(STRAW, STRAW2), 122: vest(STRAW, STRAW2), 123: legs(STRAW, STRAW2), 124: boot(STRAW, STRAW2), 125: legs(LEA, LEA2), 126: legs(PLATE, PLATE2),
    127: helm(ALLOY, ALLOY2), 128: vest(ALLOY, ALLOY2), 129: legs(ALLOY, ALLOY2), 131: boot(ALLOY, ALLOY2),
    130: [[0.4, 0.14, 0.2, 0, 0.36, 0, ALLOY2], [0.32, 0.12, 0.2, 0, 0.48, 0, ALLOY], [0.1, 0.04, 0.2, -0.06, 0.55, 0, '#fff2c8']] }); // 合金锭
  Object.assign(TOOLS, { 40: helm(LEA, LEA2), 41: vest(LEA, LEA2), 42: boot(LEA, LEA2), 43: helm(PLATE, PLATE2), 44: vest(PLATE, PLATE2), 45: boot(PLATE, PLATE2),
    [HIDE]: [[0.44, 0.36, 0.05, 0, 0.44, 0, '#b8854e'], [0.3, 0.22, 0.06, 0, 0.44, 0, '#cfa06a'], [0.12, 0.1, 0.05, 0.24, 0.66, 0, '#b8854e'], [0.12, 0.1, 0.05, -0.24, 0.66, 0, '#b8854e'],
      [0.12, 0.1, 0.05, 0.24, 0.22, 0, '#b8854e'], [0.12, 0.1, 0.05, -0.24, 0.22, 0, '#b8854e']] });
  const iron = list => list.map(b => [...b.slice(0, 6), { [IRON]: '#cdd6e2', [EDGE]: '#f4f8fc', [STEEL]: '#8f9cac' }[b[6]] || b[6]]); // 同款模型换成铁色
  TOOLS[PICK2] = iron(TOOLS[PICK]); TOOLS[SWORD2] = iron(TOOLS[SWORD]);
  const recolor = (list, map) => list.map(b => [...b.slice(0, 6), map[b[6]] || b[6]]);
  Object.assign(TOOLS, {
    16: recolor(TOOLS[PICK], { [IRON]: '#b98a52', [EDGE]: '#d8ad72', [STEEL]: '#8a5a2c' }),         // 木镐
    17: recolor(TOOLS[AXE], { [IRON]: '#b98a52', [EDGE]: '#d8ad72', [STEEL]: '#8a5a2c' }),          // 木斧
    18: recolor(TOOLS[SHOVEL], { [IRON]: '#b98a52', [EDGE]: '#d8ad72', [STEEL]: '#8a5a2c' }),       // 木铲
    153: recolor(TOOLS[SWORD], { [IRON]: '#b98a52', [EDGE]: '#d8ad72', [GOLD]: '#6e4420' }),        // 木剑
    19: recolor(TOOLS[PICK], { [IRON]: '#fffaf0', [EDGE]: '#ffffff', [STEEL]: '#b88c50' }),          // 钻镐：虫牙做的镐头
    28: recolor(TOOLS[PICK], { [IRON]: '#8c8c8a', [EDGE]: '#ffb040', [STEEL]: '#5c5c5a' }),          // 岩心镐
    29: recolor(TOOLS[SWORD], { [IRON]: '#241c34', [EDGE]: '#c070ff', [GOLD]: '#4a3a6a' }),          // 黑曜剑
    132: [[0.4, 0.3, 0.08, 0, 0.42, 0, '#eef2f6'], [0.3, 0.2, 0.09, 0, 0.42, 0, '#ffffff'], [0.1, 0.1, 0.08, 0.2, 0.62, 0, '#dfe6ee'], [0.1, 0.1, 0.08, -0.2, 0.62, 0, '#dfe6ee']], // 白绒
    133: [[0.12, 0.22, 0.1, -0.08, 0.32, 0, '#efe6d6'], [0.09, 0.2, 0.1, -0.02, 0.52, 0, '#fffaf0'], [0.1, 0.18, 0.1, 0.14, 0.34, 0, '#efe6d6'], [0.06, 0.14, 0.08, 0.16, 0.5, 0, '#fffaf0']], // 虫牙
    134: [[0.34, 0.3, 0.3, 0, 0.42, 0, '#7c7c7a'], [0.16, 0.14, 0.31, 0, 0.42, 0, '#ffb040'], [0.2, 0.1, 0.2, 0.04, 0.62, 0, '#8c8c8a']],                              // 岩心
    135: [[0.3, 0.3, 0.3, 0, 0.42, 0, '#241c34'], [0.14, 0.14, 0.31, 0, 0.42, 0, '#c070ff'], [0.16, 0.1, 0.16, 0, 0.62, 0, '#342a4a']],                               // 黑曜核
    136: [[0.44, 0.3, 0.05, 0, 0.44, 0, '#3a5a4a'], [0.3, 0.16, 0.06, 0, 0.44, 0, '#44685a'], [0.44, 0.04, 0.06, 0, 0.6, 0, '#2a4236']],                              // 鳗皮
    137: [[0.2, 0.2, 0.06, -0.08, 0.36, 0, '#2a6a8a'], [0.2, 0.2, 0.06, 0.08, 0.5, 0, '#3484a8'], [0.12, 0.06, 0.07, 0.08, 0.6, 0, '#7ad0e8'], [0.12, 0.06, 0.07, -0.08, 0.46, 0, '#7ad0e8']], // 潮鳞
    138: [[0.05, 0.62, 0.03, 0, 0.42, 0, '#efe6d6'], [0.18, 0.36, 0.03, 0.02, 0.54, 0, '#6a5038'], [0.12, 0.14, 0.03, 0.01, 0.3, 0, '#57402c']],                       // 鹫羽
    139: [[0.05, 0.62, 0.03, 0, 0.42, 0, '#efe6d6'], [0.16, 0.36, 0.03, 0.02, 0.54, 0, '#a8b8c6'], [0.1, 0.14, 0.03, 0.01, 0.3, 0, '#eef4f8']],                        // 风羽
    140: [[0.4, 0.26, 0.04, 0, 0.44, 0, '#2a2438'], [0.04, 0.34, 0.05, -0.1, 0.46, 0, '#463c62'], [0.04, 0.3, 0.05, 0.1, 0.44, 0, '#463c62']],                         // 影膜
    141: [[0.05, 0.7, 0.03, 0, 0.44, 0, '#f0f4f8'], [0.2, 0.4, 0.03, 0.02, 0.58, 0, '#40506a'], [0.12, 0.2, 0.03, 0.02, 0.62, 0, '#8ad0ff'], [0.06, 0.08, 0.04, 0.02, 0.84, 0, '#fff8a0']], // 风暴羽
    142: boot('#eef2f6', '#c8d4e0'), 149: boot('#a8b8c6', '#6c7c8c'), 146: vest('#3a5a4a', '#2a4236'), 147: vest('#3484a8', '#2a6a8a'),
    148: [[0.4, 0.16, 0.2, 0, 0.6, 0, '#6a5038'], [0.26, 0.36, 0.2, 0.24, 0.36, 0, '#57402c'], [0.26, 0.36, 0.2, -0.24, 0.36, 0, '#57402c'], [0.1, 0.1, 0.2, 0, 0.72, 0, '#f4ece0']], // 长翼披风
    150: [[0.36, 0.44, 0.2, 0, 0.42, 0, '#1c1828'], [0.13, 0.16, 0.2, 0.24, 0.56, 0, '#463c62'], [0.13, 0.16, 0.2, -0.24, 0.56, 0, '#463c62'], [0.2, 0.12, 0.2, 0, 0.7, 0, '#c070ff']], // 影行斗篷
    151: [[0.36, 0.14, 0.3, 0, 0.42, 0, '#40506a'], ...[-0.13, 0, 0.13].map(x => [0.07, x ? 0.14 : 0.22, 0.3, x, x ? 0.56 : 0.6, 0, '#8ad0ff']), [0.06, 0.06, 0.31, 0, 0.42, 0, '#fff8a0']], // 风暴冠
  });
  // ---- 手持物：单独的小场景，清掉深度后画在世界之上，不会穿墙 ----
  const handScene = new THREE.Scene(), handCam = new THREE.PerspectiveCamera(50, 1, 0.01, 10), holder = new THREE.Group();
  const handLight = new THREE.DirectionalLight(0xfff2d8, 0.6); handLight.position.set(-1, 2, 1.5);
  const handAmb = new THREE.AmbientLight(0xffffff, 0.75);
  const handGlow=new THREE.PointLight(0xffb65e,0,3,2);handGlow.position.set(.2,.1,-.7);
  handScene.add(handAmb, handLight, holder,handGlow);
  holder.position.set(0.5, -0.5, -1); holder.scale.setScalar(0.72);
  const heldMat = new THREE.MeshLambertMaterial({ map: tex });
  let heldId = -1, swing = 0, heldHand=null;
  function beginSwing(){if(!hotbarActive)return;swing=.3;if(selectedItem()===SWORD||selectedItem()===SWORD2)CombatAudio.swing();}
  const HELD_YAW = { [PICK]: 0.3, [PICK2]: 0.3, 19: 0.3, 28: 0.3, 16: 0.3, [AXE]: Math.PI + 0.3, 17: Math.PI + 0.3 }; // 镐头沿前后方向握持，镐尖顺着挥动方向
  function setHeld(id) {
    if (id === heldId) return; heldId = id;
    holder.visible=id!==null;heldHand=null;
    holder.position.x = Math.min(0.5, handCam.aspect * (id === PICK || id === PICK2 ? 0.09 : 0.24));
    const skeletons=new Set();
    for (const c of [...holder.children]) { holder.remove(c); c.traverse(o => { if (o.geometry) o.geometry.dispose(); if(o.skeleton)skeletons.add(o.skeleton); }); }
    for(const skeleton of skeletons)skeleton.dispose();
    if(id===null)return;
    const hand=heldHand=HandMotion.rig(FirstPersonHand.create(!!id&&isBlock(id),id===PICK?.039:id===PICK2?.038:id===TORCH?.031:.035));
    // Item-specific yaw must not twist the player’s wrist or reverse the forearm.
    hand.rotation.y=-(HELD_YAW[id] || -0.9);
    holder.add(hand);
    if (!id) return;
    if (id === TORCH) return holder.add(TorchTool.create(pack==='natural'));
    if (id === PICK) return holder.add(StonePick.create(pack === 'natural'));
    if (id === PICK2) return holder.add(IronPick.create(pack === 'natural'));
    if (id === SWORD || id === SWORD2) return holder.add((id===SWORD2?StoneTools.ironSword:StoneTools.sword)(pack==='natural'));
    if (id === AXE) return holder.add(StoneTools.axe(pack === 'natural'));
    if (id === SHOVEL) return holder.add(StoneTools.shovel(pack === 'natural'));
    if (!isBlock(id)) return holder.add(ItemArt.create(id,TOOLS[id],pack==='natural'));
    if(BuildingIcons.supports(id)&&!Core.WOODS.some(w=>w.plank===id)){
      const group=new THREE.Group(),scale=Core.ladderInfo(id)?.45:.32;
      for(const q of Core.shapeBoxes(id)){
        const geo=new THREE.BoxGeometry((q[3]-q[0])*scale,(q[4]-q[1])*scale,(q[5]-q[2])*scale),uv=geo.attributes.uv;
        for(let i=0;i<24;i++)uv.setX(i,(BLOCKS[id].tiles[1]+.015+uv.getX(i)*.97)/ATLAS_TILES);
        const mesh=new THREE.Mesh(geo,heldMat);mesh.position.set(((q[0]+q[3])/2-.5)*scale,.14+(q[1]+q[4])/2*scale,((q[2]+q[5])/2-.5)*scale);group.add(mesh);
      }
      holder.add(group);return;
    }
    const g = new THREE.BoxGeometry(0.32, 0.32, 0.32).translate(0, 0.3, 0), uv = g.attributes.uv; // 面顺序 +x -x +y -y +z -z
    for (let i = 0; i < 24; i++) uv.setX(i, (BLOCKS[id].tiles[i >> 2 === 2 ? 0 : i >> 2 === 3 ? 2 : 1] + 0.01 + uv.getX(i) * 0.98) / ATLAS_TILES);
    holder.add(new THREE.Mesh(g, heldMat));
  }
  const icons = {};
  function icon(id) { // 方块取贴图集；工具把模型的方块列表斜着投影成带描边的小图
    if (icons[id]) return icons[id];
    if(BuildingIcons.supports(id))return icons[id]=BuildingIcons.draw(id,tex);
    if(id===TORCH)return icons[id]=StonePick.icon(pack==='natural',natural=>TorchTool.create(natural,false),false);
    if(id===SWORD || id===SWORD2)return icons[id]=StonePick.icon(pack==='natural',id===SWORD2?StoneTools.ironSword:StoneTools.sword,false);
    if (id === PICK) return icons[id] = StonePick.icon(pack === 'natural');
    if (id === PICK2) return icons[id] = IronPick.icon(pack === 'natural');
    if (id === AXE) return icons[id] = StonePick.icon(pack === 'natural', StoneTools.axe);
    if (id === SHOVEL) return icons[id] = StonePick.icon(pack === 'natural', StoneTools.shovel, false);
    if(!isBlock(id))return icons[id]=ItemArt.icon(id,TOOLS[id],pack==='natural');
    const c = document.createElement('canvas'); c.width = c.height = 40;
    const g = c.getContext('2d');
    if (isBlock(id)) g.drawImage(atlas, BLOCKS[id].tiles[1] * TS, 0, TS, TS, 0, 0, 40, 40);
    else {
      const tool = id < 31 || id === 153, S = tool ? 44 : 58; // 工具斜着放；兽皮和装备正着放、画大些
      g.translate(20, 20); if (tool) g.rotate(Math.PI / 4); g.lineJoin = 'round';
      for (const pass of [0, 1]) for (const [w, h, l, x, y, z, col] of TOOLS[id]) {
        const bw = Math.max(w, l) * S, bh = h * S, bx = (x + z) * S - bw / 2, by = -(y - 0.44) * S - bh / 2;
        if (pass) {
          if (pack !== 'natural' || !NaturalTools.drawPart(g, col, bx, by, bw, bh)) { g.fillStyle = col; g.fillRect(bx, by, bw, bh); }
        } else { g.strokeStyle = DARK; g.lineWidth = 3; g.strokeRect(bx, by, bw, bh); }
      }
    }
    return icons[id] = c.toDataURL();
  }
  const bar = $('bar');
  // Unlabelled silhouettes: irregular fractured rock vs. beveled silver ingot.
  const materialMarks = {
    stone: '<svg class="material-mark" viewBox="0 0 18 15" aria-hidden="true"><path d="M2 11 1 6 5 2 11 1 16 5 17 11 12 14 5 14Z" fill="#817c70" stroke="#302f2b" stroke-width="1.2"/><path d="m1 6 6 1 4-6 5 4-4 5-7 4Z" fill="#b1ac98"/><path d="m7 7 5 3 5 1-5 3H5Z" fill="#676961"/><path d="m7 7 2 4-2 2M11 3l1 3" fill="none" stroke="#4c4d45" stroke-width="1.2"/></svg>',
    iron: '<svg class="material-mark" viewBox="0 0 18 15" aria-hidden="true"><path d="m1 9 4-6 9-1 3 6-3 5-11 1Z" fill="#718f9f" stroke="#263943" stroke-width="1.2"/><path d="m1 9 4-6 9-1 3 6-11 2Z" fill="#d6e7ed"/><path d="m6 10 11-2-3 5-11 1Z" fill="#89a7b7"/><path d="m5 4 8-1M7 10l8-1" stroke="#fff" stroke-width="1.3"/></svg>',
  };
  const cell = (id, label, bare) => {
    const tier = [PICK,AXE,SHOVEL,SWORD].includes(id) ? 'stone' : [PICK2,SWORD2].includes(id) ? 'iron' : '';
    return `<div ${id ? `style="background-image:url(${icon(id)})" title="${itemName(id)}"` : ''}><span>${label}</span>${materialMarks[tier] || ''}${!bare && id && (id < 20 || id >= 30) ? `<b>${inv[id] || 0}</b>` : ''}</div>`;
  };
  function renderBar() {
    for (let i = 0; i < slots.length; i++) if (slots[i] && !(inv[slots[i]] > 0)) slots[i] = 0; // 用完的物品从快捷栏消失（手里也跟着空）
    bar.innerHTML = slots.map((id, i) => cell(id, i + 1)).join('') + `<button id="openBag" type="button" aria-label="Open bag" title="Bag (E)"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M11 9V6a5 5 0 0 1 10 0v3" fill="none" stroke="#f7d89d" stroke-width="3"/><rect x="6" y="8" width="20" height="22" rx="6" fill="#b98348" stroke="#f7d89d" stroke-width="1.5"/><path d="M7 15h18M11 11v7m10-7v7" stroke="#674327" stroke-width="2"/><rect x="11" y="20" width="10" height="7" rx="2" fill="#e5b875"/></svg></button>`; [...bar.children].slice(0,9).forEach((slot,i)=>{slot.dataset.slot=i;slot.setAttribute('role','button');slot.tabIndex=0;slot.setAttribute('aria-label',`Slot ${i+1}: ${itemName(slots[i]) || 'empty'}`);slot.setAttribute('aria-pressed',String(hotbarActive&&i===sel));}); if(hotbarActive)bar.children[sel].classList.add('on'); setHeld(hotbarActive?selectedItem():null); }
  function select(i,toggle=true) {
    const next=(i+9)%9;hotbarActive=!(toggle&&hotbarActive&&next===sel);sel=next;
    held=false;swing=0;digProgress=0;digKey='';miningFX.reset();$('prog').style.width='0px';
    renderBar();if(bagOpen)renderBag();saveSoon();if(hotbarActive)Lang.auto(itemName(selectedItem()));
  }
  function useItem(id) { // 背包里点物品：装备 → 穿上；其余 → 放进当前选中的快捷栏格（已在栏里就交换）
    if (ARMOR[id]) { const part = ARMOR[id][0]; inv[id]--; if (equip[part]) give(equip[part]); equip[part] = id; }
    else if (id !== HIDE) { const j = slots.indexOf(id); if (j >= 0) slots[j] = slots[sel]; slots[sel] = id; hotbarActive=true; }
    renderBar(); renderHP(); renderBag(); saveSoon();
  }
  function renderBag() { // 左：角色装备和属性；中：27 格背包 + 快捷栏；右：合成
    const ids = Object.keys(inv).map(Number).filter(id => inv[id] > 0);
    $('grid').innerHTML = Array.from({ length: Math.max(27, Math.ceil(ids.length / 9) * 9) }, (_, i) => cell(ids[i] || 0, '')).join('');
    [...$('grid').children].forEach((d, i) => { if (ids[i]) d.onclick = () => useItem(ids[i]); });
    $('hot').innerHTML = slots.map((id, i) => cell(id, i + 1)).join(''); if(hotbarActive)$('hot').children[sel].classList.add('on');
    [...$('hot').children].forEach((d, i) => { d.onclick = () => select(i); });
    $('equip').innerHTML = PART_ORDER.map(i => cell(equip[i], equip[i] ? '' : PARTS[i], true)).join('');
    [...$('equip').children].forEach((d, k) => { const i = PART_ORDER[k]; d.onclick = () => { if (equip[i]) { const id = equip[i]; equip[i] = 0; give(id); renderHP(); renderBag(); } }; }); // 点一下脱下
    $('stats').innerHTML = `<b>HP</b> ${Math.ceil(hp)} / ${MAXHP}<br><b>Armor</b> ${armor()} (blocks ${armor() * 4}%)<br><b>Attack</b> ${DMG[selectedItem()] || 1}<br><b>Holding</b> ${itemName(selectedItem())}`;
    $('craft').innerHTML = RECIPES.map(([out, n, need], i) => {
      const ok = Object.keys(need).every(id => (inv[id] || 0) >= need[id]) && !(out >= 20 && !isBlock(out) && (inv[out] || equip.includes(out))); // 工具和装备已有就不能再做；方块不限
      return `<button data-i="${i}" ${ok ? '' : 'disabled'}><img src="${icon(out)}">${itemName(out)}${n > 1 ? ' ×' + n : ''}<small>${Object.keys(need).map(id => itemName(+id) + '×' + need[id]).join(' + ')}</small></button>`;
    }).join('');
    for (const b of $('craft').children) b.onclick = () => {
      const [out, n, need] = RECIPES[b.dataset.i];
      for (const id in need) inv[id] -= need[id];
      give(out, n); renderBag();
    };
    if (window.Creative) Creative.render(); // 创造模式：合成区换成全部方块（creative.js）
  }
  let bagOpen = false;
  const lock = (touch=false) => { if(touch || mobileControls.mobile)return setPlaying(true); const r = cv.requestPointerLock(); if (r && r.catch) r.catch(() => {}); };
  function toggleBag(touch=false) {
    bagOpen = !bagOpen; $('bag').classList.toggle('off', !bagOpen);
    if (!bagOpen) return lock(touch);
    renderBag();
    if (document.pointerLockElement) document.exitPointerLock(); else setPlaying(false);
  }

  // ---- 输入 ----
  const cv = renderer.domElement;
  let playing = false;
  function setPlaying(on) {
    if(on && mobileControls.mobile && innerHeight>innerWidth)on=false;
    if(on){hasStarted=true;settingsOpen=false;document.body.classList.add('entered');saveSoon();}
    else if(hasStarted&&!bagOpen)settingsOpen=true;
    $('card').hidden=!settingsOpen;$('launchCard').hidden=settingsOpen;
    playing = on; held = false; document.body.classList.toggle('playing',on); if(!on)mobileControls.reset(); $('menu').classList.toggle('off', on || bagOpen);
    digProgress=0; digKey=''; miningFX.reset(); $('prog').style.width='0px';
    cv.style.cursor = on ? 'none' : ''; // 降级模式（没拿到鼠标锁定）下也隐藏光标
    if (on) { last = 0; schedule(); } else { for (const k in keys) keys[k] = false; saveNow(); }
  }
  $('start').onclick = e => lock(e.pointerType==='touch');
  $('settingsBtn').onclick=()=>{
    settingsOpen=true;$('card').hidden=false;$('launchCard').hidden=true;
    if(bagOpen){bagOpen=false;$('bag').classList.add('off');}
    setPlaying(false);if(document.pointerLockElement)document.exitPointerLock();
  };
  function closeSettings(touch=false){
    settingsOpen=false;$('card').hidden=true;$('launchCard').hidden=false;
    if(hasStarted)lock(touch);
  }
  $('closeSettings').onclick=e=>closeSettings(e.pointerType==='touch');
  let editingSave=null;
  const goToSave=id=>{saveNow();const url=new URL(location.href);url.searchParams.set('save',id);location.href=url.href;};
  function showSaveForm(id=null){
    editingSave=id;$('saveForm').hidden=false;$('saveError').textContent='';
    $('saveNameLabel').textContent=id?'Rename world':saveLibrary.list().length?'Name your world':'Name your first world';
    $('saveName').value=id?saveLibrary.read(id).name||`World ${id}`:'';
    $('saveSubmit').textContent=id?'Save name':'Create world';$('saveCancel').hidden=!saveLibrary.list().length;
    $('saveName').focus();
  }
  function renderSaveCards(){
    const worlds=saveLibrary.list();$('saveCards').replaceChildren();$('newSave').hidden=materialPreview||!worlds.length;
    $('start').disabled=!materialPreview&&!worlds.some(w=>w.id===selectedSave);
    $('saveIntro').textContent=materialPreview?'Temporary preview · Not saved':worlds.length?'Choose your world.':'Your adventure starts with a name.';
    if(materialPreview){$('newSave').hidden=true;return;}
    for(const world of worlds){
      const card=document.createElement('div');card.className='saveCard'+(world.id===selectedSave?' selected':'');
      const choose=document.createElement('button');choose.type='button';choose.className='saveChoose';choose.setAttribute('aria-pressed',String(world.id===selectedSave));
      const icon=document.createElement('span');icon.className='worldIcon';icon.textContent='▧';icon.setAttribute('aria-hidden','true');icon.dataset.save=world.id;if(window.Avatar&&Avatar.icon)Avatar.icon(icon);
      const info=document.createElement('span'),name=document.createElement('strong'),date=document.createElement('small');name.textContent=world.name;
      date.textContent=world.lastPlayed?'Last played · '+new Date(world.lastPlayed).toLocaleString([], {year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}):world.legacy?'Last played · Unavailable':'Not played yet';
      info.append(name,date);choose.append(icon,info);choose.onclick=()=>{if(world.id!==selectedSave)goToSave(world.id);};
      const rename=document.createElement('button');rename.type='button';rename.className='saveRename';rename.textContent='Rename';rename.setAttribute('aria-label','Rename '+world.name);rename.onclick=()=>{ // 就在这一行里改名：名字变成输入框，回车、点 Save 或点别处保存，Esc 取消；留空或没改就保持原名
        const box=document.createElement('input'),row=document.createElement('span');let done=false;
        box.maxLength=32;box.value=world.name;box.setAttribute('aria-label','World name');box.autocomplete='off';
        box.style.cssText='flex:1;min-width:0;box-sizing:border-box;font:inherit;font-weight:bold;font-size:16px;padding:8px;border:1px solid #957a50;border-radius:4px;background:#211b16;color:#f6e6c7';
        row.style.cssText='display:flex;flex:1;min-width:0;align-items:center;gap:12px;padding:10px';row.className='saveChoose';
        const finish=keep=>{if(done)return;done=true;const v=box.value.trim();if(keep&&v&&v!==world.name){try{saveLibrary.rename(world.id,v);}catch(err){/* 存不下就保持原名 */}}renderSaveCards();};
        box.onkeydown=e=>{e.stopPropagation();if(e.key==='Enter')finish(true);else if(e.key==='Escape')finish(false);};
        box.onblur=()=>finish(true);
        row.append(icon,box);choose.replaceWith(row);rename.textContent='Save';rename.onclick=null;$('saveForm').hidden=true;
        box.focus();box.select();
      };
      card.append(choose,rename);$('saveCards').appendChild(card);
    }
    if(!worlds.length)showSaveForm();
  }
  $('newSave').onclick=()=>showSaveForm();
  $('saveCancel').onclick=()=>{$('saveForm').hidden=true;};
  $('saveForm').onsubmit=e=>{
    e.preventDefault();
    try{
      if(editingSave){saveLibrary.rename(editingSave,$('saveName').value);$('saveForm').hidden=true;renderSaveCards();}
      else{const id=saveLibrary.create($('saveName').value);if(window.Avatar&&Avatar.newWorld)Avatar.newWorld(id);goToSave(id);}
    }catch(err){$('saveError').textContent=err.name==='QuotaExceededError'?'Storage is full. Your existing worlds are safe.':err.message;}
  };
  renderSaveCards();
  bar.addEventListener('pointerdown',e=>{if(e.target.closest('#openBag'))e.stopPropagation();});
  bar.addEventListener('click',e=>{
    if(!playing&&!bagOpen)return;
    const slot=e.target.closest('[data-slot]');
    if(slot){e.stopPropagation();select(+slot.dataset.slot);return;}
    if(e.target.closest('#openBag')){e.stopPropagation();toggleBag(e.pointerType==='touch');}
  });
  bar.addEventListener('keydown',e=>{const slot=e.target.closest('[data-slot]');if(slot&&(e.key==='Enter'||e.key===' ')){e.preventDefault();select(+slot.dataset.slot);}});
  $('closeBag').onclick=e=>toggleBag(e.pointerType==='touch');
  const mobileControls=new MobileControls(cv,{
    playing:()=>playing,
    move:(x,forward)=>{touchMove.x=x;touchMove.forward=forward;},
    key:(code,on)=>{touchKeys[code]=on;},
    look:(dx,dy)=>{yaw-=dx*.005;pitch=Math.max(-1.55,Math.min(1.55,pitch-dy*.005));},
    dig:on=>{held=on;if(on){beginSwing();attack();}else{digProgress=0;digKey='';miningFX.reset();$('prog').style.width='0px';}},
    place:()=>place()
  });
  $('reset').onclick = () => { if (confirm('Clear the world and start again?')) { hasStarted=false;clearTimeout(saveTimer);removeEventListener('pagehide', saveNow); localStorage.removeItem(SAVE); if(selectedSave===1)localStorage.removeItem(OLD); location.reload(); } };
  $('view').oninput = e => { setView(+e.target.value); saveSoon(); };
  $('hq').onchange = e => { setHQ(e.target.checked); saveSoon(); };
  $('pack').onchange = e => { pack = e.target.value; applyPack(); saveSoon(); };
  $('exp').onclick = () => { const a = document.createElement('a'); a.href = atlas.toDataURL(); a.download = 'stonisle-pack.png'; a.click(); };
  $('imp').onclick = () => $('file').click();
  $('file').onchange = e => { // 导入：宽 = 高 × 16 的 PNG（就是“导出”给的那种），存进 localStorage
    const f = e.target.files[0], rd = new FileReader(); if (!f) return;
    rd.onload = () => {
      const img = new Image();
      img.onload = () => {
        if (img.width % img.height || img.width < img.height * 17 || img.width > img.height * ATLAS_TILES || img.height > 256) return alert(`The picture must be a PNG. Width = height × ${ATLAS_TILES}. Export one first.`);
        try { localStorage.setItem(PACK, rd.result); } catch (err) { return alert('The picture is too big.'); }
        pack = 'custom'; applyPack(); saveSoon();
      };
      img.onerror = () => alert('This is not a picture.');
      img.src = rd.result;
    };
    rd.readAsDataURL(f); e.target.value = '';
  };
  document.addEventListener('pointerlockchange', () => setPlaying(document.pointerLockElement === cv));
  // 拿不到鼠标锁定（内嵌预览窗格，或 Esc 后 1 秒内重进）时降级：不锁鼠标照样玩，方向键也能转视角
  let lockHintShown = false, lockTried = 0;
  document.addEventListener('pointerlockerror', () => {
    if (!playing) setPlaying(true); // 已经在玩就别重置：setPlaying 会松开“按住”的状态，长按挖掘会被打断
    if (!lockHintShown) { lockHintShown = true; $('msg').textContent = 'The mouse is not locked here. Move it to the edge to keep turning, or open this page in Chrome.'; setTimeout(() => { $('msg').textContent = ''; }, 7000); }
  });
  // 没锁住鼠标时光标会和准星分开、容易滑出窗口。补救：光标靠近窗口边缘就继续往那边转（不用再往外推）；每次点击画面都再试一次锁定。
  let edgeX = 0, edgeY = 0;
  document.addEventListener('mousemove', e => {
    const m = 0.14, fx = e.clientX / innerWidth, fy = e.clientY / innerHeight;
    edgeX = fx < m ? (fx - m) / m : fx > 1 - m ? (fx - 1 + m) / m : 0; edgeY = fy < m ? (fy - m) / m : fy > 1 - m ? (fy - 1 + m) / m : 0;
  });
  document.addEventListener('mouseleave', () => { edgeX = edgeY = 0; });
  document.addEventListener('mousemove', e => {
    if (!playing || mobileControls.mobile || animalPreview || waterPreview) return; // 测试场景固定鼠标视角，便于操作测试按钮；方向键仍可转动
    yaw -= e.movementX * 0.0022;
    pitch = Math.max(-1.55, Math.min(1.55, pitch - e.movementY * 0.0022));
  });
  cv.addEventListener('mousedown', e => {
    if (!playing || mobileControls.mobile) return;
    if (!document.pointerLockElement && performance.now() - lockTried > 3000) { lockTried = performance.now(); const r = cv.requestPointerLock(); if (r && r.catch) r.catch(() => {}); } // 没锁住：隔 3 秒以上的点击再试一次，不是每次按下都试
    if (e.button === 2 || (e.button === 0 && e.ctrlKey)) place(); else if (e.button === 0) {held=true;beginSwing();attack();}
  });
  addEventListener('mouseup', () => { if(mobileControls.mobile)return; held = false; digProgress=0; digKey=''; miningFX.reset(); $('prog').style.width='0px'; schedule(); });
  cv.addEventListener('contextmenu', e => e.preventDefault());
  addEventListener('keydown', e => {
    if(e.code==='Escape'&&settingsOpen){e.preventDefault();return closeSettings();}
    if (e.code === 'KeyE' && (playing || bagOpen)) return toggleBag();
    if (bagOpen && e.code === 'Escape') { bagOpen = false; $('bag').classList.add('off'); return setPlaying(false); }
    if (!e.repeat && e.code >= 'Digit1' && e.code <= 'Digit9' && (playing || bagOpen)) select(+e.code[5] - 1);
    if (!playing) return;
    if (e.code === 'Escape' && !document.pointerLockElement) return setPlaying(false);
    keys[e.code] = true;
    if (e.code === 'Space' || e.code.startsWith('Arrow')) e.preventDefault();
  });
  addEventListener('keyup', e => { keys[e.code] = false; });
  addEventListener('wheel', e => { if (playing&&e.deltaY) select(sel + Math.sign(e.deltaY),false); }, { passive: true });
  addEventListener('resize', () => {resize();if(mobileControls.mobile && innerHeight>innerWidth && playing)setPlaying(false);});
  document.addEventListener('visibilitychange', () => { if (document.hidden) saveNow(); else { last = 0; schedule(); } });

  // ---- 主循环：标签页不可见或暂停且无待建区块时完全停止；上限 60fps ----
  let raf = 0, last = 0, frames = 0, fpsT = 0, fps = 0;
  function schedule() { if (!raf) raf = requestAnimationFrame(frame); }
  function frame(t) {
    raf = 0;
    if (document.hidden) return;
    if (last && t - last < 15) return schedule();   // 120Hz 屏降到 60
    const dt = last ? Math.min(0.05, (t - last) / 1000) : 0.016; last = t;
    if (playing) { if (!dead) { step(dt); digStep(dt); } miningFX.update(dt); tickMobs(dt); updateWater(dt); time += dt; }
    if(playing)TorchTool.update(dt);
    const detachedTorches=placedTorches.update(meshes,pack==='natural');if(detachedTorches)give(TORCH,detachedTorches);
    if(playing && foliage.update(dt) && hq)renderer.shadowMap.needsUpdate=true;
    updateChunks();
    miningFX.syncDamage(blockDamage.records,r=>{
      if(!meshes.has((r.x>>4)+','+(r.z>>4)))return false;
      if(world.get(r.x,r.y,r.z)!==r.id){blockDamage.clear(r.x,r.y,r.z);return false;}
      return true;
    });
    camera.position.set(p.x, p.y + EYE, p.z); camera.rotation.set(pitch, yaw, 0);
    updateSky();
    holder.updateMatrixWorld(true);torchWorld.set(0,.68,0);holder.localToWorld(torchWorld);
    torchWorld.applyQuaternion(camera.quaternion).add(camera.position);
    torchDirection.copy(torchWorld).sub(camera.position);const torchDistance=torchDirection.length();torchDirection.normalize();
    const torchHit=raycast((x,y,z)=>world.get(x,y,z),camera.position.toArray(),torchDirection.toArray(),torchDistance);
    if(torchHit)torchWorld.copy(camera.position).addScaledVector(torchDirection,Math.max(0,torchHit.t-.18));
    if(lighting.update(playing?dt:0,selectedItem()===TORCH,torchWorld,dayK)&&hq)renderer.shadowMap.needsUpdate=true;
    const handSky=lighting.skyAt(p.x,p.y+EYE,p.z);handAmb.color.multiplyScalar(handSky);handLight.intensity*=handSky;
    for(const mob of mobs)if(mob.mobMat.userData.skyExposure)mob.mobMat.userData.skyExposure.value=lighting.skyAt(mob.x,mob.y+mob.type.h,mob.z);
    handGlow.intensity=selectedItem()===TORCH?lighting.torch.intensity*.3:0;
    if (hq) updateShadow();
    const h = aim(); box.visible = !!h; if (h) box.position.set(h.x + 0.5, h.y + 0.5, h.z + 0.5);
    if (playing) Lang.look(h ? (window.Home && Home.label(h)) || itemName(h.torch?TORCH:world.get(h.x, h.y, h.z)) : '', t, [p.x, p.y + EYE, p.z], lookDir(), mobs, h ? h.t : 6); // 对准显示英文名
    if (window.ThirdPerson) ThirdPerson.apply(camera, dt); // 第三人称：把镜头退到身后，画出自己的小人（avatar.js）
    renderer.render(scene, camera);
    const swordHeld=[SWORD,SWORD2,29,153].includes(heldId),miningHeld=[PICK,PICK2,AXE,SHOVEL,16,17,18,19,28].includes(heldId);
    swing = Math.max(0, swing - dt*(swordHeld?.65:miningHeld?.78:1)); if (held && hotbarActive && !swing) beginSwing();
    const handX=Math.min(.5,handCam.aspect*(heldId===PICK||heldId===PICK2?.09:.24));
    holder.position.set(handX,-.43,-1);
    if(swordHeld){
      // Shoulder-driven diagonal slash: short wind-up, fast cut, slower recovery.
      const phase=swing>0?1-swing/.3:0;
      const poses=[
        [0,0,0,0,-.25,-.9,.12],
        [.22,.10,.035,.06,-.12,-1.12,-.38],
        [.53,-.30,-.045,-.10,-.48,.20,1.12],
        [.68,-.32,-.065,-.06,-.54,.28,1.20],
        [1,0,0,0,-.25,-.9,.12]
      ];
      let k=0;while(k<poses.length-2&&phase>poses[k+1][0])k++;
      const a=poses[k],b=poses[k+1],u=Math.max(0,Math.min(1,(phase-a[0])/(b[0]-a[0]))),ease=u*u*(3-2*u);
      const at=i=>a[i]+(b[i]-a[i])*ease;
      holder.position.set(handX+at(1),-.43+at(2),-1+at(3));
      holder.rotation.set(at(4),at(5),at(6));
    }else if(miningHeld){
      // Lift the forearm, drive the head forward, then settle back into the grip.
      const phase=swing>0?1-swing/.3:0;
      const poses=[[0,0,0,0,-.25,.08],[.32,.045,.13,.08,.18,-.16],[.58,-.025,-.055,-.13,-1.02,.16],[.72,-.03,-.065,-.11,-.96,.14],[1,0,0,0,-.25,.08]];
      let k=0;while(k<poses.length-2&&phase>poses[k+1][0])k++;
      const a=poses[k],b=poses[k+1],u=(phase-a[0])/(b[0]-a[0]),ease=u*u*(3-2*u),at=i=>a[i]+(b[i]-a[i])*ease;
      holder.position.set(handX+at(1),-.43+at(2),-1+at(3));
      holder.rotation.set(at(4),HELD_YAW[heldId]||-.9,at(5));
    }else{
      holder.rotation.set(-0.25 - Math.sin(swing / 0.3 * Math.PI) * 0.9, HELD_YAW[heldId] || -0.9, heldId === PICK || heldId === PICK2 ? 0.08 : 0.12);
    }
    HandMotion.update(heldHand,holder,swing>0?1-swing/.3:0,swordHeld);
    FirstPersonHand.update(heldHand,holder); // 前臂每帧从手腕指向固定的手肘位置
    if (holder.children.length && !(window.ThirdPerson && ThirdPerson.on)) { renderer.autoClear = false; renderer.clearDepth(); renderer.render(handScene, handCam); renderer.autoClear = true; }
    frames++;
    if (t - fpsT > 500) {
      fps = Math.round(frames * 1000 / (t - fpsT)); frames = 0; fpsT = t;
      $('hud').textContent = `${fps} fps · (${Math.floor(p.x)}, ${Math.floor(p.z)}) · height ${Math.floor(p.y)} · ${itemName(selectedItem())} · ${mobs.length} animal${mobs.length === 1 ? '' : 's'} · ${dayK > 0.6 ? 'day' : dayK > 0.05 ? 'dusk' : 'night'}`;
    }
    if (playing || queue.length) schedule();
  }

  if (materialPreview) {
    $('reset').disabled = true;
    const note = document.createElement('p');
    note.textContent = waterPreview ? 'Water test · Open / close the channel · Temporary world' : animalPreview ? '动物测试 · 鼠标视角固定，方向键可转动 · 临时世界不保存' : '材质预览 · 1–7 切换工具 · 临时世界不保存';
    $('card').insertBefore(note, $('card').children[1]);
  }
  if(animalPreview){
    spawnMob(TYPES[1],{x:8,z:6});
    const controls=document.createElement('div');controls.style.cssText='position:fixed;right:12px;top:12px;z-index:2;display:flex;gap:8px';
    const reset=document.createElement('button'),walk=document.createElement('button');
    reset.textContent='重置测试鹿';walk.textContent='测试上一格台阶';
    reset.onclick=()=>{for(const m of mobs){scene.remove(m.mesh);m.mobMat.dispose();}mobs.length=0;spawnMob(TYPES[1],{x:8,z:6});};
    walk.onclick=()=>{for(const m of mobs){m.walk=true;m.t=60;m.a=Math.PI;}};
    controls.append(reset,walk);document.body.appendChild(controls);
  }
  if(waterPreview){
    const controls=document.createElement('div');controls.style.cssText='position:fixed;right:12px;top:12px;z-index:2;display:flex;gap:8px';
    for(const [label,id] of [['Open channel',AIR],['Close channel',3]]){
      const button=document.createElement('button');button.textContent=label;
      button.onclick=()=>{for(let x=7;x<=9;x++)setBlock(x,34,6,id);schedule();};controls.appendChild(button);
    }
    document.body.appendChild(controls);
  }
  setView(R); setHQ(hq); applyPack(); renderHP(); resize();
  window.game = { get naturalItems(){return pack==='natural';}, debug: { frame, spawnFoe, spawnMob, spawnAt, spawnDrifter, FOES, WOLF }, mobState, mobSync, mobHit, takeLoot, slow() { slowMe(); }, push(x, z) { pushMe(x, z); }, get low() { return hp < MAXHP / 2; }, get cloak() { return equip.includes(150) ? 2 : equip.includes(47) ? 1 : 0; }, get playing() { return playing; }, torches: placedTorches, get dead() { return dead; }, get swinging() { return swing > 0; }, get swingPhase() { return swing > 0 ? 1 - swing / 0.3 : 0; }, get air() { return !onGround; }, itemMesh(id) { // 给联机小人和形象预览用：手里拿的东西
      if (!id || (!isBlock(id) && !TOOLS[id])) return null;
      if (!isBlock(id)) return ItemArt.create(id,TOOLS[id],pack==='natural');
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.3), new THREE.MeshLambertMaterial({ map: new THREE.TextureLoader().load(icon(id)) })); m.position.y = 0.3; return m; }, get held() { return selectedItem(); }, setBlock, give, renderBar, renderBag, icon, // debug：页面不渲染时也能手动驱动一帧、指定刷怪，供测试用
    heal(n) { hp = Math.min(MAXHP, hp + n); renderHP(); }, get time() { return time; }, set time(v) { time = v; schedule(); }, get yaw() { return yaw; },
    world, lighting, p, meshes, renderer, scene, get dayK() { return dayK; }, setHQ, mobs, inv, slots, equip, hurt, get hp() { return hp; }, look(y, x) { yaw = y; pitch = x; }, setTime(f) { time = f * DAY; schedule(); }, get fps() { return fps; } }; // 调试用
})();
