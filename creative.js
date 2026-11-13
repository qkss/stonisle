// 创造模式：设置里打开后，背包右侧的合成区换成全部方块和物品，按分类排列，点一下拿一组（64 个；工具和装备 1 件）。
// 另外不掉血、放置不消耗、点一下挖掉一块（这三处在 game.js / home.js 里问 Creative.on）。
// 只管这块面板；game.js 在 renderBag 末尾调一次 Creative.render()。
(() => {
  const KEY = 'stonisle.creative', STACK = 64, W = Core.WOODS;
  let on = localStorage.getItem(KEY) === '1';
  const each = f => W.map(f);
  const CATS = [ // 分类里没列到的方块自动归到 More，别的开发线新加方块也不会漏
    ['Nature', [1, 2, 3, 154, 155, 156, 157, 158, 4, 15, 7, 80, 81, 82]],
    ['Ores', [11, 12, 13, 14, 83, 84, 85, 86]],
    ['Wood', [...each(w => w.log), ...each(w => w.plank), 92, ...each(w => w.stairs), ...each(w => w.slab), ...each(w => w.fence), ...each(w => w.ladder).filter(Boolean)]],
    ['Building', [9, 91, 10, 90, 51, 52, 53, 54, 55, 56, 57, 58, 50, 183]],
    ['Home', [179, ...each(w => w.door), 64, 66, ...each(w => w.chest), 74, 59, 96, 97]],
    ['Plants', [68, 69, 70, 77, 78, 79, 87, 88, 116, 117, 118, 89, 71, 73, 119, 143, 144, 145, 152, 159, 176, 199, 98]],
  ];
  // 同一个方块的其他朝向和状态（开着的门、摘过的浆果丛、转了向的楼梯……）不单独列出；水不能拿
  const VARIANT = new Set([0, 5, 61, 62, 63, 65, 67, 72, 75, 99, ...Array.from({ length: 32 }, (_, i) => 224 + i), /* 224–255：倒着的楼梯、上半砖、双层半砖、另一侧开着的门，都是自动变出来的 */ ...W.flatMap(w => [1, 2, 3].flatMap(k => [w.door + k, w.stairs + k, ...(w.ladder ? [w.ladder + k] : [])]))]); // 爬梯的另外三个朝向也不单列，放的时候按贴的那面墙自动转向
  const TOOL = [16, 17, 18, 153, 20, 21, 22, 23, 25, 26, 27, 19, 28, 29, 24, 49, 261, 262, 263, 106, 108, 107, 109], GEAR = [121, 122, 123, 124, 40, 41, 125, 42, 43, 44, 126, 45, 127, 128, 129, 131, 46, 47, 48, 120, 142, 149, 146, 147, 148, 150, 151]; // 工具和装备一次拿 1 件，其余一次拿一组
  const ONE = new Set([...TOOL, ...GEAR].filter(id => id !== 24));
  function items() { // 物品名在 lang.js 里；没名字的 id 返回 'thing'，跳过
    const all = []; for (let id = 16; id < 300; id++) if (!Core.BLOCKS[id] && Lang.item(id) !== 'thing') all.push(id);
    const known = id => all.includes(id);
    return [['Tools', TOOL.filter(known)], ['Gear', GEAR.filter(known)], ['Materials & food', all.filter(id => !TOOL.includes(id) && !GEAR.includes(id))]];
  }
  function cats() {
    const listed = new Set(CATS.flatMap(c => c[1]));
    const more = Object.keys(Core.BLOCKS).map(Number).filter(id => !listed.has(id) && !VARIANT.has(id));
    return [...CATS, ['More', more]].map(([n, ids]) => [n, ids.filter(id => Core.BLOCKS[id])]).concat(items()).filter(c => c[1].length);
  }
  function render() {
    const box = document.getElementById('craft');
    box.classList.toggle('creative', on);
    box.previousElementSibling.textContent = on ? 'Blocks & items' : 'Make';
    if (!on) return;
    box.innerHTML = cats().map(([n, ids]) => `<h4>${n}</h4>` + ids.map(id => `<button data-id="${id}" title="${Lang.item(id)} ×${ONE.has(id) ? 1 : STACK}"><img src="${game.icon(id)}" alt="${Lang.item(id)}"></button>`).join('')).join('');
    for (const b of box.querySelectorAll('button')) b.onclick = () => { game.give(+b.dataset.id, ONE.has(+b.dataset.id) ? 1 : STACK); game.renderBag(); };
  }
  document.head.appendChild(document.createElement('style')).textContent = `
    #craft.creative h4 { margin: 8px 0 5px; font-size: 12px; font-weight: normal; letter-spacing: 1px; color: #a8957c; }
    #craft.creative h4:first-child { margin-top: 0; }
    #craft.creative button { display: inline-flex; width: 36px; height: 36px; margin: 0 4px 4px 0; padding: 3px; justify-content: center; }
    #craft.creative img { width: 28px; height: 28px; }`;
  const world = document.getElementById('settings-world');
  world.insertAdjacentHTML('afterbegin', '<h2>Game mode</h2><label><input id="creative" type="checkbox"> Creative mode <small>(no damage, instant digging, blocks never run out; your bag shows every block and item)</small></label>');
  const box = document.getElementById('creative');
  box.checked = on;
  box.onchange = () => { on = box.checked; localStorage.setItem(KEY, on ? '1' : '0'); };
  window.Creative = { render, cats, get on() { return on; } };
})();
