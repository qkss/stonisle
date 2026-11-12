// Shaped stone axe and spade; shared between first-person view and icons.
(() => {
  const woodPlain=new THREE.MeshLambertMaterial({color:0x9b7144});
  const stonePlain=new THREE.MeshLambertMaterial({color:0x767970});
  const cord=new THREE.MeshLambertMaterial({color:0xb5a17a});
  function materials(natural) {
    return [natural && NaturalTools.material(0) || woodPlain,natural && NaturalTools.material(2) || stonePlain];
  }
  function handle(group,wood,length) {
    const mesh=new THREE.Mesh(new THREE.CylinderGeometry(.035,.029,length,10),wood);
    mesh.position.y=length/2;group.add(mesh);
  }
  function wrap(group,y,radius,count) {
    for(let i=0;i<count;i++) {
      const rope=new THREE.Mesh(new THREE.TorusGeometry(radius,.005,5,16),cord);
      rope.rotation.x=Math.PI/2;rope.position.y=y+i*.011;group.add(rope);
    }
  }
  function blade(shape,depth,bevel) {
    const g=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelThickness:bevel,bevelSize:bevel,bevelSegments:1,steps:1,curveSegments:5});
    g.translate(0,0,-depth/2);
    // Planar texture coordinates give a consistent stone grain on the faces.
    g.computeBoundingBox();
    const p=g.attributes.position,u=g.attributes.uv,n=g.attributes.normal,b=g.boundingBox;
    const sx=b.max.x-b.min.x,sy=b.max.y-b.min.y,sz=b.max.z-b.min.z;
    for(let i=0;i<p.count;i++) {
      const front=Math.abs(n.getZ(i))>.5;
      u.setXY(i,front?(p.getX(i)-b.min.x)/sx:(p.getZ(i)-b.min.z)/sz,(p.getY(i)-b.min.y)/sy);
    }
    return g;
  }
  function axe(natural) {
    const group=new THREE.Group(),[wood,stone]=materials(natural);handle(group,wood,.72);
    // A broad convex cutting edge and narrow poll, rather than rectangular steps.
    const s=new THREE.Shape();s.moveTo(-.085,.60);s.lineTo(-.075,.72);s.lineTo(.08,.75);
    s.quadraticCurveTo(.17,.79,.245,.80);s.quadraticCurveTo(.29,.65,.245,.48);
    s.quadraticCurveTo(.14,.51,.07,.57);s.closePath();
    const head=new THREE.Mesh(blade(s,.032,.022),stone);head.rotation.y=-Math.PI/2;group.add(head);
    // Tight neck coils and two lashings following the bevelled stone faces.
    for(let i=0;i<5;i++) {
      const y=.535+i*.009,shaft=.029+y/.72*.006;
      const coil=new THREE.Mesh(new THREE.TorusGeometry(shaft+.0035,.0042,6,24),cord);
      coil.rotation.x=Math.PI/2;coil.position.y=y;coil.name='neck-wrap';group.add(coil);
    }
    for(const z of [-.018,.018]) {
      // The head is rotated: its original horizontal coordinate is now -z.
      const top=.72+(-z+.075)/.155*.03;
      const points=[
        [-.031,.565,z],[-.034,.592,z],[-.041,.62,z],[-.041,top,z],
        [-.018,top+.025,z],[.018,top+.025,z],[.041,top,z],
        [.041,.62,z],[.034,.592,z],[.031,.565,z],
        [.021,.551,z],[0,.548,z],[-.021,.551,z]
      ].map(p=>new THREE.Vector3(...p));
      const path=new THREE.CurvePath();
      points.forEach((p,i)=>path.add(new THREE.LineCurve3(p,points[(i+1)%points.length])));
      const lashing=new THREE.Mesh(new THREE.TubeGeometry(path,96,.0042,6,true),cord);
      lashing.name='head-lashing';group.add(lashing);
    }
    return group;
  }
  function shovel(natural) {
    const group=new THREE.Group(),[wood,stone]=materials(natural);handle(group,wood,.67);
    // Ground stone spade with sloping shoulders and a rounded pointed working edge.
    const s=new THREE.Shape();s.moveTo(-.045,.60);s.lineTo(-.13,.68);s.lineTo(-.145,.81);
    s.quadraticCurveTo(-.10,.91,0,.965);s.quadraticCurveTo(.10,.91,.145,.81);
    s.lineTo(.13,.68);s.lineTo(.045,.60);s.closePath();
    group.add(new THREE.Mesh(blade(s,.021,.012),stone));
    wrap(group,.565,.04,6);
    for(const x of [-.025,.025]) {
      const points=[[x,.57,-.038],[x,.68,-.043],[x,.705,0],[x,.68,.043],[x,.57,.038]].map(p=>new THREE.Vector3(...p));
      group.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),20,.0045,5,false),cord));
    }
    const grip=new THREE.Mesh(new THREE.TorusGeometry(.055,.012,6,16),wood);
    grip.scale.y=.72;grip.position.y=.025;group.add(grip);return group;
  }
  const ironPlain=new THREE.MeshPhongMaterial({color:0xbacbd6,shininess:90,specular:0xffffff});
  MetalFinish.apply(ironPlain);
  function swordModel(natural,iron){
    const group=new THREE.Group(),[wood,stone]=materials(natural);
    const metal=natural&&NaturalTools.material(3)||ironPlain,headMat=iron?metal:stone;
    handle(group,wood,.24);
    const shape=new THREE.Shape();
    const outline=iron?[[-.048,.25],[-.048,.78],[0,.94],[.048,.78],[.048,.25]]:[[-.065,.25],[-.082,.42],[-.065,.48],[-.075,.58],[-.052,.76],[0,.86],[.057,.76],[.078,.57],[.06,.50],[.077,.40],[.065,.25]];
    outline.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();
    group.add(new THREE.Mesh(blade(shape,iron?.016:.035,iron?.009:.018),headMat));
    const guard=new THREE.Mesh(new THREE.BoxGeometry(iron?.24:.19,.032,.062),iron?metal:wood);guard.position.y=.235;group.add(guard);
    const pommel=new THREE.Mesh(new THREE.SphereGeometry(.04,8,6),iron?metal:wood);pommel.scale.y=.7;pommel.position.y=.012;group.add(pommel);
    if(!iron)wrap(group,.19,.04,6);
    else{const ridge=new THREE.Mesh(new THREE.CylinderGeometry(.002,.009,.53,4),metal);ridge.position.set(0,.515,.021);group.add(ridge);}
    return group;
  }
  const sword=natural=>swordModel(natural,false),ironSword=natural=>swordModel(natural,true);
  window.StoneTools={axe,shovel,sword,ironSword};
})();
