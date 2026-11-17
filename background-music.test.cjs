const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const elements=new Map(),get=id=>{if(!elements.has(id))elements.set(id,{insertAdjacentHTML(){}});return elements.get(id);};
const events={},storage=new Map();let pump,now=0,notes=0;
const param=()=>({value:0,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){},setTargetAtTime(){},cancelScheduledValues(){}});
class Audio{constructor(){this.state='running';this.currentTime=0;}createGain(){return {gain:param(),connect(){},disconnect(){}};}createOscillator(){return {frequency:param(),connect(){},disconnect(){},start(){notes++;},stop(){}};}resume(){this.state='running';return Promise.resolve();}suspend(){this.state='suspended';return Promise.resolve();}}
const c={window:{AudioContext:Audio},document:{hidden:false,getElementById:get,addEventListener(k,f){events[k]=f;}},localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)},performance:{now:()=>now},setInterval:f=>pump=f,setTimeout(){},clearTimeout(){}};
c.window=c; c.AudioContext=Audio;vm.runInNewContext(fs.readFileSync('background-music.js','utf8'),c);
assert.equal(notes,0,'no autoplay');c.BackgroundMusic.setPlaying(true,true);assert.equal(c.BackgroundMusic.state.track,'arrival');
for(let i=0;i<30;i++)c.BackgroundMusic.update(1,1,false);pump();assert.equal(c.BackgroundMusic.state.track,'day');
c.BackgroundMusic.update(1,0,false);pump();assert.equal(c.BackgroundMusic.state.track,'day','debounce');
for(let i=0;i<5;i++)c.BackgroundMusic.update(1,0,false);pump();assert.equal(c.BackgroundMusic.state.track,'night');
for(let i=0;i<6;i++)c.BackgroundMusic.update(1,1,true);pump();assert.equal(c.BackgroundMusic.state.track,'cave');
c.BackgroundMusic.preview('day');pump();assert.equal(c.BackgroundMusic.state.track,'day');now=19000;pump();assert.equal(c.BackgroundMusic.state.track,'cave','preview restores environment');
c.BackgroundMusic.setPlaying(false);let before=notes;pump();assert.equal(notes,before,'pause stops scheduling');
get('musicEnabled').checked=false;get('musicEnabled').onchange();assert.equal(storage.get('stonisle.music'),'off');
console.log('BGM autoplay, intro, transitions, preview, pause and preference tests passed');
get('musicEnabled').checked=true;get('musicEnabled').onchange();c.BackgroundMusic.setPlaying(true);
for(const [i,name] of ['云岚城','阗天城','苍云城','黑风城'].entries()){
 c.game={p:{x:1000,z:1000,y:i===3?50:31},exploration:{sites:[{id:name,name,x:1000,z:1000,base:i===3?49:30}]}};
 for(let n=0;n<3;n++)c.BackgroundMusic.update(1,1,true);pump();
 assert.equal(c.BackgroundMusic.state.track,['yunlan','tiantian','cangyun','heifeng'][i],'town interiors keep city music');
}
c.game.p.x=1060;for(let n=0;n<3;n++)c.BackgroundMusic.update(1,1,false);pump();assert.equal(c.BackgroundMusic.state.track,'heifeng','boundary hysteresis');
c.game.p.x=1070;for(let n=0;n<4;n++)c.BackgroundMusic.update(1,1,false);pump();assert.equal(c.BackgroundMusic.state.track,'day','leave restores day');
c.game.p={x:1000,z:1000,y:40};for(let n=0;n<6;n++)c.BackgroundMusic.update(1,1,true);pump();assert.equal(c.BackgroundMusic.state.track,'cave','underground below town');
c.game={p:{x:0,z:40,y:31},castleWorld:true};for(let n=0;n<3;n++)c.BackgroundMusic.update(1,1,false);pump();assert.equal(c.BackgroundMusic.state.track,'yunlan','legacy town');
console.log('Four town themes, interiors, snow elevation, boundary and underground tests passed');
