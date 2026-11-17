// City workshops and fictional consumables. Pure rules also run in Node tests.
(function(root){
 const Workshops=typeof module!=='undefined'?require('./town-workshops.js'):root.TownWorkshops;
 const cities={云岚城:{title:'炼丹房 · 丹炉',detail:'调制回春、养元和辟谷丹药。'},阗天城:{title:'天工坊 · 千机台',detail:'制作高级工具、机械与高级图纸。马车、飞行背包、发电机待后续开放，图纸可先誊制。'},苍云城:{title:'酿酒厂 · 酿造台',detail:'酿造短效灵酒；同类效果刷新时长，不叠加。'},黑风城:{title:'百炼房 · 锻造炉',detail:'熔合金锭，锻造合金及以上装备。'},东海龙宫:{title:'百宝阁 · 奇珍炉',detail:'提炼云母、颜料、树脂及变色油墨，为天工提供材料。'}};
 const items={
  304:{name:'回春丹',en:'healing pill',city:'云岚城',need:{310:2,315:1,32:2},heal:8,desc:'立即恢复 8 点生命',color:'#bd5d51'},
  305:{name:'养元丹',en:'restoration pill',city:'云岚城',need:{311:1,313:1,113:2},effect:'regen',duration:40,desc:'40 秒内缓慢恢复 10 点生命',color:'#5b9b80'},
  306:{name:'辟谷丹',en:'satiety pill',city:'云岚城',need:{312:2,314:1,256:3},food:55,desc:'恢复 55 点饱食度',color:'#d4b366'},
  307:{name:'青岚酒',en:'swiftwind wine',city:'苍云城',need:{257:6,177:2,33:1},effect:'speed',duration:60,desc:'60 秒内移动速度 +20%',color:'#66a8a1'},
  308:{name:'赤岩酒',en:'stoneguard wine',city:'苍云城',need:{257:4,178:3,134:1,33:1},effect:'guard',duration:60,desc:'60 秒内受到的战斗伤害降低 15%',color:'#aa6356'},
  309:{name:'金穗酒',en:'delver wine',city:'苍云城',need:{257:4,256:3,110:2,33:1},effect:'mining',duration:90,desc:'90 秒内挖掘速度 +25%',color:'#c5a34b'}
 };
 const wines=[
  {name:'麦露清酿',en:'wheat dew wine',need:{420:6,33:1},effect:'speed',duration:45,desc:'45 秒内移动速度 +20%',color:'#d7b66e'},
  {name:'稻花春',en:'rice blossom wine',need:{421:6,33:1},effect:'regen',rate:.25,duration:40,desc:'40 秒内最多恢复 10 点生命',color:'#d6d9c4'},
  {name:'金穗醴',en:'golden corn wine',need:{422:6,33:1},effect:'fasting',food:20,duration:45,desc:'恢复 20 饱食度，45 秒不消耗饱食度',color:'#d6a54e'},
  {name:'赤粱烧',en:'red sorghum wine',need:{423:6,33:1},effect:'guard',duration:45,desc:'45 秒内受到的战斗伤害降低 15%',color:'#a6533c'},
  {name:'玉露回春酿',en:'jade dew immortal wine',need:{420:8,310:2,357:1,33:1},effect:'regen',rate:.6,duration:60,desc:'仙酿 · 60 秒内最多恢复 36 点生命',color:'#66b598',immortal:true},
  {name:'月华养元酿',en:'moonflower immortal wine',need:{421:8,313:2,352:1,33:1},effect:'regen',rate:1,duration:75,desc:'仙酿 · 75 秒内最多恢复 75 点生命',color:'#a49ac7',immortal:true},
  {name:'金霞辟谷酿',en:'golden cloud immortal wine',need:{422:8,312:2,314:2,33:1},effect:'fasting',food:80,duration:240,desc:'仙酿 · 恢复 80 饱食度，240 秒不消耗饱食度',color:'#e4c36e',immortal:true},
  {name:'赤霄护身酿',en:'crimson sky immortal wine',need:{423:8,310:2,315:2,33:1},effect:'guard',duration:120,desc:'仙酿 · 120 秒内受到的战斗伤害降低 15%',color:'#b96668',immortal:true}
 ];
 wines.forEach((s,i)=>items[450+i]={...s,wine:true,city:'苍云城'});
 const grades=['下品','中品','上品','极品'],gradeColors=['#ddcba2','#ddcba2','#ddcba2','#ddcba2'];
 const probabilities=[[100,0,0,0],[100,0,0,0],[35,65,0,0],[10,30,60,0],[0,10,35,55]];
 const pillId=(base,grade)=>grade===0?base:400+(base-304)*4+grade;
 const needs=(base,age)=>base===304?{[355+age]:1,310:1,315:1}:base===305?{[350+age]:1,311:1,313:1}:{[355+age]:1,312:2,314:1};
 for(const base of [304,305,306]){
  const original={...items[base]};
  for(let grade=0;grade<4;grade++){
   const id=pillId(base,grade),item={...original,id,base,rank:grade,gradeIndex:grade,grade:grades[grade],gradeColor:'#ddcba2',name:grades[grade]+original.name,en:['lower','middle','upper','supreme'][grade]+' '+original.en,need:needs(base,0)};
   if(base===304){item.heal=[8,14,17,20][grade];item.desc='立即恢复 '+item.heal+' 点生命';}
   if(base===305){item.rate=[.25,.6,.8,1][grade];item.duration=[40,50,60,75][grade];item.desc=item.duration+' 秒内最多恢复 '+(item.rate*item.duration)+' 点生命';}
   if(base===306){item.food=[55,75,90,100][grade];item.duration=[0,60,120,240][grade];if(grade)item.effect='fasting';item.desc='恢复 '+item.food+' 点饱食度'+(grade?'，'+item.duration+' 秒不消耗饱食度':'');}
   items[id]=item;
  }
  // Old ten-year stacks remain usable, then merge with lower grade on load.
  const legacy=400+(base-304)*4;items[legacy]={...items[base],id:legacy,legacy:true};
 }
 function odds(ages){const age=Array.isArray(ages)?ages.reduce((a,b)=>a+b,0)/ages.length:ages;if(!Number.isFinite(age)||age<0||age>4)throw new RangeError('Invalid herb age');const lo=Math.floor(age),hi=Math.ceil(age);return probabilities[lo].map((v,i)=>v+(probabilities[hi][i]-v)*(age-lo));}
 const alchemyRecipes=age=>[304,305,306].map(base=>[base,1,needs(base,age)]);
 function brew(inv,base,age,allowed,grant,random=Math.random){
  if(![304,305,306].includes(base)||!Number.isInteger(age)||age<0||age>4||!allowed)return false;
  const need=needs(base,age);if(!Object.entries(need).every(([id,n])=>Number.isFinite(inv[id])&&inv[id]>=n))return false;
  const roll=random()*100;let total=0,grade=0;for(let i=0;i<4;i++){total+=probabilities[age][i];if(roll<total){grade=i;break;}}
  const count=age===1&&random()<.25?2:1,id=pillId(base,grade);
  if(!craft(inv,[id,count,need],true,grant))return false;return {id,count,grade};
 }
 function mergeLegacy(inv){for(const base of [304,305,306]){const old=400+(base-304)*4;if(inv[old]>0){inv[base]=(inv[base]||0)+inv[old];delete inv[old];}}}
 function craft(inv,recipe,allowed,grant){if(!allowed||!recipe)return false;const [out,n,need]=recipe;if(!Object.entries(need).every(([id,count])=>Number.isFinite(inv[id])&&inv[id]>=count))return false;for(const [id,count] of Object.entries(need))inv[id]-=count;if(grant)grant(out,n);else inv[out]=(inv[out]||0)+n;return true;}
 const forge=new Set([130,127,128,129,131,29,142,146,147,148,149,150,151]),engineering=new Set([19,28,263,299,293,294,295,296,298]);
 const cityFor=id=>items[id]?.city||(forge.has(+id)?'黑风城':engineering.has(+id)?'阗天城':+id>=300&&+id<=303?'东海龙宫':null);
 const recipes=Object.entries(items).filter(([id,s])=>!s.base||+id===s.base).map(([id,s])=>[+id,1,s.need]);

 // Copying consumes one original and returns two: the original design is retained.
 for(const id of [293,294,295,296,298])recipes.push([id,2,{[id]:1,49:1,300:1,297:10}]);
 function canCraft(g,city){return !!g&&!g.dead&&!g.guest&&(g.exploration?.sites||[]).concat(g.castleWorld?[{id:'legacy',name:'云岚城',x:0,z:0,base:30}]:[]).some(s=>s.name===city&&g.guardState?.cities?.[s.id]?.owned&&(Workshops.near(s,g.p)||(Math.abs(g.p.x-(s.x+2.5))<12&&Math.abs(g.p.z-(s.z-5.5))<12&&Math.abs(g.p.y-((s.base||30)+1))<4)));}
 class Effects{
  constructor(saved){this.regenRate=Number.isFinite(saved?.regenRate)?Math.max(.25,Math.min(1,saved.regenRate)):.25;this.active={};for(const [k,v] of Object.entries(saved||{}))if(['regen','speed','guard','mining','fasting'].includes(k)&&Number.isFinite(v)&&v>0)this.active[k]=Math.min(v,k==='mining'?90:k==='regen'?75:k==='fasting'?240:k==='guard'?120:60);}
  canUse(id){const s=items[id];return !(s?.effect==='regen'&&this.active.regen>0&&(s.rate||.25)<this.regenRate);}
  use(id){const s=items[id];if(!this.canUse(id))return false;if(s?.effect){this.active[s.effect]=Math.max(this.active[s.effect]||0,s.duration);if(s.effect==='regen')this.regenRate=s.rate||.25;}return true;}
  factor(k){return this.active[k]>0?({speed:1.2,guard:.85,mining:1.25}[k]||1):1;}
  tick(dt){let heal=0;for(const k of Object.keys(this.active)){const n=Math.min(Math.max(0,dt),this.active[k]);if(k==='regen')heal+=n*this.regenRate;this.active[k]-=n;if(this.active[k]<=0)delete this.active[k];}return heal;}
  clear(){this.active={};this.regenRate=.25;}toJSON(){return {...this.active,regenRate:this.regenRate};}
 }
 const api={cities,items,recipes,cityFor,canCraft,Effects,grades,gradeColors,pillId,alchemyRecipes,craft,probabilities,odds,brew,mergeLegacy};if(typeof module!=='undefined')module.exports=api;else root.CityCrafts=api;
})(this);
