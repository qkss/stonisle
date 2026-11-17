// Transparent blossom sprigs for the same wind-driven cards as ordinary leaves.
(() => {
 let map;
 function texture(){
  if(map)return map;
  const canvas=document.createElement('canvas');canvas.width=canvas.height=512;const c=canvas.getContext('2d');
  let seed=173;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  c.lineCap='round';
  for(let branch=0;branch<7;branch++){
   const endX=55+rand()*402,endY=35+rand()*275;
   c.strokeStyle='#695043';c.lineWidth=3+rand()*3;c.beginPath();c.moveTo(260,477);c.quadraticCurveTo(260+(endX-260)*.7,270,endX,endY);c.stroke();
   for(let j=0;j<5;j++){
    const t=.25+j*.16,x=260+(endX-260)*t+(rand()-.5)*49,y=477+(endY-477)*t;
    if(j%2===0){c.save();c.translate(x+15,y+9);c.rotate(rand()*3);const grad=c.createLinearGradient(-20,0,20,0);grad.addColorStop(0,'#395444');grad.addColorStop(.5,'#80966a');grad.addColorStop(1,'#52684c');c.fillStyle=grad;c.beginPath();c.ellipse(0,0,24,9,0,0,Math.PI*2);c.fill();c.restore();}
    c.save();c.translate(x,y);c.rotate(rand()*6.28);const r=13+rand()*10;
    for(let p=0;p<5;p++){
     c.rotate(Math.PI*2/5);const grad=c.createRadialGradient(0,2,1,0,-r*.58,r);grad.addColorStop(0,'#d889a0');grad.addColorStop(.45,'#efb5c7');grad.addColorStop(1,branch%2?'#f8d9df':'#f5e7e5');c.fillStyle=grad;
     c.beginPath();c.moveTo(0,3);c.bezierCurveTo(-r*.85,-r*.35,-r*.75,-r*1.35,-r*.17,-r*1.3);c.lineTo(0,-r*1.15);c.lineTo(r*.17,-r*1.3);c.bezierCurveTo(r*.75,-r*1.35,r*.85,-r*.35,0,3);c.fill();
     c.strokeStyle='#b77186';c.lineWidth=.7;c.beginPath();c.moveTo(0,1);c.lineTo(0,-r*.55);c.stroke();c.fillStyle='#e9c589';c.beginPath();c.arc(0,-r*.55,1.25,0,Math.PI*2);c.fill();
    }c.fillStyle='#b76882';c.beginPath();c.arc(0,0,2.8,0,Math.PI*2);c.fill();c.restore();
   }
  }
  map=new THREE.CanvasTexture(canvas);map.anisotropy=4;return map;
 }
 window.CherryMaterial={texture};
})();
