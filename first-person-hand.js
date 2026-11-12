// 第一人称的右手和前臂：方块风格，和世界、工具、联机小人是同一种画法。
// 坐标和原来一致：工具的握柄沿 +y 穿过原点，手握在 y≈0.08–0.24；+z 朝向镜头，+x 是屏幕右边；前臂从手腕伸向右下方、画面之外。
// create(carry, shaftRadius)：carry=true 是托着方块的摊开手掌，否则是握住握柄的拳头。
(() => {
  const mat = c => new THREE.MeshLambertMaterial({ color: c });
  const materials=window.ExplorerHandMaterials;
  const SKIN = materials?.skin||mat('#e8c39e'), SKIN2 = materials?.fingers||mat('#d9b08a'), SLEEVE = materials?.sleeve||mat('#d9d2bd'), CUFF = materials?.cuff||mat('#b3a98c'); // 手背、手指（略深，指缝才分得清）、袖子、袖口
  function box(g, w, h, d, x, y, z, m, rz = 0) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    b.position.set(x, y, z); b.rotation.z = rz; g.add(b);
    return b;
  }
  // 前臂不跟着工具一起转：拳头握着工具随挥动转动，前臂每帧从手腕指向画面右下角外的手肘（固定点），
  // 这样挥剑、挥镐时胳膊像是从肩膀伸出来的，不会整根横扫过画面。
  const ARM = materials?[materials.forearmSkin,materials.forearmSleeve,materials.forearmCuff]:[mat('#e8c39e'),mat('#d9d2bd'),mat('#b3a98c')]; // 单独的材质：拳头的材质会被 hand-motion.js 标成带骨骼的，前臂没有骨骼
  const ELBOW = new THREE.Vector3(0.95, -1.3, -0.15), DOWN = new THREE.Vector3(0, -1, 0), wrist = new THREE.Vector3(), dir = new THREE.Vector3();
  let forearm = null;
  function update(hand, holder) { // game.js 每帧调用
    if (!hand || !holder.children.length || !hand.userData.wristPoint) { if (forearm) forearm.visible = false; return; }
    if (!forearm) {
      forearm = new THREE.Group();
      box(forearm, 0.1, 0.24, 0.085, 0, -0.06, 0, ARM[0]);       // 手腕和一小截前臂
      box(forearm, 0.128, 0.06, 0.11, 0, -0.2, 0, ARM[2]);       // 袖口
      box(forearm, 0.118, 1.6, 0.1, 0, -1.03, 0, ARM[1]);        // 袖子，一直伸到画面外
    }
    if (forearm.parent !== holder.parent) holder.parent.add(forearm);
    holder.updateMatrixWorld(true);
    wrist.set(...hand.userData.wristPoint);
    if(hand.userData.wrist){const joint=hand.userData.wrist;wrist.sub(joint.position).applyQuaternion(joint.quaternion).add(joint.position);}
    hand.localToWorld(wrist);
    forearm.visible = true; forearm.position.copy(wrist); forearm.scale.copy(holder.scale);
    forearm.quaternion.setFromUnitVectors(DOWN, dir.copy(ELBOW).sub(wrist).normalize());
  }
  function paint(skin, sleeve) { // 跟着角色形象换色（avatar.js 调用）：肤色、袖子（穿了护甲就是护甲的颜色）
    SKIN.color.set(skin); SKIN2.color.set(skin).multiplyScalar(0.92);
    SLEEVE.color.set(sleeve); CUFF.color.set(sleeve).multiplyScalar(0.8);
    ARM[0].color.set(skin); ARM[1].color.set(sleeve); ARM[2].color.set(sleeve).multiplyScalar(0.8);
  }
  window.FirstPersonHand = { paint, update, create(carry = false, shaftRadius = 0.035) {
    const group = new THREE.Group();
    if (carry) { // 摊开的手掌托着方块：掌心朝上，四指向前并微微翘起，拇指在右侧
      box(group, 0.17, 0.036, 0.15, 0.03, 0.098, 0.055, SKIN);
      for (let i = 0; i < 4; i++) {
        const x = -0.038 + i * 0.038;
        box(group, 0.032, 0.03, 0.085, x, 0.1, 0.17, SKIN2);
        box(group, 0.032, 0.05, 0.03, x, 0.125, 0.215, SKIN2);
      }
      box(group, 0.036, 0.036, 0.085, 0.125, 0.112, 0.06, SKIN2);
      group.userData.wristPoint = [0.09, 0.09, 0.0];
      return group;
    }
    // 握拳：手背在握柄右侧；四指从后面绕到左边，指尖回到正面；拇指横在正面、食指上方
    const shapeAt=y=>{
      let rx,rz;
      if(shaftRadius===.039)rx=rz=.032+y/.65*.010;
      else if(shaftRadius===.031)rx=rz=.025+y/.55*.008;
      else if(shaftRadius===.038){const r=.028+(y+.01)/.73*.008,c=Math.cos(.3),sn=Math.sin(.3);rx=r*Math.hypot(c,1.18*sn);rz=r*Math.hypot(sn,1.18*c);}
      else rx=rz=.029+Math.min(1,y/.24)*.006;
      return [rx+.0015,rz+.0015];
    };
    const [palmX,palmZ]=shapeAt(.15);
    box(group,.060,.146,2*palmZ+.043,palmX+.030,.139,-.005,SKIN);
    // Shorter little finger; each joint follows the shaft taper at its own height.
    for(const [y,T,H] of [[.088,.027,.023],[.120,.030,.025],[.153,.032,.027],[.187,.030,.025]]){
      const [rx,rz]=shapeAt(y);
      box(group,2*rx+T,H,T,-T/2,y,-(rz+T/2),SKIN2);
      box(group,T,H,2*rz+2*T,-(rx+T/2),y,0,SKIN2);
      box(group,rx+T+.006,H,T,(.006-rx-T)/2,y,rz+T/2,SKIN2);
    }
    // Below the sword guard, opposing the index finger rather than perched on the hilt.
    const [tx,tz]=shapeAt(.201);
    box(group,tx+.054,.027,.031,(tx+.048)/2,.198,tz+.017,SKIN2,-.12);
    group.userData.wristPoint = [palmX + 0.045, 0.092, 0.015];
    return group;
  } };
})();
