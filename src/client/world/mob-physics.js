// Model-sized collision and ray hits, independent of Three.js.
(function(root){
  const pass=typeof Core!=='undefined'&&Core.PASS; // open doors and plants can be walked through (Core is absent in the Node tests)
  const solid=id=>id!==0&&id!==5&&!(pass&&pass.has(id)),EPS=1e-5;
  function box(m){
    const b=m.bounds,c=Math.cos(m.a),s=Math.sin(m.a),xs=[],zs=[];
    for(const x of [b.min[0],b.max[0]])for(const z of [b.min[2],b.max[2]]){xs.push(x*c+z*s);zs.push(-x*s+z*c);}
    return {min:[m.x+Math.min(...xs),m.y+b.min[1],m.z+Math.min(...zs)],max:[m.x+Math.max(...xs),m.y+b.max[1],m.z+Math.max(...zs)]};
  }
  function intersects(m,get){
    const b=box(m);
    for(let y=Math.floor(b.min[1]+EPS);y<=Math.floor(b.max[1]-EPS);y++)
      for(let z=Math.floor(b.min[2]+EPS);z<=Math.floor(b.max[2]-EPS);z++)
        for(let x=Math.floor(b.min[0]+EPS);x<=Math.floor(b.max[0]-EPS);x++){const id=get(x,y,z);if(!solid(id))continue;
          const boxes=typeof Core!=='undefined'?Core.shapeBoxes(id,get,x,y,z):[[0,0,0,1,1,1]];
          for(const q of boxes)if(b.min[0]<x+q[3]-EPS&&b.max[0]>x+q[0]+EPS&&b.min[1]<y+q[4]-EPS&&b.max[1]>y+q[1]+EPS&&b.min[2]<z+q[5]-EPS&&b.max[2]>z+q[2]+EPS)return true; }
    return false;
  }
  function move(m,axis,delta,get){
    if(!delta)return false;
    const steps=Math.max(1,Math.ceil(Math.abs(delta)/.15)),d=delta/steps;
    for(let step=0;step<steps;step++){
      const start=m[axis];m[axis]=start+d;
      if(!intersects(m,get))continue;
      let lo=0,hi=1;
      for(let i=0;i<14;i++){const t=(lo+hi)/2;m[axis]=start+d*t;if(intersects(m,get))hi=t;else lo=t;}
      m[axis]=start+d*lo;return true;
    }
    return false;
  }
  function supported(m,get){return intersects({...m,y:m.y-.025},get);}
  function canJump(m,dx,dz,get){
    // Only jump a single block, and only if the entire body has headroom.
    for(let up=.15;up<1.5;up+=.15)if(intersects({...m,y:m.y+up},get))return false;
    return !intersects({...m,x:m.x+dx,z:m.z+dz,y:m.y+1.05},get);
  }
  function waterAhead(m,dx,dz,get){
    // Probe one point ahead of the body along the travel direction, not the whole footprint.
    // The old footprint test fired for every heading once any corner overlapped a shore column,
    // so the animal could never walk away and re-rolled its heading each frame (spinning in place).
    const len=Math.hypot(dx,dz);if(!len)return false;
    const b=m.bounds,reach=Math.max(b.max[0]-b.min[0],b.max[2]-b.min[2])/2+.35,y=m.y+b.min[1];
    const x=Math.floor(m.x+dx/len*reach),z=Math.floor(m.z+dz/len*reach);
    return get(x,Math.floor(y-.05),z)===5||get(x,Math.floor(y+.05),z)===5;
  }
  function freeHeading(m,get){
    // Blocked: pick the nearest open heading once (alternating sides), or null if boxed in.
    const tries=[.8,-.8,1.6,-1.6,2.4,-2.4,Math.PI];
    if(Math.random()<.5)for(let i=0;i<6;i+=2)[tries[i],tries[i+1]]=[tries[i+1],tries[i]];
    for(const t of tries){
      const a=m.a+t,c={...m,a},dx=Math.sin(a)*.3,dz=Math.cos(a)*.3;
      if(intersects(c,get)||waterAhead(c,dx,dz,get))continue;
      if(intersects({...c,x:c.x+dx,z:c.z+dz},get)&&!canJump(c,dx,dz,get))continue;
      return a;
    }
    return null;
  }
  function step(m,vx,vz,dt,get,hop=false){
    const dx=vx*dt,dz=vz*dt;
    m.ground=supported(m,get)&&m.vy<=0;
    if(m.ground&&waterAhead(m,dx,dz,get)){vx=0;vz=0;m.turnBlocked=true;}
    const blocked=intersects({...m,x:m.x+vx*dt,z:m.z+vz*dt},get);
    if(m.ground&&blocked){
      if(canJump(m,vx*dt,vz*dt,get)){m.vy=8.2;m.ground=false;}
      else m.turnBlocked=true;
    }else if(m.ground&&hop&&(vx||vz)){m.vy=3.5;m.ground=false;}
    move(m,'x',vx*dt,get);move(m,'z',vz*dt,get);
    m.vy=Math.max(-18,m.vy-22*dt);
    const falling=m.vy<0,hit=move(m,'y',m.vy*dt,get);
    m.ground=falling&&hit;if(hit)m.vy=0;
  }
  function ray(m,o,d,max){
    // Transform into the animal's unrotated model box. Explicit parallel slabs avoid 0/0.
    const c=Math.cos(m.a),s=Math.sin(m.a),x=o[0]-m.x,z=o[2]-m.z;
    const p=[x*c-z*s,o[1]-m.y,x*s+z*c],v=[d[0]*c-d[2]*s,d[1],d[0]*s+d[2]*c];
    let near=0,far=max;
    for(let i=0;i<3;i++){
      if(Math.abs(v[i])<1e-10){if(p[i]<m.bounds.min[i]||p[i]>m.bounds.max[i])return null;continue;}
      let a=(m.bounds.min[i]-p[i])/v[i],b=(m.bounds.max[i]-p[i])/v[i];
      near=Math.max(near,Math.min(a,b));far=Math.min(far,Math.max(a,b));if(near>far)return null;
    }
    return near<=max?near:null;
  }
  const api={box,intersects,move,supported,step,ray,waterAhead,freeHeading};
  if(typeof module!=='undefined')module.exports=api;else root.MobPhysics=api;
})(this);
