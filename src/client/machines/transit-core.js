(function(root){
 const RELAY=600,RAIL=610,CART=611,ENGINE=612,D=[[0,0,-1],[1,0,0],[0,0,1],[-1,0,0],[0,1,0],[0,-1,0]];
 const relay=id=>id>=600&&id<=605,key=p=>[p.x,p.y,p.z].join(',');
 function links(get,p){const out=[];for(let dir=0;dir<4;dir++)for(const dy of [0,1,-1]){const d=D[dir],q={x:p.x+d[0],y:p.y+dy,z:p.z+d[2],dir};if(get(q.x,q.y,q.z)===RAIL){out.push(q);break;}}return out;}
 function next(get,p,previous,heading=0){return links(get,p).filter(q=>key(q)!==previous).sort((a,b)=>(a.dir===heading?-1:0)-(b.dir===heading?-1:0)||a.dir-b.dir)[0]||null;}
 function trace(get,start,dir,range){const segments=[],cells=[],visited=new Set(),unique=new Set();let p={...start},truncated=false;for(let hop=0;hop<16;hop++){const d=D[dir],u=d[0]?[0,0,1]:[1,0,0],v=d[1]?[0,0,1]:[0,1,0];let hit=null,length=range;for(let n=1;n<=range;n++){const plane=[];for(let a=0;a<2;a++)for(let b=0;b<2;b++){const q={x:p.x+d[0]*n+u[0]*a+v[0]*b,y:p.y+d[1]*n+u[1]*a+v[1]*b,z:p.z+d[2]*n+u[2]*a+v[2]*b};if(q.y<=0||q.y>=96)continue;const id=get(q.x,q.y,q.z);if(relay(id))hit={...q,dir:id-RELAY};plane.push(q);}if(hit){length=n;break;}for(const q of plane){const k=key(q);if(!unique.has(k)){unique.add(k);cells.push([q.x,q.y,q.z]);}}}segments.push({h:p,dir,length});if(!hit)break;const k=key(hit);if(visited.has(k)){truncated=true;break;}visited.add(k);p=hit;dir=hit.dir;if(hop===15)truncated=true;}return {segments,cells,truncated};}
 function clear(get,x,y,z,pass=id=>id===RAIL){for(const dx of [-.37,.37])for(const dz of [-.37,.37])for(const dy of [.23,.7,1.15]){const xx=Math.floor(x+dx),yy=Math.floor(y+dy),zz=Math.floor(z+dz),id=get(xx,yy,zz);if(id&&!pass(id)){let support=false;for(let ry=yy;ry<=yy+1;ry++)if(get(xx,ry,zz)===RAIL&&yy<ry)support=true;if(!support)return false;}}return true;}
 function parts(id,get=()=>0,x=0,y=0,z=0){if(relay(id)){const dir=id-RELAY;const q=[[.1,0,.08,.9,.14,.92,67],[.12,.12,.38,.22,1,.62,65],[.78,.12,.38,.88,1,.62,65],[.22,.88,.38,.78,1,.62,65],[.24,.2,.43,.76,.86,.57,48],[.37,.1,.04,.63,.16,.32,24]];return q.map(b=>{const pts=[];for(const a of [b[0],b[3]])for(const c of [b[2],b[5]]){const xx=a-.5,zz=c-.5,ang=dir<4?dir*Math.PI/2:0;pts.push([.5+xx*Math.cos(ang)-zz*Math.sin(ang),.5+xx*Math.sin(ang)+zz*Math.cos(ang)]);}return [Math.min(...pts.map(p=>p[0])),b[1],Math.min(...pts.map(p=>p[1])),Math.max(...pts.map(p=>p[0])),b[4],Math.max(...pts.map(p=>p[1])),b[6]];});}
 if(id===RAIL){
  const con=links(get,{x,y,z}).slice(0,2);if(!con.length)con.push({x,y,z:z-1},{x,y,z:z+1});if(con.length===1){const q=con[0];con.push({x:2*x-q.x,y,z:2*z-q.z});}
  const a=[con[0].x-x,con[0].z-z],b=[con[1].x-x,con[1].z-z],curve=a[0]*b[0]+a[1]*b[1]===0,out=[];
  function beam(cx,cz,h,length,width,angle,tile,tint,height=.045,pitch=0){out.push([cx-width/2,h,cz-length/2,cx+width/2,h+height,cz+length/2,tile,tint,angle,pitch]);}
  const center=[.5+.5*(a[0]+b[0]),.5+.5*(a[1]+b[1])],start=Math.atan2(-b[1],-b[0]);let end=Math.atan2(-a[1],-a[0]),delta=Math.atan2(Math.sin(end-start),Math.cos(end-start));
  function point(t,side=0){if(curve){const angle=start+delta*t,r=.5+side;return [center[0]+Math.cos(angle)*r,center[1]+Math.sin(angle)*r,.075+Math.max(0,con[0].y-y)*(1-t)+Math.max(0,con[1].y-y)*t];}return [.5+(a[0]*(1-t)+b[0]*t)*.5+b[1]*side,.5+(a[1]*(1-t)+b[1]*t)*.5-b[0]*side,.075+Math.max(0,con[0].y-y)*(1-t)+Math.max(0,con[1].y-y)*t];}
  for(const side of [-.23,.23])for(let i=0;i<24;i++){const p=point(i/24,side),q=point((i+1)/24,side),angle=Math.atan2(q[0]-p[0],q[1]-p[1]),length=Math.hypot(q[0]-p[0],q[1]-p[1],q[2]-p[2])+.006,pitch=Math.atan2(q[2]-p[2],Math.hypot(q[0]-p[0],q[1]-p[1])),h=(p[2]+q[2])/2;beam((p[0]+q[0])/2,(p[1]+q[1])/2,h,length,.065,angle,123,0x8997a2,.065,pitch);beam((p[0]+q[0])/2,(p[1]+q[1])/2,h+.065,length,.075,angle,123,0xe4edf2,.012,pitch);}
  for(let i=0;i<5;i++){const t=(i+.5)/5,p=point(t),q=point(Math.min(1,t+.001)),angle=Math.atan2(q[0]-p[0],q[1]-p[1]);beam(p[0],p[1],p[2]-.065,.085,.76,angle,6,0x998473,.055);}
  return out;
 }
 return [];}
 function pose(get,c,t=c.t||0){const a=c.node,b=c.next;if(!b)return {x:a.x+.5,y:a.y,z:a.z+.5};
  const q=t<.5?a:b,f=t<.5?t+.5:t-.5,previous=c.previous?c.previous.split(',').map(Number):null;
  let entry=t<.5?(previous?{x:previous[0],y:previous[1],z:previous[2]}:{x:a.x-D[c.heading||0][0],y:a.y,z:a.z-D[c.heading||0][2]}):a,exit=t<.5?b:next(get,b,key(a),b.dir)||{x:b.x+D[b.dir][0],y:b.y,z:b.z+D[b.dir][2]};
  if(get(q.x,q.y,q.z)!==RAIL)return {x:a.x+.5+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,z:a.z+.5+(b.z-a.z)*t};
  const u=[entry.x-q.x,entry.z-q.z],v=[exit.x-q.x,exit.z-q.z],height=q.y+Math.max(0,entry.y-q.y)*(1-f)+Math.max(0,exit.y-q.y)*f;
  if(u[0]*v[0]+u[1]*v[1]===0){const cx=q.x+.5+.5*(u[0]+v[0]),cz=q.z+.5+.5*(u[1]+v[1]),start=Math.atan2(-v[1],-v[0]),end=Math.atan2(-u[1],-u[0]),delta=Math.atan2(Math.sin(end-start),Math.cos(end-start)),ang=start+delta*f;return {x:cx+.5*Math.cos(ang),y:height,z:cz+.5*Math.sin(ang)};}
  return {x:q.x+.5+.5*(u[0]*(1-f)+v[0]*f),y:height,z:q.z+.5+.5*(u[1]*(1-f)+v[1]*f)};
 }
 const api={RELAY,RAIL,CART,ENGINE,D,relay,links,next,trace,clear,parts,key,pose};if(typeof module!=='undefined')module.exports=api;else root.TransitCore=api;
})(typeof globalThis!=='undefined'?globalThis:this);
