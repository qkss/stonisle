// 背包面板的布局：左边是背包（5 行格子，快捷栏贴在最下面），右边一栏用两个标签切换——物品（合成 / 创造模式的全部方块）和角色（装备、属性）。
// 原来三栏并排太宽。这里只挪动页面上已有的三块，不改它们各自的内容；开箱子时右边这一栏收起（home.js）。
(() => {
  const $ = i => document.getElementById(i), sack = $('sack');
  if (!sack || !$('grid') || !$('equip') || !$('craft')) return;
  const bag = $('grid').parentElement, who = $('equip').parentElement, items = $('craft').parentElement;
  who.classList.add('bagCharacter');
  const side = document.createElement('div'); side.id = 'bagSide';
  side.innerHTML = '<div id="bagTabs" role="tablist" aria-label="Bag side panel"><button type="button" role="tab" data-t="items">Make</button><button type="button" role="tab" data-t="who">Character</button></div>';
  bag.classList.add('bagMain'); sack.append(bag, side); side.append(items, who);
  const inventoryTabs=StationInventory.tabs(key=>game.setInventoryFilter(key));$('grid').before(inventoryTabs.el);window.resetInventoryCategory=()=>inventoryTabs.reset();
  let wasOpen = false;
  const show = t => {
    items.hidden = t !== 'items'; who.hidden = t === 'items';
    for (const b of side.querySelectorAll('#bagTabs [role=tab]')) b.setAttribute('aria-selected', String(b.dataset.t === t));
  };
  for (const b of side.querySelectorAll('#bagTabs [role=tab]')) b.onclick = () => show(b.dataset.t);
  show('items');
  const filters=document.createElement('div');filters.id='craftFilters';filters.setAttribute('role','group');filters.setAttribute('aria-label','Recipe categories');
  const categories=[['all','ALL'],['ready','可合成'],['tools','工具'],['weapons','武器'],['building','建筑'],['gear','装备'],['other','其他']];
  filters.innerHTML=categories.map(([key,label])=>`<button type="button" data-filter="${key}" data-group="${['all','ready'].includes(key)?'availability':'category'}" aria-pressed="${key==='all'}">${label}</button>`).join('');
  $('craft').before(filters);
  const empty=document.createElement('p');empty.id='craftEmpty';empty.textContent='暂无可合成的配方';empty.hidden=true;$('craft').after(empty);
  let category='all',readyOnly=false;
  const filterRecipes=()=>{
    const creative=!!(window.Creative&&Creative.on);items.querySelector('h3').hidden=!creative;filters.hidden=creative;empty.hidden=true;if(creative)return;
    let count=0;
    for(const recipe of $('craft').querySelectorAll('.recipe-row[data-i]')){const visible=(!readyOnly||recipe.dataset.ready==='true')&&(category==='all'||recipe.dataset.category===category);recipe.hidden=!visible;if(visible)count++;}
    empty.textContent=readyOnly?'材料不足，或已拥有该装备':'此分类暂无配方';empty.hidden=count>0;
    for(const button of filters.children){const key=button.dataset.filter;button.setAttribute('aria-pressed',String(key==='all'?!readyOnly:key==='ready'?readyOnly:key===category));}
  };
  for(const button of filters.children)button.onclick=()=>{const key=button.dataset.filter;if(key==='all'||key==='ready')readyOnly=key==='ready';else category=category===key?'all':key;filterRecipes();$('craft').scrollTop=0;};
  filters.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const buttons=[...filters.children].filter(b=>b.dataset.group===e.target.dataset.group),i=buttons.indexOf(e.target),next=e.key==='Home'?0:e.key==='End'?buttons.length-1:(i+(e.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;buttons[next].focus();buttons[next].click();});
  new MutationObserver(filterRecipes).observe($('craft'),{childList:true});
  filterRecipes();

  // 每次打开背包都先看到物品页（生存模式是合成，创造模式是全部方块）；想看角色再点右边的标签
  new MutationObserver(() => { if (!$('bag').classList.contains('off') && !$('bag').classList.contains('chest') && !wasOpen) show('items'); wasOpen = !$('bag').classList.contains('off'); }).observe($('bag'), { attributes: true, attributeFilter: ['class'] });
  // 角色页：装备格旁边放一张形象预览，穿上什么、手里拿着什么都画出来。game.js 每次重画背包都会重写 #equip，跟着它更新
  const row = document.createElement('div'), pic = document.createElement('img');
  row.id = 'whoRow'; pic.id = 'whoPic'; pic.alt = 'Your character';
  $('equip').before(row); row.append(pic, $('equip'));
  const draw = () => { const src = window.Avatar && Avatar.shot && window.game ? Avatar.shot([...game.equip], game.held || 0) : ''; if (src && pic.src !== src) pic.src = src; pic.hidden = !src; };
  new MutationObserver(draw).observe($('equip'), { childList: true });
  document.head.appendChild(document.createElement('style')).textContent = `
    #bag:not(.chest) #sack { height:min(440px,calc(100dvh - 24px)); }
    #sack > .bagMain { display:flex; flex-direction:column; min-height:0; }
    .bagMain #grid { margin-bottom:auto; min-height:0; overflow-y:auto; grid-auto-rows:40px; align-content:start; flex:1; }
    .bagMain #hot { flex-shrink:0; }
    #bagSide { display:flex; flex-direction:column; width:280px; box-sizing:border-box; flex-shrink:0; min-width:0; min-height:0; margin-top:-24px; padding-left:17px; border-left:1px solid #80634280; }
    #bagTabs { display: flex; gap: 6px; margin-bottom: 12px; }
    #bagTabs button { flex: 1; margin: 0; padding: 7px 4px; font: inherit; font-size: 13px; background: #ffffff14; color: #d4c19b; border: 1px solid #6b513a; border-radius: 6px; cursor: pointer; }
    #bagTabs button[aria-selected=true] { background: linear-gradient(#657447,#455333); color: #fff1d1; border-color: #b3ab72; }
    #bagSide > section { display: flex; flex-direction: column; flex: 1; min-height: 0; overflow-y:auto; }
    #bagSide > section[hidden] { display: none; }
    #bagSide #craft { flex: 1 1 0; width: auto; min-height: 0; max-height: none; }
    #craftFilters { display:grid; grid-template-columns:repeat(10,minmax(0,1fr)); gap:4px; margin:0 0 8px; padding-bottom:8px; border-bottom:1px solid #6b513a; }
    #craftFilters[hidden],#craft .recipe-row[hidden],#craftEmpty[hidden] { display:none; }
    #craftFilters button { grid-column:span 2; margin:0; padding:6px 3px; border:0; border-bottom:2px solid transparent; border-radius:0; background:transparent; color:#bba889; font:12px system-ui; cursor:pointer; }
    #craftFilters button[data-filter="all"],#craftFilters button[data-filter="ready"] { grid-column:span 5; }
    #craftFilters button[aria-pressed=true] { color:#e6ca92; background:transparent; border-bottom-color:#c7a567; }
    #craftFilters button:focus-visible { outline:2px solid #e0b878; }
    #craftEmpty { font:12px/1.6 system-ui; color:#bba889; text-align:center; }
    #whoRow { display: grid; grid-template-columns: minmax(0,1fr) 40px; align-items: stretch; gap: 10px; }
    .bagCharacter > h3 { display: none; }
    #whoPic { display:block; width:100%; height:175px; object-fit:contain; border-radius:8px; background:linear-gradient(#241d16,#181510); box-shadow:inset 0 0 0 1px #6b513a; }
    #whoPic[hidden] { display:none; }
    #whoRow #equip { gap:5px; margin:0; align-content:start; }
    #stats { display:grid; grid-template-columns:64px minmax(0,1fr); align-items:center; gap:0; margin-top:10px; padding:0 10px; border:1px solid #6b513a; border-radius:8px; background:#211a144d; white-space:normal; font-size:12px; line-height:1.4; }
    #stats dt,#stats dd { margin:0; padding:7px 0; border-bottom:1px solid #b28d5730; min-width:0; }
    #stats dt { color:#c6ad83; }
    #stats dd { text-align:right; color:#f0e4d0; font-variant-numeric:tabular-nums; overflow-wrap:anywhere; }
    #stats dt:last-of-type,#stats dd:last-of-type { border-bottom:0; }
    #stats small { color:#a99577; font-size:10px; }
    #bag.chest #bagSide { display: none; }
    body.mobile #bagSide { width: min(250px, 38vw); }
    @media (max-width: 640px) { #bagSide, body.mobile #bagSide { width:100%; margin-top:0; min-height:320px; padding-left:0; padding-top:12px; border-left:0; border-top:1px solid #80634280; } #bagSide #craft { flex: none; max-height: 40dvh; } }`;
})();
