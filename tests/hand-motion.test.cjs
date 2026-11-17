// Usage: node hand-motion.test.cjs /path/to/three-r128.cjs
const assert=require('assert'),fs=require('fs'),THREE=require(process.argv[2]),window={};
new Function('THREE','window',fs.readFileSync('src/client/player/hand-motion.js','utf8'))(THREE,window);
const {rig,update,angles}=window.HandMotion;
for(const sword of [false,true]){
 assert(angles(0,sword).every(x=>Math.abs(x)<1e-10));assert(angles(1,sword).every(x=>Math.abs(x)<1e-10));
 for(let i=0;i<=100;i++)assert(angles(i/100,sword).every(x=>Number.isFinite(x)&&Math.abs(x)<.2));
}
for(const yaw of [.3,-.9,Math.PI+.3]){
 const holder=new THREE.Group(),hand=new THREE.Group(),finger=new THREE.Mesh(new THREE.BoxGeometry(.03,.03,.03),new THREE.MeshLambertMaterial());finger.position.set(-.03,.15,.05);hand.add(finger);rig(hand);hand.rotation.y=-yaw;holder.add(hand);
 const tool=new THREE.Group();holder.add(tool);
 for(const phase of [0,.25,.5,.7,1]){
  update(hand,holder,phase,true);holder.updateMatrixWorld(true);
  const mesh=hand.children.find(o=>o.isSkinnedMesh),position=mesh.geometry.attributes.position;
  const before=new THREE.Vector3().fromBufferAttribute(position,0),after=before.clone();mesh.boneTransform(0,after);after.applyQuaternion(hand.quaternion);
  const toolPoint=before.clone().applyQuaternion(hand.quaternion).applyQuaternion(tool.quaternion).add(tool.position);
  assert(after.distanceTo(toolPoint)<1e-6,'fingers and tool must share the exact wrist transform');
  const w=mesh.geometry.attributes.skinWeight;for(let i=0;i<w.count;i++)assert(Math.abs(w.getX(i)+w.getY(i)-1)<1e-6);
 }
 assert(tool.position.length()<1e-8&&tool.quaternion.angleTo(new THREE.Quaternion())<1e-7,'return to rest without accumulating drift');
}
console.log('手腕端点、角度限制、权重、三种工具朝向及手柄同步测试通过');
