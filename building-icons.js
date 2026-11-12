// Render silhouettes at a consistent scale: cube, half slab and stepped stair.
(() => {
  let renderer;
  window.BuildingIcons={
    supports(id){return !!Core.ladderInfo(id)||!!Core.stairInfo(id)||!!Core.slabInfo(id)||Core.WOODS.some(w=>w.plank===id);},
    draw(id,texture){
      if(!renderer){renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});renderer.setSize(80,80);renderer.setClearColor(0,0);}
      const scene=new THREE.Scene(),group=new THREE.Group();scene.add(group);
      const boxes=Core.shapeBoxes(id),tiles=Core.BLOCKS[id].tiles;
      const material=new THREE.MeshLambertMaterial({map:texture});
      const edgeMaterial=new THREE.LineBasicMaterial({color:0x302318,transparent:true,opacity:.28});
      for(const q of boxes){
        const geo=new THREE.BoxGeometry(q[3]-q[0],q[4]-q[1],q[5]-q[2]),uv=geo.attributes.uv;
        for(let face=0;face<6;face++)for(let vertex=0;vertex<4;vertex++){
          const i=face*4+vertex,tile=tiles[face===2?0:face===3?2:1];uv.setX(i,(tile+.015+uv.getX(i)*.97)/Core.ATLAS_TILES);
        }
        const mesh=new THREE.Mesh(geo,material);mesh.position.set((q[0]+q[3])/2-.5,(q[1]+q[4])/2,(q[2]+q[5])/2-.5);group.add(mesh);
        const edge=new THREE.LineSegments(new THREE.EdgesGeometry(geo),edgeMaterial);edge.position.copy(mesh.position);group.add(edge);
      }
      const bounds=new THREE.Box3().setFromObject(group);group.position.y=-bounds.getCenter(new THREE.Vector3()).y;
      scene.add(new THREE.AmbientLight(0xffffff,.8));const light=new THREE.DirectionalLight(0xfff0d5,.95);light.position.set(-3,5,4);scene.add(light);
      const camera=new THREE.OrthographicCamera(-.92,.92,.92,-.92,.1,20);camera.position.set(3,2.4,4);camera.lookAt(0,0,0);
      renderer.render(scene,camera);const result=renderer.domElement.toDataURL();
      group.traverse(o=>{if(o.geometry)o.geometry.dispose();});material.dispose();edgeMaterial.dispose();return result;
    }
  };
})();
