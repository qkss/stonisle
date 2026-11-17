// Slow world-space convection and emissive fissures, isolated to lava's atlas tile.
(() => {
  const clock={value:0};
  window.LavaMaterial={update(dt){clock.value+=Math.min(Math.max(dt,0),.1);},decorate(material,tiles){
    const previous=material.onBeforeCompile,oldKey=material.customProgramCacheKey.bind(material),key=oldKey();
    material.onBeforeCompile=function(shader,renderer){
      previous.call(this,shader,renderer);shader.uniforms.lavaTime=clock;
      const varying='varying vec3 vLavaWorld; varying vec3 vLavaNormal;\n';
      shader.vertexShader=varying+shader.vertexShader;
      shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvLavaWorld=(modelMatrix*vec4(position,1.0)).xyz;vLavaNormal=normal;');
      shader.fragmentShader='uniform float lavaTime;\n'+varying+shader.fragmentShader;
      shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
        float lavaMask=0.0;vec3 lavaSurface=vec3(0.0);vec3 lavaFire=vec3(0.0);
        #ifdef USE_MAP
        lavaMask=step(82.0,vUv.x*${tiles}.0)*step(vUv.x*${tiles}.0,83.0);
        if(lavaMask>.5){
          vec2 p=vLavaWorld.xz;
          if(abs(vLavaNormal.y)<.5)p=vec2(abs(vLavaNormal.x)>.5?vLavaWorld.z:vLavaWorld.x,vLavaWorld.y);
          float t=lavaTime;
          p+=abs(vLavaNormal.y)>.5?vec2(-t*.021,t*.013):vec2(-t*.009,t*.036);
          vec2 curl=vec2(sin(p.y*2.4+t*.13),cos(p.x*2.1-t*.11))*.17;
          vec2 q=p+curl;
          float ridge=abs(sin(q.x*5.2+sin(q.y*4.1)*1.35)+cos(q.y*5.8+sin(q.x*3.1)));
          float fissure=1.0-smoothstep(.08,.72,ridge);
          float hot=1.0-smoothstep(.0,.23,ridge);
          float pulse=.78+.12*sin(t*.78+q.x*2.2)+.10*sin(t*1.13-q.y*3.1);
          vec2 a=fract(q*.28);
          vec3 stone=mapTexelToLinear(texture2D(map,vec2((82.01+a.x*.98)/${tiles}.0,.01+a.y*.98))).rgb;
          float crust=.045+.022*sin(q.x*12.0)*sin(q.y*9.0);
          lavaSurface=vec3(.19+crust*1.3,.029+crust*.42,.008+crust*.15)+stone*.055;
          lavaFire=mix(vec3(1.0,.14,.012),vec3(1.25,.70,.15),hot)*fissure*pulse;
          diffuseColor.rgb=lavaSurface;
        }
        #endif
      `);
      // Emission is independent of sun/sky lighting, but still passes through fog and tone mapping.
      shader.fragmentShader=shader.fragmentShader.replace('#include <output_fragment>', 'if(lavaMask>.5)outgoingLight=outgoingLight*.35+lavaSurface*.65+lavaFire;\n#include <output_fragment>');
      shader.fragmentShader=shader.fragmentShader.replace('gl_FragColor = vec4( outgoingLight, diffuseColor.a );','if(lavaMask>.5)outgoingLight=outgoingLight*.35+lavaSurface*.65+lavaFire;\ngl_FragColor = vec4( outgoingLight, diffuseColor.a );');
    };
    material.customProgramCacheKey=()=>key+'-molten-convection-v1';material.needsUpdate=true;
  }};
})();
