(function(root){
 function hit(unit,amount,source){
  if(unit.hp<=0||!Number.isFinite(amount)||amount<=0)return false;
  unit.hp=Math.max(0,unit.hp-amount);unit.flash=.24;unit.repath=0;unit.path=[];
  const dx=unit.x-source.x,dz=unit.z-source.z,len=Math.hypot(dx,dz)||1;
  unit.kx=dx/len*3.8;unit.kz=dz/len*3.8;unit.dead=unit.hp===0;
  if(unit.dead){unit.state='dead';unit.deathTime=0;}
  return true;
 }
 function knock(unit,dt,clear){
  const distance=Math.hypot(unit.kx||0,unit.kz||0)*dt,n=Math.max(1,Math.ceil(distance/.08));
  for(let i=0;i<n;i++)for(const axis of ['x','z']){
   const next=unit[axis]+(unit[axis==='x'?'kx':'kz']||0)*dt/n;
   const x=axis==='x'?next:unit.x,z=axis==='z'?next:unit.z;
   if(clear(x,unit.y,z))unit[axis]=next;else unit[axis==='x'?'kx':'kz']=0;
  }
  unit.kx*=Math.exp(-7*dt);unit.kz*=Math.exp(-7*dt);
 }
 const api={hit,knock};if(typeof module!=='undefined')module.exports=api;else root.GuardCombat=api;
})(this);
