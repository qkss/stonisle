// Skin categories register their own content; adding a type needs no tab-switch changes.
(() => {
  const root=document.getElementById('settings-skins');if(!root)return;
  const tabs=document.createElement('div');tabs.className='skinCategoryTabs';tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','Skin categories');
  root.prepend(tabs);const categories=new Map();let active='';
  function select(id,focus=false){
    if(!categories.has(id))return;active=id;
    for(const [key,{button,panel}] of categories){const on=key===id;button.setAttribute('aria-selected',String(on));button.tabIndex=on?0:-1;panel.hidden=!on;if(on&&focus)button.focus();}
    if(id==='character')window.Avatar?.refresh();
  }
  function register({id,label,panel}){
    if(categories.has(id)||!/^[a-z][a-z0-9-]*$/.test(id))return;
    const button=document.createElement('button');button.type='button';button.id='skin-category-'+id;button.textContent=label;button.setAttribute('role','tab');button.setAttribute('aria-controls','skin-panel-'+id);
    panel.id='skin-panel-'+id;panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby',button.id);button.onclick=()=>select(id);tabs.append(button);root.append(panel);categories.set(id,{button,panel});select(active||id);
  }
  const character=document.getElementById('characterSkins');character.querySelector('h2').textContent='Character skins';
  register({id:'character',label:'Character',panel:character});
  const weapons=document.createElement('div');
  let previewSkin=WeaponSkins.selected;
  function renderWeapons(){
    const skin=WeaponSkins.list.find(s=>s.id===previewSkin);
    weapons.innerHTML=`<h2>Weapon skins</h2><p class="settingsHint">剑类外观 · 木剑、石剑、铁剑与黑曜剑共用 · 不改变伤害</p><div class="weaponHero"><img src="${WeaponSkins.preview(skin.id)}" alt="${skin.name}"><div><h3>${skin.name}</h3><p>${skin.note}</p><button id="equipWeaponSkin" ${skin.id===WeaponSkins.selected?'disabled':''}>${skin.id===WeaponSkins.selected?'已装备':'装备外观'}</button></div></div><div class="weaponSkinGrid">${WeaponSkins.list.map(s=>`<button type="button" data-skin="${s.id}" aria-pressed="${s.id===previewSkin}" title="预览${s.name}"><img src="${WeaponSkins.preview(s.id)}" alt=""><strong>${s.name}</strong><small>${s.id===WeaponSkins.selected?'已装备':s.en}</small></button>`).join('')}</div>`;
    weapons.querySelector('#equipWeaponSkin').onclick=()=>{WeaponSkins.set(previewSkin);renderWeapons();};
    for(const b of weapons.querySelectorAll('[data-skin]'))b.onclick=()=>{previewSkin=b.dataset.skin;renderWeapons();};
  }
  renderWeapons();register({id:'weapons',label:'Weapons',panel:weapons});
  tabs.addEventListener('keydown',e=>{const keys=[...categories.keys()],i=keys.indexOf(active),next=e.key==='ArrowRight'?(i+1)%keys.length:e.key==='ArrowLeft'?(i+keys.length-1)%keys.length:e.key==='Home'?0:e.key==='End'?keys.length-1:null;if(next!==null){e.preventDefault();e.stopPropagation();select(keys[next],true);}});
  document.getElementById('tab-skins').addEventListener('click',()=>select(active));
  document.head.appendChild(document.createElement('style')).textContent=`
    .weaponHero { display:flex; align-items:center; gap:10px; padding:8px; border-radius:8px; background:linear-gradient(130deg,#18272d,#30241d); border:1px solid #7d694b; }
    .weaponHero>img { width:100px;height:180px;object-fit:contain; }
    .weaponHero h3 { font-size:16px; margin:0; color:#ecd9ad; } .weaponHero p { font-size:12px; color:#baa98e; line-height:1.7; }
    #card .weaponHero button { font-size:12px; padding:7px 10px; margin:0; }
    .weaponSkinGrid { display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:12px; }
    #card .weaponSkinGrid button { display:flex;flex-direction:column;align-items:center;min-width:0;width:100%;box-sizing:border-box;margin:0;padding:5px;background:#211d1980;border:1px solid #77614455;border-radius:6px;color:#d8c49d; }
    #card .weaponSkinGrid button[aria-pressed=true] { border-color:#cbb17b;background:#5a563233; }
    .weaponSkinGrid img { width:72px;height:100px;object-fit:contain; } .weaponSkinGrid strong {font-size:12px;} .weaponSkinGrid small { font-size:10px;color:#a9957c;margin-top:3px; }
    .skinCategoryTabs { display:flex; gap:16px; border-bottom:1px solid #80634266; margin-bottom:16px; }
    #card .skinCategoryTabs button { padding:8px 2px; margin:0; border:0; border-bottom:2px solid transparent; border-radius:0; background:none; color:#ae9878; }
    #card .skinCategoryTabs button[aria-selected=true] { color:#ebd2a2; border-bottom-color:#c7a567; }
    .skinDefault { display:flex; align-items:center; gap:10px; padding:12px; border:1px solid #80634277; border-radius:7px; background:#261e1755; }
    .skinDefault>span:first-child { font-size:26px; color:#cfb68d; }
    .skinDefault strong,.skinDefault small { display:block; } .skinDefault small { color:#ae9878; margin-top:4px; }
    .skinCurrent { margin-left:auto; color:#acbb8a; font-size:11px; }
  `;
  window.SkinPanels={register,select};
})();
