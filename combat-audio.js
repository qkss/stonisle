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
 function pickup(){if(!enabled||!ctx||ctx.state!=='running')return;const now=ctx.currentTime,o=ctx.createOscillator(),g=ctx.createGain();o.frequency.setValueAtTime(660,now);o.frequency.exponentialRampToValueAtTime(1320,now+.08);g.gain.setValueAtTime(.001,now);g.gain.exponentialRampToValueAtTime(.08,now+.01);g.gain.exponentialRampToValueAtTime(.001,now+.12);o.connect(g);g.connect(ctx.destination);o.start(now);o.stop(now+.13);o.onended=()=>{o.disconnect();g.disconnect();};} // 捡起东西：一声短短往上滑的“叮”
 let lastCraft=-1;
 function craft(){
  unlock();if(!enabled||!ctx||ctx.state!=='running')return;
  const now=ctx.currentTime;if(now-lastCraft<.15)return;lastCraft=now;
  for(const [delay,freq,volume] of [[0,210,.11],[.09,740,.055],[.15,990,.04]]){
   const o=ctx.createOscillator(),g=ctx.createGain(),t=now+delay;o.type=delay?'sine':'triangle';o.frequency.setValueAtTime(freq,t);o.frequency.exponentialRampToValueAtTime(freq*(delay?1.01:.55),t+.09);
   g.gain.setValueAtTime(.001,t);g.gain.exponentialRampToValueAtTime(volume,t+.006);g.gain.exponentialRampToValueAtTime(.001,t+.14);
   o.connect(g);g.connect(ctx.destination);o.start(t);o.stop(t+.15);o.onended=()=>{o.disconnect();g.disconnect();};
  }
 }
 let lastLaser=0;
 function laser(fire,k=0){unlock();if(!enabled||!ctx||ctx.state!=='running')return;const now=ctx.currentTime,interval=.46-.40*Math.max(0,Math.min(1,k));if(!fire&&now-lastLaser<interval)return;lastLaser=now;
 const duration=fire?5:Math.min(.20,interval*.8),src=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain(),tone=ctx.createOscillator(),tg=ctx.createGain(),lfo=ctx.createOscillator(),mod=ctx.createGain();src.buffer=noise;src.loop=true;filter.type='bandpass';filter.Q.value=2;filter.frequency.setValueAtTime(fire?2300:380+1800*k,now);filter.frequency.exponentialRampToValueAtTime(fire?500:500+2100*k,now+duration);gain.gain.setValueAtTime(.001,now);gain.gain.linearRampToValueAtTime(fire?.065:.008+.018*k,now+.03);gain.gain.exponentialRampToValueAtTime(.001,now+duration);tone.type='sawtooth';tone.frequency.setValueAtTime(fire?210:100+250*k,now);tone.frequency.exponentialRampToValueAtTime(fire?60:120+280*k,now+duration);tg.gain.value=fire?.007:.003;lfo.frequency.value=fire?45:22+25*k;mod.gain.value=180;lfo.connect(mod);mod.connect(filter.frequency);src.connect(filter);tone.connect(tg);tg.connect(filter);filter.connect(gain);gain.connect(ctx.destination);src.start();tone.start();lfo.start();src.stop(now+duration);tone.stop(now+duration);lfo.stop(now+duration);src.onended=()=>[src,filter,gain,tone,tg,lfo,mod].forEach(n=>n.disconnect());
 }
 window.CombatAudio={laserCharge:k=>laser(false,k),laserFire:()=>laser(true),unlock,swing:()=>burst(false),hit:()=>burst(true),pickup,craft};
 document.addEventListener('pointerdown',unlock,{capture:true});document.addEventListener('keydown',unlock,{capture:true});
 const toggle=document.getElementById('combatAudio');if(toggle){toggle.checked=enabled;toggle.onchange=()=>{enabled=toggle.checked;localStorage.setItem(key,enabled?'on':'off');if(enabled)unlock();};}
})();
