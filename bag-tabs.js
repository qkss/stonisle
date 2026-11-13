// 背包面板的布局：左边是背包（5 行格子，快捷栏贴在最下面），右边一栏用两个标签切换——物品（合成 / 创造模式的全部方块）和角色（装备、属性）。
// 原来三栏并排太宽。这里只挪动页面上已有的三块，不改它们各自的内容；开箱子时右边这一栏收起（home.js）。
(() => {
  const $ = i => document.getElementById(i), sack = $('sack');
  if (!sack || !$('grid') || !$('equip') || !$('craft')) return;
  const bag = $('grid').parentElement, who = $('equip').parentElement, items = $('craft').parentElement, KEY = 'stonisle.bagTab';
  const side = document.createElement('div'); side.id = 'bagSide';
  side.innerHTML = '<div id="bagTabs" role="tablist" aria-label="Bag side panel"><button type="button" role="tab" data-t="items">Items</button><button type="button" role="tab" data-t="who">Character</button></div>';
  bag.classList.add('bagMain'); sack.append(bag, side); side.append(items, who);
  const show = t => {
    items.hidden = t !== 'items'; who.hidden = t === 'items';
    for (const b of side.querySelectorAll('[role=tab]')) b.setAttribute('aria-selected', String(b.dataset.t === t));
    try { localStorage.setItem(KEY, t); } catch (e) { /* 记不住就算了 */ }
  };
  for (const b of side.querySelectorAll('[role=tab]')) b.onclick = () => show(b.dataset.t);
  show(localStorage.getItem(KEY) === 'who' ? 'who' : 'items');
  // 角色页：装备格旁边放一张形象预览，穿上什么、手里拿着什么都画出来。game.js 每次重画背包都会重写 #equip，跟着它更新
  const row = document.createElement('div'), pic = document.createElement('img');
  row.id = 'whoRow'; pic.id = 'whoPic'; pic.alt = 'Your character';
  $('equip').before(row); row.append(pic, $('equip'));
  const draw = () => { const src = window.Avatar && Avatar.shot && window.game ? Avatar.shot([...game.equip], game.held || 0) : ''; if (src && pic.src !== src) pic.src = src; pic.hidden = !src; };
  new MutationObserver(draw).observe($('equip'), { childList: true });
  document.head.appendChild(document.createElement('style')).textContent = `
    #sack > .bagMain { display: flex; flex-direction: column; }
    .bagMain #grid { margin-bottom: auto; }
    #bagSide { display: flex; flex-direction: column; width: 262px; flex-shrink: 0; min-width: 0; }
    #bagTabs { display: flex; gap: 6px; margin-bottom: 12px; }
    #bagTabs button { flex: 1; margin: 0; padding: 7px 4px; font: inherit; font-size: 13px; background: #ffffff14; color: #d4c19b; border: 1px solid #6b513a; border-radius: 6px; cursor: pointer; }
    #bagTabs button[aria-selected=true] { background: linear-gradient(#657447,#455333); color: #fff1d1; border-color: #b3ab72; }
    #bagSide > section { display: flex; flex-direction: column; flex: 1; min-height: 0; }
    #bagSide > section[hidden] { display: none; }
    #bagSide #craft { flex: 1 1 0; width: auto; min-height: 150px; max-height: none; }
    #whoRow { display: flex; align-items: center; justify-content: center; gap: 14px; }
    #whoPic { width: 128px; height: 160px; border-radius: 8px; background: #1d1712; box-shadow: inset 0 0 0 1px #6b513a; }
    #bag.chest #bagSide { display: none; }
    body.mobile #bagSide { width: min(250px, 38vw); }
    @media (max-width: 640px) { #bagSide, body.mobile #bagSide { width: 100%; } #bagSide #craft { flex: none; max-height: 40dvh; } }`;
})();
