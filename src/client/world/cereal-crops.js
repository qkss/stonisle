(function(root){
 const list=['小麦','稻谷','玉米','高粱'].map((name,i)=>({name,en:['wheat','rice','corn','sorghum'][i],id:430+i,product:420+i,seed:424+i,young:434+i*2,growing:435+i*2,seconds:[360,480,420,420][i],tile:108+i,youngTile:112+i,growingTile:116+i,top:[.9,.85,1,1][i],color:['#d9b65f','#d8c48b','#edbd4b','#a95335'][i]}));
 function draw(ctx,size){for(const [i,d] of list.entries())for(let stage=0;stage<3;stage++){
  const tile=[d.youngTile,d.growingTile,d.tile][stage];ctx.save();ctx.translate(tile*size,0);ctx.clearRect(0,0,size,size);ctx.scale(size/128,size/128);
  const stems=stage===0?3:i===2?2:5;
  for(let n=0;n<stems;n++){const x=26+n*(76/Math.max(1,stems-1)),top=stage===0?86:stage===1?42+n%2*9:18+n%2*12,bend=i===1?13:4;
   ctx.strokeStyle=stage===2&&i!==2?'#9d9453':'#54814a';ctx.lineWidth=i===2?4:2.6;ctx.beginPath();ctx.moveTo(x,125);ctx.quadraticCurveTo(x-5,80,x+bend,top);ctx.stroke();
   for(let j=0;j<(stage===0?2:3);j++){const y=112-j*22,side=j%2?1:-1;ctx.fillStyle=j%2?'#87a851':'#5d8c48';ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+side*30,y-26,x+side*34,y-16);ctx.quadraticCurveTo(x+side*16,y-4,x,y+4);ctx.fill();}
   if(stage===2){ctx.fillStyle=d.color;
    if(i===2){ctx.save();ctx.translate(x+7,64);ctx.rotate(.28);ctx.fillStyle='#7d9e49';ctx.beginPath();ctx.ellipse(0,0,10,24,0,0,7);ctx.fill();for(let row=0;row<7;row++)for(let col=0;col<3;col++){ctx.fillStyle=col===1?'#f5d87e':'#d6a13d';ctx.fillRect(-5+col*4,-19+row*5,3,4);}ctx.restore();}
    else for(let k=0;k<(i===3?22:12);k++){const dx=i===3?Math.sin(k*2.4)*(4+k*.2):(k%2?1:-1)*(i===1?5:3),yy=top+k*(i===3?1.4:2.6);ctx.beginPath();ctx.ellipse(x+bend+dx+(i===1?k*.5:0),yy,i===3?3:3.2,i===3?3:4.2,i===1?.65:k%2?.5:-.5,0,7);ctx.fill();}
   }
  }ctx.restore();
 }}
 const api={list,draw};if(typeof module!=='undefined')module.exports=api;else root.CerealCrops=api;
})(this);
