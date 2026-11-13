// Full silhouettes shared by the inventory and held blocks, using the world atlas.
(() => {
  let renderer;const materials=new WeakMap(),plantMaterials=new WeakMap();
  function create(id,texture){
    let mat=materials.get(texture);if(!mat){mat=new THREE.MeshLambertMaterial({map:texture,alphaTest:.5,side:THREE.DoubleSide});materials.set(texture,mat);}
    const g=new THREE.Group(),tiles=Core.BLOCKS[id].tiles;
    const box=(w,h,d,x,y,z,ts=tiles)=>{
      if(typeof ts==='number')ts=[ts,ts,ts];const geo=new THREE.BoxGeometry(w,h,d),uv=geo.attributes.uv;
      for(let f=0;f<6;f++)for(let v=0;v<4;v++){const i=f*4+v,t=ts[f===2?0:f===3?2:1];uv.setX(i,(t+.008+uv.getX(i)*.984)/Core.ATLAS_TILES);}
      const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);g.add(m);return m;
    };
    const card=(tile,u0,u1,v0,v1,w,h,y,tint=0xffffff)=>{
      const geo=new THREE.PlaneGeometry(w,h),uv=geo.attributes.uv;
      for(let i=0;i<4;i++)uv.setXY(i,(tile+u0+uv.getX(i)*(u1-u0))/Core.ATLAS_TILES,v0+uv.getY(i)*(v1-v0));
      // Vertex tint avoids allocating per-icon materials.
      const col=new THREE.Color(tint);geo.setAttribute('color',new THREE.Float32BufferAttribute(Array.from({length:4},()=>col.toArray()).flat(),3));
      let plant=plantMaterials.get(texture);if(!plant){plant=mat.clone();plant.vertexColors=true;plantMaterials.set(texture,plant);}
      const m=new THREE.Mesh(geo,plant);m.position.y=y;g.add(m);return m;
    };
    if(id===158){
      const data=Core.cobbleModel(),geo=new THREE.BufferGeometry();
      for(const [name,key,size] of [['position','pos',3],['normal','nor',3],['uv','uv',2],['color','col',3]])geo.setAttribute(name,new THREE.Float32BufferAttribute(data[key],size));
      geo.setIndex(data.idx);geo.translate(-.5,0,-.5);
      let stone=plantMaterials.get(texture);if(!stone){stone=mat.clone();stone.vertexColors=true;plantMaterials.set(texture,stone);}
      g.add(new THREE.Mesh(geo,stone));return g;
    }
    const P=Core.PLANTS[id];
    if(P||id>=68&&id<=73){
      if(P){if(P.stem)card(29,.01,.99,.01,.49,.48,P.stem,P.stem/2);card(P.tile,P.qx*.5+.008,P.qx*.5+.492,P.qy?.008:.508,P.qy?.492:.992,.68,P.top-P.stem,(P.top+P.stem)/2);}
      else if(id<=70){card(29,.01,.99,.01,.49,.5,.4,.2);card(29,.01,.99,.51,.99,.5,.4,.6,[0xd76f6a,0xe0c35e,0x859ccd][id-68]);}
      else card(tiles[1],.01,.99,.01,.99,.8,.9,.45);
      return g;
    }
    if(Core.doorBase(id)){
      box(.86,1.8,.13,0,.9,0);box(.055,.14,.065,.29,.83,.10,24);
    }else if(id===64||id===65){
      box(.9,1.05,.055,0,.55,0,17);
      for(const x of [-.47,.47])box(.045,1.1,.07,x,.55,0,19);
      for(const y of [0,1.1])box(.94,.045,.07,0,y,0,19);
    }else if(id===74||id===75){
      box(.10,.60,.10,0,.3,0,9);box(.9,.48,.10,0,.8,0,46);
      for(const [w,x,y] of [[.52,-.08,.88],[.38,-.15,.76]])box(w,.025,.012,x,y,.056,6);
    }else if(id===66||id===67){
      box(.85,.18,1.6,0,.35,0,9);box(.82,.15,1.10,0,.49,.24,28);box(.78,.17,.38,0,.50,-.53,16);
      for(const x of [-.32,.32])for(const z of [-.66,.66])box(.12,.28,.12,x,.14,z,9);
      box(.9,.48,.08,0,.5,-.79,9);
    }else if(Core.isChest(id)){
      box(.9,.58,.76,0,.34,0);box(.94,.22,.80,0,.74,0);box(.11,.19,.07,0,.57,.41,24);
    }else{
      const boxes=id>=220&&id<=223?Core.shapeBoxes(id,x=>x?id:0):Core.shapeBoxes(id);
      for(const q of boxes)box(q[3]-q[0],q[4]-q[1],q[5]-q[2],(q[0]+q[3])/2-.5,(q[1]+q[4])/2,(q[2]+q[5])/2-.5);
    }
    return g;
  }
  function draw(id,texture){
    if(!renderer){renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});renderer.setSize(96,96);renderer.setClearColor(0,0);}
    const scene=new THREE.Scene(),g=create(id,texture);scene.add(g);
    const plant=!!Core.PLANTS[id]||id>=68&&id<=73;
    g.rotation.y=plant?0:-.40;g.rotation.x=plant?0:.18;
    g.updateMatrixWorld(true);const b=new THREE.Box3().setFromObject(g),size=b.getSize(new THREE.Vector3());g.position.sub(b.getCenter(new THREE.Vector3()));
    scene.add(new THREE.AmbientLight(0xdde7ef,.65));const light=new THREE.DirectionalLight(0xfff0d8,.8);light.position.set(-3,5,4);scene.add(light);
    const half=Math.max(size.x,size.y)*.58,camera=new THREE.OrthographicCamera(-half,half,half,-half,.1,20);camera.position.z=4;
    renderer.render(scene,camera);const result=renderer.domElement.toDataURL();const owned=new Set();g.traverse(o=>{o.geometry?.dispose();if(o.material?.userData.iconOwned)owned.add(o.material);});for(const m of owned)m.dispose();return result;
  }
  window.BuildingIcons={supports:id=>!!Core.BLOCKS[id],create,draw};
})();
