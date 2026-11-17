// 生成规则的版本锁：第 1 版的生成结果永远不能变（老存档里动过的区块、新手村周围都靠它）。
// 下面的指纹是第 1 版在 208×208 格范围内全部方块的校验值。改了生成代码后这里失败，说明旧规则被动到了——
// 新物种要写在 `v >= 新版本号` 的分支里，不要改旧分支。运行：node gen-version.test.js
const assert = require('assert'), C = require('./core.js');
const print = gen => { let h = 2166136261; for (let cx = -6; cx <= 6; cx++) for (let cz = -6; cz <= 6; cz++) { const d = C.genChunk(cx, cz, gen); for (let i = 0; i < d.length; i++) h = Math.imul(h ^ d[i], 16777619) >>> 0; } return h; };
const V1 = 2711228264;
assert.strictEqual(print(1), V1, '第 1 版的生成结果变了');
// 新手村周围：不管要哪一版，出来的都是第 1 版
const home = C.genChunk(2, 0), same = C.genChunk(2, 0, 1); assert.ok(home.every((b, i) => b === same[i]), '新手村周围必须固定用第 1 版');
// 动过的区块记下版本；旧存档没记的按第 1 版
const w = new C.World(); w.set(900, 30, 900, 3); assert.strictEqual(w.edits['56,56'].g, 'v' + C.GEN);
const old = new C.World(undefined, { '56,56': { 5: 3 } }).chunk(56, 56), v1 = C.genChunk(56, 56, 1); assert.ok(old.every((b, i) => i === 5 || b === (v1[i] ?? C.AIR)), '旧存档里动过的区块按第 1 版生成');
assert.ok(new C.World().chunk(0,0).slice(64*256).every(b=>b===C.AIR),'新增建筑高度层不改变自然地形');
console.log('生成版本锁：第 1 版指纹、新手村固定、区块版本记录测试通过');
