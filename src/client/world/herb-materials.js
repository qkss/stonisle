// Transparent medicinal plant silhouettes, shared by world meshes and inventory icons.
window.HerbMaterials={draw(ctx,size){
 for(let k=0;k<6;k++){
  ctx.save();ctx.translate((87+k)*size,0);ctx.clearRect(0,0,size,size);ctx.scale(size/128,size/128);
  const leaf=(x,y,a,w,h,c)=>{ctx.save();ctx.translate(x,y);ctx.rotate(a);const gr=ctx.createLinearGradient(-w,0,w,0);gr.addColorStop(0,c);gr.addColorStop(.5,'#94ac79');gr.addColorStop(1,'#345843');ctx.fillStyle=gr;ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(-w,-h*.55,0,-h);ctx.quadraticCurveTo(w,-h*.5,0,0);ctx.fill();ctx.strokeStyle='#c5c99d88';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-h*.9);ctx.stroke();ctx.restore();};
  if(k===0){
   for(const [x,y,r] of [[45,65,27],[79,43,30],[83,89,22]]){ctx.strokeStyle='#94724a';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(61,120);ctx.quadraticCurveTo(x-9,y+20,x,y);ctx.stroke();const gr=ctx.createRadialGradient(x-5,y-5,2,x,y,r);gr.addColorStop(0,'#a95131');gr.addColorStop(.5,'#78382a');gr.addColorStop(.85,'#b06b3e');gr.addColorStop(1,'#e5bd7c');ctx.fillStyle=gr;ctx.beginPath();ctx.ellipse(x,y,r,r*.45,-.15,0,7);ctx.fill();for(let n=1;n<4;n++){ctx.strokeStyle='#e6a86a66';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(x,y,r*n/4,r*.45*n/4,-.15,Math.PI,Math.PI*2);ctx.stroke();}}
  }else if(k===1||k===3){
   for(let i=0;i<7;i++)leaf(64,115,(i-3)*.46,12,48,'#496e69');
   for(let ring=0;ring<2;ring++)for(let i=0;i<9;i++){ctx.save();ctx.translate(64,65);ctx.rotate(i*Math.PI*2/9+ring*.3);const gr=ctx.createLinearGradient(0,-42,0,0);gr.addColorStop(0,k===3?'#e2ccf5':'#fff9df');gr.addColorStop(.6,'#d6e6e5');gr.addColorStop(1,'#7dabc0');ctx.fillStyle=gr;ctx.beginPath();ctx.moveTo(0,5);ctx.bezierCurveTo(-15,-12,-12,-29,0,-42+ring*13);ctx.bezierCurveTo(12,-29,15,-12,0,5);ctx.fill();ctx.restore();}ctx.fillStyle='#d7bc64';ctx.beginPath();ctx.arc(64,65,8,0,7);ctx.fill();
  }else{
   for(let i=0;i<5;i++){const x=35+i*14,y=29+(i%2)*16;ctx.strokeStyle='#57774d';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(64,120);ctx.quadraticCurveTo(x,85,x,y);ctx.stroke();leaf(x,95,-.8,9,30,'#436845');leaf(x,78,.8,8,25,'#546f4b');for(let j=0;j<5;j++){const yy=y+j*5;ctx.fillStyle=k===4?(j%2?'#efd379':'#b88d32'):k===5?(j%2?'#7fd1ac':'#37816d'):(j%2?'#b09bd2':'#7961a7');ctx.beginPath();ctx.ellipse(x+(j%2?4:-4),yy,5,3,j%2?.5:-.5,0,7);ctx.fill();}ctx.fillStyle='#d5e5f4';ctx.beginPath();ctx.arc(x+5,y+14,1.8,0,7);ctx.fill();}
  }
  ctx.restore();
 }

 // Twelve distinct growth silhouettes packed into the remaining three atlas tiles.
 for(let i=0;i<6;i++)for(let phase=0;phase<2;phase++){
  ctx.save();ctx.translate((93+Math.floor(i/2))*size+phase*size/2,(i%2)*size/2);ctx.clearRect(0,0,size/2,size/2);ctx.scale(size/256,size/256);
  const leaf=(x,y,angle,len,width)=>{ctx.save();ctx.translate(x,y);ctx.rotate(angle);const gr=ctx.createLinearGradient(-width,0,width,-len);gr.addColorStop(0,'#3b6841');gr.addColorStop(.55,phase?'#79a55b':'#a0c979');gr.addColorStop(1,'#c3d995');ctx.fillStyle=gr;ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(-width,-len*.5,0,-len);ctx.quadraticCurveTo(width,-len*.5,0,0);ctx.fill();ctx.strokeStyle='#d4e4ac88';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-len*.9);ctx.stroke();ctx.restore();};
  if(i===0){ // Lingzhi starts as pinheads, then develops small closed caps.
   for(let n=0;n<(phase?3:2);n++){const x=43+n*22,y=phase?50+n%2*20:72+n*8;ctx.strokeStyle='#bba47c';ctx.lineWidth=phase?10:7;ctx.beginPath();ctx.moveTo(x,119);ctx.quadraticCurveTo(x-8,88,x,y);ctx.stroke();const g=ctx.createRadialGradient(x-3,y-4,1,x,y,phase?17:9);g.addColorStop(0,'#deae74');g.addColorStop(1,'#8b4931');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(x,y,phase?18:9,phase?10:12,0,0,7);ctx.fill();}
  }else{
   ctx.strokeStyle='#5b854d';ctx.lineWidth=phase?4:3;ctx.beginPath();ctx.moveTo(64,120);ctx.quadraticCurveTo(59,85,64,phase?35:67);ctx.stroke();
   leaf(64,phase?112:100,-.9,phase?49:35,phase?17:18);leaf(64,phase?99:100,.9,phase?47:35,phase?17:18);
   if(phase){leaf(64,79,-.65,33,12);leaf(64,66,.65,29,11);if(i===1||i===3){ctx.fillStyle=i===1?'#b5c8bf':'#ae9ebd';ctx.beginPath();ctx.ellipse(64,30,10,19,0,0,7);ctx.fill();leaf(64,48,-.23,24,8);leaf(64,48,.23,24,8);}else{ctx.fillStyle=['','','#7e6b99','','#ad9a50','#68a286'][i];for(let n=0;n<3;n++){ctx.beginPath();ctx.ellipse(62+n%2*7,35+n*7,4,6,.2,0,7);ctx.fill();}}}
  }ctx.restore();
 }

 for(const d of HerbVarieties.list){
  ctx.save();ctx.translate(d.tile*size,0);ctx.clearRect(0,0,size,size);ctx.scale(size/128,size/128);
  const rank=d.rank;
  const leaf=(x,y,angle,len,width)=>{ctx.save();ctx.translate(x,y);ctx.rotate(angle);const g=ctx.createLinearGradient(-width,0,width,-len);g.addColorStop(0,'#325742');g.addColorStop(.5,rank>=3?'#a5b97d':'#7fa991');g.addColorStop(1,rank===4?'#e1d694':'#b2c6a0');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(-width,-len*.55,0,-len);ctx.quadraticCurveTo(width,-len*.5,0,0);ctx.fill();ctx.strokeStyle=d.color;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-len*.9);ctx.stroke();ctx.restore();};
  if(d.family===0){
   for(let n=0;n<5+rank;n++)leaf(64,119,(n-(4+rank)/2)*.4,38+rank*3,12);
   for(let ring=0;ring<2+(rank>=2?1:0);ring++){const count=7+rank*2;for(let n=0;n<count;n++){ctx.save();ctx.translate(64,65);ctx.rotate(n*Math.PI*2/count+ring*.3);const length=37+rank*3-ring*7,g=ctx.createLinearGradient(0,-length,0,0);g.addColorStop(0,rank>=3?'#fff0bf':'#edf6f4');g.addColorStop(.45,d.color);g.addColorStop(1,rank>=3?'#9d9150':'#769aa8');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(0,4);ctx.bezierCurveTo(-11,-12,-10,-length*.8,0,-length);ctx.bezierCurveTo(10,-length*.8,11,-12,0,4);ctx.fill();ctx.restore();}}
   ctx.fillStyle=rank>=3?'#edc75a':'#d6b57b';ctx.beginPath();ctx.arc(64,65,6+rank*.6,0,7);ctx.fill();
  }else{
   // A visible, forked root with rootlets and a leaf crown distinguishes ginseng.
   const root=ctx.createLinearGradient(47,0,77,0);root.addColorStop(0,'#856344');root.addColorStop(.5,rank>=3?'#e8ce8d':'#d3ba8a');root.addColorStop(1,'#a48656');ctx.strokeStyle=root;ctx.lineCap='round';
   ctx.lineWidth=10+rank*3;ctx.beginPath();ctx.moveTo(64,53);ctx.quadraticCurveTo(57,78,64,90);ctx.stroke();
   for(const sign of [-1,1]){ctx.lineWidth=5+rank;ctx.beginPath();ctx.moveTo(63,85);ctx.quadraticCurveTo(64+sign*14,102,64+sign*(18+rank*2),119);ctx.stroke();ctx.lineWidth=2;for(let n=0;n<2+rank;n++){const y=69+n*8;ctx.beginPath();ctx.moveTo(64+sign*6,y);ctx.quadraticCurveTo(64+sign*24,y+3,64+sign*(27+rank),y+12);ctx.stroke();}}
   for(let n=0;n<5+rank;n++)leaf(64,57,(n-(4+rank)/2)*.46,35+rank*2,11);
   for(let n=0;n<2+rank;n++){ctx.fillStyle=rank>=3?'#c4a755':'#ab5242';ctx.beginPath();ctx.arc(58+n%3*6,38-Math.floor(n/3)*5,3,0,7);ctx.fill();}
   ctx.strokeStyle='#775b3b66';ctx.lineWidth=1;for(let n=0;n<3+rank;n++){ctx.beginPath();ctx.moveTo(58,66+n*4);ctx.lineTo(69,64+n*4);ctx.stroke();}
  }
  if(rank>=3){ctx.fillStyle=d.color;for(const [x,y] of [[24,34],[104,49],[93,14]]){ctx.beginPath();ctx.moveTo(x,y-3);ctx.lineTo(x+2,y);ctx.lineTo(x,y+3);ctx.lineTo(x-2,y);ctx.closePath();ctx.fill();}}
  ctx.restore();
 }
 // Both species retain actual seedling / bud silhouettes during cultivation.
 ctx.clearRect(106*size,0,size,size);
 for(let phase=0;phase<2;phase++){
  ctx.drawImage(ctx.canvas,93*size+phase*size/2,size/2,size/2,size/2,106*size+phase*size/2,0,size/2,size/2);
  ctx.drawImage(ctx.canvas,95*size+phase*size/2,0,size/2,size/2,106*size+phase*size/2,size/2,size/2,size/2);
 }
}};
