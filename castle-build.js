// A self-contained, editable castle scene. Does not touch existing saved worlds.
(function(root){
 function build(world){
  const put=(x,y,z,id)=>{if(y>=0&&y<64&&world.get(x,y,z)!==id)world.set(x,y,z,id);};
  const box=(x0,y0,z0,x1,y1,z1,id)=>{for(let x=x0;x<=x1;x++)for(let z=z0;z<=z1;z++)for(let y=y0;y<=y1;y++)put(x,y,z,id);};
  // Level a small meadow and give the fortress a continuous foundation.
  for(let x=-25;x<=53;x++)for(let z=-26;z<=61;z++){box(x,31,z,x,63,z,0);box(x,27,z,x,29,z,2);put(x,30,z,1);}
  box(-17,28,-17,17,30,19,10);
  // Moat and timber bridge, kept below the walking surface.
  for(let x=-21;x<=21;x++)for(let z=-21;z<=23;z++)if(x<-17||x>17||z<-17||z>19){put(x,28,z,3);put(x,29,z,5);put(x,30,z,0);}
  box(-2,30,18,2,30,25,94);for(const x of [-3,3])for(let z=18;z<=25;z++){put(x,30,z,181);put(x,31,z,222);}
  for(let z=24;z<=43;z++)for(let x=-2;x<=2;x++)put(x,30,z,52);
  // Curtain walls: a two-block-wide walk with alternating merlons.
  for(let x=-14;x<=14;x++)for(const z of [-14,16]){box(x,31,z,x,37,z,10);box(x,37,z-1,x,37,z+1,52);if(x%2===0)box(x,38,z,x,39,z,10);}
  for(let z=-14;z<=16;z++)for(const x of [-14,14]){box(x,31,z,x,37,z,10);box(x-1,37,z,x+1,37,z,52);if(z%2===0)box(x,38,z,x,39,z,10);}
  // Pale buttresses and a recessed gate with a stepped arch.
  for(const x of [-10,-6,6,10])for(const z of [-14,16]){box(x,31,z-1,x,36,z+1,155);put(x,37,z+1,55);}
  box(-4,31,15,4,40,18,10);box(-2,31,15,2,34,18,0);box(-1,35,15,1,36,18,0);
  for(const x of [-3,3])box(x,31,18,x,35,18,155);box(-2,36,18,2,36,18,155);box(-1,37,18,1,37,18,155);
  for(const x of [-4,4]){put(x,34,19,59);box(x,38,17,x,40,17,155);}for(let x=-4;x<=4;x+=2)put(x,41,17,10);
  // Four hollow towers with slit windows, accessible ladders and tapered roofs.
  for(const [cx,cz] of [[-14,-14],[14,-14],[-14,16],[14,16]]){
   for(let y=31;y<=43;y++)for(let x=cx-3;x<=cx+3;x++)for(let z=cz-3;z<=cz+3;z++){
    const edge=Math.abs(x-cx)===3||Math.abs(z-cz)===3,corner=Math.abs(x-cx)===3&&Math.abs(z-cz)===3;
    put(x,y,z,edge?(corner?155:10):0);
   }
   box(cx-2,36,cz-2,cx+2,36,cz+2,94);box(cx-3,43,cz-3,cx+3,43,cz+3,155);
   for(const dy of [33,39])for(const [x,z] of [[cx,cz-3],[cx,cz+3],[cx-3,cz],[cx+3,cz]])box(x,dy,z,x,dy+2,z,280);
   const inward=cz>0?-1:1;box(cx-1,31,cz+inward*3,cx+1,33,cz+inward*3,0);
   for(let y=31;y<=42;y++)put(cx+1,y,cz-2,160);put(cx+1,36,cz-2,160);
   for(let r=4;r>=0;r--){let y=44+(4-r)*2;box(cx-r,y,cz-r,cx+r,y,cz+r,55);if(r)box(cx-r+1,y+1,cz-r+1,cx+r-1,y+1,cz+r-1,55);}
   box(cx,53,cz,cx,55,cz,181);box(cx+1,54,cz,cx+3,55,cz,9);put(cx,44,cz,59);
  }
  // Central keep, three furnished levels and tall paired windows.
  box(-7,31,-11,7,45,2,10);box(-6,31,-10,6,44,1,0);
  for(const y of [35,40,45])box(-6,y,-10,6,y,1,94);
  for(const x of [-7,7])for(const z of [-11,2])box(x,31,z,x,45,z,155);
  box(-1,31,2,1,34,2,0);box(0,35,2,0,35,2,0);
  for(const y of [32,37,42])for(const x of [-4,4]){box(x,y,2,x,y+2,2,280);box(x-1,y-1,3,x+1,y-1,3,155);}
  for(const x of [-7,7])for(const z of [-7,-2])for(const y of [32,37,42])box(x,y,z,x,y+2,z,280);
  for(let r=8;r>=0;r--){const y=46+(8-r);box(-r,y,-12,r,y,3,55);}
  box(-1,55,-6,1,55,-4,155);put(0,56,-5,59);
  // Interior stair flights along the west wall, rising toward the rear.
  for(const level of [0,5])box(-5,35+level,-5,-4,35+level,-1,0);
  for(let i=0;i<5;i++)for(const level of [0,5]){put(-5,31+level+i,-1-i,208);put(-4,31+level+i,-1-i,208);}
  box(-5,35,-7,-4,35,-6,94);box(-5,40,-7,-4,40,-6,94);
  for(const y of [34,39,44]){put(0,y,-9,59);put(5,y,0,59);}
  // Ground floor: dining hall with a raised tabletop, chairs and a working kitchen.
  box(-1,31,-7,1,31,-5,242);
  for(const z of [-7,-5]){put(-2,31,z,209);put(2,31,z,211);}
  for(let z=-9;z<=-6;z++)put(5,31,z,94);
  put(5,32,-9,289);put(5,32,-8,197);put(5,32,-6,59);
  put(3,31,-9,197);put(3,32,-9,218);
  box(4,33,-10,6,33,-10,242);
  // Bedroom floor: two private rooms off an open west-side corridor.
  box(1,36,-10,1,39,1,94);box(1,36,-8,1,38,-8,0);box(1,36,-1,1,38,-1,0);
  box(2,36,-4,6,39,-4,94);
  for(const z of [-8,-1]){put(1,36,z,189);put(1,37,z,189);}
  for(const z of [-9,-2]){
   put(4,36,z,67);put(4,36,z+1,67);
   put(5,36,z+1,94);put(5,37,z+1,59);
   put(2,36,z,197);put(2,37,z,218);
   // Pale floor inlay and timber headboard give each bed its own alcove.
   box(3,35,z,5,35,z+2,93);put(4,36,z+2,94);
  }
  // Upper lounge: paired benches, low table and storage along the back wall.
  box(-1,41,-7,1,41,-6,218);
  for(const x of [-1,0,1]){put(x,41,-8,210);put(x,41,-5,208);}
  for(const x of [3,5]){put(x,41,-9,197);put(x,42,-9,242);}
  put(5,41,-2,94);put(5,42,-2,59);
  // Guard tower bunk rooms, with a bed and personal supply chest each.
  for(const [cx,cz] of [[-14,-14],[14,-14],[-14,16],[14,16]]){
   put(cx-1,31,cz,67);put(cx-1,31,cz+1,67);put(cx+1,31,cz+1,197);put(cx+2,34,cz+2,59);
  }
  // Courtyard path, fountain and rose beds.
  box(-2,30,3,2,30,15,52);box(-11,30,7,11,30,9,52);
  for(let x=-2;x<=2;x++)for(let z=6;z<=10;z++)put(x,31,z,Math.abs(x)===2||z===6||z===10?155:5);
  put(0,31,8,155);put(0,32,8,155);put(0,33,8,5);
  for(const cx of [-8,8])for(const cz of [5,12]){box(cx-2,30,cz-1,cx+2,30,cz+1,1);for(let x=cx-2;x<=cx+2;x++)for(let z=cz-1;z<=cz+1;z++)if((x+z)%2===0)put(x,31,z,77);}
  for(const x of [-5,5])for(const z of [4,12,24]){box(x,31,z,x,33,z,181);put(x,34,z,59);put(x,35,z,55);}
  // East-side animal paddock: two-high timber rails keep jumping rabbits inside.
  box(25,30,-12,42,30,8,1);
  for(let x=25;x<=42;x++)for(const z of [-12,8])box(x,31,z,x,32,z,222);
  for(let z=-12;z<=8;z++)for(const x of [25,42])box(x,31,z,x,32,z,222);
  for(const x of [25,42])for(const z of [-12,8]){box(x,31,z,x,33,z,181);put(x,34,z,59);}
  box(25,31,0,25,32,0,189);box(22,30,-1,26,30,1,52);
  // Open shelter and a shallow drinking trough; no water deep enough to trap an animal.
  for(const x of [34,40])for(const z of [-10,-6])box(x,31,z,x,34,z,181);
  box(33,35,-11,41,35,-5,55);box(34,36,-10,40,36,-6,55);
  box(35,30,-10,39,30,-6,53);
  for(let x=28;x<=32;x++)for(let z=-9;z<=-7;z++)put(x,30,z,x===28||x===32||z===-9||z===-7?155:5);
  box(39,31,4,40,31,5,53);
  // Gentle viewing hill on the south-east side, accessible on foot.
  for(let x=24;x<=52;x++)for(let z=34;z<=62;z++){const h=Math.max(0,10-Math.floor(Math.hypot(x-38,z-48)/1.5));if(h){box(x,31,z,x,29+h,z,2);put(x,30+h,z,1);}}
  return {pos:[38.5,41,48.5,.64,-.02],name:'云岚城堡',animals:[{type:'野兔',x:29.5,y:31,z:2.5},{type:'野兔',x:32.5,y:31,z:4.5},{type:'鹿',x:35.5,y:31,z:1.5},{type:'鹿',x:38.5,y:31,z:3.5}]};
 }
 const api={build};if(typeof module!=='undefined')module.exports=api;else root.CastleBuild=api;
})(this);
