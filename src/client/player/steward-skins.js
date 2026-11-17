// One shared outfit definition per city: resident NPC, portraits and player skin.
(function(root){
 const styles=[
  {city:'云岚城',key:'yunlan-steward',name:'云岚青衿',coat:'#355e76',dark:'#223b4b',trim:'#d4bd85',lining:'#e3dbbd',skin:1,hair:0,style:4},
  {city:'阗天城',key:'tiantian-steward',name:'阗天司礼',coat:'#d9cbb0',dark:'#877044',trim:'#d7ac51',lining:'#f0e8d3',skin:2,hair:5,style:0},
  {city:'苍云城',key:'cangyun-steward',name:'苍云雅士',coat:'#3f7568',dark:'#264b48',trim:'#a6c3a1',lining:'#e0ddc0',skin:0,hair:0,style:11},
  {city:'黑风城',key:'heifeng-steward',name:'黑风总领',coat:'#414655',dark:'#272a34',trim:'#a9acb2',lining:'#bfb8a8',skin:3,hair:5,style:0},
  {city:'东海龙宫',key:'dragon-steward',name:'龙宫熬光',coat:'#317d8c',dark:'#254e68',trim:'#dab968',lining:'#e7e4d3',skin:0,hair:5,style:1}
 ];
 function owned(g,city){if(!g)return false;const records=g.guardState?.cities||{};return (city==='云岚城'&&!!records.legacy?.owned)||(g.exploration?.sites||[]).some(s=>s.name===city&&records[s.id]?.owned);}
 const fabrics=new Map();
 function embroidered(s,i){if(fabrics.has(s.key))return fabrics.get(s.key);const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');x.fillStyle=s.coat;x.fillRect(0,0,256,256);
  for(let n=0;n<256;n+=3){x.fillStyle=n%2?'#ffffff08':'#0000000a';x.fillRect(n,0,1,256);x.fillRect(0,n,256,1);}
  x.strokeStyle=s.trim;x.lineWidth=3;x.strokeRect(14,12,228,232);x.lineWidth=2;
  for(const y of [39,205]){x.beginPath();x.moveTo(25,y);x.bezierCurveTo(68,y-22,88,y+22,128,y);x.bezierCurveTo(169,y-22,198,y+22,231,y);x.stroke();}
  x.translate(128,124);x.lineWidth=4;x.beginPath();
  if(i===0){x.moveTo(-65,37);x.lineTo(-15,-32);x.lineTo(18,10);x.lineTo(38,-12);x.lineTo(67,37);x.stroke();x.beginPath();x.arc(5,-38,21,Math.PI,0);x.stroke();}
  if(i===1){x.arc(0,0,29,0,7);x.stroke();for(let k=0;k<12;k++){const a=k*Math.PI/6;x.beginPath();x.moveTo(Math.cos(a)*38,Math.sin(a)*38);x.lineTo(Math.cos(a)*51,Math.sin(a)*51);x.stroke();}}
  if(i===2){for(let j=-1;j<=1;j++){x.beginPath();x.moveTo(-65,j*24);x.bezierCurveTo(-25,j*24-40,25,j*24+40,65,j*24);x.stroke();}}
  if(i===3){x.moveTo(0,45);x.lineTo(-65,-31);x.lineTo(-23,-9);x.lineTo(0,-36);x.lineTo(23,-9);x.lineTo(65,-31);x.closePath();x.stroke();}
  if(i===4){x.moveTo(-55,43);x.bezierCurveTo(67,49,54,-1,-12,15);x.bezierCurveTo(-62,32,-39,-40,27,-26);x.bezierCurveTo(58,-18,48,-61,26,-52);x.stroke();x.beginPath();x.moveTo(29,-48);x.lineTo(20,-66);x.moveTo(42,-44);x.lineTo(56,-62);x.stroke();}
  const map=new THREE.CanvasTexture(c);map.encoding=THREE.sRGBEncoding;map.anisotropy=4;const m=new THREE.MeshPhongMaterial({map,shininess:7,specular:0x20251e});fabrics.set(s.key,m);return m;
 }
 function extra(s,i,a){
  const cloth=(w,h,d,x,y,z,color=s.coat,to)=>{const m=a.part(w,h,d,x,y,z,color,to);if(typeof ItemArt!=='undefined'){m.material.dispose();m.material=ItemArt.material('cloth',color,true);}return m;};
  const gold=(w,h,d,x,y,z,to)=>{const m=a.part(w,h,d,x,y,z,s.trim,to);if(typeof ItemArt!=='undefined'){m.material.dispose();m.material=ItemArt.material('metal',s.trim,true);}return m;};
  if(!a.body){
   cloth(.50,.57,.28,0,1.08,0);cloth(.51,.065,.30,0,.81,0,s.dark);
   for(const side of [-1,1]){const lapel=cloth(.095,.28,.025,side*.07,1.30,-.16,s.lining);lapel.rotation.z=side*.40;}
   const bib=cloth(.34,.32,.018,0,1.08,-.157);bib.material=embroidered(s,i);
   gold(.08,.065,.025,0,.81,-.17);for(const x of [-.12,.12])gold(.016,.21,.025,x,.66,-.19);
   // Split coat tails follow the legs, keeping a readable robe silhouette without a solid skirt.
   if(!a.legs)for(let j=0;j<2;j++){const leg=a.swing[j],side=j?-1:1;cloth(.245,.43,.30,0,-.13,0,s.coat,leg);cloth(.25,.025,.31,0,-.35,0,s.trim,leg);cloth(.05,.4,.015,side*.09,-.13,-.158,s.dark,leg);}
   const mantle=cloth(.53,.51,.05,0,1.11,.18,s.dark);mantle.rotation.x=-.06;
  }
  for(const arm of [a.swing[2],a.swing[3]])if(!a.body){cloth(i===3?.24:.205,.40,.25,0,-.22,0,s.coat,arm);cloth(.225,.085,.27,0,-.43,0,s.dark,arm);gold(.23,.018,.275,0,-.39,0,arm);}
  if(!a.legs)for(const leg of [a.swing[0],a.swing[1]]){cloth(.225,.18,.27,0,-.54,0,s.dark,leg);gold(.23,.022,.28,0,-.46,0,leg);}
  if(a.head)return;
  if(i===0){cloth(.48,.12,.44,0,1.98,.01,s.dark);cloth(.35,.13,.33,0,2.09,.035,s.dark);for(const side of [-1,1]){const wing=cloth(.21,.035,.085,side*.31,1.98,.025,s.dark);wing.rotation.z=side*.12;}gold(.07,.055,.025,0,2.02,-.22);a.part(.06,.10,.03,.17,.76,-.19,'#75a48a');}
  if(i===1){gold(.47,.045,.45,0,1.98,0);for(const x of [-.17,0,.17])gold(.055,x===0?.17:.1,.045,x,2.05,-.22);a.part(.06,.06,.035,0,2.07,-.25,'#d8e6c8');cloth(.16,.13,.035,0,1.49,-.249,s.lining);for(const side of [-1,1]){const shawl=cloth(.18,.25,.34,side*.22,1.32,0,s.lining);shawl.rotation.z=side*.28;} }
  if(i===2){gold(.47,.025,.035,.045,2.035,0);a.part(.045,.065,.055,.27,2.035,0,'#79a990');cloth(.13,.08,.12,0,2.07,.04,s.dark);const pouch=cloth(.13,.18,.07,-.21,.70,-.18,s.dark);gold(.11,.025,.08,-.21,.79,-.18);for(let k=0;k<5;k++){const fold=cloth(.028,.22,.018,-.22+k*.021,.94,-.18,s.lining);fold.rotation.z=(k-2)*.13;}}
  if(i===3){cloth(.52,.13,.48,0,1.98,.015,s.dark);for(let k=0;k<9;k++)cloth(.065,.08,.09,(k-4)*.052,1.94,-.235,k%2?s.lining:'#99938b');for(const side of [-1,1])cloth(.22,.13,.32,side*.23,1.40,0,s.lining);gold(.08,.10,.03,0,2.02,-.23);cloth(.18,.12,.035,0,1.49,-.249,'#928d87');const strap=cloth(.065,.55,.035,.06,1.09,-.19,s.dark);strap.rotation.z=-.36;}
  if(i===4){gold(.48,.045,.43,0,1.97,0);gold(.10,.17,.05,0,2.055,-.22);a.part(.07,.09,.035,0,2.07,-.255,'#80d5d1');
   for(const side of [-1,1]){for(let k=0;k<3;k++){const horn=gold(.045,.12,.05,side*(.17+k*.045),2.02+k*.083,.025+k*.035);horn.rotation.z=-side*(.3+k*.16);}const branch=gold(.04,.095,.04,side*.29,2.17,-.01);branch.rotation.z=side*.8;
    cloth(.07,.20,.04,side*.11,1.46,-.248,s.lining);for(let k=0;k<3;k++)cloth(.07-k*.014,.08,.035,side*(.045+k*.008),1.43-k*.06,-.25+k*.012,s.lining);
    for(let k=0;k<3;k++){const scale=cloth(.12,.065,.31,side*(.26+k*.045),1.40-k*.04,0,s.coat);scale.rotation.z=side*.16;gold(.12,.014,.32,side*(.26+k*.045),1.37-k*.04,0);}
   }
  }
 }
 const list=styles.map((s,i)=>({id:s.key,city:s.city,name:s.name,how:'占领'+s.city+'后解锁',got:g=>!g?.isPreview&&owned(g,s.city),look:{skin:s.skin,hair:s.hair,style:s.style,shirt:4,pants:2,skirt:0,size:0,acc:0},shirtColor:s.coat,pantsColor:s.dark,firstPerson:{sleeve:s.coat,cuff:s.trim,bell:i===2||i===4,slim:i===2||i===4},extra:a=>extra(s,i,a)}));
 if(typeof document!=='undefined'&&new URLSearchParams(location.search).has('preview')&&new URLSearchParams(location.search).has('stewardReview'))addEventListener('load',()=>{
  const panel=document.createElement('section');panel.style='position:fixed;inset:12% 4% auto;z-index:50;background:#28241fed;border:1px solid #9b8259;border-radius:12px;padding:18px;color:#e6cf9e;font:14px system-ui;box-shadow:0 15px 70px #0008';
  const title=document.createElement('h2');title.textContent='五城人物皮肤 · 占领对应城池解锁';title.style='margin:0 0 10px;font-size:20px';panel.append(title);
  const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});renderer.setSize(1100,390);renderer.setPixelRatio(1);renderer.domElement.style='width:100%;display:block';panel.append(renderer.domElement);
  const scene=new THREE.Scene();scene.add(new THREE.AmbientLight(0xe8edf3,.85));const lamp=new THREE.DirectionalLight(0xffefd8,.85);lamp.position.set(-4,6,-5);scene.add(lamp);const rim=new THREE.DirectionalLight(0x8fbdcf,.35);rim.position.set(4,4,2);scene.add(rim);
  const camera=new THREE.OrthographicCamera(-4.4,4.4,1.45,-1.65,.1,30);camera.position.set(0,1.25,-10);camera.lookAt(0,1.25,0);
  const models=list.map((s,i)=>{const m=Avatar.build({outfit:Skins.list.findIndex(k=>k.id===s.id)},[]);m.position.x=(2-i)*1.7;m.rotation.y=-.16;scene.add(m);return m;});
  const labels=document.createElement('div');labels.style='display:grid;grid-template-columns:repeat(5,1fr);text-align:center;gap:8px';labels.innerHTML=list.map(s=>`<div><strong>${s.name}</strong><div style="margin-top:4px;color:#ac9e88">${s.city}</div></div>`).join('');panel.append(labels);
  const turn=document.createElement('button');turn.textContent='查看背面';turn.style='margin-top:14px;padding:8px 18px;background:#4e5943;border:1px solid #9b8259;color:#eee0be;border-radius:6px';let back=false;turn.onclick=()=>{back=!back;models.forEach(m=>m.rotation.y=back?Math.PI+.16:-.16);turn.textContent=back?'查看正面':'查看背面';renderer.render(scene,camera);};panel.append(turn);
  const close=document.createElement('button');close.textContent='关闭人物预览';close.style=turn.style.cssText+';margin-left:12px';close.onclick=()=>{panel.remove();scene.traverse(o=>o.geometry?.dispose());renderer.dispose();};panel.append(close);document.body.append(panel);renderer.render(scene,camera);
 });
 const api={list,owned};if(typeof module!=='undefined')module.exports=api;else root.StewardSkins=api;
})(this);
