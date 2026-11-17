(function(root){
 const EXECUTOR=620,TRIGGER=621,DETECTOR=622,D=[[0,0,-1],[1,0,0],[0,0,1],[-1,0,0],[0,1,0],[0,-1,0]];
 const isDevice=id=>id>=620&&id<=622,key=p=>[p.x,p.y,p.z].join(',');
 function target(c){const d=D[c.dir||0];return {x:c.node.x+d[0],y:c.node.y+d[1],z:c.node.z+d[2]};}
 function connected(devices,start){const byPosition=new Map(devices.filter(c=>!c.disabled).map(c=>[key(c.node),c])),queue=[start],seen=new Set(),out=[];for(let at=0;at<queue.length&&out.length<64;at++){const c=queue[at];if(!c||seen.has(c.uid))continue;seen.add(c.uid);out.push(c);for(const d of D){const p=c.node;const next=byPosition.get([p.x+d[0],p.y+d[1],p.z+d[2]].join(','));if(next&&!seen.has(next.uid))queue.push(next);}}return out;}
 function due(c){const n=(c.steps||0)-(c.triggerStart||0);return !!c.trigger&&n>0&&n%Math.max(1,c.pulseEvery||1)===0;}
 function claim(c,i){if(!due(c)||c.modules?.[i]!==EXECUTOR)return null;const stamp=[c.triggerStart||0,c.pulseEvery||1,c.steps||0].join(':');c.pulses||=[];if(c.pulses[i]===stamp)return null;c.pulses[i]=stamp;return stamp;}
 const api={claim,EXECUTOR,TRIGGER,DETECTOR,D,isDevice,key,target,connected,due};if(typeof module!=='undefined')module.exports=api;else root.AutomationCore=api;
})(typeof globalThis!=='undefined'?globalThis:this);
