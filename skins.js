// 角色皮肤：一整套现成的造型，比“肤色 / 发型 / 上衣”这些选项细节多得多。在设置 → Character 里选；要先解锁才能穿。
// 一套皮肤 = 名字 + 怎么得到（how，给玩家看的一句话；got(game)，满足了就解锁）+ look（盖掉哪些基本选项）+ extra（往小人身上加的零件）。
// extra 拿到的工具：part(宽, 高, 深, x, y, z, 颜色, 挂在哪) 加一个小方块；swing = [左腿, 右腿, 左臂, 右臂] 四个关节（零件挂上去就跟着摆）；
//   tint / shade 调亮调暗；head / body 表示头上、身上是不是穿着护甲（穿了就别画帽子、胸前的东西）。小人脸朝 -z，身高约 1.9。
// 以后加新皮肤：在 LIST 末尾加一项（不要改已有皮肤的顺序，存档里记的是序号）。
// 解锁记在这台设备上（stonisle.skins），所有世界通用；联机时别人看得到你穿的皮肤。
(() => {
  const ring = (n, f) => { for (let i = 0; i < n; i++) f(Math.sin(i / n * 6.283), Math.cos(i / n * 6.283), i); };
  const hood = (a, col, lining) => { // 兜帽：后面、头顶、两侧包住头，后脑勺再鼓出一点
    a.part(0.52, 0.36, 0.1, 0, 1.7, 0.25, col); a.part(0.52, 0.09, 0.5, 0, 1.935, 0.03, col); for (const x of [-0.26, 0.26]) a.part(0.07, 0.34, 0.42, x, 1.72, 0.05, col);
    a.part(0.4, 0.05, 0.05, 0, 1.9, -0.215, lining); a.part(0.2, 0.14, 0.12, 0, 1.6, 0.33, a.shade(col, 0.88));
  };
  const LIST = [
    { name: 'My own look', how: '' }, // 0：不用皮肤，按自己选的肤色、发型、衣服来
    { name: 'Forest Ranger', how: 'Finish all of Wick\'s tasks.', got: g => window.Lang && Lang.quest >= 20, look: { shirt: 3, pants: 1, skirt: 0, acc: 0 },
      extra(a) { // 森林游侠：绿兜帽斗篷、背上的箭袋、皮带和小包、护腕、翻边靴
        const G = '#3f7a3a', D = '#2c5a2a', L = '#7a5230', GOLD = '#d8b040';
        if (!a.head) hood(a, G, D);
        a.part(0.64, 0.07, 0.36, 0, 1.385, 0, G); a.part(0.52, 0.62, 0.05, 0, 1.06, 0.175, G); a.part(0.58, 0.34, 0.05, 0, 0.6, 0.195, D);
        for (const x of [-0.22, -0.07, 0.08, 0.23]) a.part(0.1, 0.1, 0.05, x, 0.4, 0.195, x > 0 ? G : D);   // 斗篷下摆的破边
        a.part(0.07, 0.07, 0.03, 0, 1.37, -0.19, GOLD);
        const q = a.part(0.13, 0.52, 0.11, 0.1, 1.2, 0.26, L); q.rotation.z = 0.32;                             // 箭袋斜背着，露出三支箭羽
        [['#e8e0c8', -0.02], ['#c84a3c', 0.03], ['#e8e0c8', 0.08]].forEach(([c, x]) => { const f = a.part(0.035, 0.1, 0.06, x - 0.02, 1.5, 0.27, c); f.rotation.z = 0.32; });
        if (!a.body) { a.part(0.5, 0.06, 0.28, 0, 0.86, 0, L); a.part(0.08, 0.08, 0.02, 0, 0.86, -0.145, GOLD); for (const x of [-0.19, 0.19]) { a.part(0.12, 0.13, 0.07, x, 0.8, -0.16, a.shade(L, 0.85)); a.part(0.12, 0.03, 0.075, x, 0.855, -0.16, L); } }
        for (const arm of [a.swing[2], a.swing[3]]) { a.part(0.165, 0.13, 0.195, 0, -0.43, 0, L, arm); a.part(0.17, 0.025, 0.2, 0, -0.37, 0, GOLD, arm); }
        for (const leg of [a.swing[0], a.swing[1]]) { a.part(0.235, 0.07, 0.25, 0, -0.55, 0, L, leg); a.part(0.24, 0.025, 0.255, 0, -0.52, 0, a.tint(L, 0.3), leg); }
      } },
    { name: 'Silver Knight', how: 'Make an iron sword.', got: g => (g.inv[26] || 0) > 0, look: { shirt: 7, pants: 2, skirt: 0, acc: 0 },
      extra(a) { // 白银骑士：胸甲和护肩、臂甲腿甲、红披风、头上一圈银冠和红缨
        const S = '#c8ced6', S2 = '#8e98a6', R = '#b8303a', GOLD = '#e0b840';
        if (!a.body) { a.part(0.5, 0.42, 0.03, 0, 1.15, -0.145, S); a.part(0.06, 0.42, 0.035, 0, 1.15, -0.15, S2); a.part(0.2, 0.05, 0.04, 0, 1.2, -0.155, GOLD); a.part(0.05, 0.2, 0.04, 0, 1.17, -0.156, GOLD);
          a.part(0.5, 0.42, 0.03, 0, 1.15, 0.145, S); for (const x of [-0.16, 0, 0.16]) a.part(0.15, 0.16, 0.035, x, 0.8, -0.15, x ? S2 : S); }
        for (const arm of [a.swing[2], a.swing[3]]) { a.part(0.25, 0.13, 0.28, 0, -0.02, 0, S, arm); a.part(0.26, 0.03, 0.29, 0, -0.09, 0, GOLD, arm); a.part(0.17, 0.2, 0.2, 0, -0.42, 0, S2, arm); a.part(0.18, 0.04, 0.21, 0, -0.33, 0, S, arm); }
        for (const leg of [a.swing[0], a.swing[1]]) { a.part(0.235, 0.26, 0.25, 0, -0.44, 0, S, leg); a.part(0.14, 0.09, 0.05, 0, -0.3, -0.13, S2, leg); a.part(0.24, 0.03, 0.255, 0, -0.56, 0, GOLD, leg); }
        a.part(0.54, 0.06, 0.06, 0, 1.4, 0.15, GOLD); a.part(0.52, 0.86, 0.04, 0, 0.96, 0.19, R); a.part(0.52, 0.05, 0.045, 0, 0.55, 0.19, GOLD); a.part(0.44, 0.84, 0.01, 0, 0.96, 0.213, a.shade(R, 0.8));
        if (!a.head) { a.part(0.46, 0.06, 0.46, 0, 1.87, 0, S); a.part(0.1, 0.08, 0.03, 0, 1.9, -0.235, GOLD); for (let i = 0; i < 4; i++) a.part(0.06, 0.12 - i * 0.02, 0.09, 0, 2.0 - i * 0.012, -0.08 + i * 0.09, i % 2 ? a.shade(R, 0.85) : R); }
      } },
    { name: 'Star Mage', how: 'Find three amethysts.', got: g => (g.inv[82] || 0) >= 3, look: { shirt: 5, pants: 2, skirt: 2, acc: 0 },
      extra(a) { // 星星法师：紫长袍（连衣裙那一套裙摆）上缀着星星、高领、金腰带，一顶弯尖的宽檐帽
        const P = '#5a48b0', P2 = '#3e3284', GOLD = '#f0c84a', star = (x, y, z) => { a.part(0.05, 0.02, 0.012, x, y, z, GOLD); a.part(0.02, 0.05, 0.012, x, y, z, GOLD); };
        if (!a.body) { for (const [x, y] of [[-0.15, 1.24], [0.14, 1.12], [-0.08, 0.98], [0.17, 1.3]]) star(x, y, -0.142); a.part(0.5, 0.05, 0.28, 0, 0.84, 0, GOLD); a.part(0.09, 0.09, 0.02, 0, 0.84, -0.15, '#fff4c0'); a.part(0.3, 0.1, 0.04, 0, 1.4, 0.11, P2); }
        for (const [x, y, z] of [[-0.2, 0.62, -0.24], [0.16, 0.5, -0.27], [0.02, 0.4, -0.3], [-0.14, 0.66, 0.24], [0.2, 0.45, 0.28]]) star(x, y, z);
        for (const arm of [a.swing[2], a.swing[3]]) { a.part(0.2, 0.14, 0.24, 0, -0.34, 0, P, arm); a.part(0.21, 0.03, 0.25, 0, -0.41, 0, GOLD, arm); }
        if (!a.head) { a.part(0.74, 0.03, 0.74, 0, 1.9, 0, P2); a.part(0.44, 0.14, 0.44, 0, 1.985, 0, P); a.part(0.46, 0.045, 0.46, 0, 1.94, 0, GOLD); a.part(0.31, 0.13, 0.31, 0.01, 2.115, 0.01, P); a.part(0.2, 0.12, 0.2, 0.04, 2.235, 0.03, P2);
          a.part(0.11, 0.1, 0.11, 0.1, 2.33, 0.05, P); a.part(0.06, 0.06, 0.06, 0.17, 2.36, 0.06, GOLD); star(0, 2.0, -0.226); }
      } },
    { name: 'Panda Hoodie', how: 'Meet a panda.', got: () => { try { return JSON.parse(localStorage.getItem('stonisle.met') || '[]').includes('panda'); } catch (e) { return false; } }, look: { shirt: 7, pants: 2, skirt: 0, acc: 0 },
      extra(a) { // 熊猫卫衣：白兜帽上两只黑耳朵和黑眼圈，黑袖子、黑手套，肚子上一个大口袋
        const W = '#f4f1ea', B = '#26221f', GR = '#d8d2c6';
        if (!a.head) { hood(a, W, GR); for (const x of [-0.18, 0.18]) { a.part(0.15, 0.13, 0.08, x, 2.02, 0.03, B); a.part(0.08, 0.07, 0.085, x, 2.01, 0.028, '#5a504a'); a.part(0.1, 0.1, 0.02, x * 0.9, 1.93, -0.225, B); } a.part(0.07, 0.05, 0.02, 0, 1.9, -0.228, B); }
        for (const arm of [a.swing[2], a.swing[3]]) { a.part(0.185, 0.32, 0.225, 0, -0.14, 0, B, arm); a.part(0.16, 0.26, 0.19, 0, -0.42, 0, B, arm); a.part(0.17, 0.15, 0.2, 0, -0.59, 0, B, arm); a.part(0.1, 0.05, 0.02, 0, -0.6, -0.105, '#e8a0a8', arm); }
        if (!a.body) { a.part(0.28, 0.13, 0.02, 0, 0.95, -0.142, GR); a.part(0.28, 0.02, 0.022, 0, 1.015, -0.143, a.shade(GR, 0.8)); for (const x of [-0.05, 0.05]) a.part(0.02, 0.16, 0.02, x, 1.27, -0.143, GR); a.part(0.5, 0.05, 0.28, 0, 0.8, 0, B); }
        a.part(0.12, 0.11, 0.08, 0, 0.84, 0.17, W);
        for (const leg of [a.swing[0], a.swing[1]]) a.part(0.235, 0.05, 0.25, 0, -0.56, 0, W, leg);
      } },
    { name: 'Snow Traveler', how: 'Walk far to the north.', got: g => Core.climateAt(g.p.x, g.p.z) === 0, look: { shirt: 4, pants: 5, skirt: 0, acc: 0 },
      extra(a) { // 雪地旅人：毛领毛边的厚外套、大扣子、红围巾红手套、耳罩、毛口靴
        const F = '#f6f4ee', R = '#c8403c', C = '#3c78b8';
        if (!a.body) { a.part(0.58, 0.1, 0.38, 0, 1.4, 0, F); a.part(0.53, 0.08, 0.3, 0, 0.8, 0, F); a.part(0.04, 0.5, 0.02, 0, 1.1, -0.142, a.shade(C, 0.75)); for (const y of [1.26, 1.12, 0.98]) a.part(0.06, 0.06, 0.025, 0.07, y, -0.145, '#f0d890');
          a.part(0.36, 0.09, 0.3, 0, 1.44, -0.02, R); a.part(0.12, 0.3, 0.05, -0.1, 1.27, -0.16, R); for (const x of [-0.14, -0.1, -0.06]) a.part(0.025, 0.05, 0.05, x, 1.1, -0.16, a.tint(R, 0.4)); }
        for (const arm of [a.swing[2], a.swing[3]]) { a.part(0.195, 0.07, 0.235, 0, -0.29, 0, F, arm); a.part(0.17, 0.16, 0.2, 0, -0.58, 0, R, arm); a.part(0.175, 0.03, 0.205, 0, -0.5, 0, a.tint(R, 0.35), arm); }
        for (const leg of [a.swing[0], a.swing[1]]) { a.part(0.24, 0.08, 0.255, 0, -0.55, 0, F, leg); a.part(0.235, 0.12, 0.31, 0, -0.65, -0.035, '#6a4a30', leg); }
        if (!a.head) { a.part(0.48, 0.035, 0.07, 0, 1.94, 0, a.shade(R, 0.8)); for (const x of [-0.235, 0.235]) { a.part(0.08, 0.16, 0.16, x, 1.66, 0, F); a.part(0.085, 0.09, 0.09, x, 1.66, 0, R); } }
      } },
    { name: 'Island Dancer', how: 'Walk far to the south.', got: g => Core.climateAt(g.p.x, g.p.z) === 2, look: { shirt: 1, pants: 3, skirt: 1, acc: 0 },
      extra(a) { // 海岛舞者：脖子上一圈花环、头上别一朵花、草裙的一条条草叶、手环脚环
        const FL = ['#f0688a', '#f8d848', '#ffffff', '#f09838'];
        if (!a.body) ring(10, (sx, cz, i) => { a.part(0.085, 0.07, 0.085, sx * 0.25, 1.37 - Math.abs(sx) * 0.03, cz * 0.16, FL[i % 4]); a.part(0.035, 0.075, 0.035, sx * 0.25, 1.372 - Math.abs(sx) * 0.03, cz * 0.16, '#f0b030'); });
        ring(16, (sx, cz, i) => { const s = a.part(0.05, 0.34 + (i % 3) * 0.03, 0.02, sx * 0.3, 0.5, cz * 0.25, i % 2 ? '#7aa83c' : '#9cc050'); s.rotation.y = Math.atan2(sx, cz); s.rotation.x = 0.12; });
        if (!a.head) { for (const [dx, dy] of [[0.05, 0], [-0.05, 0], [0, 0.05], [0, -0.05]]) a.part(0.06, 0.06, 0.03, 0.2 + dx, 1.86 + dy, -0.2, '#f0688a'); a.part(0.045, 0.045, 0.04, 0.2, 1.86, -0.205, '#f8d848'); a.part(0.07, 0.03, 0.03, 0.27, 1.82, -0.19, '#5c9a48'); }
        for (const arm of [a.swing[2], a.swing[3]]) { a.part(0.16, 0.03, 0.19, 0, -0.5, 0, '#f8d848', arm); a.part(0.16, 0.03, 0.19, 0, -0.46, 0, '#f0688a', arm); }
        for (const leg of [a.swing[0], a.swing[1]]) a.part(0.205, 0.035, 0.225, 0, -0.5, 0, '#f09838', leg);
      } },
  ];
  // —— 拥有哪些皮肤 ——
  const KEY = 'stonisle.skins';
  const own = raw => { let o; try { o = JSON.parse(raw); } catch (e) { o = null; } return new Set([0, ...(Array.isArray(o) ? o.filter(i => Number.isInteger(i) && i > 0 && i < LIST.length) : [])]); };
  const newly = (owned, game) => LIST.map((s, i) => i).filter(i => i && !owned.has(i) && LIST[i].got && LIST[i].got(game)); // 这一刻刚满足条件的皮肤
  if (typeof document === 'undefined') { module.exports = { LIST, own, newly }; return; }
  let owned = own(localStorage.getItem(KEY));
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify([...owned])); } catch (e) { /* 存不下就不记 */ } };
  setInterval(() => { // 每 4 秒看一眼有没有新解锁的
    if (!window.game || !game.playing) return;
    let fresh; try { fresh = newly(owned, game); } catch (e) { return; }
    if (!fresh.length) return;
    for (const i of fresh) owned.add(i);
    save();
    if (window.Lang) Lang.say(`A new skin! ${LIST[fresh[0]].name}!`, false, 1.4);
    if (window.Avatar && Avatar.refresh) Avatar.refresh();
  }, 4000);
  window.Skins = { list: LIST, has: i => owned.has(i), unlock(i) { owned.add(i); save(); }, get owned() { return [...owned]; } };
})();
