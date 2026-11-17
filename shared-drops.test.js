const assert=require('node:assert/strict'),SharedDrops=require('./shared-drops');
const s=new SharedDrops(), data={key:'throw-1',id:263,x:1,y:2,z:3}, p={x:1,y:1.4,z:3};
const item=s.create('alice',data,1000);
assert.equal(s.create('alice',data,1100),item); // retry doesn't duplicate
assert.equal(s.claim('alice',item.key,p,2000),null); // owner grace
assert.equal(s.claim('bob',item.key,{...p,x:20},2000),null);
assert.equal(s.claim('bob',item.key,{...p,dn:true},2000),null);
assert.equal(s.claim('bob',item.key,p,2000),item);
assert.equal(s.claim('alice',item.key,p,4000),null); // one winner
assert.equal(s.claim('bob',item.key,p,4000),item); // response retry
assert.equal(s.create('alice',data,5000),null); // no resurrection
assert.equal(s.create('alice',{...data,key:'bad',x:NaN}),null);
const self=s.create('alice',{...data,key:'self'},1000);
assert.equal(s.claim('alice',self.key,p,3500),self);
const expired=s.create('alice',{...data,key:'old'},1000);
assert.equal(s.claim('bob',expired.key,p,301001),null);
assert.equal(s.create('alice',{...data,key:'gun',ammo:8},1000).ammo,8);assert.equal(s.create('alice',{...data,key:'gun2',ammo:999},1000).ammo,0); // 枪带着弹药，数量有上限
console.log('Shared drops: ownership, distance, delay, retries and expiry passed');
