// Skylight is separate from local emitters: roofs block sky, not torch light.
(() => {
  // Blocks that never count as a roof: air, water, and everything Core marks see-through (leaves, glass, doors, panes, beds, plants).
  const see=typeof Core!=='undefined'?Core.see:b=>b===7||b===50; // Core is absent in the Node test
  const clear=b=>b===0||b===5||see(b);
  // 灯照亮周围是烘在网格里的（geometry() 里按距离给每个顶点一个 blockGlow），不靠实时光源，灯再多也不费显卡。
  // lampDay：露天的地方白天把这份灯光压到 25%，免得大太阳下灯旁边发白；有屋顶的地方（室内、洞里）始终全亮。
  const LAMP_DAY={value:1};
  function decorate(material,exposure=null){
    const previous=material.onBeforeCompile,cache=material.customProgramCacheKey.bind(material);
    material.onBeforeCompile=function(shader,renderer){
      previous.call(this,shader,renderer);
      if(exposure)shader.uniforms.skyAccess=exposure;
      shader.uniforms.lampDay=LAMP_DAY;
      shader.vertexShader=(exposure?'uniform':'attribute')+' float skyAccess; varying float vSkyAccess; varying float vBlockGlow;'+(exposure?'':'attribute float blockGlow;')+'\n'+shader.vertexShader;
      shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvSkyAccess=skyAccess;vBlockGlow='+(exposure?'0.0':'blockGlow')+';');
      const shade=chunk=>chunk.replaceAll('getAmbientLightIrradiance( ambientLightColor )','getAmbientLightIrradiance( ambientLightColor ) * skyAccess').replace('getDirectionalDirectLightIrradiance( directionalLights[ i ], geometry, directLight );','getDirectionalDirectLightIrradiance( directionalLights[ i ], geometry, directLight ); directLight.color *= skyAccess;');
      shader.vertexShader=shader.vertexShader.replace('#include <lights_lambert_vertex>',shade(THREE.ShaderChunk.lights_lambert_vertex));
      shader.fragmentShader='uniform float lampDay; varying float vSkyAccess; varying float vBlockGlow;\n'+shader.fragmentShader;
      shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\ntotalEmissiveRadiance+=diffuseColor.rgb*vBlockGlow*mix(1.0,lampDay,clamp(vSkyAccess,0.0,1.0));');
      const frag=THREE.ShaderChunk.lights_fragment_begin.replaceAll('getAmbientLightIrradiance( ambientLightColor )','getAmbientLightIrradiance( ambientLightColor ) * vSkyAccess').replace('getDirectionalDirectLightIrradiance( directionalLight, geometry, directLight );','getDirectionalDirectLightIrradiance( directionalLight, geometry, directLight ); directLight.color *= vSkyAccess;');
      shader.fragmentShader=shader.fragmentShader.replace('#include <lights_fragment_begin>',frag);
      // 柔和压亮：几盏灯加火把叠在一起时亮度会远超 1，整面墙变成一片白。最亮的通道超过 0.8 后平滑地压向 1，
      // 三个通道按同一个比例缩，颜色和贴图纹理都还在，只是不再刺眼。0.8 以下（绝大多数画面）完全不变。
      shader.fragmentShader=shader.fragmentShader.replace('#include <tonemapping_fragment>','{float peak=max(gl_FragColor.r,max(gl_FragColor.g,gl_FragColor.b));if(peak>0.8)gl_FragColor.rgb*=(0.8+0.2*(1.0-exp(-(peak-0.8)/0.2*0.35)))/peak;}\n#include <tonemapping_fragment>');
    };
    const key=cache();material.customProgramCacheKey=()=>key+'-sky-access-v3'+(exposure?'-object':'-terrain');
  }
  const LAMP=.8,GLOW=.7; // GLOW：灯烘在周围方块上的亮度上限（原来 .9）。 // 灯的实时光源：周围的方块已经有烘进网格的灯光了，这一份只用来照亮动物和手里的东西，不用太亮（原来 2.4）
  const HELD_TORCH=1.4,PLACED_TORCH=1.1; // 火把的亮度。原来都是 3.4，近处的浅色石头会被照得发白刺眼；想再亮或再暗改这两个数
  window.WorldLighting=class {
    constructor(scene,world){
      this.world=world;world.lighting=true;this.scene=scene;this.emitters=new Map();this.clock=0;this.shadowClock=0;this.lampChunks=new Map();
      this.torch=this.add('held-torch',{color:0xffb65e,intensity:0,range:12});
      this.torch.decay=1.25; // Broad, soft falloff keeps the floor and side walls readable.
      this.placed=Array.from({length:4},(_,i)=>this.add('placed-'+i,{intensity:0,range:7}));
      this.torch.castShadow=true;this.torch.shadow.mapSize.set(256,256);this.torch.shadow.camera.near=.1;this.torch.shadow.camera.far=12;this.torch.shadow.bias=-.002;this.torch.shadow.normalBias=.025;
    }
    add(id,{color=0xffbc70,intensity=1,range=7}={}){
      if(this.emitters.has(id))return this.emitters.get(id);
      const lamp=new THREE.PointLight(color,intensity,range,2);this.emitters.set(id,lamp);
      if(this.scene)this.scene.add(lamp);return lamp;
    }
    chunk(cx,cz){
      const data=this.world.chunk(cx,cz),positions=[];
      for(let i=data.indexOf(59);i>=0;i=data.indexOf(59,i+1))positions.push(new THREE.Vector3(cx*16+(i&15)+.5,(i>>8)+.5,cz*16+((i>>4)&15)+.5));
      this.lampChunks.set(cx+','+cz,positions);
    }
    drop(cx,cz){this.lampChunks.delete(cx+','+cz);}
    skyAt(x,y,z){
      for(let h=Math.max(0,Math.ceil(y));h<64;h++){const b=this.world.get(Math.floor(x),h,Math.floor(z));if(!clear(b))return .015;}
      return 1;
    }
    geometry(geo,cx,cz,solid=false){
      const p=geo.attributes.position,n=geo.attributes.normal,values=new Float32Array(p.count),roofs=new Map();
      for(let i=0;i<p.count;i++){
        const x=Math.floor(p.getX(i)+cx*16+n.getX(i)*.025),z=Math.floor(p.getZ(i)+cz*16+n.getZ(i)*.025),key=x+','+z;
        if(!roofs.has(key)){let roof=-1;for(let y=63;y>=0;y--){const b=this.world.get(x,y,z);if(!clear(b)){roof=y;break;}}roofs.set(key,roof);}
        values[i]=p.getY(i)+n.getY(i)*.025>=roofs.get(key)+1?1:.015;
      }
      geo.setAttribute('skyAccess',new THREE.BufferAttribute(values,1));
      const glow=new Float32Array(p.count);
      if(solid)for(let i=0;i<p.count;i+=4){let x=0,y=0,z=0;for(let j=0;j<4;j++){x+=p.getX(i+j)/4;y+=p.getY(i+j)/4;z+=p.getZ(i+j)/4;}
        if(this.world.get(Math.floor(x+cx*16-n.getX(i)*.02),Math.floor(y-n.getY(i)*.02),Math.floor(z+cz*16-n.getZ(i)*.02))===59)glow.fill(.9,i,i+4);
      }
      // 灯光：本区块和周围八个区块里的灯，8 格内按距离衰减。ponytail: 不算遮挡，灯光会透过墙；要挡光得做逐格的光照传播
      if(this.world.chunk){
        const lamps=[];
        for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++){const d=this.world.chunk(cx+dx,cz+dz);for(let i=d.indexOf(59);i>=0;i=d.indexOf(59,i+1))lamps.push((i&15)+dx*16+.5,(i>>8)+.5,((i>>4)&15)+dz*16+.5);}
        if(lamps.length)for(let i=0;i<p.count;i++){
          const x=p.getX(i),y=p.getY(i),z=p.getZ(i);let best=glow[i];
          for(let j=0;j<lamps.length;j+=3){const q=(x-lamps[j])**2+(y-lamps[j+1])**2+(z-lamps[j+2])**2;if(q<64){const k=1-Math.sqrt(q)/8;best=Math.max(best,GLOW*k*Math.sqrt(k));}}
          glow[i]=best;
        }
      }
      geo.setAttribute('blockGlow',new THREE.BufferAttribute(glow,1));
    }
    torchScale(position,daylight){
      const sky=Math.max(0,Math.min(1,Number.isFinite(daylight)?daylight:0))*this.skyAt(position.x,position.y,position.z);
      const t=Math.max(0,Math.min(1,(sky-.18)/.62));
      return 1-.9*t*t*(3-2*t); // Sunlit outdoors: 10%; caves and night retain full light.
    }
    update(dt,on,position,daylight){
      this.clock+=dt;this.torch.position.copy(position);
      LAMP_DAY.value=1-.75*Math.max(0,Math.min(1,Number.isFinite(daylight)?daylight:0));
      const nearby=[...this.lampChunks.values()].flat().filter(p=>p.distanceToSquared(position)<324).sort((a,b)=>a.distanceToSquared(position)-b.distanceToSquared(position));
      this.placed.forEach((lamp,i)=>{const source=nearby[i],torch=source&&source.torch;lamp.intensity=source?(torch?PLACED_TORCH*this.torchScale(source,daylight)*(1+.045*Math.sin(this.clock*7+i)+.025*Math.sin(this.clock*13.7+i)):LAMP):0;lamp.distance=torch?14:7;lamp.decay=torch?1:2;if(source)lamp.position.copy(source);});
      this.torch.intensity=on?HELD_TORCH*this.torchScale(position,daylight)*(1+.045*Math.sin(this.clock*7)+.025*Math.sin(this.clock*13.7)+.018*Math.sin(this.clock*3.2)):0;
      if(on && this.clock-this.shadowClock>.12){this.shadowClock=this.clock;return true;}return false;
    }
    static decorate(material){decorate(material);}
    static object(material){const exposure={value:1};decorate(material,exposure);return exposure;}
  };
})();
