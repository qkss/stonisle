// 最小自检：node selftest.js
const assert = require('assert');
const { CH, H, AIR, STONE, World, meshChunk, raycast, genChunk } = require('./core.js');

const empty = () => new Uint8Array(CH * CH * H);
const faces = m => m.solid.idx.length / 6;

// 隐藏面剔除
let w = new World(empty);
w.set(5, 5, 5, STONE);
assert.strictEqual(faces(meshChunk(w, 0, 0)), 6, '孤立方块 6 个面');
w.set(6, 5, 5, STONE);
assert.strictEqual(faces(meshChunk(w, 0, 0)), 10, '相邻两块共用面被剔除');
// 跨区块边界也剔除
w = new World(empty);
w.set(15, 5, 5, STONE); w.set(16, 5, 5, STONE);
assert.strictEqual(faces(meshChunk(w, 0, 0)), 5, '区块边界的共用面被剔除');
// 贴地（y=0）底面不画
w = new World(empty);
w.set(3, 0, 3, STONE);
assert.strictEqual(faces(meshChunk(w, 0, 0)), 5, '世界底面不画');

// 射线
w = new World(empty);
w.set(0, 0, 5, STONE);
const get = (x, y, z) => w.get(x, y, z);
let hit = raycast(get, [0.5, 0.5, 0.5], [0, 0, 1], 8);
assert.deepStrictEqual([hit.x, hit.y, hit.z, hit.n], [0, 0, 5, [0, 0, -1]], '正面命中并给出法线');
assert.ok(Math.abs(hit.t - 4.5) < 1e-9, '命中距离');
assert.strictEqual(raycast(get, [0.5, 0.5, 0.5], [0, 0, 1], 3), null, '超出距离不命中');
assert.strictEqual(raycast(get, [0.5, 0.5, 0.5], [0, 1, 0], 8), null, '朝空处不命中');
hit = raycast(get, [-3.5, 0.5, 5.5], [1, 0, 0], 8);
assert.deepStrictEqual([hit.x, hit.n], [0, [-1, 0, 0]], '负坐标起点、侧面命中');

// 地形确定性 + 改动回放
assert.deepStrictEqual(genChunk(3, -2), genChunk(3, -2), '地形生成是确定的');
const w1 = new World();
w1.set(-1, 30, -1, AIR); w1.set(2, 40, 2, STONE);
const w2 = new World(undefined, JSON.parse(JSON.stringify(w1.edits)));
assert.strictEqual(w2.get(2, 40, 2), STONE, '存档回放：放置');
assert.strictEqual(w2.get(-1, 30, -1), AIR, '存档回放：挖掉（负坐标）');

// 新地形：高度不越界，岩层里有矿，三种群系都存在
const C = require('./core.js');
let ores = 0, maxH = 0; const biomes = new Set();
for (let i = 0; i < 400; i++) { const x = i * 37 - 7000, z = i * 53 % 3000; maxH = Math.max(maxH, C.heightAt(x, z)); biomes.add(C.biomeAt(x, z)); }
for (const b of genChunk(0, 0)) if (b >= 11 && b <= 14) ores++;
let caves = 0; for (let i = 0; i < 20000; i++) if (C.caveAt(i % 97, 4 + i % 23, i % 89 * 3)) caves++;
assert.ok(caves > 200 && caves < 3000, '洞穴占地下 1%–15%：' + caves);
const wc = new World(); let floating = 0; // 水边不该有悬空的水（水下方必须是水或实心）
for (let x = 0; x < 48; x++) for (let z = 0; z < 48; z++) for (let y = 1; y <= C.SEA; y++) if (wc.get(x, y, z) === C.WATER && wc.get(x, y - 1, z) === AIR) floating++;
assert.strictEqual(floating, 0, '洞穴没有挖穿水底');
assert.ok(maxH <= H - 6, '地形高度留出树的空间');
assert.ok(ores > 0, '岩层里生成了矿石');
assert.strictEqual(biomes.size, 3, '草原/沙漠/雪原都能出现');

// 玻璃：看得穿，所以它后面的面要画；玻璃和玻璃之间的面不画
{
  const { GLASS, LAMP } = C, at = 5;
  let g = new World(empty); g.set(at, at, at, STONE); g.set(at + 1, at, at, GLASS);
  assert.strictEqual(faces(meshChunk(g, 0, 0)), 11, '石头贴着玻璃：石头朝玻璃的面要画（6），玻璃贴石头的面不用画（5）');
  g = new World(empty); g.set(at, at, at, GLASS); g.set(at + 1, at, at, GLASS);
  assert.strictEqual(faces(meshChunk(g, 0, 0)), 10, '两块玻璃之间的面被剔除');
  // 灯：有屋顶的地面本来会变暗，灯在 6 格内时恢复并提亮
  const room = lamp => { const w = new World(empty); for (let x = 2; x < 9; x++) for (let z = 2; z < 9; z++) { w.set(x, 3, z, STONE); w.set(x, 6, z, STONE); } if (lamp) w.set(5, 4, 5, LAMP); return w; };
  const floorLight = w => { const m = meshChunk(w, 0, 0).solid; let best = 0; for (let i = 0; i < m.pos.length / 3; i++) if (m.pos[i * 3 + 1] === 4 && m.nor[i * 3 + 1] === 1 && m.pos[i * 3] === 3 && m.pos[i * 3 + 2] === 3) best = Math.max(best, m.col[i * 3]); return best; };
  const dark = floorLight(room(false)), lit = floorLight(room(true));
  assert.ok(dark < 0.6, '屋顶下的地面变暗：' + dark);
  assert.ok(lit > 0.95, '灯旁的地面恢复亮度：' + lit);
}

// 非整格方块：门是一个薄长方体（6 个面），花是两片交叉的面、分茎和花两段、正反都画（8 个面）；旁边的石头不因为它们而少画面
{
  const w = new World(empty); w.set(5, 5, 5, 60); w.set(8, 5, 5, 68);
  assert.strictEqual(faces(meshChunk(w, 0, 0)), 6 + 8, '门 6 面 + 花 8 面');
  w.set(5, 4, 5, STONE);
  assert.strictEqual(faces(meshChunk(w, 0, 0)), 6 + 8 + 6, '门下面的石头六个面都画（门看得穿）');
  assert.ok(C.PASS.has(62) && !C.PASS.has(60) && C.PASS.has(68), '开着的门和花可以走过去，关着的门不行');
  { const s = new World(empty); s.set(5, 5, 5, 74); s.set(7, 5, 5, 76); assert.strictEqual(faces(meshChunk(s, 0, 0)), 12 + 6, '告示牌 = 木桩 + 牌子（12 面），箱子是整格（6 面）'); assert.ok(C.PASS.has(74) && !C.PASS.has(76), '告示牌可以走过，箱子不行'); }
  let flowers = 0; for (let cx = 0; cx < 6; cx++) for (let cz = 0; cz < 6; cz++) { let n = 0; for (const b of genChunk(cx, cz)) if (b >= 68 && b <= 70) n++; assert.ok(n <= 6, '每个区块花不超过 6 朵'); flowers += n; }
  assert.ok(flowers > 0, '草原上长出了花');
}

console.log('自检通过');
