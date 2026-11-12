// A short, collision-checked mantle from the water surface onto a low bank.
(function(root){
  const C=typeof module!=='undefined'?require('./core'):Core;
  function tryExit(get,p,dx,dz,surface,blocked){
    const length=Math.hypot(dx,dz);if(length<1e-6||p.y<surface-1.2||p.y>surface+.1)return false;
    const start={...p},nx=dx/length,nz=dz/length,reach=.46;
    const end={x:p.x+nx*reach,y:p.y,z:p.z+nz*reach},tops=new Set();
    for(let z=Math.floor(end.z-.29);z<=Math.floor(end.z+.29);z++)for(let x=Math.floor(end.x-.29);x<=Math.floor(end.x+.29);x++)for(let y=Math.floor(p.y);y<=Math.floor(Math.min(surface+1.2,p.y+1.85));y++){
      const id=get(x,y,z);if(!id||id===C.WATER||C.PASS.has(id))continue;
      for(const box of C.shapeBoxes(id,get,x,y,z)){const top=y+box[4];if(top>p.y+.05&&top<=p.y+1.85&&top<=surface+1.201)tops.add(top);}
    }
    for(const top of [...tops].sort((a,b)=>a-b)){
      const target=top+.002;let clear=true;
      // Up first, then over the lip. Check the whole standing body along both paths.
      for(let y=start.y;y<target;y+=.08)if(blocked({...start,y})){clear=false;break;}
      if(!clear||blocked({...start,y:target}))continue;
      for(let t=0;t<=1.001;t+=.125)if(blocked({x:start.x+nx*reach*t,y:target,z:start.z+nz*reach*t})){clear=false;break;}
      const finish={...end,y:target};
      if(!clear||blocked(finish)||!blocked({...finish,y:top-.025}))continue;
      Object.assign(p,finish);return true;
    }
    return false;
  }
  const api={tryExit};if(typeof module!=='undefined')module.exports=api;else root.ShoreMotion=api;
})(typeof window!=='undefined'?window:this);
