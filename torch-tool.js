(() => {
  const clock={value:0};
  const wood=new THREE.MeshLambertMaterial({color:0x966b3e}),char=new THREE.MeshLambertMaterial({color:0x30251b});
  const rope=new THREE.MeshLambertMaterial({color:0x8e734e});
  function fireMaterial(opacity){
    const m=new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity,depthWrite:false,side:THREE.FrontSide});
    m.onBeforeCompile=s=>{s.uniforms.torchTime=clock;s.vertexShader='uniform float torchTime; varying vec3 fireNormal; varying vec3 fireView; varying float fireHeight;\n'+s.vertexShader;s.vertexShader=s.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
      float tip=position.y/.28;
      transformed.x+=sin(torchTime*7.0+tip*4.0)*.022*tip*tip;
      transformed.z+=sin(torchTime*5.3+tip*5.0)*.015*tip*tip;
      transformed.y*=1.0+sin(torchTime*9.0+tip)*.055*tip;
      fireNormal=normalize(normalMatrix*normal);
      fireView=normalize(-(modelViewMatrix*vec4(transformed,1.0)).xyz);
      fireHeight=tip;
    `);
    s.fragmentShader='varying vec3 fireNormal; varying vec3 fireView; varying float fireHeight;\n'+s.fragmentShader;
    s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
      float edge=pow(abs(dot(normalize(fireNormal),normalize(fireView))),.85);
      diffuseColor.a*=smoothstep(.0,.6,edge)*(1.0-smoothstep(.65,1.0,fireHeight))*.8;
    `);
    };m.customProgramCacheKey=()=>`torch-fire-soft-v2-${opacity}`;return m;
  }
  const outer=fireMaterial(.65),inner=fireMaterial(.9);
  function tongue(height,radius,core){
    const pos=[],col=[],idx=[],rings=12,sides=12;
    for(let i=0;i<=rings;i++){
      const t=i/rings,r=radius*Math.pow(Math.sin(Math.PI*(.13+t*.87)),.85)*(1-t*.5);
      for(let j=0;j<sides;j++){
        const a=j/sides*Math.PI*2;pos.push(Math.cos(a)*r+.027*t*t,height*t,Math.sin(a)*r*.72);
        const c=new THREE.Color();c.setRGB(1,core?.94-t*.22:.52+t*.27,core?.56-t*.38:.06+t*.08);col.push(c.r,c.g,c.b);
        if(i<rings){const v=i*sides+j,n=i*sides+(j+1)%sides;idx.push(v,v+sides,n,n,v+sides,n+sides);}
      }
    }
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();return g;
  }
  const sparkMaterial=new THREE.ShaderMaterial({
    uniforms:{sparkTime:clock},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
    vertexShader:`uniform float sparkTime; varying float life; void main(){
      float age=fract(sparkTime*(.55+position.z*.3)+position.x);life=sin(age*3.14159)*(1.0-age);
      vec3 p=vec3((position.y-.5)*.09+sin(age*7.0+position.z*6.28)*age*.055,age*.43,(position.z-.5)*.07);
      vec4 mv=modelViewMatrix*vec4(p,1.0);gl_Position=projectionMatrix*mv;gl_PointSize=clamp((1.3+position.y)*5.0/max(.3,-mv.z),1.0,6.0);
    }`,
    fragmentShader:`varying float life; void main(){float r=length(gl_PointCoord-.5)*2.0;float a=(1.0-smoothstep(.1,1.0,r))*life;gl_FragColor=vec4(1.0,.72,.22,a*1.4);}`
  });
  function create(natural,sparksEnabled=true){
    const group=new THREE.Group();
    const shaft=new THREE.Mesh(new THREE.CylinderGeometry(.033,.025,.55,10),natural&&NaturalTools.material(0)||wood);shaft.position.y=.275;group.add(shaft);
    const head=new THREE.Mesh(new THREE.CylinderGeometry(.055,.043,.13,10),natural&&NaturalTools.material(5)||char);head.position.y=.535;group.add(head);
    for(let i=0;i<5;i++){const ring=new THREE.Mesh(new THREE.TorusGeometry(.047+i*.001,.005,5,16),rope);ring.rotation.x=Math.PI/2;ring.position.y=.49+i*.017;group.add(ring);}
    const fire=new THREE.Group();fire.position.y=.57;group.add(fire);
    const shell=new THREE.Mesh(tongue(.28,.062,false),outer);shell.renderOrder=1;fire.add(shell);
    const heart=new THREE.Mesh(tongue(.17,.034,true),inner);heart.position.z=.018;heart.renderOrder=2;fire.add(heart);
    const side=new THREE.Mesh(tongue(.19,.026,false),outer);side.position.set(-.036,0,-.006);side.rotation.z=.3;side.renderOrder=1;fire.add(side);
    if(sparksEnabled){
    const sparksGeo=new THREE.BufferGeometry(),seeds=[];
    for(let i=0;i<9;i++)seeds.push(i*.173%1,i*.317%1,i*.719%1);
    sparksGeo.setAttribute('position',new THREE.Float32BufferAttribute(seeds,3));
    const sparks=new THREE.Points(sparksGeo,sparkMaterial);sparks.position.y=.65;sparks.frustumCulled=false;sparks.renderOrder=3;group.add(sparks);
    }
    return group;
  }
  window.TorchTool={create,update(dt){clock.value+=dt;}};
})();
