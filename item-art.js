// Shared material families and model-rendered icons for crafting items, food and gear.
(() => {
  const cache=new Map(), maps=new Map();
  const families={straw:[121,122,123,124],leather:[31,40,41,42,125],metal:[43,44,45,126,127,128,129,130,131,151],fur:[37,47,132,142],scale:[34,46,114,120,136,137,146,147],feather:[39,49,138,139,141,148,149],cloth:[38,48,140,150],crystal:[29,110,111,135],stone:[28,33,134],bone:[19,27,36,133],food:[30,32,112,113,115],plant:[35]};
  function family(id){return Object.keys(families).find(k=>families[k].includes(id))||'stone';}
  function texture(kind){
    if(maps.has(kind))return maps.get(kind);
    const c=document.createElement('canvas');c.width=c.height=128;
    const ctx=c.getContext('2d'),im=ctx.createImageData(128,128);
    for(let y=0;y<128;y++)for(let x=0;x<128;x++){
      const n=Core.hash(x,y,721)-.5;let v=230+n*8;
      if(kind==='cloth')v=210+18*Math.sin(x*Math.PI/4)*Math.sin(y*Math.PI/4)+12*Math.cos((x+y)*Math.PI/16)+n*7;
      if(kind==='straw'){const a=x%24,b=y%24,over=(Math.floor(x/24)+Math.floor(y/24))%2;const cross=over?a:b;v=150+75*Math.sin(Math.PI*cross/24)+n*7;if(cross<3)v=110;}
      if(kind==='leather')v=195+16*Math.sin(x*.06+Math.sin(y*.08))+n*12-10*Math.pow(Math.max(0,Math.sin(x*.48+y*.71)),10);
      if(kind==='metal')v=173+60*Math.pow(Math.max(0,Math.cos((x-38)*.026)),6)+Math.sin(y*.8)*3+n*3;
      if(kind==='fur'||kind==='feather')v=215+16*Math.sin(x*.9+Math.sin(y*.07)*2)+n*7;
      if(kind==='scale'){const row=Math.floor(y/16),xx=(x+(row%2)*8)%16,yy=y%16;v=224-42*Math.exp(-Math.pow(Math.hypot((xx-8)/8,yy/14)-1,2)*130)+n*5;}
      if(kind==='bone')v=239+5*Math.sin(x*.25+Math.sin(y*.04))+n*3;
      if(kind==='stone')v=215+15*Math.sin(x*.12+Math.sin(y*.1)*2)+n*17;
      if(kind==='food')v=234+6*Math.sin(x*.22+y*.10)+n*5;
      if(kind==='crystal')v=239+8*Math.sin(x*.08+y*.13);
      const i=(y*128+x)*4;im.data[i]=im.data[i+1]=im.data[i+2]=v;im.data[i+3]=255;
    }
    ctx.putImageData(im,0,0);const map=new THREE.CanvasTexture(c);map.wrapS=map.wrapT=THREE.RepeatWrapping;map.anisotropy=4;maps.set(kind,map);return map;
  }
  function material(kind,color,natural=true){
    const key=[kind,color,natural].join(':');if(cache.has(key))return cache.get(key);
    const glossy=['metal','scale','crystal','food'].includes(kind);
    const m=new THREE.MeshPhongMaterial({color,map:natural?texture(kind):null,shininess:kind==='metal'?90:kind==='crystal'?65:glossy?24:5,specular:kind==='metal'?0xc9d5e0:glossy?0x454b50:0x141414});
    if(natural&&!['metal','crystal','food'].includes(kind)){m.bumpMap=m.map;m.bumpScale=kind==='straw'?.0017:.0007;}
    if(kind==='metal')MetalFinish.apply(m,color==='#e6c27a'||color==='#a8803a');
    cache.set(key,m);return m;
  }
  function bevel(w,h,d){const s=new THREE.Shape();s.moveTo(-w/2,-h/2);s.lineTo(w/2,-h/2);s.lineTo(w/2,h/2);s.lineTo(-w/2,h/2);s.closePath();const b=Math.min(w,h,d)*.10;const g=new THREE.ExtrudeGeometry(s,{depth:Math.max(.001,d-2*b),bevelEnabled:true,bevelThickness:b,bevelSize:b,bevelSegments:1,steps:1});g.translate(0,0,-(d-2*b)/2);const p=g.attributes.position,n=g.attributes.normal,u=g.attributes.uv;for(let i=0;i<p.count;i++){const front=Math.abs(n.getZ(i))>.5,side=Math.abs(n.getX(i))>.5;u.setXY(i,front?p.getX(i)/w+.5:side?p.getZ(i)/d+.5:p.getX(i)/w+.5,front||side?p.getY(i)/h+.5:p.getZ(i)/d+.5);}return g;}
  function create(id,list,natural=true){
    const group=new THREE.Group(),kind=family(id);
    const add=(geo,mat,x=0,y=0,z=0)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);group.add(m);return m;};
    const mat=(color,k=kind)=>material(k,color,natural);
    if(id===19||id===28){
      const pick=StonePick.create(natural);pick.children[1].material=mat(id===19?'#e8dcc3':'#676a66',id===19?'bone':'stone');
      if(id===28){const gem=new THREE.Mesh(new THREE.OctahedronGeometry(.038,0),mat('#e8a24d','crystal'));gem.position.set(.055,.65,0);gem.scale.set(.5,1,1);pick.add(gem);}return pick;
    }
    if(id===29){const sword=StoneTools.sword(natural);sword.children[1].material=mat('#34293e','crystal');sword.children[2].material=mat('#6b586d','metal');return sword;}
    if(id===27){add(new THREE.CylinderGeometry(.024,.029,.79,10),natural&&NaturalTools.material(0)||mat('#8a5a2c','wood'),0,.395);const point=add(new THREE.ConeGeometry(.057,.27,5),mat('#e8dcc3','bone'),0,.91);point.scale.z=.50;for(let i=0;i<5;i++){const ring=add(new THREE.TorusGeometry(.027,.004,5,14),mat('#aa9168','straw'),0,.76+i*.01);ring.rotation.x=Math.PI/2;}return group;}
    if(id===30||id===115){
      const flesh=add(new THREE.SphereGeometry(.18,12,8),mat(id===30?'#b95f55':'#e7c9ad','food'),0,.46);flesh.scale.set(1.2,1,.5);
      const fat=add(new THREE.TorusGeometry(.136,.018,6,18),mat(id===30?'#eed6bc':'#c66643','food'),0,.46,.074);fat.scale.set(1.15,.85,.6);
      if(id===30){add(new THREE.CylinderGeometry(.025,.03,.18,8),mat('#e8dcc3','bone'),0,.22);for(const x of [-.025,.025])add(new THREE.SphereGeometry(.034,8,6),mat('#e8dcc3','bone'),x,.13);}return group;
    }
    if(id===33){const lump=add(new THREE.IcosahedronGeometry(.22,1),mat('#ac7860','stone'),0,.44);lump.scale.set(1,.7,.8);return group;}
    if(id===34||id===114||id===137){
      const shell=add(new THREE.SphereGeometry(.22,10,6,0,Math.PI*2,0,Math.PI*.57),mat(id===34?'#b99660':id===114?'#ba6548':'#4085a0','scale'),0,.38);shell.rotation.x=Math.PI/2;shell.scale.set(1,.65,.80);return group;
    }
    if(id===35){
      const points=[[-.12,.2,0],[-.05,.35,.01],[.03,.48,0],[-.01,.64,0],[.09,.72,0]].map(p=>new THREE.Vector3(...p));add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),20,.017,6,false),mat('#526b35','plant'));
      for(const [x,y,rz] of [[-.07,.35,-.6],[.03,.50,.7],[.02,.64,-.6]]){const leaf=add(new THREE.SphereGeometry(.07,7,4),mat('#6b8546','plant'),x,y,.01);leaf.scale.set(.6,1.3,.15);leaf.rotation.z=rz;}return group;
    }
    if([39,49,138,139,141].includes(id)){
      const color=list[1][6],stem=mat('#cfbb92','bone');add(new THREE.CylinderGeometry(.004,.009,.64,6),stem,0,.42);
      const outline=new THREE.Shape();outline.moveTo(0,-.23);outline.quadraticCurveTo(-.15,-.04,-.095,.15);outline.quadraticCurveTo(-.05,.29,0,.34);outline.quadraticCurveTo(.15,.15,.115,-.02);outline.lineTo(0,-.23);
      const g=new THREE.ExtrudeGeometry(outline,{depth:.012,bevelEnabled:false,curveSegments:8});add(g,mat(color),0,.44,-.006);
      for(let i=0;i<11;i++)for(const sign of [-1,1]){const y=.29+i*.035,len=.07*Math.sin((i+1)/13*Math.PI);const rib=add(new THREE.CylinderGeometry(.0015,.002,len,4),mat(list[0][6]),sign*len*.34,y,.009);rib.rotation.z=-sign*.8;}
      if(id===49)add(new THREE.ConeGeometry(.012,.10,5),mat('#c9a23a','metal'),0,.07).rotation.z=Math.PI;
      return group;
    }
    if([36,133].includes(id)){
      const n=id===133?2:1;for(let i=0;i<n;i++){
        const tooth=add(new THREE.CylinderGeometry(.003,.065,.40,7,3),mat('#eee2ca'),(i-(n-1)/2)*.18,.45);tooth.rotation.z=(i?-.22:.28);
        add(new THREE.SphereGeometry(.065,7,4),mat('#b7a184'),(i-(n-1)/2)*.18-.05,.25).scale.set(1,.5,.8);
      }return group;
    }
    if([110,111,134,135].includes(id)){
      const colors=id===110?['#f4d27a','#fff0bc']:id===111?['#80bdd9','#d7edf3']:id===134?['#5d6260','#e8a24d']:['#292237','#9c70c6'];
      if(id===134||id===135)add(new THREE.IcosahedronGeometry(.22,0),mat(colors[0],'stone'),0,.44);
      for(let i=0;i<(id===110?5:3);i++){
        const m=add(new THREE.OctahedronGeometry(id===110?.055:.10,0),mat(colors[1],'crystal'),(i%3-1)*.11,.36+(i%2)*.14,.07);m.scale.y=id===111?2:1;m.rotation.z=(i-1)*.3;
      }return group;
    }
    if(id===130){const m=add(bevel(.40,.15,.23),mat('#d9b568'),0,.43);m.rotation.z=.08;add(bevel(.27,.12,.19),mat('#e6c27a'),.025,.56);return group;}
    if(id===32){for(const [x,y] of [[-.09,.39],[.085,.42],[0,.54]])add(new THREE.SphereGeometry(.105,10,7),mat('#a93b4e'),x,y);const leaf=add(new THREE.SphereGeometry(.07,6,4),mat('#54743c','cloth'),.04,.65);leaf.scale.set(1.4,.35,.6);return group;}
    if(id===112){const body=add(new THREE.SphereGeometry(.21,12,8),mat('#87a6ab','scale'),0,.44);body.scale.set(1.25,.5,.40);const tail=add(new THREE.ConeGeometry(.13,.19,3),mat('#4d737c','scale'),-.29,.44);tail.rotation.z=-Math.PI/2;tail.scale.z=.3;add(new THREE.SphereGeometry(.019,8,6),mat('#151d20','crystal'),.15,.48,.076);return group;}
    if(id===113){const jelly=add(new THREE.SphereGeometry(.18,12,8),mat('#cb89b0','crystal'),0,.48);jelly.scale.set(1,.65,.8);for(const x of [-.09,0,.09])add(new THREE.CylinderGeometry(.018,.008,.18,6),mat('#b76c9d'),x,.32);return group;}
    for(const [w,h,d,x,y,z,color] of list){
      let k=kind;if(color==='#8a5a2c'||color==='#6e4420')k='wood';
      if(['#efe6d6','#fffaf0','#f6f0e2'].includes(color)&&kind!=='metal')k='bone';
      if(k==='wood'&&natural){const m=NaturalTools.material(color==='#8a5a2c'?0:1);if(m){add(bevel(w,h,d),m,x,y,z);continue;}}
      const m=add(bevel(w*.96,h*.96,d*.96),mat(color,k),x,y,z);
      // Broad construction details survive the 28px inventory downsample.
      const gear=[121,122,123,124,40,41,42,125,43,44,45,126,127,128,129,131].includes(id);
      if(gear&&w>.09&&h>.10){
        const front=z+d*.50+.003;
        if(kind==='straw'){
          const rows=Math.max(2,Math.round(h/.045)),cols=Math.max(2,Math.round(w/.045));
          for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
            const over=(row+col)%2,ww=w/cols*.88,hh=h/rows*.88;
            add(new THREE.BoxGeometry(over?ww:ww*.48,over?hh*.48:hh,.006),mat(over?'#b79a4d':'#80652e','straw'),x+(col+.5)*w/cols-w/2,y+(row+.5)*h/rows-h/2,front+.002);
          }
          for(const yy of [-1,1])add(new THREE.BoxGeometry(w,.015,.012),mat('#76592b','straw'),x,y+yy*h*.44,front);
        }else if(kind==='leather'){
          const edge=mat('#503323','leather'),thread=mat('#d9bd82','cloth');
          for(const sign of [-1,1]){
            add(new THREE.BoxGeometry(.018,h*.90,.012),edge,x+sign*w*.43,y,front);
            for(let yy=-h*.35;yy<h*.40;yy+=.035){const stitch=add(new THREE.BoxGeometry(.014,.006,.008),thread,x+sign*w*.35,y+yy,front+.008);stitch.rotation.z=sign*.45;}
          }
          add(new THREE.BoxGeometry(w*.9,.025,.016),edge,x,y-h*.36,front+.004);
          if(w>.25&&h>.3){add(new THREE.BoxGeometry(.035,h*.8,.013),edge,x+.055,y,front+.005);const buckle=add(new THREE.TorusGeometry(.021,.006,4,4),mat('#a68a50','metal'),x+.055,y-h*.20,front+.018);buckle.rotation.z=Math.PI/4;}
        }else if(kind==='metal'){
          const gold=[127,128,129,131].includes(id),dark=mat(gold?'#84602b':'#536372','metal'),bright=mat(gold?'#e4bc67':'#b8cad6','metal');
          for(const sign of [-1,1])add(new THREE.BoxGeometry(.018,h*.88,.018),dark,x+sign*w*.43,y,front);
          // Paired sloped plates make the centre ridge catch light differently.
          for(const sign of [-1,1]){const plate=add(bevel(w*.37,h*.77,.025),bright,x+sign*w*.19,y,front+.009);plate.rotation.y=sign*.17;}
          for(const sign of [-1,1])for(const yy of [-.34,.34])add(new THREE.SphereGeometry(.011,6,4),bright,x+sign*w*.42,y+yy*h,front+.015);
          add(new THREE.BoxGeometry(w*.9,.018,.018),dark,x,y-h*.40,front);
        }
      }
    }
    return group;
  }
  // Batch repeated weave strips and studs by material for animated world avatars.
  function worn(id,list,natural=true){
    const source=create(id,list,natural),batches=new Map(),group=new THREE.Group();
    // Back-facing third-person cameras must see the same construction details.
    for(const detail of [...source.children].slice(1)){
      if(!detail.isMesh||detail.geometry.type==='TorusGeometry')continue;
      const back=detail.clone();back.geometry=detail.geometry.clone();back.position.x=-detail.position.x;back.position.z=-detail.position.z;back.rotateY(Math.PI);source.add(back);
    }
    source.updateMatrixWorld(true);
    source.traverse(o=>{
      if(!o.isMesh)return;
      const geo=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();geo.applyMatrix4(o.matrixWorld);
      let batch=batches.get(o.material);if(!batch){batch={position:[],normal:[],uv:[]};batches.set(o.material,batch);}
      for(const key of Object.keys(batch))batch[key].push(...geo.attributes[key].array);
      geo.dispose();o.geometry.dispose();
    });
    for(const [mat,data] of batches){const geo=new THREE.BufferGeometry();for(const key in data)geo.setAttribute(key,new THREE.Float32BufferAttribute(data[key],key==='uv'?2:3));group.add(new THREE.Mesh(geo,mat));}
    return group;
  }
  let renderer;
  function icon(id,list,natural){
    if(!renderer){renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});renderer.setSize(96,96);renderer.setClearColor(0,0);}
    const scene=new THREE.Scene(),model=create(id,list,natural),pivot=new THREE.Group();pivot.add(model);scene.add(pivot);
    model.rotation.y=[19,28].includes(id)?-Math.PI/2:-.30;
    pivot.rotation.z=id<30||id===49?-Math.PI/4:0;
    pivot.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(pivot),size=bounds.getSize(new THREE.Vector3());pivot.position.sub(bounds.getCenter(new THREE.Vector3()));
    scene.add(new THREE.AmbientLight(0xdde7ef,.52));const light=new THREE.DirectionalLight(0xfff2da,.85);light.position.set(-3,4,5);scene.add(light);const rim=new THREE.DirectionalLight(0xb6d8ff,.28);rim.position.set(3,1,-2);scene.add(rim);
    const half=Math.max(size.x,size.y)*.59,camera=new THREE.OrthographicCamera(-half,half,half,-half,.1,10);camera.position.set(0,0,3);renderer.render(scene,camera);const url=renderer.domElement.toDataURL();model.traverse(o=>{if(o.geometry)o.geometry.dispose();});return url;
  }
  window.ItemArt={create,icon,family,worn,material};
})();
