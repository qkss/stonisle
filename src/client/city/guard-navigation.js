(function(root){
 const pass=id=>!id||(typeof Core!=='undefined'&&Core.PASS.has(id));
 function clear(get,x,y,z){
  for(const dx of [-.32,.32])for(const dz of [-.32,.32]){
   const X=Math.floor(x+dx),Z=Math.floor(z+dz),floor=get(X,y-1,Z);
   if(!floor||floor===5||floor===287||(typeof Core!=='undefined'&&(Core.PASS.has(floor)||Core.ladderInfo(floor))))return false;
   for(let h=0;h<2;h++)if(!pass(get(X,y+h,Z)))return false;
  }return true;
 }
 function path(get,start,goal,y,limit=1800,occupied=()=>false){
  const sx=Math.floor(start[0]),sz=Math.floor(start[1]),key=(x,z)=>x+','+z;
  const queue=[[sx,sz]],seen=new Map([[key(sx,sz),null]]);let best=queue[0],score=Infinity;
  for(let i=0;i<queue.length&&i<limit;i++){
   const [x,z]=queue[i],d=Math.hypot(x+.5-goal[0],z+.5-goal[1]);if(d<score){score=d;best=[x,z];}if(d<.75)break;
   for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){
    const nx=x+dx,nz=z+dz,k=key(nx,nz);if(seen.has(k)||Math.abs(nx-sx)>24||Math.abs(nz-sz)>24||occupied(nx+.5,nz+.5)||!clear(get,nx+.5,y,nz+.5))continue;
    seen.set(k,[x,z]);queue.push([nx,nz]);
   }
  }
  const result=[];let at=best;while(at&&(at[0]!==sx||at[1]!==sz)){result.push([at[0]+.5,at[1]+.5]);at=seen.get(key(...at));}return result.reverse();
 }
 // Duties stay separate from temporary combat/return states.
 function duty(a,target,dist){
  if(target)return {state:'defend',goal:!a.archer&&dist>1.9?[target.x,target.z]:null};
  if(a.duty==='guard')return Math.hypot(a.x-a.home[0],a.z-a.home[1])>.12?{state:'return',goal:a.home}:{state:'guard',goal:null};
  return {state:'patrol',goal:a.route[a.index%a.route.length]};
 }
 const api={clear,path,duty};if(typeof module!=='undefined')module.exports=api;else root.GuardNavigation=api;
})(this);
