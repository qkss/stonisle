// Shared deterministic workshop plots and their interactive scene models.
(function(root){
 const specs={
  云岚城:{hall:'炼丹房',station:'丹炉',kind:'alchemy',wall:8,trim:181,roof:55,floor:52,color:'#518d78'},
  阗天城:{hall:'天工坊',station:'千机台',kind:'engineering',wall:51,trim:155,roof:51,floor:155,color:'#bc9754'},
  苍云城:{hall:'酿酒厂',station:'酿造台',kind:'brewery',wall:95,trim:181,roof:55,floor:94,color:'#8e633e'},
  黑风城:{hall:'百炼房',station:'锻造炉',kind:'forge',wall:92,trim:157,roof:157,floor:157,color:'#d47735'},
  东海龙宫:{hall:'百宝阁',station:'奇珍炉',kind:'treasure',wall:155,trim:57,roof:282,floor:155,color:'#72bfc6'}
 };
 function point(site){return [site.x+41.5,(site.base??30)+2,site.z+13.5];}
 function near(site,p){const [x,y,z]=point(site);return Math.hypot(p.x-x,p.z-z)<8&&Math.abs(p.y-(y-1))<4;}
 function plan(site){const s=specs[site.name];if(!s)return [];const cells=new Map(),base=site.base??30;
  const put=(x,y,z,id)=>cells.set(x+','+y+','+z,[site.x+x,base+y,site.z+z,id]);
  const box=(x,y,z,X,Y,Z,id)=>{for(let a=x;a<=X;a++)for(let b=y;b<=Y;b++)for(let c=z;c<=Z;c++)put(a,b,c,id);};
  box(33,1,7,49,10,22,0);box(34,-1,8,48,0,21,s.floor);
  box(34,1,8,48,6,21,s.wall);box(35,1,9,47,6,20,0);
  for(const x of [34,48])for(const z of [8,21]){box(x,1,z,x,7,z,s.trim);put(x,5,z,59);}
  box(40,1,21,43,4,21,0);box(40,0,22,43,0,24,52);
  for(const x of [34,48])for(const z of [11,17])box(x,3,z,x,4,z+2,50);
  for(const x of [36,44])box(x,3,8,x+2,4,8,50);
  for(let r=0;r<3;r++)box(33+r,7+r,7,49-r,7+r,22,s.roof);
  // Collision plinth beneath the sculpted station, with clear working space in front.
  box(40,1,12,42,1,14,s.floor);
  for(const x of [36,46]){box(x,1,10,x,1,18,s.wall);put(x,2,10,59);put(x,2,18,59);}
  if(s.kind==='forge'){box(45,2,9,46,10,10,92);put(45,2,11,56);}
  if(s.kind==='alchemy'){for(const z of [12,15,17]){put(36,2,z,94);put(46,2,z,94);}}
  if(s.kind==='treasure'){for(const x of [36,46])for(const z of [11,17])put(x,2,z,58);}
  return [...cells.values()];
 }
 function create(site){const T=root.THREE,s=specs[site.name],g=new T.Group();g.position.set(...point(site));
  const mat=(c,shine=20)=>new T.MeshPhongMaterial({color:c,map:root.ItemArt?.material(shine>=40?'metal':'stone',c,true)?.map||null,shininess:shine,specular:0x55504a});
  const bronze=mat('#ad8150',55),dark=mat('#333c40',40),wood=mat('#785034',7),jade=mat(s.color,35),cream=mat('#ebdfb7',20);
  const add=(geo,m,x=0,y=0,z=0)=>{const o=new T.Mesh(geo,m);o.position.set(x,y,z);g.add(o);return o;};
  const box=(w,h,d,x,y,z,m)=>add(new T.BoxGeometry(w,h,d),m,x,y,z);
  const ball=(r,x,y,z,m,scale)=>{const o=add(new T.SphereGeometry(r,28,20),m,x,y,z);if(scale)o.scale.set(...scale);return o;};
  const cylinder=(r,R,h,x,y,z,m)=>add(new T.CylinderGeometry(r,R,h,24),m,x,y,z);
  const ring=(r,y,m)=>{const o=add(new T.TorusGeometry(r,.045,8,36),m,0,y,0);o.rotation.x=Math.PI/2;};
  const glow=mat('#ffac47');glow.emissive=new T.Color('#994012');
  if(s.kind==='alchemy'){
   for(const x of [-.65,.65])for(const z of [-.5,.5])cylinder(.12,.17,.48,x,.24,z,bronze);
   ball(.92,0,1.05,0,jade,[1,.88,1]);ring(.83,1.37,bronze);ring(.69,.58,bronze);
   cylinder(.68,.82,.18,0,1.76,0,bronze);ball(.65,0,1.84,0,jade,[1,.38,1]);ball(.13,0,2.18,0,bronze);
   for(const x of [-1,1]){const o=add(new T.TorusGeometry(.27,.07,8,24),bronze,x,1.35,0);o.rotation.y=Math.PI/2;}
   for(let i=0;i<5;i++)box(.07,.15,.035,(i-2)*.16,.68,.77,glow);
   for(let i=0;i<12;i++){const a=i*Math.PI/6;ball(.028,Math.cos(a)*.84,1.37,Math.sin(a)*.84,bronze);}
   // Small scroll seals follow the belly, leaving the jade silhouette visible.
   for(const x of [-.42,0,.42]){const seal=add(new T.TorusGeometry(.105,.012,6,24,Math.PI*1.65),bronze,x,1.06,Math.sqrt(.92*.92-x*x)+.005);seal.rotation.z=x*2;}

  }else if(s.kind==='forge'){
   box(2.1,1.5,1.5,0,.95,0,dark);box(1.38,.83,.06,0,.85,.78,mat('#120d0a'));box(1.12,.22,.08,0,.53,.83,glow);
   for(const x of [-.63,.63])box(.12,.92,.18,x,.86,.85,bronze);box(1.4,.13,.18,0,1.34,.85,bronze);
   cylinder(.62,.95,.75,0,2.07,-.1,dark);cylinder(.35,.4,.7,0,2.72,-.1,dark);
   for(let i=0;i<6;i++)box(.08,.38,.1,(i-2.5)*.18,.7,.87,dark);
   box(.8,.22,.44,-1.35,.75,.25,dark);box(.32,.55,.3,-1.35,.4,.25,bronze);
   const brick=mat('#735344',6),edge=mat('#8d9290',32);
   for(const x of [-.87,.87])for(let j=0;j<5;j++)box(.31,.23,.13,x,.42+j*.26,.83,j%2?brick:dark);
   for(let i=0;i<7;i++)box(.27,.22,.15,(i-3)*.29,1.56,.82,brick);
   for(const x of [-1,1])for(const y of [.31,1.63]){box(.12,.15,.10,x,y,.86,edge);ball(.032,x,y,.93,bronze);}
   for(let i=0;i<8;i++)ball(.07,-.48+i*.14,.54,.86,i%2?glow:brick,[1,.6,1]);
   const horn=add(new T.ConeGeometry(.2,.48,12),edge,-1.9,.75,.25);horn.rotation.z=Math.PI/2;
   box(.75,.14,.7,1.37,.36,-.05,wood);box(.65,.20,.6,1.37,.53,-.05,mat('#594135',5));box(.75,.10,.7,1.37,.68,-.05,wood);
   cylinder(.45,.48,.12,0,3.1,-.1,edge);

  }else if(s.kind==='brewery'){
   const timberCanvas=document.createElement('canvas');timberCanvas.width=128;timberCanvas.height=256;const tc=timberCanvas.getContext('2d');
   tc.fillStyle='#956c43';tc.fillRect(0,0,128,256);
   for(let i=0;i<100;i++){tc.strokeStyle=i%3?'#39281730':'#f0cc8d35';tc.lineWidth=i%7===0?2:1;tc.beginPath();for(let y=0;y<=256;y+=8){const x=i*1.37+Math.sin(y*.035+i)*1.8;if(y===0)tc.moveTo(x,y);else tc.lineTo(x,y);}tc.stroke();}
   const woodMap=new T.CanvasTexture(timberCanvas);woodMap.encoding=T.sRGBEncoding;woodMap.wrapS=woodMap.wrapT=T.RepeatWrapping;
   const oak=new T.MeshPhongMaterial({map:woodMap,color:'#f0d4aa',shininess:6,bumpMap:woodMap,bumpScale:.009});
   const iron=mat('#45423a',24),copper=mat('#bd8054',55),rim=mat('#e2bd80',45),ceramic=mat('#406f68',38);
   const tube=(points,r,m)=>add(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),40,r,10,false),m);
   const hoop=(x,y,z,r,m,thick=.035)=>{const o=add(new T.TorusGeometry(r,thick,8,48),m,x,y,z);o.rotation.x=Math.PI/2;return o;};
   // Broad framed workbench, separate planks and braced trestle legs.
   for(let i=0;i<6;i++)box(.59,.15,1.6,-1.5+i*.6,.68,0,oak);
   for(const x of [-1.45,1.45]){for(const z of [-.57,.57])box(.19,.62,.19,x,.31,z,oak);box(.23,.14,1.4,x,.23,0,oak);}
   box(2.9,.14,.16,0,.23,0,oak);box(3.5,.16,.1,0,.56,.8,iron);
   // Bulging coopered fermenting barrel, each stave has real seams.
   const profile=[[.40,0],[.46,.12],[.50,.42],[.49,.76],[.42,1.08]].map(([r,y])=>new T.Vector2(r,y));
   for(let i=0;i<18;i++)add(new T.LatheGeometry(profile,4,i*Math.PI*2/18+.008,Math.PI*2/18-.016),oak,-1.02,.77,-.1);
   for(const [h,r] of [[.1,.453],[.4,.502],[.92,.459]]){hoop(-1.02,.77+h,-.1,r,iron,.031);for(let i=0;i<10;i++){const a=i*Math.PI/5;ball(.019,-1.02+Math.cos(a)*(r+.02),.77+h,-.1+Math.sin(a)*(r+.02),rim);}}
   cylinder(.418,.418,.05,-1.02,1.86,-.1,oak);box(.58,.045,.12,-1.02,1.9,-.1,iron);
   tube([[-1.02,1.04,.32],[-1.02,1.04,.56],[-1.02,.96,.61]],.045,copper);box(.18,.035,.045,-1.02,1.13,.47,oak);
   // Small charcoal hearth, copper still and an arched condenser pipe.
   cylinder(.42,.48,.22,.30,.86,-.18,iron);for(let i=0;i<7;i++)ball(.055,.05+i*.08,.88,.18,glow,[1,.55,1]);
   ball(.47,.30,1.32,-.18,copper,[1,1.0,1]);hoop(.30,1.56,-.18,.40,rim,.025);
   cylinder(.15,.40,.35,.30,1.83,-.18,copper);cylinder(.10,.14,.16,.30,2.08,-.18,rim);
   tube([[.30,2.15,-.18],[.43,2.36,-.18],[.91,2.37,-.18],[1.35,2.04,-.12],[1.42,1.65,.15],[1.42,1.42,.35]],.055,copper);
   for(const x of [-.2,.8]){const handle=add(new T.TorusGeometry(.14,.025,8,24),iron,x,1.42,-.18);handle.rotation.y=Math.PI/2;}
   // Glazed receiving jar and cloth-wrapped reserve jars.
   const jar=(x,y,z,r,m)=>{ball(r,x,y+r*.85,z,m,[1,1.1,1]);cylinder(r*.45,r*.65,r*.30,x,y+r*1.9,z,m);hoop(x,y+r*2.08,z,r*.46,rim,.018);};
   jar(1.40,.77,.35,.27,ceramic);jar(-.34,.77,.52,.18,mat('#b7a177',10));
   box(3.25,.10,.32,0,2.28,-.69,oak);for(const x of [-1.52,1.52])box(.10,1.5,.10,x,1.55,-.69,iron);
   for(const [i,x] of [-1.25,-.88,-.5].entries()){jar(x,2.33,-.68,.13,mat(['#6b8c70','#9b6653','#d2b88b'][i],28));cylinder(.065,.08,.05,x,2.63,-.68,cream);}
   // Grain scoop resting on the front edge, and a hanging wooden stirring paddle.
   const scoop=ball(.14,.65,.82,.58,oak,[1,.35,.7]);box(.35,.035,.055,.88,.84,.58,oak);
   box(.045,.65,.045,-1.65,1.56,-.45,oak);ball(.10,-1.65,1.2,-.45,oak,[.7,1.6,.28]);
  }else if(s.kind==='treasure'){
   const colors=['#eea8c2','#b4a5e4','#7fcbd3','#aadfc7','#f1d39b'];
   // Thin scalloped shell surfaces, fanning from a shared hinge; no solid egg silhouette.
   function shell(upper){const positions=[],uvs=[],indices=[],N=48,M=16;for(let j=0;j<=M;j++)for(let i=0;i<=N;i++){
    const u=i/N*Math.PI,r=j/M,scallop=1+.045*Math.cos(u*12),x=Math.cos(u)*r*1.45*scallop,z=Math.sin(u)*r*1.55;
    positions.push(x,upper?.38+z*1.05+.18*Math.sin(r*Math.PI):.22-.30*Math.sin(r*Math.PI),upper?-.5-z*.38:-.5+z);uvs.push(i/N,r);
   }for(let j=0;j<M;j++)for(let i=0;i<N;i++){const a=j*(N+1)+i;indices.push(a,a+1,a+N+1,a+1,a+N+2,a+N+1);}
    const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));geo.setIndex(indices);geo.computeVertexNormals();
    const c=document.createElement('canvas');c.width=256;c.height=128;const ctx=c.getContext('2d'),gradient=ctx.createLinearGradient(0,0,256,0);colors.forEach((v,i)=>gradient.addColorStop(i/4,v));ctx.fillStyle=gradient;ctx.fillRect(0,0,256,128);for(let k=0;k<=12;k++){ctx.fillStyle='#fff4dc77';ctx.fillRect(k*256/12,0,3,128);}
    const tex=new T.CanvasTexture(c);tex.encoding=T.sRGBEncoding;add(geo,new T.MeshPhongMaterial({map:tex,side:T.DoubleSide,shininess:60,specular:0xd0dedc}));
   }shell(false);shell(true);cylinder(.55,.75,.24,0,.04,0,bronze);const pearl=mat('#f4dfec',80);pearl.emissive=new T.Color('#393045');ball(.35,0,.5,.2,pearl);
  }else{
   box(3.5,.28,1.3,0,.65,0,dark);for(const x of [-1.5,1.5])for(const z of [-.48,.48])box(.15,.65,.15,x,.33,z,bronze);
   for(let i=0;i<11;i++){const roller=cylinder(.105,.105,1.1,-1.4+i*.28,.85,0,mat(i%2?'#63757a':'#9aa8a3',55));roller.rotation.x=Math.PI/2;}
   for(const z of [-.63,.63])box(3.5,.12,.1,0,.97,z,bronze);
   for(const x of [-1.45,1.45])box(.12,1.5,.12,x,1.6,-.58,dark);box(3.1,.14,.15,0,2.32,-.58,bronze);
   for(const x of [-1,-.5,.5,1]){box(.08,.6,.08,x,1.95,-.55,wood);box(.3,.12,.16,x,2.13,-.55,dark);}
   box(.48,.35,.55,0,1.08,0,jade);
   // Bench vise, toothed drive wheel and a compact hand drill.
   box(.55,.15,.6,-.85,1.04,0,dark);for(const x of [-1.06,-.67])box(.12,.25,.5,x,1.23,0,bronze);
   const screw=cylinder(.045,.045,.8,-.86,1.13,.42,dark);screw.rotation.z=Math.PI/2;
   const gear=add(new T.TorusGeometry(.25,.06,8,32),bronze,1.55,.6,.7);
   for(let i=0;i<12;i++){const a=i*Math.PI/6,tooth=box(.12,.12,.09,1.55+Math.cos(a)*.28,.6+Math.sin(a)*.28,.7,bronze);tooth.rotation.z=a;}
   cylinder(.075,.075,1.15,.85,1.56,-.35,dark);box(.5,.18,.33,.7,2.1,-.35,bronze);cylinder(.035,.07,.38,.53,1.84,-.35,dark);
   for(const x of [-1.5,1.5])for(const z of [-.63,.63])ball(.035,x,.97,z,cream);

  }
  // Interior stock: herb jars, bottles, ore bins or tool components.
  for(const side of [-1,1])for(let i=0;i<4;i++){const m=mat(['#95805a','#7b9a72','#bd9c6b','#8798a3'][i]);cylinder(.18,.24,.45,side*5, .25, -1.4+i*1.65,m);cylinder(.19,.19,.07,side*5,.51,-1.4+i*1.65,bronze);}
  function label(text,width,height,x,y,z){const c=document.createElement('canvas');c.width=768;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#30251e';ctx.fillRect(0,0,768,128);ctx.strokeStyle='#bb9560';ctx.lineWidth=8;ctx.strokeRect(6,6,756,116);ctx.fillStyle='#f0d49b';ctx.font='bold 68px serif';ctx.textAlign='center';ctx.fillText(text,384,88);const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;const m=add(new T.PlaneGeometry(width,height),new T.MeshBasicMaterial({map:t,side:T.DoubleSide}),x,y,z);return m;}
  label(s.hall,4,.7,0,3.5,8.53);label(s.station,2.6,.43,0,2.9,1.1);
  // A forgiving interaction volume prevents thin shells and roller gaps from losing clicks.
  box(3.2,2.8,2.3,0,1.4,0,new T.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));
  return g;
 }
 const api={specs,point,near,plan,create};if(typeof module!=='undefined')module.exports=api;else root.TownWorkshops=api;
})(this);
