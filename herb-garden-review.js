// Disposable garden uses the same planting, growth and harvesting handlers as play.
addEventListener('load',()=>{
 if(!new URLSearchParams(location.search).has('herbReview')||!game.isPreview)return;
 const panel=document.createElement('div');panel.style='position:fixed;left:16px;top:90px;z-index:30;background:#302b22ec;color:#e9d9b7;border:1px solid #85704d;padding:12px;border-radius:9px;font:13px system-ui;max-width:90vw';
 const text=document.createElement('p');text.textContent='药圃预览 · 六种药材 · 幼苗 → 生长 → 成熟';panel.append(text);
 const positions=HerbFarming.defs.slice(0,6).map((d,i)=>({x:i*2,y:40,z:0,n:[0,1,0]}));
 const button=(name,fn)=>{const b=document.createElement('button');b.textContent=name;b.style='padding:9px;margin:3px;background:#585b3c;color:#f1e3c1;border:1px solid #958461;border-radius:5px';b.onclick=fn;panel.append(b);};
 const info=document.createElement('p');
 const update=()=>{info.textContent=HerbFarming.defs.slice(0,6).map((d,i)=>d.name+' '+(game.herbState.crops[[i*2,41,0].join(',')]?Math.floor(game.herbState.crops[[i*2,41,0].join(',')].age/d.seconds*100)+'%':'—')).join(' · ');};
 button('播种六种药材',()=>{const blocks=[];for(let x=-2;x<14;x++)for(let z=-2;z<11;z++){blocks.push([x,40,z,1]);for(let y=41;y<46;y++)blocks.push([x,y,z,0]);}game.setBlocks(blocks);positions.forEach((p,i)=>{game.setBlock(p.x,p.y,p.z,98);game.give(320+i,1);HerbFarming.use(p,320+i);});game.p.x=5.5;game.p.y=41;game.p.z=9;game.look(0,-.22);game.furnaceModal(true);update();});
 button('三阶段并排对比',()=>{const blocks=[];for(let x=-2;x<14;x++)for(let z=-2;z<12;z++){blocks.push([x,40,z,2]);for(let y=41;y<46;y++)blocks.push([x,y,z,0]);}game.setBlocks(blocks);game.herbState.crops={};HerbFarming.defs.slice(0,6).forEach((d,i)=>{for(let row=0;row<3;row++){const z=4-row*2,age=[0,d.seconds*.55,d.seconds][row];game.setBlock(i*2,40,z,98);game.setBlock(i*2,41,z,HerbFarming.stage(d,age));game.herbState.crops[[i*2,41,z].join(',')]={id:d.id,age};}});game.p.x=5.5;game.p.y=44;game.p.z=11;game.look(0,-.5);game.furnaceModal(true);info.textContent='近排：幼苗 · 中排：生长期 · 远排：成熟（可收获）';});
 button('雪莲人参年份对比',()=>{const blocks=[];for(let x=-2;x<12;x++)for(let z=-2;z<12;z++){blocks.push([x,40,z,2]);for(let y=41;y<46;y++)blocks.push([x,y,z,0]);}game.setBlocks(blocks);game.herbState.crops={};for(const d of HerbVarieties.list){game.setBlock(d.rank*2,40,d.family*3,98);game.setBlock(d.rank*2,41,d.family*3,d.id);}game.p.x=4.5;game.p.y=43;game.p.z=10;game.look(0,-.38);game.furnaceModal(true);info.textContent='从左到右：普通 / 十年 / 百年 / 千年 / 万年 · 前排人参，后排雪莲';
 let gallery=document.getElementById('herbAgeGallery');if(!gallery){gallery=document.createElement('div');gallery.id='herbAgeGallery';gallery.style='position:fixed;right:16px;bottom:110px;z-index:25;display:grid;grid-template-columns:repeat(5,minmax(65px,100px));gap:8px;padding:12px;background:#29271fe8;border:1px solid #786443;border-radius:9px;max-width:95vw';document.body.append(gallery);}gallery.innerHTML=HerbVarieties.list.map(d=>`<div style="text-align:center;font:12px system-ui;color:${d.color}"><img src="${game.icon(d.id)}" style="width:64px;height:64px;display:block;margin:auto" alt="${d.name}">${d.name}</div>`).join('');
 });
 button('推进生长 120 秒',()=>{HerbFarming.tick(120);update();});
 button('收获成熟药材',()=>{let n=0;positions.forEach((p,i)=>{if(game.world.get(p.x,41,p.z)!==310+i)return;game.setBlock(p.x,41,p.z,0);const out=HerbFarming.dug({...p,y:41},310+i);if(out){game.give(out,1);n++;}});update();info.textContent+=' · 收获 '+n+' 份药材';});
 panel.append(info);document.body.append(panel);
});
