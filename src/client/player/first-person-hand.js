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
  let forearmSkin = null;
  let forearm = null, sleeveMesh = null, cuffMesh = null, currentStyle = null;
  const silk = new THREE.MeshLambertMaterial({color:0xffffff,side:THREE.DoubleSide});
  const gold = new THREE.MeshLambertMaterial({color:0xc9a34e,side:THREE.DoubleSide});
  const textureCache = new Map();
  const softSkin=new THREE.MeshPhongMaterial({color:0xe4c4b2,specular:0x060403,shininess:3,vertexColors:true});
  const softFinger=softSkin.clone(), softArm=softSkin.clone();
  // Broad pigment gradients only: keep the anime skin smooth, without pore noise.
  function skinColors(geo, tint){
    const p=geo.attributes.position,colors=new Float32Array(p.count*3);
    for(let i=0;i<p.count;i++)colors.set(tint(i,p),i*3);
    geo.setAttribute('color',new THREE.BufferAttribute(colors,3));
  }
  function rounded(g,size,at,material){
    const geo=new THREE.SphereGeometry(1,20,14),p=geo.attributes.position;
    // A rounded palm, flattened across its thickness, with no hard cube corners.
    for(let i=0;i<p.count;i++)for(let a=0;a<3;a++){const v=p.array[i*3+a];p.array[i*3+a]=Math.sign(v)*Math.pow(Math.abs(v),.60)*size[a]/2;}
    skinColors(geo,(i,p)=>{
      const edge=Math.min(1,Math.abs(p.getX(i)/size[0])*2),warm=.5+.5*p.getY(i)/(size[1]/2);
      return [.96-.035*edge,.94-.055*edge-.025*warm,.92-.06*edge-.025*warm];
    });
    geo.computeVertexNormals();const m=new THREE.Mesh(geo,material);m.position.set(...at);g.add(m);return m;
  }
  function finger(g,points,r){
    const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)),false,'centripetal');
    const rows=40,sides=12,geo=new THREE.TubeGeometry(curve,rows,r,sides,false);
    const pos=geo.attributes.position,frames=curve.computeFrenetFrames(rows,false);
    const bump=(t,c,w)=>Math.exp(-(((t-c)/w)**2));
    for(let j=0;j<=rows;j++){
      const t=j/rows,center=curve.getPointAt(t);
      // Broad proximal phalanx, two understated knuckles, then a tapered fingertip.
      let width=1.04-.34*t+.12*bump(t,.38,.065)+.10*bump(t,.72,.055);
      width-=.045*bump(t,.45,.025)+.035*bump(t,.79,.025);
      const cap=t>.91?Math.sqrt(Math.max(.001,1-((t-.91)/.09)**2)):1;
      for(let k=0;k<=sides;k++){
        const a=k/sides*Math.PI*2;
        const v=center.clone().addScaledVector(frames.normals[j],-Math.cos(a)*r*width*cap)
          .addScaledVector(frames.binormals[j],Math.sin(a)*r*width*.84*cap);
        pos.setXYZ(j*(sides+1)+k,v.x,v.y,v.z);
      }
    }
    skinColors(geo,(i)=>{
      const t=Math.floor(i/(sides+1))/rows,a=(i%(sides+1))/sides*Math.PI*2;
      const pink=Math.min(1,.75*bump(t,.38,.10)+.60*bump(t,.72,.085)+.25*bump(t,.93,.08));
      const shade=.035*(.5+.5*Math.sin(a));
      return [.97-shade,.95-shade-.105*pink,.93-shade-.075*pink];
    });
    geo.computeVertexNormals();g.add(new THREE.Mesh(geo,softFinger));
    rounded(g,[r*1.9,r*1.75,r*1.9],points[0],softFinger);
  }
  function slimHand(carry,shaftRadius){
    const g=new THREE.Group();
    if(carry){
      rounded(g,[.128,.035,.125],[.035,.10,.06],softSkin);
      for(let i=0;i<4;i++){const x=-.013+i*.031,len=[.085,.105,.098,.075][i];finger(g,[[x,.10,.10],[x,.11,.14],[x,.13,.10+len]],.010);}
      finger(g,[[.086,.10,.045],[.107,.11,.07],[.106,.13,.10]],.012);
      g.userData.wristPoint=[.065,.085,.015];return g;
    }
    const radiusAt=y=>shaftRadius===.039?.032+y/.65*.010:shaftRadius===.031?.025+y/.55*.008:shaftRadius===.038?.034+y*.012:.029+Math.min(1,y/.24)*.006;
    const r=radiusAt(.14);
    rounded(g,[.045,.126,2*r+.028],[r+.020,.138,0],softSkin);
    for(const [i,y] of [.100,.124,.149,.174].entries()){
      const rad=[.0095,.011,.0115,.0105][i],R=radiusAt(y)+rad-.0005,pts=[];
      for(let j=0;j<=12;j++){
        const a=-.60-j/12*(Math.PI*1.48),c=Math.cos(a),z=Math.sin(a);
        pts.push([R*Math.sign(c)*Math.sqrt(Math.abs(c)),y+.002*Math.sin(j/12*Math.PI)-.005*Math.pow(j/12,3),R*Math.sign(z)*Math.sqrt(Math.abs(z))]);
      }
      finger(g,pts,rad);
    }
    // Thumb emerges from the palm and rests diagonally across the index finger.
    finger(g,[[r+.030,.114,.022],[r+.025,.151,r+.014],[.025,.179,r+.022],[.003,.166,r+.020]],.013);
    g.userData.wristPoint=[r+.027,.085,.008];return g;
  }

  // Open, thin cloth tube: wider at the wrist, narrowing towards the elbow.
  function bellGeometry(trim=false){
    const p=[],uv=[],indices=[],rows=trim?2:12,cols=24;
    for(let j=0;j<=rows;j++){
      const t=j/rows, k=trim?t*.018:t, y=-.075-k*1.5;
      const radius=.072+.080*Math.pow(1-k,2);
      for(let i=0;i<=cols;i++){
        const a=i/cols*Math.PI*2, fold=1+.045*Math.cos(a*6)*(1-k);
        p.push(Math.cos(a)*radius*fold,y+Math.sin(a)*.014*(1-k),Math.sin(a)*radius*.85*fold);
        uv.push(i/cols,1-k);
        if(j<rows&&i<cols){const n=j*(cols+1)+i;indices.push(n,n+1,n+cols+1,n+1,n+cols+2,n+cols+1);}
      }
    }
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return g;
  }
  function fitSleeve(){
    if(!sleeveMesh)return;
    const bell=!!currentStyle?.bell;
    if(forearmSkin){
      forearmSkin.geometry.dispose();
      forearmSkin.geometry=currentStyle?.slim?new THREE.CylinderGeometry(.033,.040,.20,16):new THREE.BoxGeometry(.1,.24,.085);
      if(currentStyle?.slim){
        forearmSkin.geometry.scale(1,1,.82);
        skinColors(forearmSkin.geometry,(i,p)=>{const k=Math.max(0,Math.min(1,(p.getY(i)+.1)/.2));return [.95,.92-.02*k,.89-.02*k];});
      }
      forearmSkin.material=currentStyle?.slim?softArm:ARM[0];
    }
    sleeveMesh.geometry.dispose();cuffMesh.geometry.dispose();
    sleeveMesh.geometry=bell?bellGeometry():new THREE.BoxGeometry(.118,1.6,.1);
    cuffMesh.geometry=bell?bellGeometry(true):new THREE.BoxGeometry(.128,.06,.11);
    sleeveMesh.position.set(0,bell?0:-1.03,0);cuffMesh.position.set(0,bell?0:-.2,0);
    sleeveMesh.material=bell?silk:ARM[1];cuffMesh.material=bell?gold:ARM[2];
    cuffMesh.scale.setScalar(bell?1.012:1);
  }
  function update(hand, holder) { // game.js 每帧调用
    if (!hand || !holder.children.length || !hand.userData.wristPoint) { if (forearm) forearm.visible = false; return; }
    if (!forearm) {
      forearm = new THREE.Group();
      forearmSkin=box(forearm, 0.1, 0.24, 0.085, 0, -0.06, 0, ARM[0]);       // 手腕和一小截前臂
      cuffMesh=box(forearm, 0.128, 0.06, 0.11, 0, -0.2, 0, ARM[2]);       // 袖口
      sleeveMesh=box(forearm, 0.118, 1.6, 0.1, 0, -1.03, 0, ARM[1]); fitSleeve();        // 袖子，一直伸到画面外
    }
    if (forearm.parent !== holder.parent) holder.parent.add(forearm);
    holder.updateMatrixWorld(true);
    wrist.set(...hand.userData.wristPoint);
    if(hand.userData.wrist){const joint=hand.userData.wrist;wrist.sub(joint.position).applyQuaternion(joint.quaternion).add(joint.position);}
    hand.localToWorld(wrist);
    forearm.visible = true; forearm.position.copy(wrist); forearm.scale.copy(holder.scale);
    forearm.quaternion.setFromUnitVectors(DOWN, dir.copy(ELBOW).sub(wrist).normalize());
  }
  function paint(skin, sleeve, style = null) { // 跟着角色形象换色（avatar.js 调用）：肤色、袖子（穿了护甲就是护甲的颜色）
    const changedShape=!!currentStyle?.slim!==!!style?.slim;
    currentStyle=style;
    silk.color.set(style?.atlas?'#ded8cf':sleeve); gold.color.set(style?.cuff||sleeve);
    let map=null;
    if(style?.atlas){
      const key=style.atlas+':'+style.tile;
      map=textureCache.get(key);
      if(!map){map=new THREE.TextureLoader().load(style.atlas);const tile=style.tile||0;map.repeat.set(.992/3,.992/2);map.offset.set((tile%3+.004)/3,(tile<3?.5:0)+.002);map.anisotropy=4;textureCache.set(key,map);}
    }
    silk.map=map;silk.needsUpdate=true;fitSleeve();
    for(const m of [softSkin,softFinger,softArm])m.color.set(skin);softFinger.color.multiplyScalar(.97);
    SKIN.color.set(skin); SKIN2.color.set(skin).multiplyScalar(0.92);
    SLEEVE.color.set(sleeve); CUFF.color.set(sleeve).multiplyScalar(0.8);
    ARM[0].color.set(skin); ARM[1].color.set(sleeve); ARM[2].color.set(sleeve).multiplyScalar(0.8);
    if(changedShape)window.dispatchEvent(new Event('hand-style-changed'));
  }
  window.FirstPersonHand = { paint, update, create(carry = false, shaftRadius = 0.035) {
    if(currentStyle?.slim)return slimHand(carry,shaftRadius);
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
