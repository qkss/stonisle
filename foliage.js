// Alpha-tested branch cards; identical vertex wind in color and shadow passes.
(() => {
  // One world-space wind field for leaves, grass, and both shadow passes.
  const windShader=`
    uniform float vegetationTime;
    attribute vec2 leafWind;
    const vec2 windDir=vec2(.848,.530);
    float vegetationBend(vec3 worldPosition,float phase){
      float downwind=dot(worldPosition.xz,windDir);
      float gust=.5+.5*sin(vegetationTime*1.65-downwind*.48);
      float swell=.5+.5*sin(vegetationTime*.57-downwind*.14);
      float flutter=sin(vegetationTime*4.2-downwind*1.1+phase)*.008;
      return .018+gust*(.075+swell*.055)+flutter;
    }
  `;
  window.Foliage=class {
    constructor(atlas,tiles,onLoad){
      this.time={value:0};this.natural={value:1};this.shadowClock=0;
      const placeholder=document.createElement('canvas');placeholder.width=placeholder.height=1;
      const map=new THREE.CanvasTexture(placeholder);this.map=map;map.anisotropy=4;
      const image=new Image();image.onload=()=>{
        const canvas=document.createElement('canvas');canvas.width=canvas.height=512;
        canvas.getContext('2d').drawImage(image,0,0,512,512);map.image=canvas;map.needsUpdate=true;onLoad();
      };image.onerror=()=>console.warn('Leaf cluster texture failed to load');
      image.src='texture-packs/natural-v1/leaf-cluster.png';
      this.basic=new THREE.MeshBasicMaterial({map,vertexColors:true,alphaTest:.45,side:THREE.DoubleSide});
      this.lit=new THREE.MeshLambertMaterial({map,vertexColors:true,alphaTest:.45,side:THREE.DoubleSide});
      this.depth=new THREE.MeshDepthMaterial({map,alphaTest:.45,side:THREE.DoubleSide,depthPacking:THREE.RGBADepthPacking});
      for(const [i,material]of [this.basic,this.lit,this.depth].entries()){
        material.onBeforeCompile=shader=>{
          shader.uniforms.vegetationTime=this.time;shader.uniforms.leafNatural=this.natural;shader.uniforms.leafAtlas={value:atlas};
          shader.vertexShader=windShader+shader.vertexShader;
          shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
            vec3 leafWorld=(modelMatrix*vec4(position,1.0)).xyz;
            float bend=vegetationBend(leafWorld,leafWind.y)*leafWind.x*1.1;
            transformed.xz+=windDir*bend;
            transformed.y-=bend*.12;
          `);
          if(i<2){
            shader.fragmentShader='uniform float leafNatural;uniform sampler2D leafAtlas;\n'+shader.fragmentShader;
            shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
              #ifdef USE_MAP
                if(leafNatural<.5){
                  vec4 packLeaf=texture2D(leafAtlas,vec2((8.01+vUv.x*.98)/${tiles}.0,.01+vUv.y*.98));
                  diffuseColor.rgb=diffuse*mapTexelToLinear(packLeaf).rgb;
                  diffuseColor.a*=packLeaf.a;
                }
              #endif
            `);
          }else{
            shader.fragmentShader='uniform float leafNatural;uniform sampler2D leafAtlas;\n'+shader.fragmentShader;
            shader.fragmentShader=shader.fragmentShader.replace('#include <alphatest_fragment>',`
              #ifdef USE_MAP
                if(leafNatural<.5)diffuseColor.a*=texture2D(leafAtlas,vec2((8.01+vUv.x*.98)/${tiles}.0,.01+vUv.y*.98)).a;
              #endif
              #include <alphatest_fragment>
            `);
          }
        };
        material.customProgramCacheKey=()=>`foliage-shared-wind-v3-${i}`;
      }
      this.grassBasic=new THREE.MeshBasicMaterial({map:atlas,vertexColors:true,side:THREE.DoubleSide});
      this.grassLit=new THREE.MeshLambertMaterial({map:atlas,vertexColors:true,side:THREE.DoubleSide});
      this.grassDepth=new THREE.MeshDepthMaterial({side:THREE.DoubleSide,depthPacking:THREE.RGBADepthPacking});
      for(const [i,material]of [this.grassBasic,this.grassLit,this.grassDepth].entries()){
        material.onBeforeCompile=shader=>{
          shader.uniforms.vegetationTime=this.time;
          shader.vertexShader=windShader+shader.vertexShader;
          shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
            vec3 grassWorld=(modelMatrix*vec4(position,1.0)).xyz;
            float bend=vegetationBend(grassWorld,leafWind.y)*leafWind.x;
            transformed.xz+=windDir*bend;
            transformed.y-=bend*.16;
          `);
        };
        material.customProgramCacheKey=()=>`grass-shared-wind-v3-${i}`;
      }
    }
    setPack(natural){this.natural.value=natural?1:0;}
    update(dt){this.time.value+=dt;this.shadowClock+=dt;if(this.shadowClock>.25){this.shadowClock=0;return true;}return false;}
  };
})();
