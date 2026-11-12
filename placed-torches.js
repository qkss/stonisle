// Decorative world objects: no solid voxel or collision cube is added.
(() => {
  class PlacedTorches {
    constructor(scene,world,lighting,saved={}){
      Object.assign(this,{scene,world,lighting});this.records={};this.models=new Map();this.ray=new THREE.Raycaster();
      for(const r of Object.values(saved||{}))if(r&&[r.x,r.y,r.z].every(Number.isInteger)&&Array.isArray(r.n)&&r.n.length===3&&r.n.every(Number.isInteger)&&r.n.reduce((a,b)=>a+Math.abs(b),0)===1&&r.n[1]>=0&&r.y>0&&r.y<64)this.records[this.key(r)]=r;
    }
    key(r){return `${r.x},${r.y},${r.z}`;}
    supported(r){const b=this.world.get(r.x-r.n[0],r.y-r.n[1],r.z-r.n[2]);return b!==0&&b!==5&&this.world.get(r.x,r.y,r.z)===0;}
    place(h){
      if(h.torch||h.n[1]<0)return false;
      const r={x:h.x+h.n[0],y:h.y+h.n[1],z:h.z+h.n[2],n:[...h.n]},key=this.key(r);
      if(r.y<=0||r.y>=64||this.records[key]||!this.supported(r))return false;
      this.records[key]=r;return true;
    }
    remove(key){
      delete this.records[key];const model=this.models.get(key);
      if(model){this.scene.remove(model);model.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.userData.torchMaterial)o.material.dispose();});this.models.delete(key);}
      this.lighting.lampChunks.delete('torch:'+key);
    }
    refresh(){for(const key of [...this.models.keys()]){const r=this.records[key];this.remove(key);this.records[key]=r;}}
    update(loaded,natural){
      let removed=0;
      for(const [key,r] of Object.entries(this.records)){
        if(!this.supported(r)){this.remove(key);removed++;continue;}
        const visible=loaded.has((r.x>>4)+','+(r.z>>4));
        if(!visible){if(this.models.has(key)){this.remove(key);this.records[key]=r;}continue;}
        if(this.models.has(key))continue;
        const model=TorchTool.create(natural),n=r.n,axis=new THREE.Vector3(n[0]*.55,1,n[2]*.55).normalize();
        model.position.set(r.x+.5-n[0]*.48,r.y+(n[1]===1?.02:.2),r.z+.5-n[2]*.48);
        model.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),axis);
        // The handle leans outward, while flames and sparks always rise vertically.
        for(const child of model.children)if(child.isGroup||child.isPoints)child.quaternion.copy(model.quaternion).invert();
        model.traverse(o=>{if(o.isMesh&&!o.material.transparent){o.material=o.material.clone();o.userData.torchMaterial=true;o.receiveShadow=true;const sky=WorldLighting.object(o.material);sky.value=this.lighting.skyAt(r.x+.5,r.y+.8,r.z+.5);}});
        this.scene.add(model);model.updateMatrixWorld(true);this.models.set(key,model);
        const light=model.localToWorld(new THREE.Vector3(0,.7,0));
        // A slightly offset effective emitter spreads light across the mounting wall.
        // Stop before solid blocks so a narrow passage cannot push it through a wall.
        if(n[1]===0)for(let step=0;step<10;step++){
          const x=light.x+n[0]*.1,z=light.z+n[2]*.1;
          if(this.world.get(Math.floor(x+n[0]*.15),Math.floor(light.y),Math.floor(z+n[2]*.15))!==0)break;
          light.x=x;light.z=z;
        }
        light.torch=true;this.lighting.lampChunks.set('torch:'+key,[light]);
      }
      return removed;
    }
    hit(origin,direction,limit){
      this.ray.set(new THREE.Vector3(...origin),new THREE.Vector3(...direction));this.ray.far=limit;
      let nearest=null;
      for(const [key,model] of this.models){const hit=this.ray.intersectObject(model,true).find(h=>h.object.isMesh&&!h.object.material.transparent);if(hit&&(!nearest||hit.distance<nearest.t))nearest={...this.records[key],torch:key,t:hit.distance};}
      return nearest;
    }
  }
  window.PlacedTorches=PlacedTorches;
})();
