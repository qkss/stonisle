// Sword cosmetics share one model factory across hand, inventory and previews.
(() => {
  const KEY='stonisle.weaponSkin', swords=new Set([23,26,29,153]);
  const list=[{id:'default',name:'原始外观',en:'Default',note:'保留武器原有材质与造型'},
    {id:'destiny',name:'命运之剑',en:'Destiny',note:'银白羽翼 · 青蓝剑心 · 星纹镶饰'},
    {id:'ember',name:'余烬之刃',en:'Ember',note:'黑钢剑脊 · 古铜护手 · 熔火纹路'},
    {id:'frost',name:'霜月之锋',en:'Frostmoon',note:'冰蓝晶刃 · 月牙护手 · 银色棱面'}];
  let selected=localStorage.getItem(KEY)||'default';if(!list.some(s=>s.id===selected))selected='default';
  const mats=new Map();
  function material(color,glow=false){
    const key=color+glow;if(mats.has(key))return mats.get(key);
    const m=new THREE.MeshPhongMaterial({color,shininess:glow?65:85,specular:0xc9e2ed});
    if(glow){m.emissive=new THREE.Color(color);m.emissiveIntensity=.26;}else if(window.MetalFinish){MetalFinish.apply(m,color==='#b4945f');m.reflectivity=.13;m.shininess=65;}
    mats.set(key,m);return m;
  }
  function frostMaterial(role){
    const key='frost-'+role;if(mats.has(key))return mats.get(key);
    const palette={edge:0xbacbd8,core:0x377b9c,grip:0x263a50,light:0x9bd8e9};
    const m=new THREE.MeshPhongMaterial({color:palette[role],specular:role==='grip'?0x11151b:0x9bbdcc,shininess:role==='edge'?95:role==='grip'?7:55});
    if(role==='edge'&&window.MetalFinish)MetalFinish.apply(m);
    if(role==='light'){m.emissive.setHex(0x4d92ad);m.emissiveIntensity=.10;}
    const prev=m.onBeforeCompile;
    m.onBeforeCompile=function(shader,renderer){
      prev.call(this,shader,renderer);
      shader.vertexShader='varying vec3 frostP;\n'+shader.vertexShader;
      shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nfrostP=position;');
      shader.fragmentShader='varying vec3 frostP;\n'+shader.fragmentShader;
      shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
        ${role==='grip'?`float grain=sin(frostP.y*700.0)*sin(frostP.x*850.0);diffuseColor.rgb*=.90+grain*.055;`:
        `float facet=.80+.18*cos(frostP.x*58.0+frostP.z*21.0);
        float vein=pow(max(0.0,sin(frostP.y*37.0+frostP.x*145.0+sin(frostP.y*13.0))),24.0);
        float hairline=sin(frostP.y*1200.0+frostP.x*35.0)*.018;
        diffuseColor.rgb*=facet+hairline;
        diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.65,.83,.91),vein*${role==='core'?'.24':'.045'});`}
      `);
    };
    m.customProgramCacheKey=()=>key+'-etched-ice-v1';mats.set(key,m);return m;
  }
  function create(style=selected){
    if(style==='default')return StoneTools.ironSword(true);
    const g=new THREE.Group(),destiny=style==='destiny',frost=style==='frost';
    const edge=frost?frostMaterial('edge'):material(destiny?'#e4e8e2':'#b4945f'),core=frost?frostMaterial('core'):material(destiny?'#168da8':'#34323b'),dark=frost?frostMaterial('grip'):material(destiny?'#263b57':'#493632'),light=frost?frostMaterial('light'):material(destiny?'#a3e9e2':'#f49a43',true);
    function shape(points,mat,z=0,depth=.025){const s=new THREE.Shape();points.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();const geo=new THREE.ExtrudeGeometry(s,{depth,bevelEnabled:true,bevelThickness:.003,bevelSize:.003,bevelSegments:1,steps:1});geo.translate(0,0,z-depth/2);const m=new THREE.Mesh(geo,mat);g.add(m);return m;}
    function box(w,h,d,x,y,z,mat){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);g.add(m);return m;}
    function gem(x,y,r,mat,z=.028){const m=new THREE.Mesh(new THREE.OctahedronGeometry(r),mat);m.scale.z=.45;m.position.set(x,y,z);g.add(m);}
    box(.042,.20,.044,0,.12,0,dark);
    for(let i=0;i<7;i++){const m=new THREE.Mesh(new THREE.TorusGeometry(.025,.0025,4,12),edge);m.rotation.x=Math.PI/2;m.position.y=.035+i*.025;g.add(m);}
    gem(0,.012,.039,edge,0);gem(0,.012,.021,light,.022);
    const outline=destiny?[[-.07,.26],[-.10,.47],[-.064,.61],[-.075,.95],[0,1.24],[.075,.95],[.064,.61],[.10,.47],[.07,.26]]:frost?[[-.062,.26],[-.105,.60],[-.075,.95],[0,1.22],[.075,.95],[.105,.60],[.062,.26]]:[[-.07,.26],[-.095,.82],[-.055,.79],[-.075,1.02],[0,1.19],[.075,1.02],[.055,.79],[.095,.82],[.07,.26]];
    shape(outline,edge,0,.034);
    shape(outline.map(([x,y])=>[x*.70,.28+(y-.28)*.94]),core,.024,.012);
    shape([[-.008,.30],[-.011,.92],[0,1.11],[.011,.92],[.008,.30]],light,.035,.006);
    // Both faces are decorated so the sword remains readable as the wrist turns.
    if(destiny){
      const filigree=material('#b8cbd0');
      function line(points,mat,r=.003,z=.047){const curve=new THREE.CatmullRomCurve3(points.map(([x,y])=>new THREE.Vector3(x,y,z)));const m=new THREE.Mesh(new THREE.TubeGeometry(curve,24,r,5,false),mat);g.add(m);const back=m.clone();back.scale.z=-1;g.add(back);}
      for(const sign of [-1,1]){
        const flip=pts=>pts.map(([x,y])=>[x*sign,y]);
        line(flip([[.025,.27],[.11,.29],[.17,.37],[.20,.48]]),filigree,.009,0);
        for(let i=0;i<7;i++){
          const x=.09+i*.016,y=.28+i*.024;
          shape(flip([[x,y],[x+.025,y+.018],[x+.072,y+.105+i*.006],[x+.044,y+.09],[x+.008,y+.038]]),edge,.008+i*.002,.016);
          line(flip([[x+.012,y+.025],[x+.032,y+.06],[x+.062,y+.098+i*.005]]),filigree,.002,.032+i*.002);
        }
        line(flip([[.018,.31],[.078,.33],[.113,.42],[.10,.50],[.052,.54],[.018,.51]]),edge,.005);
        for(let i=0;i<3;i++)line(flip([[.018+i*.022,.34],[.022+i*.022,.43],[.018+i*.02,.51]]),edge,.0025);
        for(let i=0;i<5;i++){const y=.57+i*.10;line(flip([[.008,y-.035],[.036,y],[.011,y+.04]]),edge,.0026);}
        line(flip([[.05,.60],[.044,.77],[.053,.95],[.008,1.14]]),filigree,.0025);
      }
      gem(0,.28,.048,edge);gem(0,.28,.028,light,.049);
      for(const y of [.55,.79,.99]){shape([[0,y+.038],[.009,y+.011],[.025,y],[.009,y-.009],[0,y-.038],[-.009,y-.009],[-.025,y],[-.009,y+.011]],edge,.043,.007);gem(0,y,.012,light,.053);}
    }else if(frost){
      // Fine silver frost branches catch light independently of the blue blade.
      for(const sign of [-1,1])for(const y of [.46,.64,.82]){
        const pts=[[.013*sign,y-.028],[.047*sign,y],[.067*sign,y+.055]];
        const curve=new THREE.CatmullRomCurve3(pts.map(([x,y])=>new THREE.Vector3(x,y,.045)));
        const line=new THREE.Mesh(new THREE.TubeGeometry(curve,10,.0017,5,false),edge);g.add(line);const back=line.clone();back.scale.z=-1;g.add(back);
      }

      for(const sign of [-1,1])shape([[.02,.25],[.16,.21],[.22,.30],[.17,.27],[.08,.30]].map(([x,y])=>[x*sign,y]),edge,0,.04);
      for(const y of [.40,.59,.78,.95])gem(0,y,.022,light,.041);
      shape([[-.06,.36],[-.035,.92],[0,1.13],[0,.38]],core,.034,.005);
    }else{
      for(const sign of [-1,1])shape([[.025,.24],[.17,.23],[.20,.29],[.13,.27],[.10,.35]].map(([x,y])=>[x*sign,y]),edge,0,.05);
      for(let i=0;i<5;i++){const y=.39+i*.12;shape([[-.026,y],[-.007,y+.045],[.027,y+.07],[.007,y+.025]],light,.037,.008);}
      gem(0,.27,.035,light,.033);
    }
    // Mirror raised inlays onto the reverse without duplicating the central blade.
    for(const child of [...g.children])if(child.geometry&&child.geometry.type==='ExtrudeGeometry'){
      const b=child.geometry.boundingBox||(child.geometry.computeBoundingBox(),child.geometry.boundingBox);
      if(b.min.z>.01){const back=child.clone();back.geometry=child.geometry.clone();back.scale.z=-1;g.add(back);}
    }
    return g;
  }
  let renderer;const previews=new Map();
  function preview(style){if(previews.has(style))return previews.get(style);
    if(!renderer){renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});renderer.setSize(220,300);}
    const scene=new THREE.Scene(),m=create(style);m.rotation.y=-.22;scene.add(m);scene.add(new THREE.AmbientLight(0xe4efff,.75));const sun=new THREE.DirectionalLight(0xfff1d8,1);sun.position.set(-2,3,4);scene.add(sun);const rim=new THREE.DirectionalLight(0x85c9e7,.45);rim.position.set(2,1,-2);scene.add(rim);
    const camera=new THREE.OrthographicCamera(-.48,.48,1.32,.01,.1,10);camera.position.set(0,0,3);renderer.render(scene,camera);const url=renderer.domElement.toDataURL();m.traverse(o=>o.geometry?.dispose());previews.set(style,url);return url;
  }
  window.WeaponSkins={list,create,preview,supports:id=>swords.has(id),get selected(){return selected;},get active(){return selected!=='default';},set(id){if(!list.some(s=>s.id===id)||id===selected)return;selected=id;localStorage.setItem(KEY,id);window.dispatchEvent(new Event('weapon-skin-change'));}};
})();
