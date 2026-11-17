// Textured skin and dyed cloth for the shared pixel-hand silhouette.
(() => {
 const fallback=new THREE.DataTexture(new Uint8Array([185,145,120,255]),1,1,THREE.RGBAFormat);fallback.needsUpdate=true;
 const tiles=[{value:fallback},{value:fallback},{value:fallback}];
 const skin=new THREE.MeshPhongMaterial({color:0xe8c39e,specular:0x11100e,shininess:5});
 skin.extensions={derivatives:true};
 skin.onBeforeCompile=shader=>{
  shader.uniforms.handBack=tiles[0];shader.uniforms.handPalm=tiles[1];shader.uniforms.handJoint=tiles[2];
  shader.vertexShader='varying vec3 handSurface; varying vec3 handNormal;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nhandSurface=position;handNormal=normal;');
  shader.fragmentShader=`varying vec3 handSurface; varying vec3 handNormal;
   uniform sampler2D handBack;uniform sampler2D handPalm;uniform sampler2D handJoint;
   vec3 handSample(sampler2D tex,vec3 p,vec3 n){
    vec3 w=pow(abs(n),vec3(4.));w/=max(dot(w,vec3(1.)),.0001);
    return texture2D(tex,p.yz*2.4).rgb*w.x+texture2D(tex,p.xz*2.4).rgb*w.y+texture2D(tex,p.xy*2.4).rgb*w.z;
   }
  `+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`
   vec3 surfaceN=normalize(handNormal),radial=normalize(vec3(handSurface.x+.0001,0.,handSurface.z));
   float pad=smoothstep(.05,.55,-dot(surfaceN,radial))*smoothstep(.035,.085,handSurface.y);
   vec3 back=handSample(handBack,handSurface,surfaceN),palm=handSample(handPalm,handSurface,surfaceN),joint=handSample(handJoint,handSurface,surfaceN);
   vec3 detail=mix(mix(back,joint,.16),palm,pad);float micro=dot(detail,vec3(.299,.587,.114));
   // Restrained pigmentation: a scan's highlights are not deep physical skin relief.
   vec3 pigment=mix(vec3(.78,.77,.75),vec3(.87,.84,.80),pad);
   pigment+=(detail-vec3(micro))*.07+vec3(clamp(micro-mix(.49,.58,pad),-.065,.065)*.65);
   diffuseColor.rgb*=pigment;
  `);
  shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
   float height=micro*.000035;
   vec3 sx=dFdx(-vViewPosition),sy=dFdy(-vViewPosition),r1=cross(sy,normal),r2=cross(normal,sx);float det=dot(sx,r1);
   normal=normalize(abs(det)*normal-sign(det)*(dFdx(height)*r1+dFdy(height)*r2));
  `);
 };
 skin.customProgramCacheKey=()=> 'explorer-skin-anatomical-triplanar-v3';
 const fingers=skin.clone();fingers.onBeforeCompile=skin.onBeforeCompile;fingers.customProgramCacheKey=skin.customProgramCacheKey;fingers.extensions={derivatives:true};
 const cloth=new THREE.MeshPhongMaterial({color:0xffffff,shininess:2,specular:0x080907}),cuff=cloth.clone();cuff.color.setHex(0xc4bba2);
 for(const m of [cloth,cuff]){
  m.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#ifdef USE_MAP
   vec4 weave=texture2D(map,vUv);float thread=dot(weave.rgb,vec3(.299,.587,.114));
   diffuseColor.rgb*=vec3(clamp(.97+(thread-.32)*1.10,.64,1.25));
   #endif`);};m.customProgramCacheKey=()=> 'explorer-dyed-linen-v1';
 }
 const copySurface=source=>{const m=source.clone();m.onBeforeCompile=source.onBeforeCompile;m.customProgramCacheKey=source.customProgramCacheKey;m.extensions={derivatives:true};return m;};
 const forearmSkin=copySurface(skin),forearmSleeve=copySurface(cloth),forearmCuff=copySurface(cuff);
 new THREE.TextureLoader().load('assets/characters/explorer-materials.png',atlas=>{
  const img=atlas.image,w=img.width/2,h=img.height/2;
  for(const [slot,x,y] of [[0,0,0],[1,1,0],[2,1,1],[3,0,1]]){
   const c=document.createElement('canvas');c.width=c.height=512;c.getContext('2d').drawImage(img,x*w,y*h,w,h,0,0,512,512);
   const map=new THREE.CanvasTexture(c);map.wrapS=map.wrapT=THREE.RepeatWrapping;map.anisotropy=4;
   if(slot<3)tiles[slot].value=map;
   else {
    map.repeat.set(.45,.75);
    const cuffMap=map.clone();cuffMap.repeat.set(.30,.22);cuffMap.needsUpdate=true;
    for(const m of [cloth,cuff,forearmSleeve,forearmCuff]){const isCuff=m===cuff||m===forearmCuff;m.map=isCuff?cuffMap:map;m.bumpMap=m.map;m.bumpScale=isCuff?.00065:.0004;m.needsUpdate=true;}
   }
  }atlas.dispose();
 });
 window.ExplorerHandMaterials={skin,fingers,sleeve:cloth,cuff,forearmSkin,forearmSleeve,forearmCuff};
})();
