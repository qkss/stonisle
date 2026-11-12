// One articulated wrist shared by the hand and tool; the forearm stays planted.
(() => {
 const pivot=new THREE.Vector3(.095,.045,.05);
 const localQ=new THREE.Quaternion(),toolQ=new THREE.Quaternion(),inverseQ=new THREE.Quaternion(),localPivot=new THREE.Vector3(),euler=new THREE.Euler();
 const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
 function angles(phase,sword){
  const p=Math.max(0,Math.min(1,phase)),envelope=Math.sin(Math.PI*p)**2;
  return [(sword?.10:.14)*Math.sin(2*Math.PI*p)*envelope,(sword?.13:.045)*envelope,(sword?.18:.065)*Math.sin(2*Math.PI*p)*envelope];
 }
 function rig(hand){
  hand.updateMatrixWorld(true);
  const sources=[];hand.traverse(o=>{if(o.isMesh)sources.push(o);});
  const root=new THREE.Bone(),wrist=new THREE.Bone();wrist.position.copy(pivot);root.add(wrist);root.updateMatrixWorld(true);
  const skeleton=new THREE.Skeleton([root,wrist]),meshes=[];
  const toHand=new THREE.Matrix4().copy(hand.matrixWorld).invert();
  for(const src of sources){
   const g=src.geometry.clone();g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(toHand,src.matrixWorld));
   const pos=g.attributes.position,indices=new Uint16Array(pos.count*4),weights=new Float32Array(pos.count*4);
   for(let i=0;i<pos.count;i++){
    const w=smooth((pos.getY(i)+.075)/.15);indices[i*4+1]=1;weights[i*4]=1-w;weights[i*4+1]=w;
   }
   g.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(indices,4));g.setAttribute('skinWeight',new THREE.Float32BufferAttribute(weights,4));
   const cloneMaterial=m=>{if(!m.skinning){m.skinning=true;m.needsUpdate=true;}return m;};
   const material=Array.isArray(src.material)?src.material.map(cloneMaterial):cloneMaterial(src.material);
   const mesh=new THREE.SkinnedMesh(g,material);mesh.bind(skeleton,new THREE.Matrix4());mesh.frustumCulled=false;meshes.push(mesh);
  }
  for(const c of [...hand.children])hand.remove(c);
  for(const source of sources)source.geometry.dispose();
  hand.add(root,...meshes);hand.userData.wrist=wrist;return hand;
 }
 function update(hand,holder,phase,sword){
  if(!hand?.userData.wrist)return;
  const a=angles(phase,sword);euler.set(...a);localQ.setFromEuler(euler);hand.userData.wrist.quaternion.copy(localQ);
  inverseQ.copy(hand.quaternion).invert();toolQ.copy(hand.quaternion).multiply(localQ).multiply(inverseQ);localPivot.copy(pivot).applyQuaternion(hand.quaternion);
  for(const tool of holder.children)if(tool!==hand){
   if(!tool.userData.gripRest){tool.userData.gripRest={position:tool.position.clone(),quaternion:tool.quaternion.clone()};}
   const rest=tool.userData.gripRest;
   tool.position.copy(rest.position).sub(localPivot).applyQuaternion(toolQ).add(localPivot);tool.quaternion.copy(toolQ).multiply(rest.quaternion);
  }
 }
 window.HandMotion={rig,update,angles};
})();
