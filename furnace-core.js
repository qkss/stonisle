(function(root){
 const RECIPES={12:291,13:292,80:135,287:466},COUNTS={80:10,287:10},SECONDS=4,CAP=64;
 const inputCount=id=>COUNTS[id]||1;
 function fuelValue(id){return id===11?16:[6,180,181,182,8,93,94,95].includes(+id)?4:0;}
 function create(){return {ore:null,fuel:null,output:null,heat:0,progress:0};}
 function status(s){const out=s.ore&&RECIPES[s.ore.id];if(!out)return '放入矿石、黑曜石或岩浆';if(s.ore.n<inputCount(s.ore.id))return '原料不足：需要 '+inputCount(s.ore.id)+' 个';if(s.output&&(s.output.id!==out||s.output.n>=CAP))return '请先取出产物';if(s.heat<=0&&!s.fuel)return '需要煤、木头或木板';return '正在熔炼';}
 function insert(s,slot,id,n){if(!Number.isInteger(n)||n<=0||!(slot==='ore'?RECIPES[id]:slot==='fuel'?fuelValue(id):false))return 0;const old=s[slot];if(old&&old.id!==id)return 0;const count=Math.min(n,CAP-(old?.n||0));if(count)s[slot]={id,n:(old?.n||0)+count};return count;}
 function take(s,slot){const stack=s[slot];s[slot]=null;if(slot==='ore')s.progress=0;return stack;}
 function tick(s,dt){let produced=0;if(!Number.isFinite(dt)||dt<=0)return 0;dt=Math.min(dt,1);while(dt>1e-6&&status(s)==='正在熔炼'){
  if(s.heat<=0){s.heat=fuelValue(s.fuel.id);if(--s.fuel.n<=0)s.fuel=null;}
  const step=Math.min(dt,s.heat,SECONDS-s.progress);s.progress+=step;s.heat-=step;dt-=step;
  if(s.progress>=SECONDS-1e-6){const id=RECIPES[s.ore.id];s.output={id,n:(s.output?.n||0)+1};s.ore.n-=inputCount(s.ore.id);if(s.ore.n<=0)s.ore=null;s.progress=0;produced++;}
 }return produced;}
 const api={RECIPES,COUNTS,inputCount,SECONDS,CAP,fuelValue,create,status,insert,take,tick};if(typeof module!=='undefined')module.exports=api;else root.FurnaceCore=api;
})(this);
