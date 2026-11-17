// Server-owned thrown items. A claim removes the item before any award is sent.
class SharedDrops {
  constructor(){this.items=new Map();this.receipts=new Map();}
  prune(now=Date.now()){for(const [key,d] of this.items)if(now-d.created>300000)this.items.delete(key);for(const [key,r] of this.receipts)if(now-r.created>300000)this.receipts.delete(key);}
  create(owner, data, now=Date.now()){
    this.prune(now);
    if(!data||typeof data.key!=='string'||!/^[a-zA-Z0-9-]{1,64}$/.test(data.key)||!Number.isInteger(data.id)||data.id<=0||data.id>4096||![data.x,data.y,data.z].every(Number.isFinite)||data.y<0||data.y>65)return null;
    const key=owner+'-'+data.key;
    if(this.receipts.has(key))return null;
    if(this.items.has(key))return this.items.get(key);
    if(this.items.size>=512)return null;
    const d={key,id:data.id,n:Number.isInteger(data.n)&&data.n>0&&data.n<=999?data.n:1,skin:typeof data.skin==='string'&&/^[a-z]{1,16}$/.test(data.skin)?data.skin:'default',ammo:Number.isInteger(data.ammo)&&data.ammo>0&&data.ammo<=64?data.ammo:0,x:data.x,y:data.y,z:data.z,owner,created:now};this.items.set(key,d);return d; // ammo：扔出去的枪或弓带着的弹药，捡的人一起拿到
  }
  claim(who,key,p,now=Date.now()){
    this.prune(now);const receipt=this.receipts.get(key);if(receipt)return receipt.who===who?receipt.item:null;
    const d=this.items.get(key);if(!d||!p||p.dn||now-d.created<(d.owner===who?2500:600)||Math.hypot(d.x-p.x,d.y-(p.y+.6),d.z-p.z)>1.8)return null;
    this.items.delete(key);this.receipts.set(key,{who,item:d,created:now});return d;
  }
}
module.exports=SharedDrops;
