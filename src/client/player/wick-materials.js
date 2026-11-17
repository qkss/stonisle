// Small cached textures for Wick's handmade lantern materials.
(() => {
  // Thin curved leaf surface; silhouette comes from geometry, not a rectangular card.
  window.WickLeafGeometry=(length,width,side=1)=>{
    const pos=[],uv=[],idx=[],segments=12;
    for(let i=0;i<=segments;i++){
      const t=i/segments,span=Math.pow(Math.sin(Math.PI*t),.8)*width*.5;
      for(let j=-1;j<=1;j++){
        pos.push(side*length*t,.035*t+span*j,.018*Math.sin(Math.PI*t)*(1-Math.abs(j))+.025*t*t);
        uv.push(t,(j+1)*.5);
      }
      if(i<segments)for(let j=0;j<2;j++){const a=i*3+j;idx.push(a,a+3,a+1,a+1,a+3,a+4);}
    }
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;
  };
  let cached;
  window.WickMaterials=()=>{
    if(cached)return cached;
    let seed=741;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
    const texture=draw=>{const canvas=document.createElement('canvas');canvas.width=canvas.height=256;draw(canvas.getContext('2d'));const map=new THREE.CanvasTexture(canvas);map.anisotropy=4;return map;};
    const paper=texture(c=>{
      const glow=c.createRadialGradient(128,114,12,128,128,170);glow.addColorStop(0,'#fff3c9');glow.addColorStop(.55,'#e9c98b');glow.addColorStop(1,'#ad7e43');c.fillStyle=glow;c.fillRect(0,0,256,256);
      for(let i=0;i<2600;i++){const x=random()*256,y=random()*256;c.strokeStyle=random()<.5?'rgba(107,73,34,.10)':'rgba(255,252,220,.27)';c.lineWidth=.4+random()*.8;c.beginPath();c.moveTo(x,y);c.lineTo(x+(random()-.5)*12,y+2+random()*13);c.stroke();}
      c.strokeStyle='#88663880';c.lineWidth=2;c.strokeRect(12,12,232,232);c.strokeStyle='#fff1be80';c.lineWidth=1;c.strokeRect(16,16,224,224);
    });
    const wood=texture(c=>{
      c.fillStyle='#644225';c.fillRect(0,0,256,256);
      for(let i=0;i<360;i++){const y=random()*256;c.strokeStyle=i%3?'rgba(29,16,9,.28)':'rgba(210,157,89,.3)';c.lineWidth=.3+random()*2;c.beginPath();c.moveTo(0,y);for(let x=0;x<=256;x+=8)c.lineTo(x,y+Math.sin(x*.025+i)*2.2);c.stroke();}
      const light=c.createLinearGradient(0,0,0,256);light.addColorStop(0,'#e2b77477');light.addColorStop(.12,'#ffffff00');light.addColorStop(.8,'#00000000');light.addColorStop(1,'#100b0788');c.fillStyle=light;c.fillRect(0,0,256,256);
    });
    const wing=texture(c=>{
      const green=c.createLinearGradient(0,0,0,256);green.addColorStop(0,'#638747');green.addColorStop(.48,'#c4d18a');green.addColorStop(.53,'#a7bf6c');green.addColorStop(1,'#446c38');
      c.fillStyle=green;c.fillRect(0,0,256,256);
      for(let i=0;i<1900;i++){c.fillStyle=i%2?'#254d2420':'#f5f0b024';c.fillRect(random()*256,random()*256,1,1);}
      c.strokeStyle='#e2dfa0';c.lineWidth=3;c.beginPath();c.moveTo(0,128);c.quadraticCurveTo(130,123,256,128);c.stroke();
      for(let x=24;x<245;x+=25)for(const side of [-1,1]){
        c.strokeStyle='#d7dc9b99';c.lineWidth=1.5;c.beginPath();c.moveTo(x,128);c.quadraticCurveTo(x+20,128+side*32,x+36,128+side*105);c.stroke();
        c.strokeStyle='#294e3444';c.lineWidth=.6;c.beginPath();c.moveTo(x+4,128);c.lineTo(x+39,128+side*104);c.stroke();
      }
    });
    cached={
      paper:new THREE.MeshPhongMaterial({map:paper,bumpMap:paper,bumpScale:.002,shininess:8,specular:0x54472e,emissive:0xe7b758,emissiveMap:paper,emissiveIntensity:.3}),
      wood:new THREE.MeshPhongMaterial({map:wood,bumpMap:wood,bumpScale:.003,shininess:28,specular:0x8c7452}),
      wing:new THREE.MeshPhongMaterial({map:wing,bumpMap:wing,bumpScale:.001,shininess:24,specular:0x72854c,emissive:0x778b39,emissiveIntensity:.16,side:THREE.DoubleSide}),
      eye:new THREE.MeshPhongMaterial({color:0x241b12,shininess:100,specular:0xffe9c0}),
      glint:new THREE.MeshBasicMaterial({color:0xfff4db}),
      stem:new THREE.MeshPhongMaterial({color:0x687448,shininess:10})
    };return cached;
  };
})();
