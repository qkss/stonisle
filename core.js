// 岩屿 Stonisle — 纯逻辑核心（不依赖 Three.js / DOM，浏览器与 node 通用）
(function (root) {
  const CH = 16, H = 64, SEA = 22;
  const AIR = 0, MOSS = 1, DIRT = 2, STONE = 3, SAND = 4, WATER = 5, LOG = 6, LEAF = 7;
  const COAL = 11, IRON = 12, GOLD = 13, CRYSTAL = 14, SNOW = 15;
  const GLASS = 50, LAMP = 59;                    // 第一批建筑方块（PRD FR-019）用 50–59；20–49 留给工具和物品
  const SHAPED = id => id === 179 || PLANTS[id] !== undefined || (id >= 160 && id <= 175) || (id >= 60 && id <= 75) || (id >= 184 && id <= 195) || (id >= 200 && id <= 243) || (id >= 248 && id <= 255);      // 不是整格的方块：门、窗、床、花、浆果丛、树苗、告示牌（PRD FR-18/19），外形见 meshChunk 里的 shape()
  // 新植物（farm.js 管种植和生长）：贴图 61、62 两格各切成四小块（qx、qy：第几列、第几行），一小块是一种花或一截茎叶。
  // stem：下面绿茎的高度（借用花那一格贴图的下半截）；top：整株的高度，可以超过一格（向日葵）。
  const PLANTS = {
    77: { name: '玫瑰', tile: 61, qx: 0, qy: 0, stem: 0.45, top: 0.9 },
    78: { name: '向日葵', tile: 61, qx: 1, qy: 0, stem: 0.8, top: 1.4 },
    79: { name: '百合', tile: 61, qx: 0, qy: 1, stem: 0.45, top: 0.95 },
    87: { name: '水仙', tile: 61, qx: 1, qy: 1, stem: 0.4, top: 0.85 },
    88: { name: '油菜花', tile: 62, qx: 0, qy: 0, stem: 0, top: 0.95 },
    89: { name: '竹子', tile: 62, qx: 1, qy: 0, stem: 0, top: 1 },
    99: { name: '幼苗', tile: 62, qx: 0, qy: 1, stem: 0, top: 0.45 },
    116: { name: '红蘑菇', tile: 69, qx: 0, qy: 0, stem: 0, top: 0.5 }, 117: { name: '棕蘑菇', tile: 69, qx: 1, qy: 0, stem: 0, top: 0.5 },
    118: { name: '白蘑菇', tile: 69, qx: 0, qy: 1, stem: 0, top: 0.5 }, // 原来还有黄蘑菇（179），编号让给了篝火
  };
  const GRANITE = 154, MARBLE = 155, QUARTZ = 156, SLATE = 157, COBBLE = 158; // 更多天然岩石（贴图 64–68）
  const PUMPKIN = 119, MELON = 143, CHERRY_LEAF = 144, APPLE_LEAF = 145, MANGO_LEAF = 152, MUSHROOMS = [116, 117, 118], CAMPFIRE = 179; // 南瓜、西瓜（整格方块）；樱花、苹果、芒果树的树冠
  const BANANA_LEAF = 159, GRAPE_VINE = 176, LYCHEE_LEAF = 199; // 香蕉树、荔枝树的树冠，和长在草地上的葡萄藤
  const SLIME = 183; // 粘液方块：史莱姆掉落，踩上去会弹起来（game.js）
  const FARMLAND = 98, WILD_FLOWERS = [68, 69, 70, 77, 78, 79, 87, 88];
  const PASS = new Set([62, 63, 68, 69, 70, 71, 72, 73, 74, 75, 77, 78, 79, 87, 88, 89, 99, 116, 117, 118, 179]); // 可以走过去的：打开的门、植物、告示牌
  const see = id => id === LEAF || id === GLASS || SHAPED(id); // 看得穿的方块：不挡后面的面，也不算“头顶有遮挡”
  // id -> [顶面, 侧面, 底面] 在贴图集里的格子号
  const BLOCKS = [
    null,
    { name: '草地', tiles: [0, 1, 2] },
    { name: '泥土', tiles: [2, 2, 2] },
    { name: '岩石', tiles: [3, 3, 3] },
    { name: '沙子', tiles: [4, 4, 4] },
    { name: '水', tiles: [5, 5, 5] },
    { name: '树干', tiles: [7, 6, 7] },
    { name: '树叶', tiles: [8, 8, 8] },
    { name: '木板', tiles: [9, 9, 9] },
    { name: '红砖', tiles: [10, 10, 10] },
    { name: '石砖', tiles: [11, 11, 11] },
    { name: '煤矿', tiles: [12, 12, 12] },
    { name: '铁矿', tiles: [13, 13, 13] },
    { name: '金矿', tiles: [14, 14, 14] },
    { name: '晶矿', tiles: [15, 15, 15] },
    { name: '雪块', tiles: [16, 16, 16] },
  ];
  [['玻璃', 17], ['砂岩', 18], ['磨光石', 19], ['茅草', 20], ['雪砖', 21], ['屋瓦', 22], ['铁块', 23], ['金块', 24], ['晶块', 25], ['灯', 26]]
    .forEach(([name, t], i) => { BLOCKS[50 + i] = { name, tiles: [t, t, t] }; });
  // 60–73 家居与植物：门（关·横/关·竖/开·横/开·竖）、窗（横/竖）、床（东西向/南北向）、红黄蓝花、浆果丛（有果/摘过）、树苗
  [['门', 27], ['门', 27], ['门', 27], ['门', 27], ['窗', 17], ['窗', 17], ['床', 28], ['床', 28], ['红花', 29], ['黄花', 29], ['蓝花', 29], ['浆果丛', 30], ['浆果丛', 8], ['树苗', 31]]
    .forEach(([name, t], i) => { BLOCKS[60 + i] = { name, tiles: [t, t, t] }; });
  BLOCKS[74] = BLOCKS[75] = { name: '告示牌', tiles: [46, 46, 46] };   // 74 牌面朝南北，75 朝东西
  BLOCKS[76] = { name: '箱子', tiles: [45, 45, 45] };
  for (const id in PLANTS) BLOCKS[id] = { name: PLANTS[id].name, tiles: [PLANTS[id].tile, PLANTS[id].tile, PLANTS[id].tile] };
  [['花岗岩', 64], ['大理石', 65], ['石英石', 66], ['石板岩', 67], ['鹅卵石', 68]].forEach(([name, t], i) => { BLOCKS[GRANITE + i] = { name, tiles: [t, t, t] }; });
  BLOCKS[CAMPFIRE] = { name: '篝火', tiles: [6, 6, 6] }; // 一圈石头围着两根交叉的木柴；点着以后的火苗是 farm.js 另外画的
  BLOCKS[PUMPKIN] = { name: '南瓜', tiles: [71, 70, 71] }; BLOCKS[MELON] = { name: '西瓜', tiles: [73, 72, 73] };
  BLOCKS[CHERRY_LEAF] = { name: '樱花', tiles: [74, 74, 74] }; BLOCKS[APPLE_LEAF] = { name: '苹果树叶', tiles: [75, 75, 75] }; BLOCKS[MANGO_LEAF] = { name: '芒果树叶', tiles: [76, 76, 76] };
  BLOCKS[SLIME] = { name: '粘液方块', tiles: [77, 77, 77] };
  BLOCKS[BANANA_LEAF] = { name: '香蕉树叶', tiles: [78, 78, 78] }; BLOCKS[GRAPE_VINE] = { name: '葡萄藤', tiles: [79, 79, 79] }; BLOCKS[LYCHEE_LEAF] = { name: '荔枝树叶', tiles: [80, 80, 80] };
  BLOCKS[FARMLAND] = { name: '耕地', tiles: [63, 2, 2] }; // 顶面是翻过的土，侧面和底面是泥土
  BLOCKS[96] = { name: '荧光玻璃', tiles: [47, 47, 47] }; BLOCKS[97] = { name: '冰灯', tiles: [48, 48, 48] }; // 怪物掉落做的两种发亮的装饰方块（自己亮，不照亮周围）
  // 80–86 矿物与宝石（地下生成），90–95 不同颜色的建材（合成）
  const OBSIDIAN = 80, CALCITE = 81, AMETHYST = 82, DIAMOND = 83, RUBY = 84, EMERALD = 85, SAPPHIRE = 86;
  [['黑曜石', 32], ['方解石', 33], ['紫水晶', 34], ['钻石矿', 35], ['红宝石矿', 36], ['绿宝石矿', 37], ['蓝宝石矿', 38]]
    .forEach(([name, t], i) => { BLOCKS[80 + i] = { name, tiles: [t, t, t] }; });
  [['水泥块', 39], ['黄砖', 40], ['深色砖', 41], ['浅色木板', 42], ['深色木板', 43], ['红木板', 44]]
    .forEach(([name, t], i) => { BLOCKS[90 + i] = { name, tiles: [t, t, t] }; });
  const WOODS=[
    {name:'oak',cn:'橡木',log:6,plank:8,door:60,chest:76,bark:6,end:7,doorTile:27,chestTile:45},
    {name:'birch',cn:'白桦',log:180,plank:93,door:184,chest:196,bark:49,end:50,doorTile:51,chestTile:52},
    {name:'walnut',cn:'胡桃',log:181,plank:94,door:188,chest:197,bark:53,end:54,doorTile:55,chestTile:56},
    {name:'cedar',cn:'雪松',log:182,plank:95,door:192,chest:198,bark:57,end:58,doorTile:59,chestTile:60}
  ];
  // 门：base+0 / +1 是关着的两个朝向，+2 / +3 是开着、门板靠低的一侧；248–255 是开着、门板靠高的一侧（每种木材两个，见 doorR）
  const doorBase=id=>id>=60&&id<=63?60:id>=184&&id<=195?id-(id-184)%4:id>=248&&id<=255?WOODS[(id-248)>>1].door:0;
  const isChest=id=>WOODS.some(w=>w.chest===id);
  WOODS.forEach((w,i)=>{
    BLOCKS[w.log]={name:w.cn+'原木',tiles:[w.end,w.bark,w.end]};
    for(let k=0;k<4;k++)BLOCKS[w.door+k]={name:w.cn+'门',tiles:[w.doorTile,w.doorTile,w.doorTile]};
    PASS.add(w.door+2);PASS.add(w.door+3);
    w.doorR=248+i*2;for(let k=0;k<2;k++){BLOCKS[w.doorR+k]={name:w.cn+'门',tiles:[w.doorTile,w.doorTile,w.doorTile]};PASS.add(w.doorR+k);}
    BLOCKS[w.chest]={name:w.cn+'箱子',tiles:[BLOCKS[w.plank].tiles[0],w.chestTile,BLOCKS[w.plank].tiles[0]]};
    w.ladder=160+i*4;for(let k=0;k<4;k++){BLOCKS[w.ladder+k]={name:w.cn+'爬梯',tiles:[...BLOCKS[w.plank].tiles]};PASS.add(w.ladder+k);}
    w.stairs=200+i*4;w.slab=216+i;w.fence=220+i;w.inverted=224+i*4;w.upperSlab=240+i;w.doubleSlab=244+i;
    for(const id of [w.stairs,w.stairs+1,w.stairs+2,w.stairs+3,w.slab,w.fence,w.inverted,w.inverted+1,w.inverted+2,w.inverted+3,w.upperSlab,w.doubleSlab])BLOCKS[id]={name:w.cn+(id<216?'楼梯':id<220?'台阶':'栅栏'),tiles:[...BLOCKS[w.plank].tiles]};
  });
  const woodLogAt=(x,z)=>WOODS[Math.floor(hash(x,z,448)*4)].log;
  const ladderInfo=id=>id>=160&&id<=175?{wood:Math.floor((id-160)/4),dir:(id-160)%4,normal:[[0,0,1],[-1,0,0],[0,0,-1],[1,0,0]][(id-160)%4]}:null;
  function ladderSupported(get,x,y,z,info=ladderInfo(get(x,y,z))){if(!info)return false;const n=info.normal,b=get(x-n[0],y,z-n[2]);return !!b&&b!==5&&!SHAPED(b);}
  const stairInfo=id=>id>=200&&id<=215?{wood:Math.floor((id-200)/4),dir:(id-200)%4,up:false}:id>=224&&id<=239?{wood:Math.floor((id-224)/4),dir:(id-224)%4,up:true}:null;
  const slabInfo=id=>id>=216&&id<=219?{wood:id-216,half:0}:id>=240&&id<=243?{wood:id-240,half:1}:id>=244&&id<=247?{wood:id-244,half:2}:null;
  // Local collision boxes are also used for mesh construction and targeting.
  function shapeBoxes(id,get=()=>0,x=0,y=0,z=0){
    const ladder=ladderInfo(id);
    if(ladder){const boxes=[[.18,0,.04,.26,1,.14],[.74,0,.04,.82,1,.14]];for(const h of [.12,.37,.62,.87])boxes.push([.22,h,.06,.78,h+.075,.16]);
      return boxes.map(q=>{for(let i=0;i<ladder.dir;i++)q=[1-q[5],q[1],q[0],1-q[2],q[4],q[3]];return q;});}
    const stair=stairInfo(id);
    if(stair){
      const dirs=[[0,-1],[1,0],[0,1],[-1,0]],d=dirs[stair.dir];
      const front=stairInfo(get(x+d[0],y,z+d[1])),back=stairInfo(get(x-d[0],y,z-d[1]));
      const compatible=n=>n&&n.up===stair.up&&(n.dir%2!==stair.dir%2);
      const half=dir=>[[0,0,1,.5],[.5,0,1,1],[0,.5,1,1],[0,0,.5,1]][dir];
      const sideClear=n=>{const v=dirs[n.dir],other=stairInfo(get(x-v[0],y,z-v[1]));return !other||other.dir!==stair.dir||other.up!==stair.up;};
      let parts=[half(stair.dir)];
      if(compatible(front)&&sideClear(front)){
        const a=half(stair.dir),b=half(front.dir);parts=[[Math.max(a[0],b[0]),Math.max(a[1],b[1]),Math.min(a[2],b[2]),Math.min(a[3],b[3])]];
      }else if(compatible(back)){
        const a=half(stair.dir),b=half(back.dir);parts=[];
        for(const qx of [0,.5])for(const qz of [0,.5])if((qx>=a[0]&&qx<a[2]&&qz>=a[1]&&qz<a[3])||(qx>=b[0]&&qx<b[2]&&qz>=b[1]&&qz<b[3]))parts.push([qx,qz,qx+.5,qz+.5]);
      }
      const boxes=[[0,0,0,1,.5,1],...parts.map(q=>[q[0],.5,q[1],q[2],1,q[3]])];
      return stair.up?boxes.map(q=>[q[0],1-q[4],q[2],q[3],1-q[1],q[5]]):boxes;
    }
    const slab=slabInfo(id);
    if(slab)return [[0,slab.half===1?.5:0,0,1,slab.half===0?.5:1,1]];
    if(id>=220&&id<=223){const boxes=[[.375,0,.375,.625,1,.625]];
      for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){const b=get(x+dx,y,z+dz);if(!b||b===5||PASS.has(b)||SHAPED(b)&&!(b>=220&&b<=223))continue;
        for(const h of [.3,.7])boxes.push(dx?[dx>0?.5:0,h,.43,dx>0?1:.5,h+.14,.57]:[.43,h,dz>0?.5:0,.57,h+.14,dz>0?1:.5]);}
      return boxes;
    }
    return [[0,0,0,1,1,1]];
  }
  const CAVE = 0.075;       // 洞穴粗细
  const ATLAS_TILES = 96; // 贴图集一行 96 格（原来 64 格用满了；标准包宽 6144 像素，精细包 12288）

  // ---- 噪声 / 地形 ----
  function hash(x, z, s) {
    let h = Math.imul(x, 374761393) ^ Math.imul(z, 668265263) ^ Math.imul(s, 1442695041);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }
  function vnoise(x, z, s) {
    const xi = Math.floor(x), zi = Math.floor(z);
    let fx = x - xi, fz = z - zi;
    fx = fx * fx * (3 - 2 * fx); fz = fz * fz * (3 - 2 * fz);
    const a = hash(xi, zi, s), b = hash(xi + 1, zi, s), c = hash(xi, zi + 1, s), d = hash(xi + 1, zi + 1, s);
    return a + (b - a) * fx + (c - a) * fz + (a - b - c + d) * fx * fz;
  }
  function vnoise3(x, y, z, s) {
    const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z), h = (a, b, c) => hash(a + b * 8191, c, s);
    let fx = x - xi, fy = y - yi, fz = z - zi;
    fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy); fz = fz * fz * (3 - 2 * fz);
    const l = (a, b, t) => a + (b - a) * t;
    return l(l(l(h(xi, yi, zi), h(xi + 1, yi, zi), fx), l(h(xi, yi + 1, zi), h(xi + 1, yi + 1, zi), fx), fy),
      l(l(h(xi, yi, zi + 1), h(xi + 1, yi, zi + 1), fx), l(h(xi, yi + 1, zi + 1), h(xi + 1, yi + 1, zi + 1), fx), fy), fz);
  }
  // 洞穴：两个 3D 噪声同时接近 0.5 的地方挖空，形成弯曲连通的管道；y<2 留底
  function caveAt(x, y, z) {
    if (y < 2 || Math.abs(vnoise3(x / 14, y / 9, z / 14, 31) - 0.5) >= CAVE) return false;
    return Math.abs(vnoise3(x / 14, y / 9, z / 14, 32) - 0.5) < CAVE;
  }
  function heightAt(x, z) {
    const n = vnoise(x / 48, z / 48, 1) * 0.6 + vnoise(x / 20, z / 20, 2) * 0.3 + vnoise(x / 8, z / 8, 3) * 0.1;
    const r = Math.max(0, vnoise(x / 90, z / 90, 13) - 0.55);          // 山脉：低频噪声超过阈值的地方隆起
    return Math.min(H - 6, Math.floor(10 + n * 34 + r * r * 260));
  }
  // 群系：0 草原 / 1 沙漠 / 2 雪原
  // ---- 生成规则的版本 ----
  // 以后每次升级都可能加新物种，但不能让新长出来的树、花、石头钻进玩家已经盖好的房子里。三条规矩：
  //   1. 地形（高低、水、草原/沙漠/雪原、洞）和村庄永远不变。新版本只能改“地表上长什么、岩层是哪种石头”。
  //   2. 新手村周围（出生点 HOME_R 格内的区块）永远用第 1 版规则：新玩家看到的环境固定，老玩家的家也不会变。
  //   3. 别处的区块，玩家第一次动它的时候把当时的版本记下来（World.set），以后一直按那个版本生成；没动过的区块用最新版。
  //      版本记在这个区块的改动表里：edits[区块].g = 'v2'（带个 v，免得被当成方块编号）。存档和联机都带着改动表走，不用另外传。
  // 加新物种的做法：GEN 加 1，新规则写在 `v >= 新版本号` 的分支里；旧分支一个字都不要改。
  const GEN = 2, HOME = [36, 8], HOME_R = 128;
  const homeChunk = (cx, cz) => Math.hypot(cx * 16 + 8 - HOME[0], cz * 16 + 8 - HOME[1]) < HOME_R;
  // ---- 南北气候（第 2 版起）----
  // z 是“纬度”：z 越小越靠北、越冷，z 越大越靠南、越热。出生点（z≈8）在中部。分界线大约在 z = ±160（最近 ±110、最远 ±215），被噪声弄得弯弯曲曲，不是一条直线。
  //   北方（0）：苹果树、樱花树；水仙、百合、蓝花；蘑菇多；南瓜
  //   中部（1）：草原为主；玫瑰、油菜花、红花黄花、向日葵；葡萄藤；南瓜和西瓜；少量果树和竹子
  //   南方（2）：芒果树、香蕉树、荔枝树；海滩上的大王椰子；成片的竹林（熊猫跟着竹子走）；向日葵；西瓜
  function climateAt(x, z) { const t = z / 360 + (vnoise(x / 90, z / 90, 12) - 0.5) * 0.3; return t < -0.45 ? 0 : t > 0.45 ? 2 : 1; }
  function biomeAt(x, z) { const t = vnoise(x / 140, z / 140, 11); return t > 0.62 ? 1 : t < 0.38 ? 2 : 0; } // 群系不跟气候带走：地形和村庄的位置永远不随版本变
  const ZONE_FLOWERS = [[87, 79, 70, 69], [77, 88, 68, 69, 78], [78, 78, 68, 79]];                     // 各带的野花
  const ZONE_CROWNS = [[[0.08, 145], [0.14, 144]], [[0.03, 145], [0.07, 144], [0.09, 152]], [[0.09, 152], [0.17, 159], [0.23, 199]]]; // 各带的果树：[累计比例, 树冠方块]。145 苹果 144 樱花 152 芒果 159 香蕉 199 荔枝
  function surfaceAt(x, z, h) {
    if (h <= SEA + 1) return SAND;       // 海滩
    if (h > 52) return SNOW;             // 雪线
    if (h > 44) return STONE;            // 裸岩山体
    return [MOSS, SAND, SNOW][biomeAt(x, z)];
  }
  // 岩层本身也分种类：大片的花岗岩和石板岩，窄一些的大理石带，深处偶尔有石英脉；其余是普通岩石。裸露的山体表面也照这个来
  function rockAt(x, y, z) {
    const a = vnoise3(x / 15, y / 7, z / 15, 51);
    if (a > 0.78) return GRANITE;
    if (a < 0.22) return SLATE;
    if (vnoise3(x / 11, y / 6, z / 11, 52) > 0.84) return MARBLE;
    if (y < 36 && vnoise3(x / 7, y / 4, z / 7, 53) > 0.88) return QUARTZ;
    return STONE;
  }
  function oreAt(x, y, z, v = GEN) { // 岩层里的矿：2×2×2 的小团，越稀有埋得越深
    const rock = v >= 2 ? rockAt(x, y, z) : STONE; // 第 1 版只有普通岩石
    if (y <= 4 && vnoise3(x / 6, y / 3, z / 6, 41) > 0.74) return OBSIDIAN;       // 最深处成片的黑曜石
    // 晶洞：每个 16³ 的格子里最多一个，球心在格子中部。外壳方解石、内层紫水晶、中间空心
    const gx = x >> 4, gy = y >> 4, gz = z >> 4;
    if (hash(gx + gy * 8191, gz, 43) < 0.12) {
      const cx = gx * 16 + 5 + hash(gx, gz, 44) * 6, cy = gy * 16 + 5 + hash(gx, gy, 45) * 6, cz = gz * 16 + 5 + hash(gz, gy, 46) * 6;
      const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy, z + 0.5 - cz);
      if (cy > 8 && cy < 34 && d < 3.7) return d < 1.6 ? AIR : d < 2.7 ? AMETHYST : CALCITE;
    }
    if (y < 44 && vnoise3(x / 9, y / 5, z / 9, 47) > 0.86) return CALCITE;       // 方解石矿脉：白色的岩带
    if (hash(x + y * 8191, z, 22) < 0.25) return rock;               // 啃掉一些边角，矿团不那么方
    const c = hash((x >> 1) + (y >> 1) * 8191, z >> 1, 21);
    if (c < 0.03) return COAL;
    if (c < 0.05) return y < 30 ? IRON : rock;
    if (c < 0.058) return y < 18 ? GOLD : rock;
    if (c < 0.063) return y < 12 ? CRYSTAL : rock;
    if (c < 0.066) return y < 10 ? DIAMOND : rock;                   // 钻石最深
    if (c < 0.074) return y < 24 ? [EMERALD, RUBY, SAPPHIRE][biomeAt(x, z)] : rock; // 宝石跟着群系：草原绿宝石、沙漠红宝石、雪原蓝宝石
    return rock;
  }
  // 0 无 / 1 阔叶树（草原）/ 2 松树（雪原）/ 3 枯木桩（沙漠）
  function treeAt(x, z) {
    const r = hash(x, z, 9); if (r >= 0.012) return 0;
    const top = surfaceAt(x, z, heightAt(x, z)), b = biomeAt(x, z);
    return top === MOSS ? 1 : top === SNOW && b === 2 && r < 0.008 ? 2 : top === SAND && b === 1 && r < 0.004 ? 3 : top === SAND && b !== 1 && r < 0.009 && climateAt(x, z) === 2 && heightAt(x, z) <= SEA + 3 && heightAt(x, z) > SEA ? 4 : 0; // 4：南方海滩上的大王椰子
  }

  // ---- 村庄和城镇：稀少的现成建筑 ----
  // 世界按 192×192 格分成大格，每个大格最多一个聚落（约四成的大格有），所以相邻两个通常隔两三百格。
  // 只建在草原、离水面 3 格以上的地方。村庄 5–7 间房；四分之一是城镇：10–12 间房，外加一座两层的大屋和一座瞭望塔。
  // 中心是一口井和小广场，每间房有一条小路通到中心。房子顺着各自脚下的地势起建，下面垫地基。
  const REGION = 192, villages = new Map();
  function villageIn(rx, rz) {
    const key = rx + ',' + rz; if (villages.has(key)) return villages.get(key);
    let v = null;
    if (hash(rx, rz, 301) < 0.4) {
      const cx = rx * REGION + 48 + Math.floor(hash(rx, rz, 302) * (REGION - 96)), cz = rz * REGION + 48 + Math.floor(hash(rx, rz, 303) * (REGION - 96)), ch = heightAt(cx, cz);
      if (biomeAt(cx, cz) === 0 && ch > SEA + 3 && surfaceAt(cx, cz, ch) === MOSS) {
        const town = hash(rx, rz, 304) < 0.25, n = town ? 10 + Math.floor(hash(rx, rz, 305) * 3) : 5 + Math.floor(hash(rx, rz, 305) * 3), houses = [];
        const WALLS = [8, 10, 9, 93, 94, 91], ROOFS = [55, 53, 55, 92];
        for (let i = 0; i < n + (town ? 2 : 0); i++) {
          const r = k => hash(cx + i * 7, cz - i * 13, k), special = i >= n ? i - n + 1 : 0; // special 1 = 大屋，2 = 瞭望塔
          const ang = (i + r(310) * 0.7) / (n + (town ? 2 : 0)) * 6.283, dist = (i % 2 ? 10 : 17) + r(311) * (town ? 9 : 4) + (town && i % 3 === 0 ? 8 : 0);
          const w = special === 1 ? 9 : special === 2 ? 5 : 5 + 2 * Math.floor(r(312) * 2), dp = special === 1 ? 7 : special === 2 ? 5 : 5 + 2 * Math.floor(r(313) * 2);
          const hx = Math.round(cx + Math.cos(ang) * dist), hz = Math.round(cz + Math.sin(ang) * dist), gy = heightAt(hx, hz);
          if (gy <= SEA + 2 || biomeAt(hx, hz) !== 0 || Math.abs(gy - ch) > 7) continue;                 // 落在水边、别的群系或落差太大的位置：这间不建
          const ax = hx - (w >> 1), az = hz - (dp >> 1);
          if (houses.some(h => ax < h.ax + h.w + 2 && ax + w + 2 > h.ax && az < h.az + h.d + 2 && az + dp + 2 > h.az)) continue; // 和已有的房子挨得太近：不建
          const side = Math.abs(cx - hx) > Math.abs(cz - hz) ? (cx > hx ? 0 : 1) : (cz > hz ? 2 : 3); // 门朝向村子中心：0 +x 墙、1 -x 墙、2 +z 墙、3 -z 墙
          houses.push({ ax, az, w, d: dp, gy, side, special, wall: special ? 10 : WALLS[Math.floor(r(314) * WALLS.length)], roof: special === 2 ? 92 : ROOFS[Math.floor(r(315) * ROOFS.length)], chest: r(316) < 0.5 });
        }
        if (houses.length >= 3) v = { cx, cz, ch, town, houses };
      }
    }
    villages.set(key, v); return v;
  }
  function inVillage(wx, wz) {
    const v = villageIn(Math.floor(wx / REGION), Math.floor(wz / REGION));
    return !!v && (Math.max(Math.abs(wx - v.cx), Math.abs(wz - v.cz)) <= 7 || v.houses.some(h => wx >= h.ax - 3 && wx < h.ax + h.w + 3 && wz >= h.az - 3 && wz < h.az + h.d + 3));
  }
  function buildVillages(put, x0, z0) {
    const R = 40; // 聚落离中心最远的方块不超过 40 格
    for (let rx = Math.floor((x0 - R) / REGION); rx <= Math.floor((x0 + CH + R) / REGION); rx++) for (let rz = Math.floor((z0 - R) / REGION); rz <= Math.floor((z0 + CH + R) / REGION); rz++) {
      const v = villageIn(rx, rz);
      if (!v || v.cx + R < x0 || v.cx - R >= x0 + CH || v.cz + R < z0 || v.cz - R >= z0 + CH) continue;
      const P = (wx, wy, wz, id) => put(wx - x0, wy, wz - z0, id), inChunk = (ax, az, w, dp, m) => ax - m < x0 + CH && ax + w + m > x0 && az - m < z0 + CH && az + dp + m > z0;
      const path = (wx, wz) => { const h = heightAt(wx, wz); if (h > SEA && surfaceAt(wx, wz, h) !== STONE) { P(wx, h, wz, 51); P(wx, h + 1, wz, AIR); P(wx, h + 2, wz, AIR); } }; // 小路：把地表那一格换成砂岩
      for (const h of v.houses) { // 先铺路：从门口直通中心
        const dx0 = h.ax + (h.w >> 1) + (h.side === 0 ? (h.w >> 1) + 1 : h.side === 1 ? -(h.w >> 1) - 1 : 0), dz0 = h.az + (h.d >> 1) + (h.side === 2 ? (h.d >> 1) + 1 : h.side === 3 ? -(h.d >> 1) - 1 : 0);
        const steps = Math.max(Math.abs(v.cx - dx0), Math.abs(v.cz - dz0));
        for (let i = 0; i <= steps; i++) { const wx = Math.round(dx0 + (v.cx - dx0) * i / steps), wz = Math.round(dz0 + (v.cz - dz0) * i / steps); if (wx >= x0 - 1 && wx <= x0 + CH && wz >= z0 - 1 && wz <= z0 + CH) { path(wx, wz); path(wx + 1, wz); } }
      }
      if (inChunk(v.cx - 4, v.cz - 4, 9, 9, 0)) { // 中心：小广场、井、四角的灯柱
        for (let dx = -4; dx <= 4; dx++) for (let dz = -4; dz <= 4; dz++) {
          const wx = v.cx + dx, wz = v.cz + dz;
          for (let y = Math.min(heightAt(wx, wz), v.ch); y < v.ch; y++) P(wx, y, wz, STONE);
          P(wx, v.ch, wz, Math.abs(dx) === 4 || Math.abs(dz) === 4 ? 51 : 52); for (let y = v.ch + 1; y <= v.ch + 7; y++) P(wx, y, wz, AIR);
        }
        for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) { const rim = dx || dz; P(v.cx + dx, v.ch + 1, v.cz + dz, rim ? 10 : WATER); if (!rim) { P(v.cx, v.ch, v.cz, WATER); P(v.cx, v.ch - 1, v.cz, 10); } }
        for (const [dx, dz] of [[-1, -1], [1, 1], [-1, 1], [1, -1]]) { P(v.cx + dx, v.ch + 2, v.cz + dz, 6); P(v.cx + dx, v.ch + 3, v.cz + dz, 6); }
        for (let dx = -2; dx <= 2; dx++) for (let dz = -2; dz <= 2; dz++) P(v.cx + dx, v.ch + 4, v.cz + dz, 55); for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) P(v.cx + dx, v.ch + 5, v.cz + dz, 55);
        for (const [dx, dz] of [[-4, -4], [4, 4], [-4, 4], [4, -4]]) { P(v.cx + dx, v.ch + 1, v.cz + dz, 10); P(v.cx + dx, v.ch + 2, v.cz + dz, 10); P(v.cx + dx, v.ch + 3, v.cz + dz, LAMP); }
      }
      for (const h of v.houses) { // 再盖房子
        if (!inChunk(h.ax, h.az, h.w, h.d, 2)) continue;
        const { ax, az, w, d: dp, gy } = h, walls = h.special === 2 ? 9 : h.special === 1 ? 7 : 3, mx = ax + (w >> 1), mz = az + (dp >> 1);
        for (let x = -1; x <= w; x++) for (let z = -1; z <= dp; z++) {
          const wx = ax + x, wz = az + z, inside = x >= 0 && x < w && z >= 0 && z < dp, edge = x === 0 || x === w - 1 || z === 0 || z === dp - 1, corner = (x === 0 || x === w - 1) && (z === 0 || z === dp - 1);
          for (let y = gy + 1; y <= gy + walls + 6; y++) P(wx, y, wz, AIR);                                      // 清掉地面以上（树、花、山坡）
          if (!inside) continue;
          for (let y = Math.min(heightAt(wx, wz), gy); y < gy; y++) P(wx, y, wz, 10);                              // 地基垫到同一高度
          P(wx, gy, wz, 8);
          if (edge) for (let y = 1; y <= walls; y++) P(wx, gy + y, wz, corner ? 6 : h.wall);
          if (h.special && !edge && walls > 4) P(wx, gy + 4, wz, x === 1 && z === 1 ? AIR : 8);                    // 大屋和塔：二层楼板，角上留一个上下的口
        }
        const door = h.side === 0 ? [ax + w - 1, mz] : h.side === 1 ? [ax, mz] : h.side === 2 ? [mx, az + dp - 1] : [mx, az];
        P(door[0], gy + 1, door[1], AIR); P(door[0], gy + 2, door[1], AIR);
        for (const [wx, wz, sd] of [[ax + w - 1, mz, 0], [ax, mz, 1], [mx, az + dp - 1, 2], [mx, az, 3]]) for (let y = 2; y <= walls; y += 4) if (sd !== h.side || y > 2) P(wx, gy + y, wz, GLASS); // 其余三面墙（和楼上每一面）开窗
        for (let k = 0; ; k++) { // 屋顶：一层层往里收的四坡顶，第一层挑出一格屋檐
          const x1 = ax - 1 + k, x2 = ax + w - k, z1 = az - 1 + k, z2 = az + dp - k; if (x1 > x2 || z1 > z2) break;
          for (let x = x1; x <= x2; x++) for (let z = z1; z <= z2; z++) P(x, gy + walls + 1 + k, z, h.roof);
        }
        P(mx, gy + walls, mz, LAMP);                                                                               // 屋里吊一盏灯
        if (h.special && walls > 4) P(mx, gy + 3, mz, LAMP);
        if (h.chest) P(h.side === 1 ? ax + w - 2 : ax + 1, gy + 1, h.side === 3 ? az + dp - 2 : az + 1, 76);       // 一半的房子里有个空箱子
        const out = h.side === 0 ? [ax + w, mz + 1] : h.side === 1 ? [ax - 1, mz + 1] : h.side === 2 ? [mx + 1, az + dp] : [mx + 1, az - 1]; // 门外的灯柱
        const oh = heightAt(out[0], out[1]); if (oh >= gy - 2 && oh <= gy + 1) { for (let y = oh + 1; y <= gy + 2; y++) P(out[0], y, out[1], 10); P(out[0], gy + 3, out[1], LAMP); }
      }
    }
  }

  function genChunk(cx, cz, gen = GEN) {
    const v = homeChunk(cx, cz) ? 1 : gen; // 这个区块按哪一版规则生成
    const d = new Uint8Array(CH * CH * H), x0 = cx * CH, z0 = cz * CH;
    const put = (x, y, z, id, onlyAir) => {
      if (x < 0 || x >= CH || z < 0 || z >= CH || y < 0 || y >= H) return;
      const i = x + z * CH + y * CH * CH;
      if (!onlyAir || d[i] === AIR) d[i] = id;
    };
    let flowers = 0, bushes = 0;
    for (let z = 0; z < CH; z++) for (let x = 0; x < CH; x++) {
      const wx = x0 + x, wz = z0 + z, h = heightAt(wx, wz), top = surfaceAt(wx, wz, h);
      const sub = top === SAND ? SAND : top === STONE ? STONE : DIRT;
      const roof = h <= SEA + 4 ? h - 5 : h; // 洞可以开口到地表，但水边/水下留 5 格厚的壳，免得洞壁贴着不会流动的水
      for (let y = 0; y <= h; y++) {
        if (y <= roof && caveAt(wx, y, wz)) continue;
        put(x, y, z, y < h - 3 || top === STONE ? oreAt(wx, y, wz, v) : y < h ? sub : v >= 2 && top === SAND && h <= SEA + 1 && vnoise3(wx / 7, 0, wz / 7, 90) > 0.7 ? COBBLE : top); // 水边和浅水底的沙地上，成片的鹅卵石滩（一片大约 5–10 格宽） // 裸岩山体表面也露矿
      }
      for (let y = h + 1; y <= SEA; y++) put(x, y, z, WATER);
      if (top === MOSS && d[x + z * CH + h * CH * CH] === MOSS) { // 草原的草地上：每个区块花不超过 6 朵、浆果丛不超过 2 丛
        const r = hash(wx, wz, 77), zone = climateAt(wx, wz);
        if (r < 0.006 && bushes < 2) { bushes++; put(x, h + 1, z, 71); }
        else if (v < 2) { if (r > 0.97 && flowers < 6) { flowers++; put(x, h + 1, z, 68 + Math.floor(hash(wx, wz, 78) * 3)); } } // 第 1 版：只有红黄蓝三种花
        else if (r > 0.97 && flowers < 6) { flowers++; const F = ZONE_FLOWERS[zone]; put(x, h + 1, z, F[Math.floor(hash(wx, wz, 78) * F.length)]); }
        else if (r > 0.02 && r < (zone === 0 ? 0.03 : zone === 1 ? 0.024 : 0.02)) put(x, h + 1, z, MUSHROOMS[Math.floor(hash(wx, wz, 82) * MUSHROOMS.length)]); // 蘑菇：北方多，中部少，南方没有
        else if (r > 0.03 && r < 0.033) { const melon = zone === 2 || (zone === 1 && r > 0.0315); put(x, h + 1, z, melon ? MELON : PUMPKIN); }      // 南瓜在北方和中部，西瓜在中部和南方
        else if (zone === 1 && r > 0.035 && r < 0.038) { put(x, h + 1, z, GRAPE_VINE); if (hash(wx, wz, 83) < 0.5) put(x, h + 2, z, GRAPE_VINE); } // 葡萄藤：中部草地上一两格高的一丛
        else if (zone && r > 0.9 && hash(wx >> 3, wz >> 3, 79) < (zone === 2 ? 0.14 : 0.02)) { const n = 3 + Math.floor(hash(wx, wz, 80) * 4); for (let k = 1; k <= n; k++) put(x, h + k, z, 89); } // 竹丛：南方成片，中部偶尔有，北方没有
      }
    }
    // 树可能跨区块：扫描外扩 6 格内的树（枝最远伸出 4 格，枝头的树冠再 2 格），只写落在本区块的部分
    for (let z = -6; z < CH + 6; z++) for (let x = -6; x < CH + 6; x++) {
      const wx = x0 + x, wz = z0 + z, kind = treeAt(wx, wz);
      if (!kind || (kind === 4 && v < 2)) continue; // 大王椰子是第 2 版加的
      if (inVillage(wx, wz)) continue; // 村子的广场上、房子周围 3 格内不长树
      const hh = heightAt(wx, wz);
      if (hh > SEA + 4 && caveAt(wx, hh, wz)) continue; // 脚下正好是洞口就不长树
      const base = hh + 1, log = woodLogAt(wx, wz), rnd = k => hash(wx, wz, k);
      const sp = rnd(31), fruit = v >= 2 && kind === 1 && ZONE_CROWNS[climateAt(wx, wz)].find(c => sp < c[0]), crown = fruit ? fruit[1] : LEAF; // 阔叶树里一小部分是果树，种类看南北
      // 一团树冠：以 (cx, cy, cz) 为中心，下两层半径 r、上两层半径 r-1，四角随机缺一些
      const blob = (cx, cy, cz, r) => {
        for (let dy = -1; dy <= 2; dy++) {
          const rr = dy <= 0 ? r : r - 1; if (rr < 0) continue;
          for (let dz = -rr; dz <= rr; dz++) for (let dx = -rr; dx <= rr; dx++) {
            if (rr && Math.abs(dx) === rr && Math.abs(dz) === rr && hash(wx + cx + dx, wz + cz + dz, cy + dy) < 0.6) continue;
            put(x + cx + dx, base + cy + dy, z + cz + dz, crown, true);
          }
        }
      };
      if (kind === 1) { // 阔叶树：按一套生长规则长出来——树干上向四面八方抽枝，枝斜着往上长，枝上还能再分叉，枝头各顶一团叶子
        let seed = Math.floor(rnd(21) * 4294967296) >>> 0;
        const r = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; }; // 每棵树自己的随机数，位置定了长相就定了
        const D8 = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
        const limb = (px, py, pz, dir, len, depth) => { // 从 (px, py, pz) 朝 dir 方向长 len 段：每段先横着伸一步，多半再往上接一格（拐角）；中途可能再分出一根小枝
          let lx = px, ly = py, lz = pz;
          for (let i = 0; i < len; i++) {
            const nx = lx + D8[dir][0], nz = lz + D8[dir][1];
            if (Math.abs(nx) > 4 || Math.abs(nz) > 4) break;                       // 枝最远伸出 4 格，加上树冠不超过扫描范围
            // 每一格都和上一格面对面连着，不留只碰到棱角的“悬空台阶”：斜向分成先横一步再纵一步，抬高时在转弯处直接往上接一格，形成拐角
            if (nx !== lx) { lx = nx; put(x + lx, base + ly, z + lz, log); }
            if (nz !== lz) { lz = nz; put(x + lx, base + ly, z + lz, log); }
            if (i % 2 || r() < 0.65) { ly++; put(x + lx, base + ly, z + lz, log); }
            if (depth < 2 && i >= 1 && r() < 0.4) limb(lx, ly, lz, (dir + (r() < 0.5 ? 1 : 7) + (r() < 0.3 ? (r() < 0.5 ? 1 : 7) : 0)) % 8, 1 + Math.floor(r() * 2), depth + 1); // 往旁边偏 45° 或 90° 再分叉
            if (r() < 0.25) dir = (dir + (r() < 0.5 ? 1 : 7)) % 8;                 // 枝自己也会拐一点弯
          }
          blob(lx, ly + 1, lz, depth === 0 && len >= 3 ? 2 : 1); // 只有长的主枝顶大团叶子，其余小团：树叶总量控制在原来的一倍半左右，免得画面变重
        };
        const size = r(), th = size < 0.35 ? 3 + Math.floor(r() * 2) : size < 0.75 ? 5 + Math.floor(r() * 2) : 7 + Math.floor(r() * 3); // 矮 3–4、中 5–6、高 7–9
        const limbs = size < 0.35 ? Math.floor(r() * 2) : size < 0.75 ? 2 + Math.floor(r() * 2) : 3 + Math.floor(r() * 3);                // 侧枝：矮树 0–1 根、中等 2–3 根、大树 3–5 根
        let dir = Math.floor(r() * 8);
        for (let k = 0; k < limbs; k++) {
          dir = (dir + 2 + Math.floor(r() * 3)) % 8;                                // 每根枝换一个方向，绕着树干错开
          limb(0, Math.min(th - 1, 2 + Math.floor(r() * Math.max(1, th - 3))), 0, dir, 2 + Math.floor(r() * (size < 0.75 ? 2 : 3)), 0);
        }
        if (th >= 5 && r() < 0.4) { // 有些树到顶不再直着长，主干分成两三股各奔一方
          const forks = 2 + Math.floor(r() * 2); let fd = Math.floor(r() * 8);
          for (let k = 0; k < forks; k++) { fd = (fd + 2 + Math.floor(r() * 2)) % 8; limb(0, th - 1, 0, fd, 2 + Math.floor(r() * 2), 0); }
        } else blob(0, th - 1, 0, 2);
        for (let dy = 0; dy < th; dy++) put(x, base + dy, z, log);
        continue;
      }
      if (kind === 4) { // 大王椰子：又高又直的浅色树干（白桦原木），顶上一圈向外垂下去的大叶子
        const th = 7 + Math.floor(rnd(10) * 3);
        for (let dy = 0; dy < th; dy++) put(x, base + dy, z, 180);
        put(x, base + th, z, LEAF, true);
        for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { put(x + dx, base + th, z + dz, LEAF, true); put(x + 2 * dx, base + th, z + 2 * dz, LEAF, true); put(x + 3 * dx, base + th - 1, z + 3 * dz, LEAF, true); }
        for (const [dx, dz] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) { put(x + dx, base + th, z + dz, LEAF, true); put(x + 2 * dx, base + th - 1, z + 2 * dz, LEAF, true); }
        continue;
      }
      const th = kind === 3 ? 1 + Math.floor(rnd(10) * 2) : 5 + Math.floor(rnd(10) * 5); // 松树 5–9 格高，枯木桩 1–2 格
      for (let dy = 2; kind === 2 && dy <= th + 1; dy++) { // 松树：塔形，半径 2/1 交替收到尖
        const r = dy > th ? 0 : th - dy >= 2 && dy % 2 ? 2 : 1;
        for (let dz = -r; dz <= r; dz++) for (let dx = -r; dx <= r; dx++) {
          if (r && Math.abs(dx) === r && Math.abs(dz) === r) continue;
          put(x + dx, base + dy, z + dz, LEAF, true);
        }
      }
      for (let dy = 0; dy < th; dy++) put(x, base + dy, z, log);
    }
    buildVillages(put, x0, z0);
    return d;
  }

  // ---- 世界：区块数据 + 玩家改动 ----
  class World {
    constructor(gen = genChunk, edits = {}) { this.gen = gen; this.edits = edits; this.chunks = new Map(); }
    chunk(cx, cz) {
      // ponytail: 区块数据只增不删（16KB/块），走得极远才会成问题，到时加 LRU
      const k = cx + ',' + cz;
      let d = this.chunks.get(k);
      if (!d) {
        const e = this.edits[k];
        d = this.gen(cx, cz, e ? (e.g ? +String(e.g).slice(1) : 1) : GEN); // 动过的区块按当时记下的版本生成（旧存档没记，就是第 1 版）；没动过的用最新版
        if (e) for (const i in e) if (i !== 'g') d[i] = e[i];
        this.chunks.set(k, d);
      }
      return d;
    }
    get(x, y, z) {
      if (y < 0) return STONE;
      if (y >= H) return AIR;
      return this.chunk(x >> 4, z >> 4)[(x & 15) + (z & 15) * CH + y * CH * CH];
    }
    set(x, y, z, id) {
      if (y < 0 || y >= H) return;
      const k = (x >> 4) + ',' + (z >> 4), i = (x & 15) + (z & 15) * CH + y * CH * CH;
      this.chunk(x >> 4, z >> 4)[i] = id;
      (this.edits[k] || (this.edits[k] = { g: 'v' + GEN }))[i] = id; // 第一次动这个区块：记下它现在是按哪一版生成的
    }
  }

  // ---- 区块网格：只生成暴露的面 ----
  // 每个面：方向、4 个角（外侧看逆时针）、明暗、用哪个贴图槽（0 顶 1 侧 2 底）
  const FACES = [
    { d: [1, 0, 0], c: [[1, 0, 1], [1, 0, 0], [1, 1, 0], [1, 1, 1]], s: 0.88, t: 1 },
    { d: [-1, 0, 0], c: [[0, 0, 0], [0, 0, 1], [0, 1, 1], [0, 1, 0]], s: 0.62, t: 1 },
    { d: [0, 1, 0], c: [[0, 1, 1], [1, 1, 1], [1, 1, 0], [0, 1, 0]], s: 1, t: 0 },
    { d: [0, -1, 0], c: [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]], s: 0.45, t: 2 },
    { d: [0, 0, 1], c: [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]], s: 0.78, t: 1 },
    { d: [0, 0, -1], c: [[1, 0, 0], [0, 0, 0], [0, 1, 0], [1, 1, 0]], s: 0.55, t: 1 },
  ];
  // 环境光遮蔽：每个角预先算好要查的 3 个邻格（两条边 + 对角）
  for (const f of FACES) {
    const a = f.d.findIndex(v => v), u = (a + 1) % 3, w = (a + 2) % 3;
    f.ao = f.c.map(c => {
      const s1 = [...f.d], s2 = [...f.d], cr = [...f.d], du = c[u] ? 1 : -1, dw = c[w] ? 1 : -1;
      s1[u] += du; s2[w] += dw; cr[u] += du; cr[w] += dw;
      return [s1, s2, cr];
    });
  }
  const UV = [[0.01, 0.01], [0.99, 0.01], [0.99, 0.99], [0.01, 0.99]];

  // Low relief made of real rounded stones, only on exposed cobblestone faces.
  function cobbleFace(out,x,y,z,f,wx,wy,wz,light=1){
    const o=f.c[0],u=f.c[1].map((v,i)=>v-o[i]),v=f.c[3].map((v,i)=>v-o[i]);
    const target=out;out={pos:[],nor:[],uv:[],col:[],idx:[]};const coords=[];
    const origin=[wx,wy,wz].map((q,i)=>q+o[i]);
    const U=origin.reduce((s,q,i)=>s+q*u[i],0),V=origin.reduce((s,q,i)=>s+q*v[i],0);
    const seed=origin.reduce((s,q,i)=>s+q*f.d[i],0)*131+FACES.indexOf(f)*977;
    let stoneColor=[.85,.88,.91];
    const vertex=(a,b,h,nu,nv,nn,tone,tu,tv)=>{
      coords.push([a,b]);
      const n=u.map((q,i)=>q*nu+v[i]*nv+f.d[i]*nn),len=Math.hypot(...n);
      out.pos.push(...o.map((q,i)=>[x,y,z][i]+q+u[i]*a+v[i]*b+f.d[i]*h));
      out.nor.push(...n.map(q=>q/len));out.uv.push((3+tu)/ATLAS_TILES,tv);
      const shade=light*tone*(.73+.27*nn/len);
      out.col.push(shade*stoneColor[0],shade*stoneColor[1],shade*stoneColor[2]);
    };
    // Recessed mineral bed closes all gaps and keeps the block watertight.
    let base=out.pos.length/3;
    for(const [a,b] of [[0,0],[1,0],[1,1],[0,1]])vertex(a,b,0,0,0,1,.62,.01+a*.98,.01+b*.98);
    out.idx.push(base,base+1,base+2,base,base+2,base+3);
    // Random sites partition the face into closely fitted stones, with no rows.
    // Half-plane clipping keeps them non-overlapping and inside the block.
    const sites=[],spacing=.35;
    for(let gy=Math.floor(V/spacing)-2;gy<=Math.floor((V+1)/spacing)+2;gy++)for(let gx=Math.floor(U/spacing)-2;gx<=Math.floor((U+1)/spacing)+2;gx++){
      sites.push([(gx+.12+hash(gx,gy,seed+41)*.76)*spacing-U,(gy+.12+hash(gx,gy,seed+42)*.76)*spacing-V,gx,gy]);
    }
    for(let k=0;k<sites.length;k++){
      const site=sites[k];if(site[0]<-.5||site[0]>1.5||site[1]<-.5||site[1]>1.5)continue;
      const stoneSeed=site[2]*7919+site[3]*104729;
      let polygon=[[site[0]-.8,site[1]-.8],[site[0]+.8,site[1]-.8],[site[0]+.8,site[1]+.8],[site[0]-.8,site[1]+.8]];
      for(let j=0;j<sites.length&&polygon.length;j++){
        if(j===k)continue;
        const other=sites[j],nx=other[0]-site[0],ny=other[1]-site[1];
        const limit=(other[0]**2+other[1]**2-site[0]**2-site[1]**2)/2,next=[];
        for(let i=0;i<polygon.length;i++){
          const a=polygon[i],b=polygon[(i+1)%polygon.length],da=a[0]*nx+a[1]*ny-limit,db=b[0]*nx+b[1]*ny-limit;
          if(da<=1e-10)next.push(a);
          if((da<0)!==(db<0)){const t=da/(da-db);next.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);}
        }polygon=next;
      }
      if(polygon.length<3||polygon.every(p=>p[0]<0)||polygon.every(p=>p[0]>1)||polygon.every(p=>p[1]<0)||polygon.every(p=>p[1]>1))continue;
      const cx=polygon.reduce((s,p)=>s+p[0],0)/polygon.length,cy=polygon.reduce((s,p)=>s+p[1],0)/polygon.length;
      // Quadratic corner arcs and a curved dome mimic water-worn edges.
      const rim=[];
      for(let j=0;j<polygon.length;j++){
        const a=polygon[j],prev=polygon[(j+polygon.length-1)%polygon.length],next=polygon[(j+1)%polygon.length];
        const enter=a.map((q,i)=>q*.66+prev[i]*.34),exit=a.map((q,i)=>q*.66+next[i]*.34);
        for(let step=0;step<=3;step++){const t=step/3;rim.push(a.map((q,i)=>(1-t)**2*enter[i]+2*t*(1-t)*q+t*t*exit[i]));}
      }
      const palette=[[.92,.98,1.06],[.79,.88,.98],[1.08,1.10,1.12],[.67,.71,.77],[1.02,.94,.83],[.88,.92,.94]];
      stoneColor=palette[Math.floor(hash(seed,stoneSeed,49)*palette.length)];
      const height=.025+hash(seed,stoneSeed,44)*.04,tone=.9+hash(seed,stoneSeed,45)*.20,N=rim.length;
      base=out.pos.length/3;
      const rings=[[.98,.002],[.88,height*.49],[.53,height*.86]];
      for(const [r,h] of rings)for(const p of rim){
        const dx=p[0]-cx,dy=p[1]-cy,d=Math.hypot(dx,dy)||1;
        const slope=height*r/(d*Math.sqrt(1-r*r));
        vertex(cx+dx*r,cy+dy*r,h,dx/d*slope,dy/d*slope,1,tone,.48+dx*r*.3,.52+dy*r*.3);
      }
      vertex(cx,cy,height,0,0,1,tone,.48,.52);
      for(let j=0;j<N;j++){const n=(j+1)%N;
        for(let r=0;r<2;r++){const a=base+r*N,b=a+N;out.idx.push(a+j,a+n,b+n,a+j,b+n,b+j);}
        out.idx.push(base+3*N,base+2*N+j,base+2*N+n);
      }
    }
    const read=i=>[...coords[i],...out.pos.slice(i*3,i*3+3),...out.nor.slice(i*3,i*3+3),...out.uv.slice(i*2,i*2+2),...out.col.slice(i*3,i*3+3)];
    for(let t=0;t<out.idx.length;t+=3){
      let poly=out.idx.slice(t,t+3).map(read);
      for(const [axis,bound,sign] of [[0,0,-1],[0,1,1],[1,0,-1],[1,1,1]]){
        const next=[];
        for(let j=0;j<poly.length;j++){
          const a=poly[j],b=poly[(j+1)%poly.length],da=(a[axis]-bound)*sign,db=(b[axis]-bound)*sign;
          if(da<=0)next.push(a);
          if((da<0)!==(db<0)){const f=da/(da-db);next.push(a.map((q,i)=>q+(b[i]-q)*f));}
        }poly=next;
      }
      if(poly.length<3)continue;
      const base=target.pos.length/3;
      for(const p of poly){target.pos.push(...p.slice(2,5));target.nor.push(...p.slice(5,8));target.uv.push(...p.slice(8,10));target.col.push(...p.slice(10,13));}
      for(let j=1;j<poly.length-1;j++)target.idx.push(base,base+j,base+j+1);
    }
  }

  function meshChunk(world, cx, cz) {
    const data = world.chunk(cx, cz), x0 = cx * CH, z0 = cz * CH;
    const mk = () => ({ pos: [], nor: [], uv: [], col: [], idx: [], flow: [], foam: [], wind: [] });
    const solid = mk(), water = mk(), leaves=mk(), grass=mk();
    const at = (x, y, z) => {
      if (y < 0) return STONE;
      if (y >= H) return AIR;
      if (x >= 0 && x < CH && z >= 0 && z < CH) return data[x + z * CH + y * CH * CH];
      return world.get(x0 + x, y, z0 + z);
    };
    const occ = (x, y, z) => { const n = at(x, y, z); return n !== AIR && n !== WATER && !see(n) ? 1 : 0; };
    const lamps = []; // 本区块和周围八个区块里的灯（换算成本区块的局部坐标）：灯光只在建网格时算，不做逐帧光照
    for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) {
      const d = world.chunk(cx + dx, cz + dz);
      for (let i = d.indexOf(LAMP); i >= 0; i = d.indexOf(LAMP, i + 1)) lamps.push([(i & 15) + dx * CH, i >> 8, ((i >> 4) & 15) + dz * CH]);
    }
    // —— 不是整格的方块：用长方体或两片交叉的面拼出来，都画进实心网格（贴图带镂空）——
    const slab = (x0, y0, z0, x1, y1, z1, tile, v0=0, v1=1) => { // 一个长方体的六个面
      for (const f of FACES) {
        const v = solid.pos.length / 3, l = f.s * 0.95;
        for (let i = 0; i < 4; i++) {
          const k = f.c[i];
          solid.pos.push(k[0] ? x1 : x0, k[1] ? y1 : y0, k[2] ? z1 : z0);
          solid.nor.push(f.d[0], f.d[1], f.d[2]);
          solid.uv.push((tile + UV[i][0]) / ATLAS_TILES, v0+UV[i][1]*(v1-v0));
          solid.col.push(l, l * 0.98, l * (1.14 - 0.22 * l));
        }
        solid.idx.push(v, v + 1, v + 2, v, v + 2, v + 3);
      }
    };
    const cross = (x, y, z, tile, v0, v1, h0, h1, tint, ua = 0.01, ub = 0.99, width = 1) => { // ua、ub：只用这一格贴图横向的一段 // 两片交叉的竖面，正反都画：花草用
      for (const [ax, az, bx, bz] of [[0.12, 0.12, 0.88, 0.88], [0.12, 0.88, 0.88, 0.12]]) for (const flip of [0, 1]) {
        const v = solid.pos.length / 3, A = (flip ? [bx, bz] : [ax, az]).map(v=>.5+(v-.5)*width), B = (flip ? [ax, az] : [bx, bz]).map(v=>.5+(v-.5)*width);
        solid.pos.push(x + A[0], y + h0, z + A[1], x + B[0], y + h0, z + B[1], x + B[0], y + h1, z + B[1], x + A[0], y + h1, z + A[1]);
        const u0 = (tile + (flip ? ub : ua)) / ATLAS_TILES, u1 = (tile + (flip ? ua : ub)) / ATLAS_TILES;
        solid.uv.push(u0, v0, u1, v0, u1, v1, u0, v1);
        for (let i = 0; i < 4; i++) { solid.nor.push(0, 1, 0); solid.col.push(tint[0], tint[1], tint[2]); }
        solid.idx.push(v, v + 1, v + 2, v, v + 2, v + 3);
      }
    };
    const PETAL = { 68: [1, 0.3, 0.3], 69: [1, 0.86, 0.25], 70: [0.4, 0.55, 1] }, PLAIN = [0.95, 0.95, 0.95];
    const shape = (b, x, y, z) => {
      if(b>=200&&b<=243||ladderInfo(b)){for(const q of shapeBoxes(b,at,x,y,z))slab(x+q[0],y+q[1],z+q[2],x+q[3],y+q[4],z+q[5],BLOCKS[b].tiles[1]);return;}
      if(b===CAMPFIRE){ // 篝火：四角四块石头，中间两根交叉的木柴
        for(const [sx,sz] of [[.06,.06],[.72,.06],[.06,.72],[.72,.72]])slab(x+sx,y,z+sz,x+sx+.22,y+.16,z+sz+.22,3);
        slab(x+.16,y,z+.4,x+.84,y+.2,z+.6,6);slab(x+.4,y+.04,z+.16,x+.6,y+.24,z+.84,6);return;
      }
      const plant=PLANTS[b];
      if(plant){ // 新植物：下面一截绿茎，上面是贴图里的那一小块
        if(plant.stem)cross(x,y,z,29,0.01,0.5,0,plant.stem,PLAIN);
        cross(x,y,z,plant.tile,plant.qy?0.01:0.51,plant.qy?0.49:0.99,plant.stem,plant.top,PLAIN,plant.qx?0.51:0.01,plant.qx?0.99:0.49,plant.stem?(b===78?.85:.65):1);return;
      }
      const doorTile=BLOCKS[b].tiles[1],base=doorBase(b),doorV=base&&doorBase(at(x,y-1,z))===base?.5:0;
      if(b>=248&&b<=255){if(b&1)slab(x, y, z + 0.84, x + 1, y + 1, z + 1, doorTile,doorV,doorV+.5);else slab(x + 0.84, y, z, x + 1, y + 1, z + 1, doorTile,doorV,doorV+.5);return;} // 门·开，门板靠另一侧
      if(base)b=60+b-base;
      if (b === 60) slab(x, y, z + 0.42, x + 1, y + 1, z + 0.58, doorTile,doorV,doorV+.5);        // 门·关：门板在格子正中
      else if (b === 61) slab(x + 0.42, y, z, x + 0.58, y + 1, z + 1, doorTile,doorV,doorV+.5);
      else if (b === 62) slab(x, y, z, x + 0.16, y + 1, z + 1, doorTile,doorV,doorV+.5);          // 门·开：门板转到格子一侧
      else if (b === 63) slab(x, y, z, x + 1, y + 1, z + 0.16, doorTile,doorV,doorV+.5);
      else if (b === 64) slab(x, y, z + 0.45, x + 1, y + 1, z + 0.55, 17);   // 窗：一片薄玻璃
      else if (b === 65) slab(x + 0.45, y, z, x + 0.55, y + 1, z + 1, 17);
      else if (b === 66 || b === 67) { // 床：木床架上铺被子；另一头没有同伴的那半是枕头
        const head = b === 66 ? at(x + 1, y, z) !== 66 : at(x, y, z + 1) !== 67;
        slab(x, y, z, x + 1, y + 0.4, z + 1, 9); slab(x + 0.03, y + 0.4, z + 0.03, x + 0.97, y + 0.56, z + 0.97, head ? 16 : 28);
      } else if (PETAL[b]) { cross(x, y, z, 29, 0.01, 0.5, 0, 0.4, PLAIN); cross(x, y, z, 29, 0.5, 0.99, 0.4, 0.8, PETAL[b]); } // 下半绿茎，上半花朵染色
      else if (b === 74 || b === 75) { // 告示牌：一根木桩顶着一块牌子
        slab(x + 0.45, y, z + 0.45, x + 0.55, y + 0.5, z + 0.55, 9);
        if (b === 74) slab(x + 0.08, y + 0.5, z + 0.44, x + 0.92, y + 1, z + 0.56, 46); else slab(x + 0.44, y + 0.5, z + 0.08, x + 0.56, y + 1, z + 0.92, 46);
      } else cross(x, y, z, b === 71 ? 30 : b === 72 ? 8 : 31, 0.01, 0.99, 0, 0.9, PLAIN);
    };
    for (let y = 0; y < H; y++) for (let z = 0; z < CH; z++) for (let x = 0; x < CH; x++) {
      const b = data[x + z * CH + y * CH * CH];
      if (b === AIR) continue;
      if(b===MOSS&&at(x,y+1,z)===AIR){
        // World-space density patches cross chunk/block borders without a visible grid.
        const wx=x0+x,wz=z0+z,density=vnoise(wx*.23,wz*.23,913);
        for(let tuft=0;tuft<9;tuft++){
          if(hash(wx,wz,y+tuft*17+301)>.38+density*.59)continue;
          const tx=(tuft%3+.18+hash(wx,wz,y+tuft*17+302)*.64)/3;
          const tz=(Math.floor(tuft/3)+.18+hash(wx,wz,y+tuft*17+303)*.64)/3;
          const phase=hash(wx,wz,y+tuft*17+304)*6.283;
          const size=.75+hash(wx,wz,y+tuft*17+305)*.5;
          const patch=vnoise((wx+tx)*.16,(wz+tz)*.16,927);
          const tone=.72+patch*.42+hash(wx,wz,y+tuft*17+306)*.18;
          for(let blade=0;blade<9;blade++){
            const seed=hash(wx,wz,y+tuft*127+blade*13+401),angle=phase+blade*2.399;
            const dry=hash(wx,wz,y+tuft*127+blade*13+409)<.045+patch*.045;
            const variation=.9+hash(wx,wz,y+tuft*127+blade*13+410)*.2;
            const ux=Math.cos(angle),uz=Math.sin(angle),outer=blade<4;
            const height=(outer?.065+seed*.065:.16+seed*.13)*size;
            const width=(outer?.024:.014)+seed*.009,bend=(outer?.15:.075)+seed*.09;
            const bx=x+tx-uz*.025,bz=z+tz+ux*.025,base=grass.pos.length/3;
            for(const [side,t]of [[-1,0],[1,0],[-1,.57],[1,.57],[0,1]]){
              const taper=1-t*.72;
              grass.pos.push(bx+side*width*taper*ux-uz*bend*t*t,y+.99+t*height,bz+side*width*taper*uz+ux*bend*t*t);
              grass.nor.push(-uz*.6,.8,ux*.6);
              // A tuft shares its ground color; short spreading leaves blend its roots into the turf.
              grass.uv.push((.01+tx*.98)/ATLAS_TILES,.01+tz*.98);
              // Roots retain the turf tint. Color variation grows towards the tips,
              // with sparse straw-colored blades rather than uniformly yellow tufts.
              const blend=Math.min(1,t*1.5),light=tone*variation*(.98+t*.12);
              const tip=dry?[1.75*light,.94*light,.72*light]:[light*(.9+patch*.15),light,light*(.8+patch*.12)];
              grass.col.push(.96+(tip[0]-.96)*blend,.94+(tip[1]-.94)*blend,.88+(tip[2]-.88)*blend);
              grass.wind.push(t*t*(outer?.65:1),phase);
            }
            grass.idx.push(base,base+1,base+2,base+1,base+3,base+2,base+2,base+3,base+4);
          }
        }
        // Overhanging fringe only on exposed sides, never between adjoining blocks.
        for(const [edge,[dx,dz]]of [[1,0],[-1,0],[0,1],[0,-1]].entries()){
          if(at(x+dx,y,z+dz)!==AIR)continue;
          const ux=-dz,uz=dx;
          for(let tuft=0;tuft<5;tuft++){
            if(hash(wx,wz,y+edge*157+tuft*23+700)<.25)continue;
            const phase=hash(wx,wz,y+edge*157+tuft*23+701)*6.283;
            const along=-.44+hash(wx,wz,y+edge*157+tuft*23+702)*.88;
            const count=1+Math.floor(hash(wx,wz,y+edge*157+tuft*23+703)*4);
            for(let blade=0;blade<count;blade++){
              const seed=hash(wx,wz,y+edge*157+tuft*23+blade+710);
              const curl=hash(wx,wz,y+edge*157+tuft*23+blade+720);
              const reach=.09+seed*.2,drop=.035+seed*seed*.29,width=.009+curl*.009;
              const base=grass.pos.length/3,splay=(curl-.5)*.32;
              // Six segments follow an arching cubic curve, with a sideways curl.
              // Independent reach/drop/curl keeps the tips from lining up like a fringe.
              for(let step=0;step<=6;step++){
                const t=step/6,q=1-t;
                const outward=.44+3*q*q*t*reach+3*q*t*t*(reach*.9)+t*t*t*reach*(.25+curl*.55);
                const elevation=3*q*q*t*(.07+curl*.07)-3*q*t*t*drop*.75-t*t*t*drop;
                const lateral=along+splay*(t*t)+Math.sin(t*Math.PI)*(curl-.5)*.12;
                const sides=step===6?[0]:[-1,1];
                for(const side of sides){
                  const half=side*width*Math.pow(1-t,.7),twist=(curl-.5)*t*.9;
                  grass.pos.push(x+.5+dx*(outward+half*Math.sin(twist))+ux*(lateral+half*Math.cos(twist)),y+.995+elevation,z+.5+dz*(outward+half*Math.sin(twist))+uz*(lateral+half*Math.cos(twist)));
                  grass.nor.push(dx*.8,.6,dz*.8);
                  grass.uv.push((.1+seed*.8)/ATLAS_TILES,.2+seed*.6);
                  const shade=.94-t*(.1+seed*.12),dry=seed>.94;
                  grass.col.push(shade*(dry?1+t*.65:1),shade*.98,shade*.85);
                  grass.wind.push(t*t*.8,phase);
                }
                if(step<5){const v=base+step*2;grass.idx.push(v,v+1,v+2,v+1,v+3,v+2);}
                else if(step===5)grass.idx.push(base+10,base+11,base+12);
              }
            }
          }
        }
      }
      if(b===LEAF){
        const wx=x0+x,wz=z0+z,seed=hash(wx,wz,y+87);
        const dense=FACES.filter(f=>at(x+f.d[0],y+f.d[1],z+f.d[2])===LEAF).length;
        // Four independently oriented branch cards give depth from above and from the side.
        for(let card=0;card<4;card++){
          const angle=seed*6.283+card*2.05,pitch=card===3?1.08:(hash(wx,wz,y+card+99)-.5)*.8;
          const u=[Math.cos(angle),0,Math.sin(angle)],v=[-Math.sin(angle)*Math.sin(pitch),Math.cos(pitch),Math.cos(angle)*Math.sin(pitch)];
          const normal=[-Math.sin(angle)*Math.cos(pitch),-Math.sin(pitch),Math.cos(angle)*Math.cos(pitch)];
          const center=[x+.5+Math.cos(angle)*.12,y+.48+(card%2)*.13,z+.5+Math.sin(angle)*.12];
          const width=.98+hash(wx,wz,y+card+111)*.14,height=.88;
          const base=leaves.pos.length/3,shade=(dense>=5?.72:.9)*(0.85+hash(wx,wz,y+card+114)*.15);
          for(const [a,b] of [[0,0],[1,0],[1,1],[0,1]]){
            for(let axis=0;axis<3;axis++)leaves.pos.push(center[axis]+(a-.5)*width*u[axis]+(b-.5)*height*v[axis]);
            leaves.nor.push(...normal);leaves.uv.push(a,b);leaves.col.push(shade*.94,shade,shade*.88);
            leaves.wind.push((a+b)*.5,seed*6.283);
          }
          leaves.idx.push(base,base+1,base+2,base,base+2,base+3);
        }
        continue;
      }
      if (SHAPED(b)) { shape(b, x, y, z); continue; }
      const out = b === WATER ? water : solid;
      const waterVisual = b === WATER && world.water ? world.water.visual(x0+x,y,z0+z) : null;
      for (const f of FACES) {
        const n = at(x + f.d[0], y + f.d[1], z + f.d[2]);
        // 实心块：邻居是空气/水/（镂空的）树叶才画；水：只在邻居是空气时画
        if (!(n === AIR || (n === WATER && b !== WATER) || (see(n) && n !== b))) continue;
        const v = out.pos.length / 3, tile = BLOCKS[b].tiles[f.t], ao = [3, 3, 3, 3];
        // 头顶 6 格内有实心方块（树叶不算）= 照不到天光：洞里、屋檐下变暗，越深越暗
        let cov = 1;
        if (b !== WATER) for (let k = 1; k <= 6; k++) {
          const u = at(x + f.d[0], y + f.d[1] + k, z + f.d[2]);
          if (u !== AIR && u !== WATER && !see(u)) { cov = 0.42 + 0.06 * k; break; }
        }
        let glow = 1; // 灯周围 6 格：不再因照不到天光变暗，并且越近越亮
        if (lamps.length && b !== WATER) for (const [lx, ly, lz] of lamps) {
          const q = (x + f.d[0] - lx) ** 2 + (y + f.d[1] - ly) ** 2 + (z + f.d[2] - lz) ** 2;
          if (q <= 36) { cov = 1; glow = Math.max(glow, 1.25 - q / 144); }
        }
        if(b===COBBLE){
          cobbleFace(out,x,y,z,f,x0+x,y,z0+z,f.s*(world.lighting?1:cov)*glow);
          continue;
        }
        const top = b === WATER && at(x, y + 1, z) !== WATER ? 0.88 : 1; // 水面略低于方块顶
        for (let i = 0; i < 4; i++) {
          if (b !== WATER) {
            const [s1, s2, cr] = f.ao[i];
            const A = occ(x + s1[0], y + s1[1], z + s1[2]), B = occ(x + s2[0], y + s2[1], z + s2[2]);
            ao[i] = A && B ? 0 : 3 - A - B - occ(x + cr[0], y + cr[1], z + cr[2]);
          }
          const l = b === LAMP || b === 96 || b === 97 ? 1.3 : f.s * (0.5 + ao[i] / 6) * (world.lighting ? 1 : cov) * glow; // 天空遮挡由光照模块单独处理，不压暗局部光源
          const surface=b===WATER&&world.water?world.water.corner(x0+x+f.c[i][0],y,z0+z+f.c[i][2]):top;
          out.pos.push(x + f.c[i][0], y + f.c[i][1] * surface, z + f.c[i][2]);
          out.nor.push(f.d[0], f.d[1], f.d[2]);
          // World-coordinate seed: unchanged by chunk rebuilds or save/load.
          let tu=UV[i][0],tv=UV[i][1],tone=1,warm=0;
          if(b===COBBLE){
            const seed=Math.floor(hash(x0+x,y*97+z0+z,1681)*8);
            if(seed&4)tu=1-tu;
            for(let r=0;r<(seed&3);r++)[tu,tv]=[tv,1-tu];
            tone=.91+hash(x0+x,y*131+z0+z,1682)*.16;
            warm=(hash(x0+x,y*173+z0+z,1683)-.5)*.07;
          }
          out.uv.push((tile + tu) / ATLAS_TILES, tv);
          out.col.push(l*tone*(1+warm), l*.98*tone, l*(1.14-.22*l)*tone*(1-warm)); // 亮面偏暖、暗面偏冷
          if(b===WATER){out.flow.push(...(waterVisual?waterVisual.flow:[0,0,0,1]));out.foam.push(waterVisual?waterVisual.foam:0);}
        }
        // 沿 AO 更平滑的对角线切分
        if (ao[0] + ao[2] < ao[1] + ao[3]) out.idx.push(v + 1, v + 2, v + 3, v + 1, v + 3, v);
        else out.idx.push(v, v + 1, v + 2, v, v + 2, v + 3);
      }
    }
    const pack = m => ({ pos: new Float32Array(m.pos), nor: new Float32Array(m.nor), uv: new Float32Array(m.uv), col: new Float32Array(m.col), idx: new Uint32Array(m.idx), flow: new Float32Array(m.flow), foam: new Float32Array(m.foam), wind:new Float32Array(m.wind) });
    return { solid: pack(solid), water: pack(water), leaves:pack(leaves), grass:pack(grass) };
  }

  // ---- 射线选方块（体素 DDA），忽略空气和水 ----
  function raycast(get, o, d, max) {
    const p = o.map(Math.floor), step = d.map(Math.sign);
    const tDelta = d.map(v => Math.abs(1 / v));
    const tMax = d.map((v, i) => v > 0 ? (p[i] + 1 - o[i]) / v : v < 0 ? (o[i] - p[i]) / -v : Infinity);
    let n = [0, 0, 0], t = 0;
    while (t <= max) {
      const b = get(p[0], p[1], p[2]);
      if (b !== AIR && b !== WATER) {
        if((b<200||b>243)&&!ladderInfo(b))return { x:p[0],y:p[1],z:p[2],n,t,point:o.map((v,i)=>v+d[i]*t) };
        let best=null;
        for(const q of shapeBoxes(b,get,...p)){
          let enter=0,leave=max,normal=[0,0,0],valid=true;
          for(let axis=0;axis<3;axis++){
            const low=p[axis]+q[axis],high=p[axis]+q[axis+3];
            if(Math.abs(d[axis])<1e-9){if(o[axis]<low||o[axis]>high)valid=false;continue;}
            let a=(low-o[axis])/d[axis],c=(high-o[axis])/d[axis];if(a>c)[a,c]=[c,a];
            if(a>enter){enter=a;normal=[0,0,0];normal[axis]=-Math.sign(d[axis]);}leave=Math.min(leave,c);
          }
          if(valid&&enter<=leave&&enter>=t-1e-6&&(!best||enter<best.t))best={x:p[0],y:p[1],z:p[2],n:normal,t:enter,point:o.map((v,i)=>v+d[i]*enter)};
        }
        if(best)return best;
      }
      const a = tMax[0] < tMax[1] ? (tMax[0] < tMax[2] ? 0 : 2) : (tMax[1] < tMax[2] ? 1 : 2);
      t = tMax[a]; tMax[a] += tDelta[a]; p[a] += step[a];
      n = [0, 0, 0]; n[a] = -step[a];
    }
    return null;
  }

  const cobbleModel=()=>{const out={pos:[],nor:[],uv:[],col:[],idx:[]};for(const f of FACES)cobbleFace(out,0,0,0,f,0,0,0,f.s);return out;};
  const Core = { CAMPFIRE, cobbleModel, GEN, climateAt, SLIME, PLANTS, FARMLAND, villageIn, REGION, CH, H, SEA, AIR, WATER, STONE, GLASS, LAMP, PASS, see, WOODS, doorBase, isChest, woodLogAt, shapeBoxes, stairInfo, slabInfo, ladderInfo, ladderSupported, hash, biomeAt, caveAt, BLOCKS, ATLAS_TILES, heightAt, genChunk, World, meshChunk, raycast };
  if (typeof module !== 'undefined') module.exports = Core; else root.Core = Core;
})(this);
