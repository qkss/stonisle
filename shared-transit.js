const Transfer=require('./container-transfer.js'),Work=require('./cart-work');
// Server owns cargo. Motion snapshots cannot overwrite a newer cargo transaction.
class SharedTransit {
 constructor(carts=[]){this.carts=new Map();this.results=new Map();this.publish(carts);}
 publish(list){for(const c of (list||[]).slice(0,256)){if(!c||typeof c.uid!=='string'||!c.node||![c.node.x,c.node.y,c.node.z].every(Number.isFinite))continue;const old=this.carts.get(c.uid);if(old?.removed)continue;const copy=JSON.parse(JSON.stringify(c));if(old){for(const k of ['slots','engine','running','rev','jobs','overflow','workVersion','modules','trigger','triggerStart','pulseEvery','dir'])copy[k]=old[k];}else{copy.slots=Array.from({length:20},(_,i)=>{const v=c.slots?.[i];return v&&Number.isInteger(v.id)&&v.id>0&&Number.isInteger(v.n)&&v.n>0?{id:v.id,n:Math.min(64,v.n)}:null;});copy.rev=0;}Work.normalize(copy);this.carts.set(c.uid,copy);}return this.snapshot();}
 snapshot(){return [...this.carts.values()].filter(c=>!c.removed);}
 transact(who,req,position,host=false){const key=who+':'+req.op;if(typeof req.op!=='string'||req.op.length>100)return {ok:false};if(this.results.has(key))return this.results.get(key);const c=this.carts.get(req.uid);let result={ok:false,n:0};if(c&&!c.removed&&(host&&req.action==='work'||position&&Math.hypot(position.x-(c.node.x+.5),position.y-c.node.y,position.z-(c.node.z+.5))<7)){const count=Math.max(0,Math.min(1280,Math.floor(req.n||0))),i=req.index,v=c.slots[i];let n=0,items=[];
 if(req.action==='deposit'&&Number.isInteger(req.id)&&req.id>0&&req.id<1024&&count){n=Work.insert(c,req.id,count,Number.isInteger(i)&&i>=0&&i<4?i:-1);}
 else if(req.action==='withdraw'&&v&&v.id===req.id){n=Math.min(count,v.n);items=[{id:v.id,n}];v.n-=n;if(!v.n)c.slots[i]=null;}
 else if(req.action==='move'&&v&&v.id===req.id&&Number.isInteger(req.target)&&req.target>=0&&req.target<4){n=(req.target!==i?Work.insert(c,v.id,Math.min(count,v.n),req.target):0);v.n-=n;if(!v.n)c.slots[i]=null;}
 else if(req.action==='module'&&i>=0&&i<4){if(c.modules[i]){items=[{id:c.modules[i],n:1}];c.modules[i]=null;n=1;}else if(count===1&&req.id===620){c.modules[i]=620;n=1;}}
 else if(req.action==='trigger'){if(c.trigger){c.trigger=false;items=[{id:621,n:1}];n=1;}else if(count===1&&req.id===621){c.trigger=true;c.triggerStart=c.steps||0;n=1;}}
 else if(req.action==='rate'&&Number.isFinite(req.spacing)){c.pulseEvery=Math.max(1,Math.min(32,Math.round(req.spacing)));c.triggerStart=c.steps||0;n=1;}
 else if(req.action==='rotate'&&c.kind==='device'){c.dir=((c.dir||0)+1)%6;n=1;}
 else if(req.action==='config'&&i>=0&&i<4&&Work.modes.includes(req.mode)&&Number.isFinite(req.spacing)){c.jobs[i]={mode:req.mode,spacing:Math.max(1,Math.min(32,Math.round(req.spacing))),startStep:c.steps||0};n=1;}
 else if(req.action==='overflow'&&c.overflow?.[i]){const v=c.overflow[i];n=v.n;items=[v];c.overflow.splice(i,1);}
 else if(host&&req.action==='work'&&i>=0&&i<4&&req.rev===c.rev&&Array.isArray(req.outputs)&&req.outputs.length<=8){if(Work.work(c,i,req.cost,req.outputs))n=1;}
 else if(req.action==='engine'){if(c.engine){c.engine=false;c.running=false;items=[{id:612,n:1}];n=1;}else if(count===1){c.engine=true;c.running=true;n=1;}}
 else if(req.action==='toggle'){c.running=!!c.engine&&!c.running;n=1;}
 else if(host&&req.action==='pack'){items=c.slots.concat(c.overflow||[]).filter(Boolean).map(v=>({...v}));if(c.engine)items.push({id:612,n:1});for(const id of c.modules||[])if(id)items.push({id,n:1});if(c.trigger)items.push({id:621,n:1});items.push({id:c.kind==='device'?c.block:611,n:1});c.removed=true;c.slots=Array(20).fill(null);n=1;}
 if(n){c.rev++;result={ok:true,n,items};}
 }this.results.set(key,result);return result;}
}
module.exports=SharedTransit;
