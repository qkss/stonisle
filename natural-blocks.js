// Natural expansion artwork. Keep alpha-cutout glass and plants in their dedicated pipeline.
(() => {
  const tiles=[18,19,20,21,22,23,24,25,26,27,28,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46];
  let image,wood,loading;
  window.NaturalBlocks={tiles,
    load(){const read=file=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('Natural material could not load: '+file));img.src='texture-packs/natural-v1/'+file;});return loading||(loading=Promise.all([read('expansion-source.png'),read('wood-family-source.png')]).then(([a,b])=>{image=a;wood=b;}).catch(e=>{loading=null;throw e;}));},
    draw(context,size){if(!image)return;const w=image.width/6,h=image.height/5;for(const tile of tiles){const i=tile-17,x=Math.round(i%6*w),y=Math.round(Math.floor(i/6)*h),right=Math.round((i%6+1)*w),bottom=Math.round((Math.floor(i/6)+1)*h);context.drawImage(image,x,y,right-x,bottom-y,tile*size,0,size,size);}
      if(wood)for(let i=0;i<12;i++){const x=Math.round(i%4*wood.width/4),y=Math.round(Math.floor(i/4)*wood.height/3),r=Math.round((i%4+1)*wood.width/4),b=Math.round((Math.floor(i/4)+1)*wood.height/3);context.drawImage(wood,x,y,r-x,b-y,(49+i)*size,0,size,size);}
    }
  };
})();
