(function(root){
 const names=['赤灵芝','霜雪莲','紫露草','月华花','金线参','碧心草'],minutes=[8,12,6,10,15,7];
 const defs=names.map((name,i)=>({name,id:310+i,seed:320+i,young:330+i*2,growing:331+i*2,seconds:minutes[i]*60}));
 defs.push(...(typeof module!=='undefined'?require('./herb-varieties.js'):root.HerbVarieties).list);
 defs.push(...(typeof module!=='undefined'?require('./cereal-crops.js'):root.CerealCrops).list);
 const byId=id=>defs.find(d=>[d.id,d.seed,d.young,d.growing,d.product].includes(+id));
 const stage=(d,age)=>age>=d.seconds?d.id:age>=d.seconds*.35?d.growing:d.young;
 const loot=(d,cultivated,transplanted,roll)=>({herb:1,seeds:transplanted?0:cultivated?1+(roll<.2?1:0):roll<.35?1:0});
 const api={defs,byId,stage,loot};if(typeof module!=='undefined'){module.exports=api;return;}root.HerbFarming=api;
 const state=()=>game.herbState,key=h=>[h.x,h.y,h.z].join(','),hint=t=>Lang.say(t,false,2);
 api.use=(h,id)=>{const d=byId(id);if(!d||!h)return false;if(root.Net?.guest){hint('Herb gardening is managed by the host.');return true;}if(!(game.inv[id]>0))return true;
  if(id!==d.seed&&id!==d.id)return true;const base=game.world.get(h.x,h.y,h.z),p={x:h.x,y:h.y+1,z:h.z};
  if(h.n[1]!==1||![1,2,98].includes(base)&&!((id===311||d.family===0)&&base===15)){hint('Plant on soil or farmland.');return true;}
  if(game.world.get(p.x,p.y,p.z))return true;
  if(id===d.seed){if(base!==98)game.setBlock(h.x,h.y,h.z,98);state().crops[key(p)]={id:d.id,age:0};game.setBlock(p.x,p.y,p.z,d.young);}
  else{state().transplants[key(p)]=true;game.setBlock(p.x,p.y,p.z,id);}
  if(!root.Creative?.on)game.inv[id]--;game.renderBar();game.saveNow();return true;
 };
 api.dug=(h,id)=>{const d=byId(id),k=key(h),s=state();if(!d){if([1,2,98,15].includes(id)){const p={x:h.x,y:h.y+1,z:h.z},pk=key(p),c=s.crops[pk];if(c){game.setBlock(p.x,p.y,p.z,0);game.give(byId(c.id).seed,1);delete s.crops[pk];}}return undefined;}
  const c=s.crops[k];if(id!==d.id){delete s.crops[k];game.give(d.seed,1);return 0;}
  const r=loot(d,!!c,s.transplants[k],Math.random());if(r.seeds)game.give(d.seed,r.seeds);delete s.crops[k];delete s.transplants[k];if(d.product){game.give(d.product,2);return d.product;}return d.id;
 };
 let elapsed=0,saveT=0;
 api.tick=dt=>{if(root.Net?.guest)return;elapsed+=dt;if(elapsed<1)return;const span=elapsed;elapsed=0;let changed=false;
  for(const [k,c] of Object.entries(state().crops)){const [x,y,z]=k.split(',').map(Number),d=byId(c.id);if(!d){delete state().crops[k];continue;}const b=game.world.get(x,y,z);if(b===undefined)continue;if(![d.id,d.young,d.growing].includes(b)){delete state().crops[k];continue;}if(b===d.id)continue;
   if(game.world.get(x,y-1,z)!==98){game.setBlock(x,y,z,0);game.give(d.seed,1);delete state().crops[k];changed=true;continue;}
   let wet=false;for(let dx=-4;dx<=4&&!wet;dx++)for(let dz=-4;dz<=4;dz++)if(game.world.get(x+dx,y-1,z+dz)===5)wet=true;
   c.age=Math.min(d.seconds,c.age+span*(wet?1.5:1));const next=stage(d,c.age);if(next!==b){game.setBlock(x,y,z,next);if(next===d.id)api.onMature?.(d.name);changed=true;}
  }saveT+=span;if(changed||saveT>=15){saveT=0;game.saveNow();}
 };
 api.label=h=>{const d=byId(game.world.get(h.x,h.y,h.z));if(!d)return '';const c=state().crops[key(h)];return d.name+(game.world.get(h.x,h.y,h.z)===d.id?' · 成熟，可收获':c?' · '+(c.age>=d.seconds?'成熟，可收获':Math.floor(c.age/d.seconds*100)+'% 生长中'):'');};
})(this);
