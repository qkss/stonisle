// Small studio/sky reflection probe shared by all handheld metal materials.
(() => {
  const faces=Array.from({length:6},(_,face)=>{
    const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');
    const sky=g.createLinearGradient(0,0,0,128);
    sky.addColorStop(0,'#d9eeff');sky.addColorStop(.43,'#8bacc5');
    sky.addColorStop(.49,'#f2f8ff');sky.addColorStop(.55,'#344456');sky.addColorStop(1,'#101823');
    g.fillStyle=sky;g.fillRect(0,0,128,128);
    if(face!==3){
      const strip=g.createLinearGradient(15,0,70,0);
      strip.addColorStop(0,'rgba(255,255,255,0)');strip.addColorStop(.4,'rgba(255,255,255,.92)');strip.addColorStop(.58,'rgba(255,255,255,.92)');strip.addColorStop(1,'rgba(255,255,255,0)');
      g.fillStyle=strip;g.fillRect(15,0,55,128);
    }
    return c;
  });
  const env=new THREE.CubeTexture(faces);env.needsUpdate=true;
  window.MetalFinish={apply(material,brass=false){
    material.envMap=env;material.combine=THREE.MixOperation;
    material.reflectivity=brass?.24:.42;
    material.shininess=brass?65:110;
    material.specular.set(brass?0xc6a678:0xc9e2ff);
    material.needsUpdate=true;return material;
  }};
})();
