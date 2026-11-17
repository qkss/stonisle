// City flags, timed occupation, resident stewards and the gold economy.
(() => {
 const R=CityRules,groups=new Map(),ray=new THREE.Raycaster();let capture=null,opened=null,clock=0,noticeUntil=0,panelTab='workshop',alchemyRank=0;
 const palette=[['#315c74','#ead49b'],['#816331','#fff0b0'],['#29645d','#cce5cc'],['#302e47','#d3bd89'],['#176a81','#f6d78a']];
 const effectsHud=document.createElement('div');effectsHud.style='position:fixed;left:50%;bottom:115px;transform:translateX(-50%);z-index:17;pointer-events:none;font:12px system-ui;color:#ead3aa;text-shadow:0 1px 3px #000';document.body.append(effectsHud);
 const hud=document.createElement('div');hud.id='cityHud';hud.innerHTML='<span id="cityNotice"></span><button id="cityInteract" hidden></button><div id="cityCapture" hidden><strong></strong><progress max="30" value="0"></progress><span></span><button id="cityCancel">取消占领</button></div>';document.body.append(hud);
 const overlay=document.createElement('div');overlay.id='cityOverlay';overlay.hidden=true;overlay.innerHTML='<section role="dialog" aria-modal="true" aria-labelledby="cityTitle"><header><button id="cityClose" aria-label="关闭城镇面板">×</button><h2 id="cityTitle"></h2></header><div id="citySummary"></div><nav id="cityTabs" aria-label="城镇功能"></nav><div id="cityBody"></div><p id="cityResult" role="status"></p></section>';document.body.append(overlay);
 const style=document.createElement('style');style.textContent=`#cityHud{position:fixed;left:50%;bottom:155px;transform:translateX(-50%);z-index:18;text-align:center;pointer-events:none;font:14px system-ui;color:#f1dfb7;max-width:calc(100vw - 180px)}#cityHud button{pointer-events:auto}#cityNotice{display:block;text-shadow:0 2px 3px #000;margin:6px}#cityHud button,#cityOverlay button{background:#4b4930;color:#f1dfb7;border:1px solid #887551;border-radius:6px;padding:9px 14px;cursor:pointer;font:inherit;touch-action:manipulation}#cityCapture{background:#302820ed;border:1px solid #8d764d;padding:12px;border-radius:8px;min-width:230px}#cityCapture progress{display:block;width:100%;height:12px;accent-color:#cda95e;margin:9px 0}#cityCapture span{display:block;font-size:12px;margin-bottom:8px}#cityOverlay{position:fixed;inset:0;z-index:34;background:#15141166;display:grid;place-items:center;padding:12px;cursor:default}#cityOverlay[hidden],#cityHud [hidden]{display:none}#cityOverlay>section{width:min(480px,100%);max-height:calc(100dvh - 24px);overflow:auto;background:#392e24;border:2px solid #766044;border-radius:12px;padding:18px;color:#eedfc4;font:14px/1.6 system-ui;box-sizing:border-box}#cityOverlay header{position:sticky;top:-18px;background:#392e24;z-index:2;padding-top:8px;display:flex;align-items:center;gap:12px;border-bottom:1px solid #746044}#cityOverlay h2{font-size:20px;color:#dfbb7c;margin:0 0 10px}#cityClose{padding:0!important;width:28px;height:28px;align-self:flex-start;color:#b9a582!important;background:#40352b!important}#cityBody button{display:flex;width:100%;justify-content:space-between;margin:6px 0}#cityOverlay button:disabled{opacity:.45;cursor:default}#cityBody [data-city-craft],#cityBody [data-city-use]{display:inline-flex;width:auto;min-width:100px;margin-right:8px;padding:6px 12px}#cityOverlay>section{scrollbar-width:thin;scrollbar-color:#887551 #392e24}#cityBody img{width:30px;height:30px;vertical-align:middle}#cityResult{color:#e6ba78} @media(max-height:500px){#cityHud{bottom:85px;font-size:12px}#cityCapture{padding:7px}#cityOverlay>section{max-height:90dvh}}`;document.head.append(style);
 const sheet=document.createElement('link');sheet.rel='stylesheet';sheet.href='src/client/city/city-panel.css';document.head.append(sheet);
 const $=id=>document.getElementById(id),g=()=>window.game,record=id=>R.record(g().guardState,id);
 function sites(){return [...(g().exploration?.sites||[]),...(g().castleWorld?[{id:'legacy',name:'云岚城',x:0,z:0,base:30,blueprint:293,wall:10}]:[])];}
 function message(text){$('cityNotice').textContent=text;noticeUntil=performance.now()+4500;}
 function emblem(i){const canvas=document.createElement('canvas');canvas.width=512;canvas.height=320;const c=canvas.getContext('2d'),[bg,gold]=palette[i];c.fillStyle=bg;c.fillRect(0,0,512,320);c.strokeStyle=gold;c.fillStyle=gold;c.lineWidth=9;c.strokeRect(13,13,486,294);c.lineCap='round';c.lineJoin='round';c.beginPath();
  if(i===0){c.moveTo(106,224);c.lineTo(206,104);c.lineTo(260,168);c.lineTo(312,115);c.lineTo(405,224);c.stroke();c.beginPath();c.moveTo(130,90);c.bezierCurveTo(160,38,221,47,231,86);c.bezierCurveTo(285,40,334,52,362,91);c.stroke();}
  if(i===1){c.arc(256,140,53,0,Math.PI*2);c.stroke();for(let k=0;k<12;k++){const a=k*Math.PI/6;c.beginPath();c.moveTo(256+Math.cos(a)*70,140+Math.sin(a)*70);c.lineTo(256+Math.cos(a)*88,140+Math.sin(a)*88);c.stroke();}for(let k=0;k<3;k++)c.fillRect(170-k*25,234+k*16,172+k*50,8);}
  if(i===2){for(let y=108;y<245;y+=48){c.beginPath();c.moveTo(90,y);c.bezierCurveTo(160,y-70,220,y+70,280,y);c.bezierCurveTo(330,y-55,380,y+20,423,y-12);c.stroke();}}
  if(i===3){c.moveTo(255,245);c.lineTo(99,91);c.lineTo(207,124);c.lineTo(256,81);c.lineTo(303,124);c.lineTo(415,91);c.closePath();c.fill();c.fillStyle=bg;c.fillRect(237,131,13,12);c.fillRect(266,131,13,12);}
  if(i===4){c.moveTo(145,234);c.bezierCurveTo(386,260,337,150,216,190);c.bezierCurveTo(111,220,160,96,295,116);c.bezierCurveTo(377,129,346,54,302,75);c.stroke();c.beginPath();c.moveTo(310,76);c.lineTo(288,45);c.moveTo(331,84);c.lineTo(365,59);c.moveTo(295,119);c.lineTo(371,145);c.stroke();c.beginPath();c.arc(306,92,5,0,7);c.fill();}
  for(let y=0;y<320;y+=3){c.fillStyle='rgba(255,255,255,.025)';c.fillRect(0,y,512,1);}const t=new THREE.CanvasTexture(canvas);t.encoding=THREE.sRGBEncoding;return t;
 }
 function initialize(site){const i=ExplorationCastles.TYPES.findIndex(t=>t.name===site.name),flag=R.flag(site),group=new THREE.Group(),pole=new THREE.Mesh(new THREE.CylinderGeometry(.055,.075,3.4,10),new THREE.MeshPhongMaterial({color:0xb4975b,shininess:35}));pole.position.y=1.7;group.add(pole);
  const geo=new THREE.PlaneGeometry(2.5,1.55,18,10);geo.translate(1.25,2.3,0);const cloth=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({map:emblem(Math.max(0,i)),side:THREE.DoubleSide}));group.add(cloth);group.position.set(flag.x,flag.y,flag.z);g().scene.add(group);
  const outfit=Skins.list.findIndex(s=>s.city===site.name);
  const steward=Avatar.build({skin:1,style:0,hair:0,shirt:4,pants:2,size:0,skirt:0,acc:0,outfit:Math.max(0,outfit)},[]);let spot=[site.x+2.5,(site.base||30)+1,site.z-5.5];
  for(const [dx,dz] of [[2,-5],[-2,-5],[4,0],[-4,0],[0,5]])if(GuardNavigation.clear((...p)=>g().world.get(...p),site.x+dx+.5,spot[1],site.z+dz+.5)){spot=[site.x+dx+.5,spot[1],site.z+dz+.5];break;}
  steward.position.set(...spot);Avatar.hold(steward,298);g().scene.add(steward);
  const c=document.createElement('canvas');c.width=256;c.height=64;const cx=c.getContext('2d');cx.fillStyle='#2b251de8';cx.fillRect(0,0,256,64);cx.fillStyle='#ecd29a';cx.font='26px sans-serif';cx.textAlign='center';cx.fillText('熬光',128,41);const tag=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),depthTest:true}));tag.scale.set(2,.5,1);tag.position.y=2.25;steward.add(tag);
  const workshop=TownWorkshops.create(site);g().scene.add(workshop);
  const a={site,flag,group,cloth,steward,spot,workshop,base:new Float32Array(geo.attributes.position.array)};groups.set(site.id,a);return a;
 }
 function sight(point,max=4){const p=g().p,o=new THREE.Vector3(p.x,p.y+g().eye,p.z),v=new THREE.Vector3(...point).sub(o),len=v.length();if(len>max)return false;const hit=Core.raycast((x,y,z)=>{const id=g().world.get(x,y,z);return Core.PASS.has(id)?0:id;},o.toArray(),v.normalize().toArray(),len);return !hit||hit.t>len-.4;}
 function aimed(){if(!g()?.playing||g().dead)return null;const p=g().p,o=new THREE.Vector3(p.x,p.y+g().eye,p.z),d=new THREE.Vector3(...g().lookDir());ray.set(o,d);ray.far=4;let nearest=null;
  for(const a of groups.values())for(const [kind,mesh] of [['flag',a.group],['steward',a.steward],['workshop',a.workshop]]){if(!mesh.visible)continue;mesh.updateMatrixWorld(true);const pick=[];mesh.traverse(o=>{if(o.isMesh)pick.push(o);});const hit=ray.intersectObjects(pick,false)[0];if(hit&&(!nearest||hit.distance<nearest.distance)&&sight(hit.point.toArray(),4.1))nearest={kind,a,distance:hit.distance};}
  const h=Core.raycast((x,y,z)=>g().world.get(x,y,z),o.toArray(),d.toArray(),4);if(h&&g().world.get(h.x,h.y,h.z)===R.MINT&&(!nearest||h.t<nearest.distance))return {kind:'mint',h};return nearest;
 }
 function nearby(){
  if(!g()?.playing||g().dead||opened)return null;
  const aimedTarget=aimed();if(aimedTarget)return aimedTarget;
  const p=g().p;let best=null;
  for(const a of groups.values())for(const kind of ['steward','workshop']){
   const mesh=kind==='steward'?a.steward:a.workshop;if(!mesh.visible)continue;
   const point=kind==='steward'?[mesh.position.x,mesh.position.y+1.2,mesh.position.z]:[mesh.position.x,mesh.position.y+1,mesh.position.z+.45];
   const distance=Math.hypot(p.x-point[0],p.y+g().eye-point[1],p.z-point[2]);
   if(distance<=4&&(!best||distance<best.distance)&&sight(point,4))best={kind,a,distance};
  }
  return best;
 }
 function interactNearby(){return interact(nearby());}
 function close(){opened=null;overlay.hidden=true;g().furnaceModal(false);}
 function drawPanel(){if(!opened)return;const body=$('cityBody'),scroll=body.scrollTop;body.className='';$('citySummary').textContent='';$('cityTabs').innerHTML='';
  if(opened.kind==='mint'){ $('cityTitle').textContent='铸币机';body.innerHTML=`<p><img src="${g().icon(292)}" alt="金锭"> 金锭 × 1 → <img src="${g().icon(R.COIN)}" alt="金币"> 金币 × 10</p><p>拥有金锭 ${g().inv[292]||0} · 金币 ${g().inv[R.COIN]||0}</p><button id="mintCoin" ${!(g().inv[292]>0)||window.Net?.guest?'disabled':''}>铸造 10 枚金币</button>`;$('mintCoin').onclick=()=>{if(!opened||window.Net?.guest||g().world.get(opened.h.x,opened.h.y,opened.h.z)!==R.MINT)return; if(R.mint(g().inv)){g().renderBar();g().saveNow();drawPanel();$('cityResult').textContent='铸造完成：获得金币 × 10';window.CombatAudio?.craft?.();}};return;}
  const {a}=opened,owned=record(a.site.id).owned,guards=CastleGuards.guards.filter(v=>v.city===a.site.id),fallen=guards.filter(v=>v.hp<=0),tier=ExplorationCastles.TYPES.findIndex(t=>t.name===a.site.name)+1;
  $('cityTitle').textContent=a.site.name+' · '+(opened.kind==='workshop'?TownWorkshops.specs[a.site.name].hall:'熬光');
  $('citySummary').innerHTML=`<span class="city-status ${owned?'owned':''}">${owned?'你的领地':'尚未占领'}</span><span>驻军 <b>${guards.length-fallen.length}/${guards.length}</b></span><span>金币 <b>${g().inv[R.COIN]||0}</b></span>`;
  $('cityTabs').innerHTML=`<button data-tab="workshop" aria-pressed="${panelTab==='workshop'}"><span aria-hidden="true">⚒</span> 专属工坊</button><button data-tab="guards" aria-pressed="${panelTab==='guards'}"><span aria-hidden="true">♜</span> 驻军招募${fallen.length?' · '+fallen.length:''}</button>`;
  for(const b of $('cityTabs').querySelectorAll('button'))b.onclick=()=>{panelTab=b.dataset.tab;$('cityResult').textContent='';drawPanel();body.scrollTop=0;$('cityTabs').querySelector('[data-tab="'+panelTab+'"]').focus();};
  body.innerHTML='';
  if(panelTab==='workshop')drawWorkshop(body,a.site);
  else{body.innerHTML=`<div class="city-intro"><h3>驻军招募</h3><p>${owned?'补充阵亡岗位，守卫会返回原驻守位置。':'占领屋顶战旗后，守卫将效忠于你。'}</p></div><div class="city-guard-list">`+(owned?fallen.map(v=>`<button data-hire="${v.slot}" ${window.Net?.guest||(g().inv[R.COIN]||0)<R.cost(tier,v.archer)?'disabled':''}><span>${v.team||'城内'} ${v.archer?'弓箭手':'护卫'} · Lv.${tier}</span><span>${R.cost(tier,v.archer)} 金币</span></button>`).join('')||'<div class="city-empty">驻军齐备<small>所有岗位均已有人驻守</small></div>':'')+'</div>';
   for(const b of body.querySelectorAll('[data-hire]'))b.onclick=()=>{const ok=CastleGuards.hire(a.site.id,+b.dataset.hire);drawPanel();$('cityResult').textContent=ok?'招募完成，护卫已返回岗位。':'无法招募：请检查金币和岗位是否被占用。';};
  }
  body.scrollTop=scroll;
 }

 function drawWorkshop(body,site){
  const spec=CityCrafts.cities[site.name];if(!spec)return;
  const section=document.createElement('div');section.className='city-workshop';body.append(section);
  const allowed=()=>CityCrafts.canCraft({...g(),guest:!!window.Net?.guest},site.name);
  const alchemy=site.name==='云岚城';
  const recipes=alchemy?CityCrafts.alchemyRecipes(alchemyRank):g().cityRecipes.filter(r=>CityCrafts.cityFor(r[0])===site.name);
  section.innerHTML=`<div class="city-intro"><h3>${spec.title}</h3><p>${spec.detail}</p>${allowed()?'':'<p class="city-lock">占领此城后，在对应设施附近制作。</p>'}</div>${alchemy?`<div class="alchemy-years" role="group" aria-label="选择主药年份">${['普通','十年','百年','千年','万年'].map((name,i)=>`<button data-age="${i}" aria-pressed="${alchemyRank===i}">${name}<small>${['仅下品','25% 双丹','最高中品','最高上品','最高极品'][i]}</small></button>`).join('')}</div><p class="alchemy-note">选择投入的主药年份，辅药不变；仅扣所选药材。十年有 25% 概率额外获得一颗下品。</p><div class="alchemy-odds">${CityCrafts.odds(alchemyRank).map((chance,i)=>`<span>${CityCrafts.grades[i]} <b>${chance}%</b></span>`).join('')}</div>`:''}<div class="city-recipes">`+recipes.map(([out,n,need],i)=>{
   const ok=allowed()&&Object.entries(need).every(([id,count])=>(g().inv[id]||0)>=count);
   const detail=(alchemy?'品级随机 · 1—4 道丹纹标识品阶':CityCrafts.items[out]?.desc)||([293,294,295,296,298].includes(out)?'誊制图纸：保留原件，新增 1 张':'城池专属制作');
   return `<article class="city-recipe"><div class="city-item"><img src="${g().icon(out)}" alt=""><div><b>${alchemy?Lang.chinese(out).replace(/^下品/,''):Lang.chinese(out)||Lang.item(out)}</b><small>${alchemy?'固定配方 · 按投入年份出丹':Lang.item(out)}</small></div><span class="city-yield">${!alchemy&&CityCrafts.items[out]?.grade?`<b class="pill-grade" style="color:${CityCrafts.items[out].gradeColor}">${CityCrafts.items[out].grade}</b>`:''} × ${n}</span></div><p class="city-effect">${detail}</p><div class="city-materials">${Object.entries(need).map(([id,count])=>`<span class="city-material ${(g().inv[id]||0)<count?'missing':''}" title="${Lang.display(+id)}"><img src="${g().icon(+id)}" alt=""><span>${Lang.chinese(+id)||Lang.item(+id)}<b>${g().inv[id]||0}<i> / ${count}</i></b></span></span>`).join('')}</div><div class="city-actions"><button data-city-craft="${i}" ${ok?'':'disabled'}>${ok?'制作'+([293,294,295,296,298].includes(out)?'副本':''):allowed()?'材料不足':'尚未解锁'}</button>${!alchemy&&CityCrafts.items[out]?`<button class="city-use" data-city-use="${out}" ${(g().inv[out]||0)>0?'':'disabled'}>使用 <span>${g().inv[out]||0}</span></button>`:''}</div></article>`;
  }).join('')+'</div>';
  for(const b of section.querySelectorAll('[data-age]'))b.onclick=()=>{alchemyRank=+b.dataset.age;$('cityResult').textContent='';drawPanel();$('cityBody').scrollTop=0;section.remove();$('cityBody').querySelector('[data-age="'+alchemyRank+'"]').focus();};
  for(const b of section.querySelectorAll('[data-city-use]'))b.onclick=()=>{const ok=g().eatFood(+b.dataset.cityUse);drawPanel();$('cityResult').textContent=ok?'已使用，效果已生效。':'当前无需使用、数量不足或已有更强的养元效果。';};
  for(const b of section.querySelectorAll('[data-city-craft]'))b.onclick=()=>{const [out,n,need]=recipes[+b.dataset.cityCraft];const grant=(id,count)=>g().give(id,count),result=alchemy?CityCrafts.brew(g().inv,out,alchemyRank,allowed(),grant):CityCrafts.craft(g().inv,[out,n,need],allowed(),grant);if(!result)return;g().saveNow();drawPanel();$('cityResult').textContent=alchemy?'炼丹完成：'+Lang.chinese(result.id)+' × '+result.count+' · '+CityCrafts.items[result.id].desc:'制作完成：'+Lang.display(out);window.CombatAudio?.craft?.();};
 }
 function interact(target=aimed()){if(!target)return false;if(window.Net?.guest){message('城池占领、招募和铸币由主机操作。');return true;}
  if(target.kind==='flag'){const a=target.a;if(record(a.site.id).owned){message(a.site.name+' 已属于你，可到一楼熬光处补充护卫。');return true;}if(!capture){capture={a,elapsed:0};$('cityCapture').hidden=false;message('占领开始，请留在战旗 4 格内；受伤会中断。');}return true;}
  panelTab='workshop';opened=target;overlay.hidden=false;g().furnaceModal(true);$('cityResult').textContent='';drawPanel();$('cityClose').focus();return true;
 }
 $('cityClose').onclick=close;$('cityCancel').onclick=()=>cancel('已取消占领');$('cityInteract').onclick=()=>interactNearby();
 overlay.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Escape'||e.code==='KeyE'){e.preventDefault();close();}if(e.key==='Tab'){const nodes=[...overlay.querySelectorAll('button:not(:disabled)')],first=nodes[0],last=nodes.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
 function cancel(text){if(!capture)return;capture=null;$('cityCapture').hidden=true;message(text);}
 window.CityControl={interact,interactNearby,close,get opened(){return !!opened;},hostile(id){return !record(id).owned;},damaged(){cancel('受到攻击，占领已中断。');},update(dt){if(!g())return;clock+=dt;
  effectsHud.textContent=Object.entries(g().cityEffects.active).map(([k,v])=>({regen:'养元',speed:'疾行',guard:'护身',mining:'采掘',fasting:'辟谷'}[k])+' '+Math.ceil(v)+'秒').join(' · ');
  for(const site of sites()){if(Math.hypot(g().p.x-site.x,g().p.z-site.z)>180)continue;const r=record(site.id);if(r.workshopVersion!==1&&!window.Net?.guest){g().setBlocks(TownWorkshops.plan(site));r.workshopVersion=1;g().saveNow();}if(!r.flagAccess&&!window.Net?.guest){g().setBlocks(R.access(site));r.flagAccess=true;g().saveNow();}if(!groups.has(site.id))initialize(site);}
  for(const a of groups.values()){const near=Math.hypot(g().p.x-a.site.x,g().p.z-a.site.z)<180;a.group.visible=near;a.steward.visible=near;a.workshop.visible=near;if(!near)continue;
   const attr=a.cloth.geometry.attributes.position;for(let n=0;n<attr.count;n++){const x=a.base[n*3],y=a.base[n*3+1];attr.setZ(n,Math.sin(clock*2.1-x*2.4+y)*.14*x/2.5+Math.sin(clock*1.1-x)*.05);}attr.needsUpdate=true;a.cloth.material.color.set(record(a.site.id).owned?0xffffff:0xc6b8ae);Avatar.pose(a.steward,0,0,0);
  }
  if(capture){const a=capture.a,near=sight([a.flag.x,a.flag.y+1,a.flag.z],4.5);if(!near||g().dead||!g().playing||document.hidden)cancel('离开战旗或暂停，占领已中断。');else if(R.tick(capture,dt,{near,alive:true,playing:true,hurt:false})){const r=record(a.site.id);r.owned=true;r.owner='player';r.capturedAt=Date.now();g().saveNow();const skin=Skins.list.findIndex(s=>s.city===a.site.name);if(skin>0&&!g().isPreview)Skins.unlock(skin);window.Avatar?.refresh();message('占领成功！你已成为'+a.site.name+'城主。');capture=null;$('cityCapture').hidden=true;}else{$('cityCapture').querySelector('strong').textContent='正在占领 '+a.site.name;$('cityCapture').querySelector('progress').value=capture.elapsed;$('cityCapture').querySelector('span').textContent=`${Math.ceil(30-capture.elapsed)} 秒 · 保持在战旗附近`;}}
  const target=g().playing?nearby():null,label=target?target.kind==='flag'?(record(target.a.site.id).owned?'查看城池':'占领战旗 · 30 秒'):target.kind==='steward'?'与熬光交谈':target.kind==='workshop'?'使用'+TownWorkshops.specs[target.a.site.name].station:'使用铸币机':'';$('cityInteract').hidden=!label||!!capture;$('cityInteract').textContent=label?(document.body.classList.contains('mobile')?label:'F · '+label):'';
  if(performance.now()>noticeUntil){const inside=sites().find(s=>Math.abs(g().p.x-s.x-7)<50&&g().p.z>s.z-41&&g().p.z<s.z+82);$('cityNotice').textContent=inside?(record(inside.id).owned?inside.name+' · 你的领地':inside.name+' · 敌对领地，小心守卫'):'';}
 }};
 if(new URLSearchParams(location.search).has('preview')&&new URLSearchParams(location.search).has('cityReview')){
  const panel=document.createElement('div');panel.style='position:fixed;left:10px;top:95px;z-index:24;background:#30271fe8;padding:8px;color:#ead3aa;border:1px solid #8c744d;border-radius:8px';
  const current=()=>groups.values().next().value;
  const button=(label,fn)=>{const b=document.createElement('button');b.textContent=label;b.onclick=fn;panel.append(b);};
  button('工坊造型定格',()=>{const a=current();if(!a)return;g().p.x=a.site.x+41.5;g().p.y=(a.site.base??30)+1.6;g().p.z=a.site.z+19.3;g().look(0,-.04);close();g().furnaceModal(true);panel.hidden=true;});
  button('专精建筑预览',()=>{const a=current();if(!a)return;g().p.x=a.site.x+41.5;g().p.y=(a.site.base??30)+1;g().p.z=a.site.z+34;g().look(0,.12);close();});
  button('进入专精工坊',()=>{const a=current();if(!a)return;g().p.x=a.site.x+41.5;g().p.y=(a.site.base??30)+1;g().p.z=a.site.z+17.1;g().look(0,.22);close();});
  button('宫城全景',()=>{const a=current();if(!a)return;g().p.x=a.site.x+.5;g().p.y=(a.site.base||30)+1;g().p.z=a.site.z+25;g().look(0,.12);});
  button('查看战旗',()=>{const a=current();if(!a)return;g().p.x=a.flag.x+1;g().p.y=a.flag.y;g().p.z=a.flag.z+2;g().look(Math.atan2(1,2),.08);});
  button('占领战旗测试',()=>{const a=current();if(a)interact({kind:'flag',a});});
  button('前往一楼熬光',()=>{const a=current();if(!a)return;const d=[[0,2],[2,0],[-2,0],[0,-2],[1,2]].find(([x,z])=>GuardNavigation.clear((...p)=>g().world.get(...p),a.spot[0]+x,a.spot[1],a.spot[2]+z))||[0,2];g().p.x=a.spot[0]+d[0];g().p.y=a.spot[1];g().p.z=a.spot[2]+d[1];g().look(Math.atan2(d[0],d[1]),-.15);});
  button('熬光交互测试',()=>{const a=current();if(a)interact({kind:'steward',a});});
  button('工坊预览测试',()=>{const a=current();if(!a)return;record(a.site.id).owned=true;g().p.x=a.spot[0]+1;g().p.y=a.spot[1];g().p.z=a.spot[2]+2;for(const [out,n,need] of g().cityRecipes.filter(r=>CityCrafts.cityFor(r[0])===a.site.name))for(const [id,count] of Object.entries(need))g().give(+id,count*3);for(let id=350;id<=359;id++)g().give(id,10);interact({kind:'steward',a});});
  button('粮田生长预览',()=>{const a=current();if(!a)return;const rows=[];for(const [i,d] of CerealCrops.list.entries())for(let phase=0;phase<3;phase++){const x=a.site.x+34+i*3,z=a.site.z+30+phase*2,y=(a.site.base??30);rows.push([x,y,z,98],[x,y+1,z,[d.young,d.growing,d.id][phase]]);}g().setBlocks(rows);g().p.x=a.site.x+38.5;g().p.y=(a.site.base??30)+2;g().p.z=a.site.z+39;g().look(0,-.28);close();});
  button('粮食与仙酿预览',()=>{for(const d of CerealCrops.list){g().give(d.product,32);g().give(d.seed,8);}for(let id=450;id<=457;id++)g().give(id,2);g().renderBag();});
  button('丹药图标对比',()=>{for(const id of Object.keys(g().inv))delete g().inv[id];for(const base of [304,305,306])for(let rank=0;rank<4;rank++)g().give(CityCrafts.pillId(base,rank),3);g().renderBag();});
  button('测试阵亡岗位',()=>{const a=CastleGuards.guards.find(a=>a.hp>0);if(a)CastleGuards.hurt(a,10000,{x:a.x+1,z:a.z});});
  button('铸币流程测试',()=>{const a=current();if(!a)return;const h={x:a.site.x-4,y:(a.site.base||30)+1,z:a.site.z-4};g().setBlock(h.x,h.y,h.z,299);g().give(292,20);g().p.x=h.x+.5;g().p.y=h.y;g().p.z=h.z+2;interact({kind:'mint',h});});
  button('隐藏预览工具',()=>{panel.hidden=true;});
  const status=document.createElement('div');panel.append(status);setInterval(()=>{const a=current();if(a)status.textContent=a.site.name+' · '+(record(a.site.id).owned?'玩家已占领':'尚未占领')+' · 金币 '+(g().inv[R.COIN]||0);},250);document.body.append(panel);
 }
})();
