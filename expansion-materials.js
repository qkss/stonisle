// Materials for glass, lava, explosives and furnace (atlas 81–86).
(() => {
 function draw(ctx,S){
  const noise=(x,y,s)=>Core.hash(x,y,s);
  const wave=(x,y)=>Math.sin(x*19+Math.sin(y*17)*1.4)+Math.cos(y*21+Math.sin(x*11));
  for(let t=81;t<=86;t++){
   const im=ctx.createImageData(S,S);
   for(let y=0;y<S;y++)for(let x=0;x<S;x++){
    const u=x/S,v=y/S,n=noise(x,y,t),edge=Math.min(u,v,1-u,1-v);let c;
    if(t===81){const streak=Math.exp(-(((u-v-.16)/.022)**2))*14;const k=edge<.012?19:edge<.035?7:0;c=[222+k+streak,232+k+streak,235+k+streak];}
    if(t===82){const veins=Math.abs(wave(u,v)),hot=Math.max(0,1-veins/.38);const crust=28+6*n+12*Math.sin(u*43)*Math.cos(v*37);c=hot>.01?[160+95*hot,36+166*hot*hot,8+58*hot**4]:[crust+13,crust*.66,crust*.51];}
    if(t===83){const dx=(u*4%1)-.5,dy=(v*4%1)-.5,d=Math.hypot(dx,dy);c=d>.47?[63,37,28]:[158+28*(1-d)+n*8,50+12*(1-d),34+n*6];if(d<.055)c=[48,35,24];if(d>.40&&d<.44)c=[111,39,27];}
    if(t===84){const stave=u*6%1,rib=Math.sin(stave*Math.PI),k=.62+.38*rib; c=[173*k+n*5,55*k+n*3,38*k];if(v>.19&&v<.28||v>.73&&v<.82)c=[79+n*8,66+n*6,48+n*3];if(v>.40&&v<.62)c=[211+n*5,195+n*5,157+n*4];}
    if(t===85||t===86){const row=Math.floor(v*5),bx=(u*3+(row%2)*.5)%1,by=v*5%1,mortar=Math.min(bx,1-bx)<.018||Math.min(by,1-by)<.032;const k=noise(Math.floor(u*3+(row%2)*.5),row,864);const grain=n*11; c=mortar?[52+grain,49+grain,44+grain]:[92+k*28+grain,87+k*24+grain,77+k*21+grain];
     if(t===86){const d=Math.max(Math.abs(u-.5)/.31,Math.abs(v-.57)/.30);if(d<1){c=[18+n*6,16+n*4,14+n*3];if(v>.65&&v<.80){const ember=(Math.sin(u*51+v*19)+1)/2;c=[120+105*ember,32+70*ember,9+15*ember];}if(v>.72&&Math.abs(u*8%1-.5)<.09)c=[42,37,30];}else if(d<1.13)c=[60+grain,54+grain,46+grain];const soot=Math.max(0,1-Math.abs(u-.5)*3)*Math.max(0,1-v/.30)*.32;c=c.map(a=>a*(1-soot));}
    }
    const i=(y*S+x)*4;for(let j=0;j<3;j++)im.data[i+j]=c[j];im.data[i+3]=255;
   }
   ctx.putImageData(im,t*S,0);
   if(t===84){ctx.save();ctx.translate(t*S,0);ctx.fillStyle='#473b2b';ctx.font=`bold ${S*.18}px serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('TNT',S*.5,S*.515);ctx.restore();}
  }
 }
 window.ExpansionMaterials={draw};
})();
