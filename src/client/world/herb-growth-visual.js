(() => {
 const markers=new Map();let material,elapsed=-Infinity,notice,until=0;
 HerbFarming.onMature=name=>{if(!notice){notice=document.createElement('div');notice.setAttribute('role','status');notice.style='position:fixed;left:50%;bottom:160px;transform:translateX(-50%);z-index:19;padding:8px 14px;border:1px solid #9da46a88;border-radius:8px;background:#263022dd;color:#e3e5bb;font:13px system-ui;pointer-events:none;transition:opacity .4s';document.body.append(notice);}notice.textContent='✓ '+name+' 已成熟，可以收获';notice.style.opacity='1';until=performance.now()+4000;};
 HerbFarming.visual=dt=>{
  if(notice&&performance.now()>until)notice.style.opacity='0';const now=performance.now();if(now-elapsed<200)return;elapsed=now;
  const near=Object.entries(game.herbState.crops).map(([k,c])=>({k,c,p:k.split(',').map(Number)})).filter(v=>Math.hypot(v.p[0]-game.p.x,v.p[1]-game.p.y,v.p[2]-game.p.z)<13).sort((a,b)=>Math.hypot(a.p[0]-game.p.x,a.p[2]-game.p.z)-Math.hypot(b.p[0]-game.p.x,b.p[2]-game.p.z));
  const visible=new Set();for(const v of near){const d=HerbFarming.byId(v.c.id);if(!d||game.world.get(...v.p)!==d.id||visible.size>=8)continue;visible.add(v.k);
   if(!material){const cv=document.createElement('canvas');cv.width=256;cv.height=64;const x=cv.getContext('2d');x.fillStyle='#293522dd';x.fillRect(4,5,248,54);x.strokeStyle='#b5c18499';x.strokeRect(4,5,248,54);x.fillStyle='#edf0be';x.font='26px system-ui';x.textAlign='center';x.fillText('✓ 可收获',128,42);material=new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cv),transparent:true,depthTest:true,depthWrite:false});}
   let m=markers.get(v.k);if(!m){m=new THREE.Sprite(material);m.scale.set(.9,.225,1);game.scene.add(m);markers.set(v.k,m);}m.position.set(v.p[0]+.5,v.p[1]+Core.PLANTS[d.id].top+.25,v.p[2]+.5);
  }
  for(const [k,m] of markers)if(!visible.has(k)){game.scene.remove(m);markers.delete(k);}
 };
})();
