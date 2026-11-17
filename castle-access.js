(function(root){
 function blocks(){const out=[],put=(x,y,z,id)=>out.push([x,y,z,id]);
  // Courtyard to wall walks: face north, backing wall on the south.
  for(const x of [-8,8])for(let y=31;y<=37;y++){put(x,y,16,10);put(x,y,15,162);}
  for(const [cx,cz] of [[-14,-14],[14,-14],[-14,16],[14,16]]){
   // An internal timber-backed shaft continues through the roof to a clear hatch.
   for(let y=31;y<=54;y++){put(cx+1,y,cz-3,181);put(cx+1,y,cz-2,160);}
   for(let x=cx-2;x<=cx+2;x++)for(let z=cz-2;z<=cz+2;z++)if(x!==cx+1||z!==cz-2)put(x,53,z,10);
   for(let x=cx-2;x<=cx+2;x++)for(let z=cz-2;z<=cz+2;z++){
    put(x,54,z,(Math.abs(x-cx)===2||Math.abs(z-cz)===2)&&x!==cx&&z!==cz&&!(x===cx+1&&z===cz-2)?222:0);put(x,55,z,0);
   }
   put(cx+1,54,cz-2,160); // leave the hatch open, supported against the timber mast
  }
  // Keep access shaft and a small rooftop landing.
  for(let y=31;y<=55;y++){put(7,y,0,181);put(6,y,0,161);}
  for(let x=4;x<=6;x++)for(let z=-1;z<=1;z++){if(x!==6||z!==0)put(x,54,z,10);put(x,55,z,0);put(x,56,z,0);}
  put(6,55,0,161);return out;
 }
 const api={blocks};if(typeof module!=='undefined')module.exports=api;else root.CastleAccess=api;
})(this);
