// Cached damage overlays and a bounded, instanced debris pool.
(() => {
  const palette={1:0x796047,2:0x876343,3:0x95948c,4:0xd5bf87,6:0xb7844b,7:0x668348,8:0xba8d57,9:0xa56348,10:0x8d8e88,11:0x52545a,12:0xa48673,13:0xbea45f,14:0x8abac2,15:0xe5edf0};
  window.MiningFX=class {
    constructor(scene) {
      this.key='';this.clock=0;this.cursor=0;
      this.maps=Array.from({length:8},(_,stage)=>{
        const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');
        let seed=7381;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
        for(let ray=0;ray<9;ray++) {
          let x=64,y=63;const a=ray*Math.PI*2/9+random()*.4;
          g.beginPath();g.moveTo(x,y);
          for(let step=0;step<8;step++) {
            x+=Math.cos(a)*8+(random()-.5)*10;y+=Math.sin(a)*8+(random()-.5)*10;
            if(step>stage)continue;
            g.lineTo(x,y);
            if(step>1 && step%2===0){g.lineTo(x+Math.cos(a+.9)*10,y+Math.sin(a+.9)*10);g.moveTo(x,y);}
          }
          g.strokeStyle='rgba(15,12,10,.86)';g.lineWidth=1+stage*.22;g.lineJoin='round';g.stroke();
        }
        const tex=new THREE.CanvasTexture(c);return tex;
      });
      this.damageMat=new THREE.MeshBasicMaterial({map:this.maps[0],transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
      this.overlay=new THREE.Mesh(new THREE.BoxGeometry(1.002,1.002,1.002),this.damageMat);
      this.overlay.visible=false;this.overlay.renderOrder=2;scene.add(this.overlay);
      this.scene=scene;this.persistent=new Map();
      this.stages=this.maps.map(map=>new THREE.MeshBasicMaterial({map,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));
      this.particles=Array.from({length:96},()=>({life:0}));
      this.debris=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial(),96);
      this.debris.instanceMatrix.setUsage(THREE.DynamicDrawUsage);this.debris.frustumCulled=false;
      this.object=new THREE.Object3D();this.color=new THREE.Color();
      for(let i=0;i<96;i++){this.object.scale.setScalar(0);this.object.updateMatrix();this.debris.setMatrixAt(i,this.object.matrix);this.debris.setColorAt(i,this.color);}
      scene.add(this.debris);
    }
    reset(){this.key='';this.clock=0;this.overlay.visible=false;}
    syncDamage(records,visible){
      // Persistent cracks are separate from the active hit emitter. Only loaded chunks get meshes.
      this.overlay.visible=false;
      const keep=new Set();
      for(const [key,r] of Object.entries(records)){
        if(!visible(r))continue;keep.add(key);
        let mesh=this.persistent.get(key);
        if(!mesh){mesh=new THREE.Mesh(this.overlay.geometry,this.stages[0]);mesh.renderOrder=2;mesh.position.set(r.x+.5,r.y+.5,r.z+.5);this.scene.add(mesh);this.persistent.set(key,mesh);}
        mesh.material=this.stages[Math.min(7,Math.floor(r.progress*8))];
      }
      for(const [key,mesh] of this.persistent)if(!keep.has(key)){this.scene.remove(mesh);this.persistent.delete(key);}
    }
    damage(hit,id,progress,dt){
      const key=`${hit.x},${hit.y},${hit.z}`;
      if(key!==this.key){this.clock=0;this.key=key;}
      this.overlay.position.set(hit.x+.5,hit.y+.5,hit.z+.5);this.overlay.visible=true;
      this.damageMat.map=this.maps[Math.min(7,Math.floor(progress*8))];
      this.clock+=dt;if(this.clock>=.075){this.clock%=.075;this.emit(hit,id,2,false);}
    }
    emit(hit,id,count,broken){
      const wood=id===6||id===8,leaf=id===7;
      for(let j=0;j<count;j++){
        const i=this.cursor++%96,p=this.particles[i],n=hit.n;
        p.x=hit.x+.5;p.y=hit.y+.5;p.z=hit.z+.5;
        for(const [axis,k] of [['x',0],['y',1],['z',2]])p[axis]+=n[k]?n[k]*.53:(Math.random()-.5)*.75;
        p.vx=n[0]*(1+Math.random()*2)+(Math.random()-.5)*2;
        p.vy=1+Math.random()*2+n[1];p.vz=n[2]*(1+Math.random()*2)+(Math.random()-.5)*2;
        p.life=p.max=.35+Math.random()*.45+(broken?.15:0);p.rotation=Math.random()*6.28;
        p.size=(wood?.025:leaf?.05:.035)+Math.random()*.025;p.wood=wood;p.leaf=leaf;
        this.color.setHex(palette[id]||0x95948c).multiplyScalar(.7+Math.random()*.5);this.debris.setColorAt(i,this.color);
      }
      this.debris.instanceColor.needsUpdate=true;
    }
    break(hit,id){this.emit(hit,id,22,true);this.reset();}
    update(dt){
      let active=false;
      this.particles.forEach((p,i)=>{
        if(p.life<=0)return;active=true;p.life-=dt;
        if(p.life>0){
          p.vy-=8*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;p.rotation+=dt*5;
          const fade=Math.min(1,p.life/.15),s=p.size*fade;
          this.object.position.set(p.x,p.y,p.z);this.object.rotation.set(p.rotation,p.rotation*.7,0);
          this.object.scale.set(s*(p.wood?.4:1),s*(p.wood?3:1),s*(p.leaf?.2:1));
        }else this.object.scale.setScalar(0);
        this.object.updateMatrix();this.debris.setMatrixAt(i,this.object.matrix);
      });
      if(active)this.debris.instanceMatrix.needsUpdate=true;
      this.debris.visible=active;
    }
  };
})();
