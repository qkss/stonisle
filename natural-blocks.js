// Natural expansion artwork. Keep alpha-cutout glass and plants in their dedicated pipeline.
(() => {
  const tiles=[18,19,20,21,22,23,24,25,26,27,28,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46];
  let image,wood,botanical,stoneHarvest,loading;
  window.NaturalBlocks={tiles,
    load(){const read=file=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('Natural material could not load: '+file));img.src='texture-packs/natural-v1/'+file;});return loading||(loading=Promise.all([read('expansion-source.png'),read('wood-family-source.png'),read('botanical-source-v2.png'),read('stone-harvest-source.png')]).then(([a,b,c,d])=>{image=a;wood=b;botanical=c;stoneHarvest=d;}).catch(e=>{loading=null;throw e;}));},
    draw(context,size){if(!image)return;const w=image.width/6,h=image.height/5;for(const tile of tiles){const i=tile-17,x=Math.round(i%6*w),y=Math.round(Math.floor(i/6)*h),right=Math.round((i%6+1)*w),bottom=Math.round((Math.floor(i/6)+1)*h);context.drawImage(image,x,y,right-x,bottom-y,tile*size,0,size,size);}
      if(wood)for(let i=0;i<12;i++){const x=Math.round(i%4*wood.width/4),y=Math.round(Math.floor(i/4)*wood.height/3),r=Math.round((i%4+1)*wood.width/4),b=Math.round((Math.floor(i/4)+1)*wood.height/3);context.drawImage(wood,x,y,r-x,b-y,(49+i)*size,0,size,size);}
      // Shared natural surfaces for world blocks, held models and inventory icons.
      if(stoneHarvest)[64,65,66,67,68,70,71,72,73].forEach((tile,i)=>{
        const x=Math.round(i%3*stoneHarvest.width/3),y=Math.round(Math.floor(i/3)*stoneHarvest.height/3);
        const r=Math.round((i%3+1)*stoneHarvest.width/3),b=Math.round((Math.floor(i/3)+1)*stoneHarvest.height/3);
        context.drawImage(stoneHarvest,x,y,r-x,b-y,tile*size,0,size,size);
      });
      if(botanical){
        const cell=(i,tile,qx,qy)=>{const half=size/2;context.clearRect(tile*size+qx*half,qy*half,half,half);context.drawImage(botanical,i%4*botanical.width/4,Math.floor(i/4)*botanical.height/2,botanical.width/4,botanical.height/2,tile*size+qx*half,qy*half,half,half);};
        for(let i=0;i<4;i++)cell(i,61,i%2,Math.floor(i/2));
        for(let i=0;i<3;i++)cell(i+4,62,i%2,Math.floor(i/2));
        context.clearRect(29*size,size/2,size,size/2);
        context.drawImage(botanical,3*botanical.width/4,botanical.height/2,botanical.width/4,botanical.height/2,29*size,size/2,size,size/2);
      }
      // Damp irregular furrows; avoid perfectly uniform horizontal stripes.
      const soil=context.createImageData(size,size);
      for(let y=0;y<size;y++)for(let x=0;x<size;x++){
        const u=x/size,v=y/size,n=Core.hash(x,y,863),ridge=Math.pow((1+Math.cos(v*Math.PI*10+Math.sin(u*9)*.35))/2,1.7),k=.60+ridge*.42+n*.15;
        const i=(y*size+x)*4;soil.data.set([101*k,72*k,46*k,255],i);
      }context.putImageData(soil,63*size,0);
    }
  };
})();
