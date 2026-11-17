// Continuous, faceted stone pick. The inventory icon renders this same model.
(() => {
  const plain = [
    new THREE.MeshLambertMaterial({ color: 0x996c3e }),
    new THREE.MeshLambertMaterial({ color: 0x777a76 }),
    new THREE.MeshLambertMaterial({ color: 0xb29b70 }),
  ];
  const ropeMaterial = plain[2];
  function headGeometry() {
    // z, center height, half thickness, half height; pointed ends droop gently.
    const sections = [
      [-0.43,0.50,0.002,0.003], [-0.33,0.565,0.022,0.030],
      [-0.19,0.625,0.043,0.058], [0,0.65,0.052,0.073],
      [0.19,0.625,0.043,0.058], [0.33,0.565,0.022,0.030], [0.43,0.50,0.002,0.003],
    ];
    const positions = [], uv = [], indices = [], sides = 8;
    for (const [z,y,rx,ry] of sections) for (let i=0;i<=sides;i++) {
      const a = i / sides * Math.PI * 2;
      positions.push(Math.cos(a)*rx, y+Math.sin(a)*ry, z);
      uv.push((z+0.43)/0.86, i/sides);
    }
    for (let ring=0;ring<sections.length-1;ring++) for (let i=0;i<sides;i++) {
      const a=ring*(sides+1)+i,b=a+sides+1;
      indices.push(a,a+1,b,a+1,b+1,b);
    }
    // Close both pointed ends.
    for (let i=1;i<sides-1;i++) {
      indices.push(0,i+1,i);
      const end=(sections.length-1)*(sides+1); indices.push(end,end+i,end+i+1);
    }
    const g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
    g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2)); g.setIndex(indices);
    const flat=g.toNonIndexed(); g.dispose(); flat.computeVertexNormals(); return flat;
  }
  function create(natural) {
    const group=new THREE.Group();
    const wood=natural && window.NaturalTools.material(0) || plain[0];
    const stone=natural && window.NaturalTools.material(2) || plain[1];
    const handle=new THREE.Mesh(new THREE.CylinderGeometry(0.042,0.032,0.65,10),wood);
    handle.position.y=0.325; group.add(handle);
    group.add(new THREE.Mesh(headGeometry(),stone));
    // Packed neck turns follow the tapered wooden shaft, without a floating gap.
    for(let i=0;i<5;i++){
      const y=.538+i*.009,shaft=.032+y/.65*.010;
      const loop=new THREE.Mesh(new THREE.TorusGeometry(shaft+.0035,.0042,6,24),ropeMaterial);
      loop.name='neck-wrap';loop.rotation.x=Math.PI/2;loop.position.y=y;group.add(loop);
    }
    // Follow the stone's eight-sided section with straight, taut spans. A spline
    // overshoots these corners and makes the cord look like a loose wire loop.
    for(const sign of [-1,1]){
      const z=sign*.022,t=Math.abs(z)/.19,cy=.65-.025*t,rx=.052-.009*t+.0035,ry=.073-.015*t+.0035;
      const onStone=a=>[Math.cos(a)*rx,cy+Math.sin(a)*ry,z];
      const points=[onStone(Math.PI/2),onStone(Math.PI/4),onStone(0),onStone(-Math.PI/4),
        [.038,.568,-sign*.018],[.029,.553,-sign*.029],[0,.55,-sign*.042],
        [-.029,.553,-sign*.029],[-.038,.568,-sign*.018],
        onStone(-Math.PI*3/4),onStone(Math.PI),onStone(Math.PI*3/4)]
        .map(p=>new THREE.Vector3(...p));
      const path=new THREE.CurvePath();
      for(let i=0;i<points.length;i++)path.add(new THREE.LineCurve3(points[i],points[(i+1)%points.length]));
      const lashing=new THREE.Mesh(new THREE.TubeGeometry(path,96,.0042,6,true),ropeMaterial);
      lashing.name='head-lashing';group.add(lashing);
    }
    const knot=new THREE.Mesh(new THREE.TorusGeometry(.006,.003,6,12),ropeMaterial);
    knot.name='binding-knot';knot.scale.set(1,.75,.65);knot.position.set(.012,.557,.044);group.add(knot);
    return group;
  }
  let iconRenderer;
  window.StonePick={ create, icon(natural, makeModel = create, sideView = true) {
    if (!iconRenderer) { iconRenderer=new THREE.WebGLRenderer({alpha:true,antialias:true}); iconRenderer.setSize(80,80); iconRenderer.setClearColor(0,0); }
    const scene=new THREE.Scene(), model=makeModel(natural);
    // Separate pivots: screen-space clockwise 45°, independent of the side view.
    model.rotation.y=sideView ? -Math.PI/2 : 0;
    const pivot=new THREE.Group();pivot.add(model);pivot.rotation.z=-Math.PI/4;scene.add(pivot);
    pivot.updateMatrixWorld(true);
    const bounds=new THREE.Box3().setFromObject(pivot),center=bounds.getCenter(new THREE.Vector3());
    pivot.position.sub(center);
    scene.add(new THREE.AmbientLight(0xffffff,0.85));
    const light=new THREE.DirectionalLight(0xfff4df,0.8); light.position.set(-2,3,4); scene.add(light);
    const size=bounds.getSize(new THREE.Vector3()),half=Math.max(size.x,size.y)*.57;
    const camera=new THREE.OrthographicCamera(-half,half,half,-half,0.1,10); camera.position.set(0,0,3);
    iconRenderer.render(scene,camera);
    const url=iconRenderer.domElement.toDataURL();
    model.traverse(o=>{ if(o.geometry)o.geometry.dispose(); }); return url;
  }};
})();
