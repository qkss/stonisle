// Animated flow-aligned dual wave layers. Reuses the selected pack's water tile.
(() => {
  const clock={value:0};
  window.WaterMaterial={update(dt){clock.value+=dt;},decorate(material,tiles){
    material.side=THREE.DoubleSide;
    material.onBeforeCompile=shader=>{
      shader.uniforms.waterTime=clock;
      const varying='varying vec3 vWaterPosition; varying vec3 vWaterNormal; varying vec4 vWaterFlow; varying float vWaterFoam;\n';
      shader.vertexShader='attribute vec4 waterFlow; attribute float waterFoam;\n'+varying+shader.vertexShader;
      shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvWaterPosition=(modelMatrix*vec4(position,1.0)).xyz;vWaterNormal=normal;vWaterFlow=waterFlow;vWaterFoam=waterFoam;');
      shader.fragmentShader='uniform float waterTime;\n'+varying+shader.fragmentShader;
      shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`
        #ifdef USE_MAP
          float waterfall=step(0.5,vWaterFlow.z);
          float side=1.0-step(0.5,abs(vWaterNormal.y));
          vec2 drift=vWaterFlow.xy;
          float speed=length(drift);
          vec2 p=vWaterPosition.xz-drift*waterTime*0.55;
          if(side>0.5) p=vec2(vWaterPosition.x+vWaterPosition.z,vWaterPosition.y+waterTime*(0.22+waterfall*1.35));
          vec2 a=fract(p*0.65+vec2(waterTime*0.025,0.0));
          vec2 b=fract(p*1.13+vec2(-waterTime*0.035,waterTime*0.02));
          vec3 texA=mapTexelToLinear(texture2D(map,vec2((5.01+a.x*0.98)/${tiles}.0,0.01+a.y*0.98))).rgb;
          vec3 texB=mapTexelToLinear(texture2D(map,vec2((5.01+b.x*0.98)/${tiles}.0,0.01+b.y*0.98))).rgb;
          float deep=clamp((vWaterFlow.w-1.0)/5.0,0.0,1.0);
          vec3 base=mix(vec3(0.19,0.56,0.56),vec3(0.035,0.19,0.34),deep);
          float waves=sin(p.x*8.0+sin(p.y*6.0+waterTime*0.6))*sin(p.y*10.0-waterTime*0.45);
          float ripple=smoothstep(0.65,0.98,waves)*(0.045+speed*0.025);
          float streak=sin(p.x*35.0+sin(p.y*5.0))*0.025*waterfall*side;
          float froth=vWaterFoam*smoothstep(0.55,0.95,waves)*(side>0.5?1.0-smoothstep(0.05,0.32,fract(vWaterPosition.y)):0.5);
          vec3 waterColor=base*0.75+(texA+texB)*0.23+vec3(ripple+streak);
          diffuseColor.rgb*=mix(waterColor,vec3(0.83,0.94,0.94),froth*0.75);
          diffuseColor.a*=mix(0.72,1.0,deep);
        #endif
      `);
    };
    material.customProgramCacheKey=()=>`flow-water-${tiles}-v1`;material.needsUpdate=true;
  }};
})();
