// Small synthesized effects; no asset downloads and no audio before user interaction.
(() => {
 let ctx,noise,lastSwing=-1,lastHit=-1;
 const key='stonisle.combatAudio';let enabled=localStorage.getItem(key)!=='off';
 function unlock(){
  if(!enabled)return;
  const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;
  if(!ctx){ctx=new Audio();noise=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*.3),ctx.sampleRate);const data=noise.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;}
  if(ctx.state==='suspended')ctx.resume().catch(()=>{});
 }
 function burst(hit){
  if(!enabled||!ctx||ctx.state!=='running')return;
  const now=ctx.currentTime;if(now-(hit?lastHit:lastSwing)<(hit?.12:.25))return;
  if(hit)lastHit=now;else lastSwing=now;
  const src=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain(),duration=hit?.13:.22;
  src.buffer=noise;filter.type=hit?'lowpass':'bandpass';filter.Q.value=hit?.65:.7;
  filter.frequency.setValueAtTime(hit?1800:650,now);filter.frequency.exponentialRampToValueAtTime(hit?220:1900,now+duration*.35);filter.frequency.exponentialRampToValueAtTime(hit?110:350,now+duration);
  gain.gain.setValueAtTime(.001,now);gain.gain.exponentialRampToValueAtTime(hit?.24:.11,now+.018);gain.gain.exponentialRampToValueAtTime(.001,now+duration);
  src.connect(filter);filter.connect(gain);gain.connect(ctx.destination);src.start(now);src.stop(now+duration);src.onended=()=>{src.disconnect();filter.disconnect();gain.disconnect();};
  if(hit){const osc=ctx.createOscillator(),g=ctx.createGain();osc.frequency.setValueAtTime(145,now);osc.frequency.exponentialRampToValueAtTime(55,now+.11);g.gain.setValueAtTime(.13,now);g.gain.exponentialRampToValueAtTime(.001,now+.12);osc.connect(g);g.connect(ctx.destination);osc.start(now);osc.stop(now+.13);osc.onended=()=>{osc.disconnect();g.disconnect();};}
 }
 window.CombatAudio={unlock,swing:()=>burst(false),hit:()=>burst(true)};
 document.addEventListener('pointerdown',unlock,{capture:true});document.addEventListener('keydown',unlock,{capture:true});
 const toggle=document.getElementById('combatAudio');if(toggle){toggle.checked=enabled;toggle.onchange=()=>{enabled=toggle.checked;localStorage.setItem(key,enabled?'on':'off');if(enabled)unlock();};}
})();
