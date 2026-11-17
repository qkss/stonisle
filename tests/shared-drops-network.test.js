const assert=require('node:assert/strict'),{spawn}=require('node:child_process');
(async()=>{
 const server=spawn(process.execPath,['src/server/server.js','18767'],{stdio:['ignore','pipe','inherit']});
 const controllers=[];
 try{
  await new Promise((ok,bad)=>{server.stdout.once('data',ok);server.once('error',bad);});
  const base='http://127.0.0.1:18767',post=async(path,data)=>{const r=await fetch(base+path,{method:'POST',body:JSON.stringify(data)});assert.equal(r.status,200);return r.json();};
  await post('/net/open',{on:true});
  async function connect(id,guest=false){const c=new AbortController();controllers.push(c);const r=await fetch(base+'/net/events?id='+id+(guest?'&guest=1':''),{signal:c.signal});assert.equal(r.status,200);const reader=r.body.getReader();return reader;}
  const host=await connect('alice'),guest=await connect('bob',true);
  await post('/net/send?id=alice',[{t:'t',time:455,seq:2}]);
  await post('/net/send?id=alice',[{t:'t',time:60,seq:1}]); // stale packet
  await post('/net/send?id=bob',[{t:'t',time:12,seq:999}]); // guest cannot change world clock
  assert.equal((await (await fetch(base+'/net/hello?guest=1')).json()).state.time,455);
  async function expectMessage(reader,needle){
    let timer;try{return await Promise.race([(async()=>{let text='';while(!text.includes(needle)){const r=await reader.read();assert(!r.done);text+=new TextDecoder().decode(r.value);}return text;})(),new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('Missing '+needle)),2000);})]);}finally{clearTimeout(timer);}
  }
  await post('/net/send?id=bob',[{t:'checkpoint'}]);
  await expectMessage(host,'"t":"checkpoint"');
  await post('/net/send?id=alice',[{t:'checkpointSaved',to:'bob',ok:true}]);
  await expectMessage(guest,'"t":"checkpointSaved"');
  const saved={cities:{'exploration-4':{owned:true,owner:'player'}},exploration:{'exploration-4':{units:{0:{hp:124}}}}};
  await post('/net/send?id=alice',[{t:'cg',data:{saved,cities:saved.cities,units:[{id:'castle-guard-exploration-4-0',hp:124,x:1,y:3,z:4}]}}]);
  await expectMessage(guest,'"t":"cg"');
  await post('/net/send?id=bob',[{t:'cg',data:{saved:{cities:{}},cities:{},units:[]}}]);
  assert.deepEqual((await (await fetch(base+'/net/hello?guest=1')).json()).state.castleGuards,saved,'only host changes city ownership and saved guard health');
  await post('/net/send?id=bob',[{t:'gh',id:'castle-guard-exploration-4-0',dealt:10}]);
  await expectMessage(host,'"t":"gh"');
  await post('/net/send?id=alice',[{t:'b',x:0,y:80,z:0,id:155}]);
  assert.equal((await (await fetch(base+'/net/hello?guest=1')).json()).state.log['0,80,0'],155,'mountaintop structures sync above old height limit');
  for(const id of ['alice','bob'])await post('/net/send?id='+id,[{t:'p',x:1,y:1.4,z:3,yaw:0}]);
  const {item}=await post('/net/drop?id=alice',{key:'test-1',id:263,x:1,y:2,z:3});assert(item);
  const late=await connect('charlie',true),snapshot=new TextDecoder().decode((await late.read()).value);assert(snapshot.includes(item.key));assert(snapshot.includes('"time":455'));
  // Let the brief toss complete before the two simultaneous pickup requests.
  await new Promise(r=>setTimeout(r,650));
  await post('/net/send?id=charlie',[{t:'p',x:1,y:1.4,z:3,yaw:0}]);
  const winners=await Promise.all(['bob','charlie'].map(id=>post('/net/pick?id='+id,{key:item.key})));
  assert.equal(winners.filter(r=>r.item).length,1);
  assert.equal((await post('/net/pick?id=alice',{key:item.key})).item,null);
  console.log('LAN: host clock authority, stale packets, late join and simultaneous pickup passed');
 }finally{controllers.forEach(c=>c.abort());server.kill();}
})().catch(e=>{console.error(e);process.exitCode=1;});
