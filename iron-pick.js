// Forged pick: slender curved steel head, oval eye socket, wedged wooden haft.
(() => {
  const woodFallback = new THREE.MeshLambertMaterial({color:0xa17a4c});
  const steelFallback = new THREE.MeshPhongMaterial({color:0x939da4,specular:0x666666,shininess:45});
  const collarMat = new THREE.MeshPhongMaterial({color:0x495158,specular:0x555555,shininess:28});
  const wedgeMat = new THREE.MeshPhongMaterial({color:0xb4bdc3,shininess:55});
  MetalFinish.apply(steelFallback);MetalFinish.apply(collarMat);MetalFinish.apply(wedgeMat);
  function forgedHead() {
    // Continuous octagonal sections give a hammered, beveled profile, not steps.
    const rings = [
      [-0.46,0.51,0.002,0.003],[-0.40,0.56,0.009,0.013],
      [-0.31,0.615,0.017,0.022],[-0.20,0.66,0.025,0.031],
      [-0.08,0.69,0.039,0.043],[0,0.695,0.049,0.047],
      [0.08,0.69,0.039,0.043],[0.20,0.66,0.025,0.031],
      [0.31,0.615,0.017,0.022],[0.40,0.56,0.009,0.013],[0.46,0.51,0.002,0.003],
    ];
    const corners = [[1,.45],[.45,1],[-.45,1],[-1,.45],[-1,-.45],[-.45,-1],[.45,-1],[1,-.45],[1,.45]];
    const pos=[],uv=[],idx=[];
    rings.forEach(([z,y,w,h])=>corners.forEach(([x,v],i)=>{
      pos.push(x*w,y+v*h,z); uv.push((z+.46)/.92,i/8);
    }));
    for(let r=0;r<rings.length-1;r++) for(let i=0;i<8;i++) {
      const a=r*9+i,b=a+9; idx.push(a,a+1,b,a+1,b+1,b);
    }
    for(let i=1;i<7;i++) {idx.push(0,i+1,i);const e=(rings.length-1)*9;idx.push(e,e+i,e+i+1);}
    const g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
    g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);
    const result=g.toNonIndexed();g.dispose();result.computeVertexNormals();return result;
  }
  function create(natural) {
    const group=new THREE.Group();
    const wood=natural && NaturalTools.material(0) || woodFallback;
    const steel=natural && NaturalTools.material(3) || steelFallback;
    const handle=new THREE.Mesh(new THREE.CylinderGeometry(.036,.028,.73,12),wood);
    handle.position.y=.355;handle.scale.z=1.18;group.add(handle);
    // Slightly flared butt, a practical grip rather than a rectangular stick.
    const butt=new THREE.Mesh(new THREE.CylinderGeometry(.028,.035,.065,12),wood);
    butt.position.y=.012;butt.scale.z=1.15;group.add(butt);
    group.add(new THREE.Mesh(forgedHead(),steel));
    // Oval forged eye encases the handle at the head; the top of the haft remains visible.
    const socket=new THREE.Mesh(new THREE.CylinderGeometry(.052,.046,.105,12),steel);
    socket.position.y=.685;socket.scale.z=1.35;group.add(socket);
    const neck=new THREE.Mesh(new THREE.CylinderGeometry(.042,.04,.027,12),collarMat);
    neck.position.y=.625;neck.scale.z=1.15;group.add(neck);
    const end=new THREE.Mesh(new THREE.CylinderGeometry(.034,.034,.009,12),wood);
    end.position.y=.742;end.scale.z=1.22;group.add(end);
    const wedge=new THREE.Mesh(new THREE.BoxGeometry(.007,.012,.055),wedgeMat);
    wedge.position.y=.748;group.add(wedge);
    return group;
  }
  window.IronPick={create,icon:natural=>StonePick.icon(natural,create)};
})();
