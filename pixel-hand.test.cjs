const assert=require('assert'),fs=require('fs'),THREE=require(process.argv[2]),window={};
new Function('THREE','window',fs.readFileSync('first-person-hand.js','utf8'))(THREE,window);
for(const r of [.039,.038,.031,.035]){
 const g=window.FirstPersonHand.create(false,r);g.updateMatrixWorld(true);
 const bounds=new THREE.Box3().setFromObject(g);assert(bounds.max.y<.219,'palm and thumb must stay below the sword guard');
 const ray=new THREE.Raycaster();let count=0;
 for(const y of [.088,.120,.153,.187])for(const a of [0,Math.PI/2,Math.PI,Math.PI*1.5]){
  const d=new THREE.Vector3(Math.cos(a),0,Math.sin(a));ray.set(new THREE.Vector3(0,y,0),d);
  const hit=ray.intersectObject(g,true)[0];assert(hit&&hit.distance>.025&&hit.distance<.043,'finger contact stays near the shaft');count++;
 }
 assert.equal(count,16);
}
console.log('四种握柄、四指接触与剑护手间隙检查通过');
