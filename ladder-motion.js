// Shared climb contact and movement, independent of rendering.
(function(root){
 const C=typeof module!=='undefined'?require('./core'):Core;
 function contact(get,p){
  for(let y=Math.floor(p.y-.02);y<=Math.floor(p.y+1.25);y++)for(let z=Math.floor(p.z-.4);z<=Math.floor(p.z+.4);z++)for(let x=Math.floor(p.x-.4);x<=Math.floor(p.x+.4);x++){
   const info=C.ladderInfo(get(x,y,z));if(!info||!C.ladderSupported(get,x,y,z,info))continue;
   const n=info.normal,plane=n[0]?(n[0]>0?x+.12:x+.88):(n[2]>0?z+.12:z+.88);
   const distance=n[0]?Math.abs(p.x-plane):Math.abs(p.z-plane),side=n[0]?p.z-z:p.x-x;
   if(distance<.43&&side>-.12&&side<1.12&&p.y<y+1-.001&&p.y+1.25>y+.05)return {...info,x,y,z};
  }
  return null;
 }
 class Controller {
  constructor(){this.cooldown=0;this.jumpHeld=false;}
  update(dt,get,p,forward,jump){
   this.cooldown=Math.max(0,this.cooldown-dt);const pressed=jump&&!this.jumpHeld;this.jumpHeld=jump;
   if(this.cooldown)return null;const hit=contact(get,p);if(!hit)return null;
   if(pressed){this.cooldown=.4;this.kickX=hit.normal[0]*4;this.kickZ=hit.normal[2]*4;return {vy:5,vx:hit.normal[0]*4,vz:hit.normal[2]*4,jump:true};}
   return {vy:Math.max(-1,Math.min(1,forward))*2.6,jump:false};
  }
 }
 const api={contact,Controller};if(typeof module!=='undefined')module.exports=api;else root.LadderMotion=api;
})(typeof window!=='undefined'?window:this);
