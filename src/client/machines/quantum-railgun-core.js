// Pure geometry and ammunition rules. Direction is encoded in the saved block ID.
(function(root){
 const BASE=460,MAGMA=466,DIRS=[[0,0,-1],[1,0,0],[0,0,1],[-1,0,0],[0,1,0],[0,-1,0]],NAMES=['北 −Z','东 +X','南 +Z','西 −X','上 +Y','下 −Y'];
 const tiers=[{base:460,name:'初级',range:16,color:0x8ceaff},{base:470,name:'中级',range:32,color:0x35d9ce},{base:476,name:'高级',range:64,color:0xb781ff},{base:482,name:'超级',range:100,color:0xff394d}];
 const isSecondary=id=>Number.isInteger(id)&&id>=500&&id<524,primaryId=id=>isSecondary(id)?tiers[Math.floor((id-500)/6)].base+(id-500)%6:id;
 const tier=id=>Number.isInteger(id)?tiers.find(t=>id>=t.base&&id<t.base+6)||null:null,is=id=>!!tier(id),direction=id=>tier(id)?id-tier(id).base:-1,canonical=id=>tier(id)?.base??id;
 const isBlock=id=>is(id)||isSecondary(id),secondaryId=id=>is(primaryId(id))?500+tiers.indexOf(tier(primaryId(id)))*6+direction(primaryId(id)):null;
 function encode(tierIndex,dir){return Number.isInteger(tierIndex)&&tiers[tierIndex]&&Number.isInteger(dir)&&dir>=0&&dir<6?tiers[tierIndex].base+dir:null;}
 const COST={135:5,466:5,267:5};
 function cost(id=BASE){const index=tiers.indexOf(tier(id));if(index<0)return null;const n=[5,10,20,30][index];return {135:n,466:n,267:5};}
 function cells(x,y,z,id){if(!is(id))return [];const d=DIRS[direction(id)],u=d[1]?[1,0,0]:d[0]?[0,0,1]:[1,0,0],v=d[1]?[0,0,1]:[0,1,0],out=[];for(let n=1;n<=tier(id).range;n++)for(let a=0;a<2;a++)for(let b=0;b<2;b++)out.push([x+d[0]*n+u[0]*a+v[0]*b,y+d[1]*n+u[1]*a+v[1]*b,z+d[2]*n+u[2]*a+v[2]*b]);return out;}
 const affordable=(inv,id=BASE)=>{const need=cost(id);return !!need&&Object.entries(need).every(([item,n])=>Number.isFinite(inv[item])&&inv[item]>=n);};
 function pay(inv,id=BASE){if(!affordable(inv,id))return false;for(const [item,n] of Object.entries(cost(id)))inv[item]-=n;return true;}
 // Two physical cells share one receiver. u is always the positive transverse axis.
 function axes(id){const d=DIRS[direction(primaryId(id))];return {d,u:d?.[0]?[0,0,1]:[1,0,0],v:d?.[1]?[0,0,1]:[0,1,0]};}
 function footprint(h,id){id=primaryId(id);if(!is(id))return [];const {u}=axes(id);return [{x:h.x,y:h.y,z:h.z,id},{x:h.x+u[0],y:h.y+u[1],z:h.z+u[2],id:secondaryId(id)}];}
 function resolve(get,h){const b=get(h.x,h.y,h.z);if(is(b))return {x:h.x,y:h.y,z:h.z,id:b};if(!isSecondary(b))return null;const id=primaryId(b),{u}=axes(id),p={x:h.x-u[0],y:h.y-u[1],z:h.z-u[2],id};return get(p.x,p.y,p.z)===id?p:null;}
 function muzzle(h,id){const {d,u,v}=axes(id);return [h.x,h.y,h.z].map((n,i)=>n+u[i]+v[i]+Math.max(0,d[i]));}
 function muzzles(h,id){const m=muzzle(h,id),{u,v}=axes(id);return [-.575,.575].map(offset=>m.map((n,i)=>n+u[i]*offset-v[i]*.125));}
 const overlap=(h,box)=>box&&h.x<box[3]&&h.x+1>box[0]&&h.y<box[4]&&h.y+1>box[1]&&h.z<box[5]&&h.z+1>box[2];
 function planPlace(get,h,id,playerBox){if(!is(id))return null;const cells=footprint(h,id);if(cells.some(p=>p.y<=0||p.y>=96||get(p.x,p.y,p.z)!==0||overlap(p,playerBox)))return null;return cells.map(p=>[p.x,p.y,p.z,p.id]);}
 function planRemove(get,h){const root=resolve(get,h);return root?footprint(root,root.id).filter(p=>get(p.x,p.y,p.z)===p.id).map(p=>[p.x,p.y,p.z,0]):[];}
 function planRotate(get,h,id,playerBox){const root=resolve(get,h);if(!root||!is(id)||canonical(id)!==canonical(root.id))return null;const old=footprint(root,root.id).filter(p=>get(p.x,p.y,p.z)===p.id),next=footprint(root,id),key=p=>[p.x,p.y,p.z].join(',');if(next.some(p=>p.y<=0||p.y>=96||(!old.some(o=>key(o)===key(p))&&get(p.x,p.y,p.z)!==0)||overlap(p,playerBox)))return null;return old.filter(p=>!next.some(n=>key(n)===key(p))).map(p=>[p.x,p.y,p.z,0]).concat(next.map(p=>[p.x,p.y,p.z,p.id]));}
 // Expand destruction batches before mutation; explicitly supplied rotation cells win.
 function expandEdits(get,list){const out=new Map(list.map(p=>[p.slice(0,3).join(','),p]));for(const [x,y,z,id] of list){const old=get(x,y,z);if(!isBlock(old)||old===id)continue;const root=resolve(get,{x,y,z});if(!root)continue;for(const p of footprint(root,root.id)){const k=[p.x,p.y,p.z].join(',');if(!out.has(k)&&get(p.x,p.y,p.z)===p.id)out.set(k,[p.x,p.y,p.z,0]);}}return [...out.values()];}
 function wholeParts(id){id=primaryId(id);const rank=Math.max(0,tiers.indexOf(tier(id))),coreTile=rank===0?48:119+rank,coilTile=rank===3?24:rank===2?66:rank===1?47:24;
 const q=[[.08,0,.08,1.92,.15,.92,67],[.66,.15,.3,1.34,.48,.7,65],[.34,.48,.58,1.66,.85,.92,67],[.25,.75,.04,.6,.98,.76,65],[1.4,.75,.04,1.75,.98,.76,65],[.72,.72,.58,1.28,.98,.95,coreTile]];
 for(const z of [.18,.36,.54])q.push([.2,.7,z,.65,1,z+.055,coilTile],[1.35,.7,z,1.8,1,z+.055,coilTile]);q.push([.68,.92,.7,1.32,1,.87,coreTile]);
 for(let i=0;i<rank;i++){const z=.22+i*.19;q.push([.04,.2,z,.26,.45,z+.09,coilTile],[1.74,.2,z,1.96,.45,z+.09,coilTile]);}if(rank>=2)q.push([.1,.75,.58,.36,.95,.95,67],[1.64,.75,.58,1.9,.95,.95,67]);if(rank===3)q.push([.72,.89,.7,.86,1,.88,24],[1.14,.89,.7,1.28,1,.88,24]);
 q.push([.25,.75,0,.6,1,.035,coreTile],[1.4,.75,0,1.75,1,.035,coreTile]);
 const dir=direction(id);return q.map(p=>{const points=[];for(const a of [p[0],p[3]])for(const b of [p[1],p[4]])for(const c of [p[2],p[5]])points.push(dir===1?[1-c,b,a]:dir===2?[a,b,1-c]:dir===3?[c,b,a]:dir===4?[a,1-c,b]:dir===5?[a,c,b]:[a,b,c]);return [0,1,2].map(i=>Math.min(...points.map(p=>p[i]))).concat([0,1,2].map(i=>Math.max(...points.map(p=>p[i]))),...p.slice(6));});}
 function parts(id){const offset=isSecondary(id)?axes(id).u:[0,0,0],out=[];for(const q of wholeParts(id)){const p=[0,1,2].map(i=>Math.max(0,q[i]-offset[i])).concat([0,1,2].map(i=>Math.min(1,q[i+3]-offset[i])),...q.slice(6));if([0,1,2].every(i=>p[i+3]>p[i]+1e-6))out.push(p);}return out;}
 // Ten physical supply slots, each holding at most 64 matching materials.
 const MATERIALS=[135,466,267];
 function supplies(slots){const inv={};for(const s of slots||[])if(s&&MATERIALS.includes(s.id)&&Number.isInteger(s.n)&&s.n>0)inv[s.id]=(inv[s.id]||0)+s.n;return inv;}
 function deposit(slots,index,inv,id,amount=Infinity){if(!MATERIALS.includes(id)||index<0||index>=10||!Number.isInteger(index))return 0;const old=slots[index];if(old&&old.id!==id)return 0;const n=Math.min(amount,64-(old?.n||0),Math.max(0,Math.floor(inv[id]||0)));if(n<=0)return 0;slots[index]={id,n:(old?.n||0)+n};inv[id]-=n;return n;}
 function consume(slots,id){if(!affordable(supplies(slots),id))return false;for(const [item,need] of Object.entries(cost(id))){let left=need;for(let i=0;i<10&&left;i++){const s=slots[i];if(s?.id!==+item)continue;const n=Math.min(left,s.n);s.n-=n;left-=n;if(!s.n)slots[i]=null;}}return true;}
 function autoLoad(slots,bag,id){const total=supplies(slots);for(const item of MATERIALS)total[item]=(total[item]||0)+(bag[item]||0);if(!affordable(total,id))return false;for(const [item,n] of Object.entries(cost(id))){let left=n;for(let i=0;i<10&&left;i++){const slot=slots[i];if(slot?.id!==+item)continue;const take=Math.min(left,slot.n);slot.n-=take;left-=take;if(!slot.n)slots[i]=null;}if(left)bag[item]-=left;}return true;}
 function turn(dir,heading,action){heading=dir<4?dir:heading||0;if(action==='left'||action==='right'){heading=(heading+(action==='left'?3:1))%4;return {dir:dir<4?heading:dir,heading};}if(action==='up')return {dir:dir===5?heading:4,heading};if(action==='down')return {dir:dir===4?heading:5,heading};return {dir,heading};}
 const api={MATERIALS,autoLoad,supplies,deposit,consume,turn,BASE,MAGMA,DIRS,NAMES,COST,cost,tiers,tier,direction,canonical,encode,is,isBlock,isSecondary,primaryId,secondaryId,axes,footprint,resolve,muzzle,muzzles,planPlace,planRotate,planRemove,expandEdits,wholeParts,cells,affordable,pay,parts};if(typeof module!=='undefined')module.exports=api;else root.QuantumRailgunCore=api;
})(typeof globalThis!=='undefined'?globalThis:this);
