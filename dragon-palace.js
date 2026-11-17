// A dry, glazed underwater settlement with a surface access shaft.
(function(root){
 function build(){const cells=new Map(),put=(x,y,z,id)=>{if(y>=0&&y<64)cells.set(x+','+y+','+z,[x,y,z,id]);},box=(x,y,z,X,Y,Z,id)=>{for(let a=x;a<=X;a++)for(let b=y;b<=Y;b++)for(let c=z;c<=Z;c++)put(a,b,c,id);};
 // Coordinates retain the common town base=30; generator lowers this template to seabed base=2.
 for(let x=-54;x<=68;x++)for(let z=-52;z<=92;z++){
  box(x,28,z,x,30,z,155);const edge=x===-54||x===68||z===-52||z===92;
  const roof=42+Math.round(7*Math.max(0,1-Math.max(Math.abs(x-7)/61,Math.abs(z-20)/72)));
  box(x,31,z,x,roof-1,z,edge?282:0);put(x,roof,z,282);
 }
 const hall=(x,z,w,d,top)=>{box(x,31,z,x+w,top,z+d,155);box(x+1,31,z+1,x+w-1,top-1,z+d-1,0);box(x+w/2-1|0,31,z+d,x+w/2+1|0,33,z+d,0);
  for(const X of [x,x+w])for(const Z of [z,z+d]){box(X,31,Z,X,top,Z,57);put(X,top+1,Z,59);}
  for(let r=0;r<3;r++)box(x-2+r,top+r,z-2+r,x+w+2-r,top+r,z+d+2-r,r===0?57:282);
  for(let X=x+2;X<x+w;X+=3){box(X,33,z,X+1,top-1,z,282);put(X,31,z+1,59);}put(x+2,31,z+2,67);put(x+2,31,z+3,67);
 };
 // Perimeter walls and open gates, same patrol coordinates as other cities.
 for(const x of [-42,56]){box(x-1,30,-40,x+1,36,80,155);box(x,31,24,x,34,28,0);box(x-1,31,24,x+1,34,28,0);}
 for(const z of [-40,80]){box(-42,30,z-1,56,36,z+1,155);box(-2,31,z-1,2,34,z+1,0);}
 for(let x=-42;x<=56;x+=4)for(const z of [-40,80])put(x,37,z,57);
 for(let z=-40;z<=80;z+=4)for(const x of [-42,56])put(x,37,z,57);
 box(-3,30,-40,3,30,91,52);box(-42,30,24,56,30,28,52);
 for(const x of [-32,19])for(const z of [-28,34,57])hall(x,z,13,11,35);
 // Palace, stacked galleries and an internal staircase to the roof and treasure.
 hall(-9,-17,18,20,42);box(-8,35,-16,8,35,2,155);box(-8,40,-16,8,40,2,155);
 for(let y=31;y<=44;y++){put(6,y,-12,155);put(6,y,-11,160);}put(6,45,-12,155);put(6,45,-11,160);
 box(-3,44,-7,6,44,-2,155);box(-3,45,-7,5,47,-2,0);put(0,41,-9,196);
 for(const x of [-7,7])for(const y of [34,39]){put(x,y,4,59);put(x,y,-18,59);}for(const z of [-13,-5,1])for(const x of [-10,10])put(x,35,z,59);
 for(const y of [32,37,42])for(const x of [-5,0,5])put(x,y,-15,59);
 // Layered ceremonial facade: blue window bays, gold cornices and an open columned porch.
 for(const y of [35,40])box(-9,y,3,9,y,3,57);
 for(const x of [-7,-3,2,6])for(const y of [33,38]){box(x,y,3,x+1,y+1,3,282);for(const X of [x-1,x+2])box(X,y,3,X,y+1,3,57);}
 box(-2,31,3,2,34,3,0);box(-1,35,3,1,35,3,0);
 for(const x of [-8,8])for(const z of [6,10]){box(x,31,z,x,35,z,155);put(x,31,z,57);put(x,35,z,57);put(x,36,z,59);}
 for(let r=0;r<3;r++){box(-11+r,36+r,4+r,11-r,36+r,12-r,r===0?57:282);for(const x of [-11+r,11-r])put(x,37+r,12-r,57);}
 // Twin sea gardens: coral-like crystal spires, pearl lights and low pools.
 for(const x of [-22,24])for(const z of [9,18]){box(x-3,30,z-3,x+3,30,z+3,282);box(x,31,z,x,34,z,58);for(const [dx,dz] of [[-2,0],[2,1],[0,-2]]){box(x+dx,31,z+dz,x+dx,32,z+dz,286);put(x+dx,33,z+dz,59);}}
 for(let z=-32;z<=76;z+=12)for(const x of [-5,5]){box(x,31,z,x,33,z,57);put(x,34,z,59);}
 // Raise and reseal the palace dome above its accessible rooftop. No holes over the flag.
 for(let x=-13;x<=13;x++)for(let z=-21;z<=7;z++){
  const edge=x===-13||x===13||z===-21||z===7;for(let y=45;y<=48;y++)put(x,y,z,edge?282:0);put(x,49,z,282);
 }
 put(6,45,-12,155);put(6,45,-11,160);
 // Enclosed, dry ladder shaft reaching above sea level, with an open landing.
 box(-2,31,85,2,53,89,282);box(-1,31,86,1,54,88,0);box(0,31,85,0,53,85,155);for(let y=31;y<=53;y++)put(0,y,86,160);
 box(-1,31,85,1,33,85,0);for(let y=31;y<=33;y++){put(0,y,85,155);put(0,y,86,160);} // side entrances into shaft
 box(-2,31,87,-1,33,88,0);box(1,31,87,2,33,88,0);
 box(-4,52,83,4,52,91,155);box(-1,52,86,1,53,88,0);put(0,52,86,160);put(0,53,86,160);
 return [...cells.values()];
 }
 const api={build};if(typeof module!=='undefined')module.exports=api;else root.DragonPalace=api;
})(this);
