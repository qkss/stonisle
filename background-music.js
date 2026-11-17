// Original ambient scores, synthesized locally. No network assets or autoplay.
(() => {
  const scores = {
    day: { bpm: 76, roots: [48,53,57,55], melody: [72,76,79,76,74,72,69,null,72,74,76,79,81,79,76,null], tone: 'triangle' },
    night: { bpm: 58, roots: [45,53,48,55], melody: [81,null,76,79,null,72,76,null,74,null,72,69,null,76,72,null], tone: 'sine' },
    cave: { bpm: 46, roots: [38,41,36,38], melody: [62,null,null,69,null,65,null,null,60,null,62,null,57,null,null,null], tone: 'sine' },
    arrival: { bpm: 82, roots: [48,55,57,53], melody: [72,74,76,79,76,74,72,null,76,79,81,84,83,79,76,72], tone: 'triangle' }
  };
  const towns={
    yunlan:{label:'云岚城 · 晴岚',bpm:76,roots:[48,53,55,48],melody:[72,74,76,79,81,79,76,null,74,76,72,69,67,null,72,null],tone:'sine',arp:true},
    tiantian:{label:'阗天城 · 天阶',bpm:80,roots:[50,55,57,50],melody:[74,null,81,78,76,74,69,null,78,81,86,83,81,null,78,74],tone:'triangle',bell:true},
    cangyun:{label:'苍云城 · 水庭',bpm:62,roots:[45,50,43,45],melody:[69,null,76,74,null,72,69,null,67,69,null,72,74,null,69,null],tone:'triangle',pluck:true},
    dragon:{label:'东海龙宫 · 潮珠',bpm:60,roots:[50,57,52,54],melody:[86,null,81,78,83,null,81,null,78,74,null,81,86,null,83,null],tone:'sine',bell:true},
    heifeng:{label:'黑风城 · 雪垒',bpm:58,roots:[38,34,36,38],melody:[62,null,69,null,65,64,62,null,58,null,60,57,62,null,null,null],tone:'sine',drum:true}
  };
  Object.assign(scores,towns);
  let town=null;
  function territory(){
    const g=window.game;if(!g?.p)return null;
    const sites=[...(g.exploration?.sites||[])];
    if(g.castleWorld)sites.push({id:'legacy',name:'云岚城',x:0,z:0,base:30});
    return sites.find(site=>{
      const margin=town?.id===site.id?4:0,x=g.p.x-site.x,z=g.p.z-site.z;
      return x>=-43-margin&&x<=58+margin&&z>=-41-margin&&z<=82+margin&&g.p.y>=(site.base||30)-4;
    })||null;
  }
  let ctx, master, active, enabled=localStorage.getItem('stonisle.music')!=='off';
  const stored=Number(localStorage.getItem('stonisle.musicVolume')??.35);
  let volume=Number.isFinite(stored)?Math.max(0,Math.min(1,stored)):.35;
  let previewTimer;
  let playing=false, desired='day', candidate='', stable=0, intro=0, previewUntil=0, previewTrack='day', next=0, beat=0;
  function unlock(){
    if(!enabled)return;
    const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;
    if(!ctx){ctx=new Audio();master=ctx.createGain();master.gain.value=0;master.connect(ctx.destination);}
    if(ctx.state==='suspended')ctx.resume().catch(()=>{});
  }
  function note(bus,midi,time,duration,level,tone){
    const o=ctx.createOscillator(),g=ctx.createGain();o.type=tone;o.frequency.value=440*2**((midi-69)/12);
    g.gain.setValueAtTime(0,time);g.gain.linearRampToValueAtTime(level,time+.035);
    g.gain.exponentialRampToValueAtTime(.0001,time+duration);o.connect(g);g.connect(bus);
    o.start(time);o.stop(time+duration+.02);o.onended=()=>{o.disconnect();g.disconnect();};
  }
  function switchTo(name){
    if(active?.name===name)return;
    const t=ctx.currentTime, old=active;
    if(old){old.gain.gain.cancelScheduledValues(t);old.gain.gain.setTargetAtTime(0,t,.8);setTimeout(()=>old.gain.disconnect(),6000);}
    const gain=ctx.createGain();gain.gain.value=0;gain.connect(master);gain.gain.setTargetAtTime(1,t,1.2);
    active={name,gain};next=t+.05;beat=0;
  }
  function pump(){
    if(!ctx||ctx.state!=='running')return;
    const preview=performance.now()<previewUntil;
    const audible=enabled&&!document.hidden&&(playing||preview);
    master.gain.setTargetAtTime(audible?volume*.65:0,ctx.currentTime,.35);
    if(!audible)return;
    switchTo(preview?previewTrack:towns[desired]?desired:intro>0?'arrival':desired);
    const score=scores[active.name],step=60/score.bpm, bus=active.gain;
    if(next<ctx.currentTime-.5)next=ctx.currentTime+.05;
    while(next<ctx.currentTime+.35){
      const root=score.roots[Math.floor(beat/8)%4],m=score.melody[beat%16];
      if(beat%8===0)for(const offset of [0,7,active.name==='cave'?12:16])note(bus,root+offset,next,step*7,.035,'sine');
      if(m!=null){note(bus,m,next,step*(score.pluck?.8:2.8),towns[active.name]?.055:.075,score.tone);note(bus,m,next+step*.75,step*2,.016,'sine');}
      if(active.name==='day'||active.name==='arrival'||score.arp)note(bus,root+12+[0,7,16,7][beat%4],next,step*.85,.025,'triangle');
      if(score.bell&&beat%4===0)note(bus,root+36,next,step*3,.022,'sine');
      if(score.drum&&beat%4===0)note(bus,root-12,next,.22,.08,'sine');
      beat++;next+=step;
    }
  }
  function update(dt,daylight,underground){
    if(!playing||performance.now()<previewUntil)return;
    intro=Math.max(0,intro-dt);
    town=territory();
    const townKey=town?Object.keys(towns).find(k=>towns[k].label.startsWith(town.name)):null;
    const mode=townKey||(underground?'cave':daylight<(desired==='night'?.45:.22)?'night':'day');
    if(candidate!==mode){candidate=mode;stable=0;}else stable+=dt;
    if(stable>=(townKey?.8:towns[desired]?2:4))desired=mode;
  }
  window.BackgroundMusic={update,setPlaying(on,newWorld=false){playing=on;if(on){previewUntil=0;}if(newWorld)intro=28;if(on)unlock();pump();},
    preview(name){if(!scores[name])return;enabled=true;toggle.checked=true;localStorage.setItem('stonisle.music','on');unlock();previewTrack=name;previewUntil=performance.now()+18000;clearTimeout(previewTimer);previewTimer=setTimeout(()=>{document.getElementById('musicStatus').textContent='';},18000);pump();},
    get state(){return {track:active?.name,enabled,volume,playing};}};
  const box=document.getElementById('settings-audio');
  box.insertAdjacentHTML('beforeend',`<h2>Background music</h2><label><input id="musicEnabled" type="checkbox"> Music</label><label>Volume <input id="musicVolume" type="range" min="0" max="100" step="1" aria-label="Music volume"><output id="musicLevel"></output></label><p class="settingsHint">昼夜、矿洞与五座城镇的配乐会自动渐变切换。</p><div id="musicPreviews"><button data-track="day">Daylight</button> <button data-track="night">Nightfall</button> <button data-track="cave">Cave</button> <button data-track="arrival">New world</button>${Object.entries(towns).map(([key,t])=>`<button data-track="${key}">${t.label}</button>`).join(' ')}</div><p id="musicStatus" class="settingsHint" role="status"></p>`);
  const toggle=document.getElementById('musicEnabled'),slider=document.getElementById('musicVolume'),level=document.getElementById('musicLevel');
  toggle.checked=enabled;slider.value=Math.round(volume*100);level.value=slider.value+'%';
  toggle.onchange=()=>{enabled=toggle.checked;localStorage.setItem('stonisle.music',enabled?'on':'off');if(enabled)unlock();pump();};
  slider.oninput=()=>{volume=Number(slider.value)/100;level.value=slider.value+'%';localStorage.setItem('stonisle.musicVolume',volume);pump();};
  document.getElementById('musicPreviews').onclick=e=>{const name=e.target.dataset.track;if(!name)return;BackgroundMusic.preview(name);document.getElementById('musicStatus').textContent='Preview · '+e.target.textContent;};
  document.addEventListener('pointerdown',unlock,{capture:true});document.addEventListener('keydown',unlock,{capture:true});
  document.addEventListener('visibilitychange',()=>{previewUntil=0;if(ctx){if(document.hidden)ctx.suspend().catch(()=>{});else if(playing&&enabled)ctx.resume().catch(()=>{});}});
  setInterval(pump,200);
})();
