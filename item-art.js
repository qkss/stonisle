// Shared material families and model-rendered icons for crafting items, food and gear.
(() => {
  const cache=new Map(), maps=new Map();
  const families={straw:[121,122,123,124],leather:[31,40,41,42,125],metal:[43,44,45,126,127,128,129,130,131,151],fur:[37,47,132,142],scale:[34,46,114,120,136,137,146,147],feather:[39,49,138,139,141,148,149],cloth:[38,48,140,150],crystal:[29,110,111,135],stone:[28,33,134],bone:[19,27,36,133],food:[30,32,112,113,115,177,178,256,257,258,268,269,270,271,272,273,274,275,276,277,278,279],plant:[35,100,101,102,103,104,259,260]};
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
    if(id>=261&&id<=267){
      const wood=natural&&window.NaturalTools?NaturalTools.material(0):mat('#98643a','wood');
      const iron=mat('#65747d','metal'),brass=mat('#a8803a','metal'),cord=mat('#cabb98','cloth'),leather=mat('#5c3826','leather');
      const tube=(points,r,m)=>add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),24,r,8,false),m);
      const box=(w,h,d,x,y,z,m)=>add(bevel(w,h,d),m,x,y,z);
      const rod=(a,b,r,m)=>{const d=new THREE.Vector3(...b).sub(new THREE.Vector3(...a)),mesh=add(new THREE.CylinderGeometry(r,r,d.length(),10),m,...a.map((q,i)=>(q+b[i])/2));mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return mesh;};
      if(id===261){
        tube([[0,.02,0],[.13,.14,0],[.20,.32,0],[.16,.46,0],[.20,.60,0],[.13,.78,0],[0,.90,0]],.023,wood);
        rod([0,.02,0],[0,.90,0],.005,cord);
        box(.055,.16,.065,.17,.46,0,leather);
        for(let i=0;i<6;i++)rod([.139,.397+i*.024,.035],[.20,.406+i*.024,.035],.0035,cord);
        for(const y of [.04,.88])add(new THREE.SphereGeometry(.026,8,6),brass,0,y,0);
      }else if(id===262){
        box(.09,.095,.72,0,.42,-.02,wood);box(.065,.18,.085,0,.29,-.20,leather);
        tube([[-.37,.45,.22],[-.22,.45,.33],[0,.45,.35],[.22,.45,.33],[.37,.45,.22]],.021,iron);
        tube([[-.37,.45,.22],[0,.45,-.10],[.37,.45,.22]],.006,cord);
        box(.11,.04,.12,0,.48,-.10,brass);rod([0,.50,-.06],[0,.50,.43],.009,wood);
        const head=add(new THREE.ConeGeometry(.023,.07,4),iron,0,.50,.46);head.rotation.x=Math.PI/2;
        tube([[-.02,.36,-.12],[-.02,.28,-.08],[-.02,.30,-.02]],.008,iron);
      }else if(id===263){
        // Traditional hunting shotgun: broad walnut butt, fore-end, twin steel barrels.
        const stockShape=new THREE.Shape();
        const outline=[[-.66,.18],[-.66,.42],[-.47,.45],[-.29,.40],[-.14,.43],[-.11,.33],[-.26,.28],[-.46,.19]];
        outline.forEach(([z,y],i)=>i?stockShape.lineTo(z,y):stockShape.moveTo(z,y));stockShape.closePath();
        const stockGeo=new THREE.ExtrudeGeometry(stockShape,{depth:.075,bevelEnabled:true,bevelThickness:.012,bevelSize:.015,bevelSegments:3,steps:1});
        stockGeo.translate(0,0,-.0375);stockGeo.rotateY(-Math.PI/2);add(stockGeo,wood);
        box(.09,.245,.025,0,.30,-.67,leather);
        box(.11,.11,.20,0,.435,-.10,iron);
        box(.105,.075,.34,0,.405,.20,wood);
        for(const x of [-.029,.029]){
          rod([x,.49,-.08],[x,.49,.84],.027,iron);
          add(new THREE.TorusGeometry(.026,.005,8,16),iron,x,.49,.845);
          add(new THREE.CircleGeometry(.021,16),mat('#11171b','stone'),x,.49,.846);
        }
        box(.016,.016,.91,0,.515,.38,iron);
        add(new THREE.SphereGeometry(.009,8,6),brass,0,.535,.79);
        tube([[0,.38,-.23],[0,.285,-.18],[0,.29,-.05],[0,.38,-.04]],.008,iron);
        tube([[0,.38,-.14],[0,.34,-.12],[0,.325,-.15]],.006,brass);
        for(const z of [.05,.30])box(.112,.012,.018,0,.40,z,leather);
      }else if(id===264){
        rod([0,.10,0],[0,.78,0],.012,wood);add(new THREE.ConeGeometry(.038,.13,4),iron,0,.84,0);
        for(let i=0;i<3;i++){const feather=box(.075,.15,.006,.025,.20,0,mat('#c8c7bb','feather'));feather.rotation.y=i*Math.PI*2/3;feather.rotation.z=-.20;}
        for(const y of [.12,.28])add(new THREE.TorusGeometry(.016,.004,5,10),cord,0,y,0).rotation.x=Math.PI/2;
      }else if(id===265){
        for(const p of [[-.095,.32,.03],[.09,.33,.02],[0,.46,-.03]])add(new THREE.SphereGeometry(.085,16,12),iron,...p);
      }else if(id===266){
        for(let i=0;i<4;i++){const loop=add(new THREE.TorusGeometry(.14+i*.012,.010,6,28),cord,0,.42,i*.018);loop.scale.y=1.22;}
        tube([[.14,.42,0],[.20,.30,0],[.18,.20,0]],.010,cord);box(.09,.08,.09,0,.59,.025,leather);
      }else{
        const bag=add(new THREE.SphereGeometry(.18,12,8),mat('#74654d','cloth'),0,.35,0);bag.scale.set(1,1.1,.75);
        add(new THREE.TorusGeometry(.10,.022,8,16),leather,0,.51,0).rotation.x=Math.PI/2;
        const powder=add(new THREE.SphereGeometry(.095,12,6),mat('#292d30','stone'),0,.51,0);powder.scale.y=.2;
        for(let i=0;i<7;i++)add(new THREE.IcosahedronGeometry(.018,0),mat('#303439','stone'),.20+Core.hash(i,1,3)*.10,.22+Core.hash(i,2,3)*.08,(Core.hash(i,3,3)-.5)*.13);
      }
      return group;
    }
    if(id>=100&&id<=104){
      const colors=['#81513c','#39362e','#c6af80','#9b7141','#383b28'];
      for(let i=0;i<5;i++){const seed=add(new THREE.SphereGeometry(.065,9,6),mat(colors[id-100],'bone'),(i%3-1)*.12,.32+Math.floor(i/3)*.16,(i%2)*.02);seed.scale.set(id===104?.75:.7,id===101?1.7:1.1,.50);seed.rotation.z=(i-2)*.35;}
      return group;
    }
    if(id===105){
      const bag=add(new THREE.SphereGeometry(.22,12,8),mat('#9b825b','cloth'),0,.42);bag.scale.set(.9,1,.65);
      add(new THREE.CylinderGeometry(.055,.08,.10,9),mat('#8b704a','cloth'),0,.65);
      const cord=add(new THREE.TorusGeometry(.06,.009,5,16),mat('#5c4830','straw'),0,.62);cord.rotation.x=Math.PI/2;
      const leaf=add(new THREE.SphereGeometry(.065,8,5),mat('#597341','plant'),0,.44,.14);leaf.scale.set(.6,1,.12);leaf.rotation.z=-.4;return group;
    }
    if(id>=106&&id<=109){
      const iron=id>=108,full=id%2===1;
      const body=iron?mat('#9eaeb7','metal'):natural&&NaturalTools.material(0)||mat('#9b713e','wood');
      body.side=THREE.DoubleSide;if(iron){body.reflectivity=.60;body.shininess=125;body.specular.setHex(0xe0f2ff);}
      add(new THREE.CylinderGeometry(.19,.15,.34,16,1,true),body,0,.39);
      add(new THREE.CylinderGeometry(.15,.15,.025,16),iron?mat('#65737b','metal'):mat('#5c422c','wood'),0,.23);
      if(iron){const gleam=mat('#dce7ed','metal');for(const angle of [-.65,.65]){const strip=add(new THREE.CylinderGeometry(.005,.005,.27,5),gleam,Math.sin(angle)*.18,.40,Math.cos(angle)*.18);strip.rotation.z=-Math.sin(angle)*.10;strip.rotation.x=Math.cos(angle)*.10;}}
      const band=mat(iron?'#cad7df':'#514b3c','metal');
      for(const y of [.25,.55]){const ring=add(new THREE.TorusGeometry(y>.5?.19:.155,.012,6,24),band,0,y);ring.rotation.x=Math.PI/2;}
      if(!iron)for(let i=0;i<12;i++){const a=i/12*Math.PI*2;const seam=add(new THREE.CylinderGeometry(.003,.003,.30,4),mat('#60442b','wood'),Math.sin(a)*.175,.40,Math.cos(a)*.175);seam.rotation.z=-Math.sin(a)*.10;seam.rotation.x=Math.cos(a)*.10;}
      const points=[];for(let i=0;i<=16;i++){const a=Math.PI*i/16;points.push(new THREE.Vector3(Math.cos(a)*.185,.55+Math.sin(a)*.24,0));}
      add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),24,.012,6,false),band);
      if(full){const water=add(new THREE.CircleGeometry(.175,32),mat('#478e9d','crystal'),0,.52);water.rotation.x=-Math.PI/2;}
      return group;
    }
    if(id===19||id===28){
      const pick=StonePick.create(natural);pick.children[1].material=mat(id===19?'#e8dcc3':'#676a66',id===19?'bone':'stone');
      if(id===28){const gem=new THREE.Mesh(new THREE.OctahedronGeometry(.038,0),mat('#e8a24d','crystal'));gem.position.set(.055,.65,0);gem.scale.set(.5,1,1);pick.add(gem);}return pick;
    }
    if(id===29){const sword=StoneTools.sword(natural);sword.children[1].material=mat('#34293e','crystal');sword.children[2].material=mat('#6b586d','metal');return sword;}
    if(id===27){add(new THREE.CylinderGeometry(.024,.029,.79,10),natural&&NaturalTools.material(0)||mat('#8a5a2c','wood'),0,.395);const point=add(new THREE.ConeGeometry(.057,.27,5),mat('#e8dcc3','bone'),0,.91);point.scale.z=.50;for(let i=0;i<5;i++){const ring=add(new THREE.TorusGeometry(.027,.004,5,14),mat('#aa9168','straw'),0,.76+i*.01);ring.rotation.x=Math.PI/2;}return group;}
    if(id===30){
      const outline=new THREE.Shape();outline.moveTo(-.19,-.10);outline.bezierCurveTo(-.29,.03,-.10,.24,.07,.20);outline.bezierCurveTo(.23,.18,.26,-.09,.12,-.16);outline.bezierCurveTo(.02,-.20,-.10,-.06,-.19,-.10);
      const geo=new THREE.ExtrudeGeometry(outline,{depth:.07,bevelEnabled:true,bevelSize:.014,bevelThickness:.014,bevelSegments:2,curveSegments:10});
      add(geo,mat('#8e3d36','food'),0,.43,-.035);
      const edge=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(outline.getPoints(48).map(p=>new THREE.Vector3(p.x,p.y+.43,.053)),true),64,.008,5,true);add(edge,mat('#d8af96','food'));
      const bone=add(new THREE.SphereGeometry(.046,10,6),mat('#e5cfac','bone'),.08,.47,.06);bone.scale.set(1,.8,.25);
      for(let i=0;i<3;i++){const vein=add(new THREE.BoxGeometry(.08,.008,.005),mat('#c99280','food'),-.09+i*.05,.42+i*.055,.055);vein.rotation.z=.6;}return group;
    }
    if(id===115){
      for(let i=0;i<3;i++){const piece=new THREE.Group();piece.position.set((i-1)*.13,.40+(i%2)*.10,0);piece.rotation.z=(i-1)*-.25;group.add(piece);
        const meat=new THREE.Mesh(new THREE.SphereGeometry(.10,10,7),mat('#efddc5','food'));meat.scale.set(.70,1.7,.65);piece.add(meat);
        const shell=new THREE.Mesh(new THREE.SphereGeometry(.103,10,6,0,Math.PI),mat('#b95339','scale'));shell.scale.set(.70,1.7,.65);shell.rotation.y=Math.PI;piece.add(shell);
      }return group;
    }
    if([31,37,132,136].includes(id)){
      const c=id===31?'#ab7d4b':id===37?'#484052':id===132?'#cdd1cb':'#456454';
      const shape=new THREE.Shape();const pts=[[-.10,.22],[.10,.22],[.22,.29],[.25,.20],[.17,.08],[.17,-.10],[.23,-.21],[.16,-.25],[.07,-.17],[-.07,-.17],[-.16,-.25],[-.23,-.21],[-.17,-.10],[-.17,.08],[-.25,.20],[-.22,.29]];pts.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();
      const geo=new THREE.ExtrudeGeometry(shape,{depth:.018,bevelEnabled:true,bevelSize:.008,bevelThickness:.006,bevelSegments:1});add(geo,mat(c),0,.42);return group;
    }
    if(id===33){const lump=add(new THREE.IcosahedronGeometry(.22,1),mat('#ac7860','stone'),0,.44);lump.scale.set(1,.7,.8);return group;}
    if(id===137){
      for(let i=0;i<3;i++){const shape=new THREE.Shape();shape.moveTo(-.10,.11);shape.lineTo(.10,.11);shape.quadraticCurveTo(.12,-.04,0,-.14);shape.quadraticCurveTo(-.12,-.04,-.10,.11);const scale=add(new THREE.ExtrudeGeometry(shape,{depth:.016,bevelEnabled:true,bevelSize:.008,bevelThickness:.006,bevelSegments:1}),mat(i===1?'#72adbb':'#34728a','scale'),(i-1)*.11,.36+(i%2)*.13,i*.026);scale.rotation.z=(i-1)*.25;}return group;
    }
    if(id===34||id===114){
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
    if(id>=106&&id<=109)model.rotation.x=.28;
    if(id===262||id===263){model.rotation.y=-1.05;model.rotation.x=.40;pivot.rotation.z=-.25;}
    if(id===261||id===264)model.rotation.z=-.40;
    pivot.rotation.z=id<30||id===49?-Math.PI/4:(id===262||id===263?-.25:0);
    pivot.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(pivot),size=bounds.getSize(new THREE.Vector3());pivot.position.sub(bounds.getCenter(new THREE.Vector3()));
    scene.add(new THREE.AmbientLight(0xdde7ef,.52));const light=new THREE.DirectionalLight(0xfff2da,.85);light.position.set(-3,4,5);scene.add(light);const rim=new THREE.DirectionalLight(0xb6d8ff,.28);rim.position.set(3,1,-2);scene.add(rim);
    const half=Math.max(size.x,size.y)*.59,camera=new THREE.OrthographicCamera(-half,half,half,-half,.1,10);camera.position.set(0,0,3);renderer.render(scene,camera);const url=renderer.domElement.toDataURL();model.traverse(o=>{if(o.geometry)o.geometry.dispose();});return url;
  }
  window.ItemArt={create,icon,family,worn,material};
})();
