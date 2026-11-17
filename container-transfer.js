// Shared stack placement: targeted stacks first; mismatched targets advance to empty slots.
(function(root){
 function insert(slots,id,amount,{size=slots.length,capacity=64,target=-1,exclude=-1}={}){
  if(!Number.isInteger(amount)||amount<=0||!Number.isInteger(id)||size<=0)return 0;
  const indices=Array.from({length:size},(_,i)=>(Math.max(0,target)+i)%size).filter(i=>i!==exclude);
  let order;
  if(target>=0&&target<size&&target!==exclude){const old=slots[target];order=old&&old.id!==id?indices.filter(i=>!slots[i]):[target,...indices.filter(i=>i!==target&&slots[i]?.id===id),...indices.filter(i=>i!==target&&!slots[i])];}
  else order=[...indices.filter(i=>slots[i]?.id===id),...indices.filter(i=>!slots[i])];
  let left=amount;for(const i of order){const n=Math.min(left,Math.max(0,capacity-(slots[i]?.n||0)));if(n){slots[i]={id,n:(slots[i]?.n||0)+n};left-=n;}if(!left)break;}return amount-left;
 }
 const api={insert};if(typeof module!=='undefined')module.exports=api;else root.ContainerTransfer=api;
})(typeof globalThis!=='undefined'?globalThis:this);
