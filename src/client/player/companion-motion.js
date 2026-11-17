(function(root){
  const radius=.43;
  function clear(get,p){
    for(let x=Math.floor(p[0]-radius);x<=Math.floor(p[0]+radius);x++)for(let y=Math.floor(p[1]-radius);y<=Math.floor(p[1]+radius);y++)for(let z=Math.floor(p[2]-radius);z<=Math.floor(p[2]+radius);z++){
      const b=get(x,y,z);if(b!==0&&b!==5)return false;
    }return true;
  }
  function free(get,p){for(let i=0;i<=32;i++){const q=[p[0],p[1]+i*.125,p[2]];if(clear(get,q))return q;}return null;}
  function move(get,from,to){
    let p=clear(get,from)?from.slice():free(get,from);if(!p)return null;
    const delta=to.map((v,i)=>v-p[i]),steps=Math.ceil(Math.max(...delta.map(Math.abs))/.08)||1;
    if(steps>100)return free(get,to);
    for(let n=0;n<steps;n++)for(const axis of [1,0,2]){const q=p.slice();q[axis]+=delta[axis]/steps;if(clear(get,q))p=q;}
    return p;
  }
  const api={clear,free,move};if(typeof module!=='undefined')module.exports=api;else root.CompanionMotion=api;
})(this);
