// Dedicated linen, quilt and piping tiles; shared by world, hand and inventory.
(() => {
  function draw(ctx,size){
    for(const tile of [87,88,89]){
      const data=ctx.createImageData(size,size);
      for(let y=0;y<size;y++)for(let x=0;x<size;x++){
        const u=x/size,v=y/size,thread=((x+y)%2?1:-1)*1.1;
        const fold=Math.sin(u*19+Math.sin(v*7)) * 2 + Math.cos(v*14)*1.5;
        const edge=Math.min(u,v,1-u,1-v),seam=edge<.025?-12:edge<.045?4:0;
        let base=tile===88?[68,113,112]:tile===89?[195,170,122]:[231,220,200];
        let stitch=0;if(tile===88){const d=Math.min(Math.abs((u+v)*4%1-.5),Math.abs((u-v+2)*4%1-.5));stitch=d<.018?-9:d<.035?3:0;}
        const k=(y*size+x)*4;for(let c=0;c<3;c++)data.data[k+c]=base[c]+thread+fold+seam+stitch;data.data[k+3]=255;
      }
      ctx.putImageData(data,tile*size,0);
    }
  }
  window.BedMaterials={draw};
})();
