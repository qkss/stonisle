// Independent Chang'e V2. V1 stays in skins.js; costume atlas authored from its turnaround.
(() => {
  const maps=new Map();
  function atlas(tile){if(maps.has(tile))return maps.get(tile);const t=new THREE.TextureLoader().load('assets/characters/change-v2-costume-atlas.png',()=>{if(window.Avatar?.refresh)Avatar.refresh();});t.repeat.set((1-0.008)/3,(1-0.008)/2);t.offset.set((tile%3+.004)/3,(tile<3?.5:0)+.002);t.anisotropy=4;maps.set(tile,t);return t;}
  const cloth=tile=>new THREE.MeshLambertMaterial({map:atlas(tile),side:THREE.DoubleSide,color:0xd4d4d4});
  const skin = {firstPerson:{slim:true,skin:'#e4c4b2',sleeve:'#eee4d2',cuff:'#c9a34e',bell:true,atlas:'assets/characters/change-v2-costume-atlas.png',tile:2},name:'嫦娥 V2 · 月华锦绣',art:'assets/characters/change-front.png',model:'assets/characters/change.glb',joints:{x:-.105,z:-.12,neck:.98,shoulder:[.22,.93],hip:[.06,.48],leg:.42,arm:[.6,1.02],ribbon:[[.2,.88,.12],[.27,.66,.2],[.33,.42,.3],[.39,.2,.42],[.44,.03,.58]]},how:'Available from the start.',unlocked:true,face:'change',eyes:'#a83872',hairColor:'#ddd9d3',look:{skin:0,hair:5,style:7,shirt:7,pants:5,skirt:0,acc:0},
      extra(a){
        const jade='#287e82',silk='#9bdcd2',gold='#c9a34e',ivory='#eee4d2',silver='#ddd9d3';
        const root=a.part(.001,.001,.001,0,1,0,jade).parent;
        const panel=(pts,z,depth,col,to=root)=>{const cy=pts.reduce((n,p)=>n+p[1],0)/pts.length,sh=new THREE.Shape();pts.forEach(([x,y],i)=>i?sh.lineTo(x,y-cy):sh.moveTo(x,y-cy));sh.closePath();const geo=new THREE.ExtrudeGeometry(sh,{depth,bevelEnabled:true,bevelThickness:.003,bevelSize:.003,bevelSegments:1,steps:1});geo.translate(0,0,-depth/2);geo.computeBoundingBox();const bounds=geo.boundingBox,uv=geo.attributes.uv,pos=geo.attributes.position;for(let i=0;i<uv.count;i++)uv.setXY(i,(pos.getX(i)-bounds.min.x)/(bounds.max.x-bounds.min.x||1),(pos.getY(i)-bounds.min.y)/(bounds.max.y-bounds.min.y||1));const tile=col===gold?1:col===ivory?2:col===jade?0:col===silk?4:null;const m=new THREE.Mesh(geo,tile===null?new THREE.MeshLambertMaterial({color:col}):cloth(tile));m.position.set(0,cy,z);to.add(m);return m;};
        const line=(pts,col=gold,r=.004,to=root)=>{const curve=new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(...p)));const m=new THREE.Mesh(new THREE.TubeGeometry(curve,20,r,5,false),new THREE.MeshLambertMaterial({color:col}));to.add(m);return m;};
        const jewel=(x,y,z,size,to=root)=>{const m=new THREE.Mesh(new THREE.OctahedronGeometry(size),new THREE.MeshPhongMaterial({color:silk,shininess:65}));m.position.set(x,y,z);m.scale.z=.5;to.add(m);return m;};
        const pearl=(x,y,z,r=.012,to=root)=>{const m=new THREE.Mesh(new THREE.SphereGeometry(r,8,6),new THREE.MeshPhongMaterial({color:ivory,shininess:45}));m.position.set(x,y,z);to.add(m);return m;};
        if(!this.ribbonWeave){
          const c=document.createElement('canvas');c.width=96;c.height=256;const ctx=c.getContext('2d');
          for(let y=0;y<256;y++)for(let x=0;x<96;x++){const u=x/95,t=y/255,fold=Math.cos(u*Math.PI*2+.35*Math.sin(t*5)),weave=((x+y)%3===0?2:0),v=Math.round(211+fold*12+Math.sin(t*14)*3-weave);ctx.fillStyle=`rgb(${v},${v},${v})`;ctx.fillRect(x,y,1,1);}
          ctx.globalCompositeOperation='destination-in';const alpha=ctx.createLinearGradient(0,0,96,0);alpha.addColorStop(0,'rgba(255,255,255,.45)');alpha.addColorStop(.12,'rgba(255,255,255,.86)');alpha.addColorStop(.5,'rgba(255,255,255,1)');alpha.addColorStop(.88,'rgba(255,255,255,.86)');alpha.addColorStop(1,'rgba(255,255,255,.45)');ctx.fillStyle=alpha;ctx.fillRect(0,0,96,256);this.ribbonWeave=new THREE.CanvasTexture(c);this.ribbonWeave.anisotropy=4;
        }
        const silkRibbon=(points,width,to)=>{
          const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),v=[],colors=[],uvs=[],ids=[],frames=[],rows=48,cols=6;
          const seed=points[2][0]*2;
          for(let i=0;i<=rows;i++){
            const t=i/rows,p=curve.getPoint(t),tan=curve.getTangent(t),side=new THREE.Vector3(-tan.y,tan.x,0).normalize();
            frames.push({p,tan,side,t});
            for(let j=0;j<=cols;j++){v.push(0,0,0);uvs.push(j/cols,1-t);const c=new THREE.Color(j===0||j===cols?'#9f986e':j===1||j===5?'#537f79':'#66958d');colors.push(c.r,c.g,c.b);if(i<rows&&j<cols){const n=i*(cols+1)+j;ids.push(n,n+1,n+cols+1,n+1,n+cols+2,n+cols+1);}}
          }
          const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3).setUsage(THREE.DynamicDrawUsage));geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.setIndex(ids);
          geo.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));const mesh=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({map:atlas(4),color:0xffffff,side:THREE.DoubleSide,transparent:true,opacity:.78,depthWrite:false}));mesh.frustumCulled=false;to.add(mesh);
          const animate=(time,walk,phase)=>{const pos=geo.attributes.position;
            for(let i=0;i<=rows;i++){const {p,tan,side,t}=frames[i],axis=side.clone().applyAxisAngle(tan,Math.sin(t*5+seed)*.40+Math.sin(time*1.25-t*4+seed)*.13*t),normal=new THREE.Vector3().crossVectors(tan,axis),w=width*(.82+.09*Math.sin(t*Math.PI))*(1-.38*t);
              for(let j=0;j<=cols;j++){const u=j/cols-.5,fold=Math.cos(u*Math.PI)*Math.sin(t*7-time*1.3)*.004*t,flutter=Math.sin(time*1.3-t*4+seed)*.018*t+Math.sin(phase-t*3)*walk*.018*t;
                pos.setXYZ(i*(cols+1)+j,p.x+axis.x*u*w+normal.x*fold,p.y+axis.y*u*w+normal.y*fold+flutter*.35,p.z+axis.z*u*w+normal.z*fold+flutter);
              }}pos.needsUpdate=true;geo.computeVertexNormals();};
          (to.userData.fabricMotion ||= []).push(animate);animate(0,0,0);
        };
        // Flattened sculpted locks: curved centerlines, tapered tips, shaded cross-sections.
        const hairLock=(pts,width,depth,col)=>{
          const origin=new THREE.Vector3(...pts[0]),curve=new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(...p).sub(origin))),v=[],colors=[],ids=[],rows=20,sides=8;
          for(let i=0;i<=rows;i++){const t=i/rows,p=curve.getPoint(t),tan=curve.getTangent(t),side=new THREE.Vector3(-tan.y,tan.x,0).normalize(),normal=new THREE.Vector3().crossVectors(tan,side).normalize(),taper=1-.88*Math.pow(t,3);
            for(let j=0;j<sides;j++){const angle=j/sides*Math.PI*2,dx=Math.cos(angle)*width*.5*taper,dz=Math.sin(angle)*depth*.5*taper;v.push(p.x+side.x*dx+normal.x*dz,p.y+side.y*dx+normal.y*dz,p.z+side.z*dx+normal.z*dz);const c=new THREE.Color(col).multiplyScalar(.86+.14*Math.max(0,Math.sin(angle))+.04*Math.sin(t*Math.PI));colors.push(c.r,c.g,c.b);if(i<rows){const n=i*sides+j,k=i*sides+(j+1)%sides;ids.push(n,k,n+sides,k,k+sides,n+sides);}}
          }
          for(let j=1;j<sides-1;j++){ids.push(0,j+1,j);const end=rows*sides;ids.push(end,end+j,end+j+1);}
          const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.setIndex(ids);geo.computeVertexNormals();const mesh=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({vertexColors:true}));mesh.position.copy(origin);mesh.userData.hair=true;root.add(mesh);
        };
        if(!a.head){
          const cap=new THREE.Mesh(new THREE.SphereGeometry(.225,20,10,0,Math.PI*2,0,Math.PI/2),new THREE.MeshLambertMaterial({color:'#bcbab4'}));cap.scale.set(1,.62,1);cap.position.set(0,1.79,.012);cap.userData.hair=true;root.add(cap);
          for(let i=0;i<7;i++){const x=(i-3)*.061;hairLock([[x,1.86,.13],[x*1.12,1.75,.205],[x*1.16,1.58,.21],[x*.95,1.47+Math.abs(i-3)*.014,.17]],.093,.045,i%2?'#b5b5b3':'#c9c6bd');}
          for(const sign of [-1,1]){
            for(let i=0;i<3;i++){const x=sign*(.025+i*.055);hairLock([[x,1.88,-.15],[x+sign*.025,1.81,-.222],[x+sign*.012,1.75,-.237],[x+sign*(i===2?.03:-.025),1.70+(i%2)*.035,-.231]],.085-i*.006,.028,i%2?'#bab9b3':'#d0ccc2');}
            for(let i=0;i<2;i++)hairLock([[sign*(.185+i*.033),1.83,-.04+i*.06],[sign*(.225+i*.026),1.71,-.11+i*.06],[sign*(.27+i*.025),1.54,-.08+i*.06],[sign*(.235+i*.032),1.47,-.10+i*.06],[sign*(.20+i*.025),1.51,-.14+i*.06]],.09-i*.014,.05,i?'#b7b9b8':'#cdc9c1');
          }
          a.part(.44,.055,.42,0,1.93,0,gold);
          for(const sign of [-1,1]){
            if(!this.headbandPattern){const c=document.createElement('canvas');c.width=128;c.height=256;const ctx=c.getContext('2d');ctx.fillStyle='#e3ddbf';ctx.fillRect(0,0,128,256);ctx.strokeStyle='#b29948';ctx.lineWidth=2;ctx.strokeRect(5,5,118,246);
              for(const [x,y] of [[43,70],[78,159]]){ctx.fillStyle='#c8ab51';for(let k=0;k<5;k++){const angle=k/5*Math.PI*2;ctx.beginPath();ctx.ellipse(x+Math.cos(angle)*12,y+Math.sin(angle)*12,8,12,angle,0,Math.PI*2);ctx.fill();}ctx.fillStyle='#88a99b';ctx.beginPath();ctx.arc(x,y,5,0,Math.PI*2);ctx.fill();}
              ctx.beginPath();ctx.moveTo(36,220);ctx.bezierCurveTo(100,190,18,115,72,35);ctx.stroke();this.headbandPattern=new THREE.CanvasTexture(c);}
            const v=[],uv=[],ids=[],rows=14,cols=8;
            for(let j=0;j<=rows;j++)for(let k=0;k<=cols;k++){const t=j/rows,u=k/cols-.5,w=.13+.045*Math.sin(t*Math.PI/2);v.push(sign*(.105+.13*t)+u*w,.25*t+sign*u*.035,-.025*Math.sin(t*Math.PI)-.035*t*t+Math.cos(u*Math.PI)*.006);uv.push(k/cols,1-t);if(j<rows&&k<cols){const n=j*(cols+1)+k;ids.push(n,n+1,n+cols+1,n+1,n+cols+2,n+cols+1);}}
            const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(ids);geo.computeVertexNormals();const band=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({map:this.headbandPattern,side:THREE.DoubleSide}));band.position.y=1.98;band.userData.hair=true;root.add(band);
            a.part(.10,.10,.11,sign*.245,1.88,-.03,gold);jewel(sign*.245,1.88,-.095,.045);
          }
          panel([[-.12,1.96],[0,2.13],[.12,1.96],[0,1.92]],-.235,.028,gold);jewel(0,1.995,-.26,.065);
          for(const sign of [-1,1]){
            for(let i=0;i<3;i++){const petal=panel([[sign*.16,1.92],[sign*(.20+i*.025),1.99+i*.012],[sign*(.25+i*.015),1.94],[sign*.20,1.89]],-.10,.015,i%2?gold:'#dcae96');petal.rotation.z=sign*i*.12;}
            for(let i=0;i<4;i++)pearl(sign*.25,1.82-i*.035,-.12,.014);
            jewel(sign*.25,1.66,-.12,.023);

          }

        }
        // Golden veil is part of Chang'e's identity and follows the same head joint as her face.
        {
          const v=[],uv=[],ids=[],rows=16,cols=32;
          for(let j=0;j<=rows;j++)for(let k=0;k<=cols;k++){const t=j/rows,u=k/cols-.5;v.push(u*(.305-.065*t),-t*(.158-.060*Math.pow(Math.abs(u)*2,1.6)),-.208-.008*Math.cos(u*Math.PI)+.0009*Math.sin(u*Math.PI*6)*t);uv.push(k/cols,1-t);if(j<rows&&k<cols){const n=j*(cols+1)+k;ids.push(n,n+1,n+cols+1,n+1,n+cols+2,n+cols+1);}}
          if(!this.veilWeave){
            const c=document.createElement('canvas');c.width=192;c.height=128;const ctx=c.getContext('2d');
            // Muted pale gold, shaded at the cheeks and lower edge; tiny woven variation.
            for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++){
              const u=x/(c.width-1),t=y/(c.height-1),edge=Math.pow(Math.abs(u-.5)*2,1.6),fold=Math.sin(u*Math.PI*5+t*.6)*1.8,weave=((x+y)%3===0?-1.2:.4),shade=-12*edge-6*t*t+fold+weave;
              ctx.fillStyle=`rgb(${Math.round(192+shade)},${Math.round(163+shade)},${Math.round(85+shade*.7)})`;ctx.fillRect(x,y,1,1);
            }
            ctx.fillStyle='#c9af70';ctx.fillRect(0,2,c.width,1);this.veilWeave=new THREE.CanvasTexture(c);this.veilWeave.anisotropy=4;
          }

          const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(ids);geo.computeVertexNormals();const veil=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({map:atlas(5),side:THREE.DoubleSide,transparent:true,opacity:.92,depthWrite:false}));veil.position.y=1.62;veil.renderOrder=2;veil.userData.hair=true;root.add(veil);
          const rest=new Float32Array(v);geo.attributes.position.setUsage(THREE.DynamicDrawUsage);veil.frustumCulled=false;
          // Only the free fabric moves; the pearl-trimmed upper edge remains attached to the face.
          veil.userData.fabricMotion=[(time,walk,phase)=>{const pos=geo.attributes.position;
            for(let n=0;n<pos.count;n++){const t=Math.floor(n/(cols+1))/rows,u=(n%(cols+1))/cols-.5,w=t*t;
              const drift=(Math.sin(time*1.45-u*3-t)*.00045+Math.sin(phase-.9-u*2)*walk*.0008)*w;
              pos.setXYZ(n,rest[n*3]+drift*.35,rest[n*3+1]+Math.sin(time*1.6+u*5-t)*.0003*w+Math.sin(phase-1.2)*walk*.0004*w,rest[n*3+2]+drift);
            }pos.needsUpdate=true;geo.computeVertexNormals();}];
          a.secondary(veil,0,0);

          for(let i=0;i<9;i++)pearl((i-4)*.035,1.621,-.225,.004);

        }
        if(!a.body){
          // Elliptical fitted bodice: narrower waist and a gently rounded shoulder line.
          const rings=[[.78,.185,.13],[.88,.157,.115],[1.01,.15,.11],[1.16,.19,.13],[1.30,.207,.13],[1.37,.17,.105]],v=[],ids=[],n=24;
          for(const [y,rx,rz] of rings)for(let k=0;k<=n;k++){const angle=k/n*Math.PI*2;v.push(Math.sin(angle)*rx,y,Math.cos(angle)*rz);}
          for(let j=0;j<rings.length-1;j++)for(let k=0;k<n;k++){const i=j*(n+1)+k;ids.push(i,i+1,i+n+1,i+1,i+n+2,i+n+1);}
          const bodice=new THREE.BufferGeometry();bodice.setAttribute('position',new THREE.Float32BufferAttribute(v,3));const bodiceUV=[];for(let j=0;j<rings.length;j++)for(let k=0;k<=n;k++)bodiceUV.push(k/n,j/(rings.length-1));bodice.setAttribute('uv',new THREE.Float32BufferAttribute(bodiceUV,2));bodice.setIndex(ids);bodice.computeVertexNormals();root.add(new THREE.Mesh(bodice,cloth(0)));

          for(const sign of [-1,1]){
            panel([[sign*.02,1.37],[sign*.20,1.34],[sign*.14,1.19],[0,1.10]],-.158,.018,ivory);
            line([[sign*.19,1.34,-.173],[sign*.11,1.19,-.173],[0,1.1,-.173]]);
            panel([[sign*.04,1.16],[sign*.13,1.12],[sign*.10,1.02],[0,1.01]],-.17,.014,gold);
          }
          a.part(.325,.065,.245,0,.875,0,'#205e69');jewel(0,.88,-.18,.06);
          if(!this.sleeveEmbroidery){
            const c=document.createElement('canvas');c.width=512;c.height=256;const ctx=c.getContext('2d');ctx.strokeStyle='#e5bf69';ctx.fillStyle='#efd49a';ctx.lineWidth=2.2;ctx.lineCap='round';
            for(const y of [194,201,238,245]){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(512,y);ctx.stroke();}
            for(let k=0;k<8;k++){const x=k*64;ctx.beginPath();ctx.moveTo(x,225);ctx.bezierCurveTo(x+12,213,x+45,213,x+48,224);ctx.bezierCurveTo(x+48,236,x+26,237,x+28,226);ctx.bezierCurveTo(x+30,220,x+36,222,x+36,226);ctx.stroke();ctx.beginPath();ctx.moveTo(x+32,180);ctx.bezierCurveTo(x+8,157,x+18,133,x+32,120);ctx.bezierCurveTo(x+46,133,x+56,157,x+32,180);ctx.stroke();ctx.beginPath();ctx.arc(x+32,188,2.5,0,Math.PI*2);ctx.fill();}
            this.sleeveEmbroidery=new THREE.CanvasTexture(c);this.sleeveEmbroidery.anisotropy=4;
          }
          for(const [i,arm] of [a.swing[2],a.swing[3]].entries()){
            // Replace the generic sleeve blocks; keep the hand and the shoulder joint.
            for(const child of arm.children.slice(0,-1)){arm.remove(child);child.geometry?.dispose();child.material?.dispose();}
            const sign=i?1:-1,sleeve=new THREE.Group();arm.add(sleeve);a.secondary(sleeve,i+4,.22);
            const vertices=[],colors=[],uv=[],indices=[],rows=20,cols=32;
            for(let j=0;j<=rows;j++)for(let k=0;k<=cols;k++){
              const t=j/rows,angle=k/cols*Math.PI*2,flare=Math.pow(t,1.65),fold=Math.cos(angle*7)*.009*t*t,r=.097+.095*flare+fold;
              vertices.push(Math.cos(angle)*r+sign*.065*flare,-.035-.51*t+.012*Math.sin(angle*3)*t*t,Math.sin(angle)*(r*1.02));
              const c=new THREE.Color(t<.22?ivory:t>.94?silk:jade).multiplyScalar(.95+.05*Math.cos(angle*7));colors.push(c.r,c.g,c.b);uv.push(k/cols,1-t);
              if(j<rows&&k<cols){const n=j*(cols+1)+k;indices.push(n,n+1,n+cols+1,n+1,n+cols+2,n+cols+1);}
            }
            const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3).setUsage(THREE.DynamicDrawUsage));geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();
            sleeve.add(new THREE.Mesh(geo,cloth(2)));
            
            const rest=new Float32Array(vertices);sleeve.userData.fabricMotion=[(time,walk,phase)=>{const pos=geo.attributes.position;for(let n=0;n<pos.count;n++){const t=Math.floor(n/(cols+1))/rows,w=t*t;pos.setXYZ(n,rest[n*3]+Math.sin(time*1.4+sign)*.004*w,rest[n*3+1],rest[n*3+2]+(Math.sin(phase-.8+sign*.35)*walk*.018+Math.sin(time*1.3+sign)*.005)*w);}pos.needsUpdate=true;geo.computeVertexNormals();}];
            // Two thin scalloped cloth layers drape over the sleeve root, with narrow embroidered hems.
            for(let layer=0;layer<2;layer++){
              const v=[],c=[],uv=[],idx=[],rows=10,cols=40;
              for(let j=0;j<=rows;j++)for(let k=0;k<=cols;k++){
                const t=j/rows,angle=k/cols*Math.PI*2,r=.075+(.105+layer*.025)*Math.sin(t*Math.PI/2),scallop=(.5+.5*Math.cos(angle*7))*.018*t*t;
                v.push(Math.cos(angle)*r,.032-layer*.018-(.205-layer*.038)*t-scallop,Math.sin(angle)*r*1.10);
                const color=new THREE.Color(j===rows?'#c9af69':layer?'#d8b764':'#d7c9a4').multiplyScalar(.92+.08*Math.cos(angle*7));c.push(color.r,color.g,color.b);uv.push(k/cols,.25+.75*t);
                if(j<rows&&k<cols){const n=j*(cols+1)+k;idx.push(n,n+1,n+cols+1,n+1,n+cols+2,n+cols+1);}
              }
              const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(c,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();arm.add(new THREE.Mesh(geo,cloth(layer?1:4)));
              arm.add(new THREE.Mesh(geo,new THREE.MeshLambertMaterial({map:this.sleeveEmbroidery,transparent:true,side:THREE.DoubleSide,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1,color:'#c4b489'})));
            }
            for(const x of [-.055,0,.055])pearl(x,-.105,-.125,.0055,arm);

          }
          // Floating silk loops fan out behind the shoulders, clear of the face and hands.
          for(const sign of [-1,1]){
            const ribbon=new THREE.Group();ribbon.position.set(sign*.20,1.30,.16);root.add(ribbon);a.secondary(ribbon,sign,.5);
            if(sign===1){
              silkRibbon([[0,0,0],[.22,.20,.14],[.54,.48,.18],[.70,.57,.08],[.66,.25,-.04],[.42,.16,-.10],[.58,-.08,.02]],.20,ribbon);
              silkRibbon([[0,-.36,-.12],[.20,-.45,-.23],[.43,-.66,-.22],[.57,-.71,-.08],[.43,-.54,.08]],.14,ribbon);
            }else{
              silkRibbon([[0,0,0],[-.22,.12,.22],[-.38,-.04,.30],[-.31,-.33,.22],[-.48,-.50,.08],[-.61,-.66,.14]],.19,ribbon);
              silkRibbon([[0,-.37,-.15],[-.13,-.56,-.22],[-.24,-.79,-.12],[-.43,-.94,.06]],.13,ribbon);
            }
            for(let i=0;i<3;i++){
              const x=sign*(.055+i*.055);
              panel([[x-sign*.025,.84],[x+sign*.025,.84],[x+sign*.065,.64-i*.035],[x,.58-i*.035],[x-sign*.035,.65]],-.195-i*.006,.018,i%2?ivory:gold);
            }
            line([[sign*.145,1.10,-.125],[sign*.10,1.035,-.125],[sign*.14,.97,-.125],[sign*.15,1.02,-.125]],gold,.003);
            for(let i=0;i<3;i++)pearl(sign*(.07+i*.055),.83,-.211,.012);
          }

        }
        if(!a.legs){
          // Embroidery is mapped onto the moving cloth itself, avoiding floating rigid ornaments.
          if(!this.skirtEmbroidery){
            const c=document.createElement('canvas');c.width=256;c.height=512;const ctx=c.getContext('2d');ctx.strokeStyle='#e8c474';ctx.fillStyle='#f3d796';ctx.lineCap='round';ctx.lineJoin='round';
            const stroke=(fn,w=2)=>{ctx.lineWidth=w;ctx.beginPath();fn();ctx.stroke();};
            for(const x of [22,234])stroke(()=>{ctx.moveTo(x,18);ctx.lineTo(x,476);},2);
            stroke(()=>{ctx.moveTo(22,474);ctx.quadraticCurveTo(128,505,234,474);},3);
            stroke(()=>{ctx.moveTo(30,463);ctx.quadraticCurveTo(128,490,226,463);},1.3);
            for(const sign of [-1,1]){
              ctx.save();ctx.translate(128,0);ctx.scale(sign,1);
              stroke(()=>{ctx.moveTo(0,431);ctx.bezierCurveTo(70,420,100,347,68,326);ctx.bezierCurveTo(28,298,15,359,50,363);ctx.bezierCurveTo(77,367,65,337,51,343);},3);
              stroke(()=>{ctx.moveTo(18,416);ctx.bezierCurveTo(42,383,5,358,13,332);ctx.bezierCurveTo(20,307,40,302,31,277);},2);
              for(let i=0;i<3;i++)stroke(()=>{const y=390-i*26;ctx.moveTo(22+i*7,y);ctx.quadraticCurveTo(55+i*5,y-26,72+i*3,y-20);ctx.quadraticCurveTo(55,y+1,22+i*7,y);},1.6);
              ctx.restore();
            }
            for(const y of [135,225,440]){stroke(()=>{ctx.moveTo(128,y-15);ctx.quadraticCurveTo(145,y,128,y+15);ctx.quadraticCurveTo(111,y,128,y-15);},2);ctx.beginPath();ctx.arc(128,y,2.6,0,Math.PI*2);ctx.fill();}
            this.skirtEmbroidery=new THREE.CanvasTexture(c);this.skirtEmbroidery.anisotropy=4;
          }
          for(const sign of [-1,1])for(const layer of [0,1,2,3]){
            const skirt=new THREE.Group();skirt.position.set(sign*(layer?.14:.105),.80,layer>=2?.20:layer===1?.06:-.17);skirt.rotation.y=sign*(layer===2?-.35:layer===1?.65:.16);root.add(skirt);a.secondary(skirt,sign+1+layer,.4);
            // Curved flared cloth panel with a scalloped hem and broad shallow folds.
            const verts=[],colors=[],indices=[],uvs=[],rows=18,cols=12;
            for(let i=0;i<=rows;i++)for(let j=0;j<=cols;j++){
              const t=i/rows,u=j/cols-.5,w=(layer===0?.14:.19)+(layer===0?.10:.16)*Math.sin(t*Math.PI/2),hem=(layer===0?.25:layer===1?.52:layer===2?.68:.55)+.035*Math.cos(u*Math.PI*2);
              verts.push(u*w+sign*(layer===0?.035:layer===1?.14:layer===2?.30:.26)*t*t,-t*hem,.02+(layer===2?.24:layer===1?.09:-.06)*t*t+.018*Math.cos(u*Math.PI*4)*t);
              uvs.push(j/cols,1-i/rows);
              const edge=j===0||j===cols||i===rows,c=new THREE.Color(edge?gold:j<2||j>10?silk:layer===0?'#d4ad57':layer===1?jade:'#4ea5a4');colors.push(c.r,c.g,c.b);
              if(i<rows&&j<cols){const n=i*(cols+1)+j;indices.push(n,n+1,n+cols+1,n+1,n+cols+2,n+cols+1);}
            }
            const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geo.setIndex(indices);geo.computeVertexNormals();skirt.add(new THREE.Mesh(geo,cloth(layer===0||layer===3?1:0)));
            
            const rest=new Float32Array(verts);skirt.userData.fabricMotion=[(time,walk,phase)=>{const pos=geo.attributes.position;for(let i=0;i<pos.count;i++){const t=Math.floor(i/(cols+1))/rows;pos.setZ(i,rest[i*3+2]+Math.sin(time*1.5-t*3+sign)*.009*t*t+Math.sin(phase-t*2+sign)*walk*.014*t*t);}pos.needsUpdate=true;geo.computeVertexNormals();}];

          }
          for(const leg of [a.swing[0],a.swing[1]]){a.part(.218,.43,.245,0,-.25,0,'#e9c7b9',leg);a.part(.222,.20,.265,0,-.56,0,ivory,leg);a.part(.23,.045,.28,0,-.64,-.01,gold,leg);a.part(.23,.10,.31,0,-.68,-.03,ivory,leg);}
        }

        const puff=(x,y,z,r,to=root)=>{const g=new THREE.Group();g.position.set(x,y,z);to.add(g);for(let k=0;k<7;k++){const m=new THREE.Mesh(new THREE.IcosahedronGeometry(r*(k? .60: .88),1),new THREE.MeshLambertMaterial({color:k%2?'#e1daca':'#f1e9dc'}));if(k){const t=(k-1)/6*Math.PI*2;m.position.set(Math.cos(t)*r*.55,Math.sin(t)*r*.5,.005);}g.add(m);}return g;};
        const flower=(x,y,z,r,to=root)=>{const g=new THREE.Group();g.position.set(x,y,z);to.add(g);for(let k=0;k<5;k++){const angle=k/5*Math.PI*2,m=new THREE.Mesh(new THREE.SphereGeometry(r*.55,8,6),new THREE.MeshLambertMaterial({color:ivory}));m.scale.set(.65,1,.32);m.position.set(Math.sin(angle)*r*.65,Math.cos(angle)*r*.65,0);m.rotation.z=-angle;g.add(m);}jewel(0,0,-r*.3,r*.32,g);return g;};
        if(!a.head){
          for(const sign of [-1,1]){
            const plume=new THREE.Group();plume.position.set(sign*.20,1.94,.10);plume.userData.hair=true;root.add(plume);
            for(let k=0;k<3;k++){const m=new THREE.Mesh(new THREE.SphereGeometry(.085,10,6),new THREE.MeshLambertMaterial({color:k%2?'#dcae9c':'#e7c2b1'}));m.scale.set(1,.48,.23);m.position.set(sign*k*.032,k*.035,0);m.rotation.z=sign*(.3+k*.35);plume.add(m);}
            flower(sign*.21,1.86,-.12,.045);
            const bob=puff(sign*.245,1.47,-.02,.045);bob.userData.hair=true;
          }
          const bun=new THREE.Mesh(new THREE.TorusGeometry(.10,.035,8,18),new THREE.MeshLambertMaterial({color:silver}));bun.position.set(0,1.85,.23);bun.userData.hair=true;root.add(bun);
          const crescent=new THREE.Mesh(new THREE.TorusGeometry(.07,.012,6,20,Math.PI*1.5),new THREE.MeshPhongMaterial({color:gold,shininess:25}));crescent.position.set(.24,1.75,.12);crescent.rotation.z=.35;crescent.userData.hair=true;root.add(crescent);
        }
        if(!a.body){
          for(const sign of [-1,1]){
            puff(sign*.235,1.37,-.075,.048);puff(sign*.26,1.22,-.10,.035);
            const wing=panel([[0,.9],[sign*.12,.98],[sign*.19,.92],[sign*.16,.84],[sign*.055,.86]],-.20,.012,'#4c85aa');wing.material=cloth(3);
            const tie=new THREE.Group();tie.position.set(sign*.035,.88,-.215);root.add(tie);a.secondary(tie,sign+3,.55);
            const tail=panel([[-.028,0],[.028,0],[sign*.045+.035,-.27],[sign*.045,-.24],[sign*.045-.025,-.29]],-.005,.008,'#4c85aa',tie);tail.material=cloth(3);
            puff(sign*.16,.74,-.18,.033);puff(sign*.205,.56,-.10,.032);
          }
          flower(0,.91,-.235,.055);flower(0,1.11,-.16,.028);
          for(const sign of [-1,1]){const bow=panel([[0,1.18],[sign*.15,1.27],[sign*.20,1.18],[sign*.13,1.10],[0,1.15]],.16,.012,silk);bow.material=cloth(4);}flower(0,1.18,.18,.045);
        }
        if(!a.legs)for(const leg of [a.swing[0],a.swing[1]]){flower(0,-.60,-.18,.034,leg);puff(.07,-.65,-.12,.025,leg);}
      }
    };
  if(typeof module!=='undefined'&&module.exports)module.exports=skin;else window.ChangeV2Skin=skin;
})();
