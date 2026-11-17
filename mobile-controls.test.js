const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
class El {constructor(){this.handlers={};this.style={};this.captured=new Set;const s=new Set;this.classList={add:x=>s.add(x),remove:x=>s.delete(x),toggle:(x,on)=>on?s.add(x):s.delete(x),contains:x=>s.has(x)};}addEventListener(n,f){(this.handlers[n]??=[]).push(f)}setPointerCapture(id){this.captured.add(id)}hasPointerCapture(id){return this.captured.has(id)}releasePointerCapture(id){this.captured.delete(id)}getBoundingClientRect(){return {width:128}}fire(n,id,x,y){for(const f of this.handlers[n]||[])f({pointerType:'touch',pointerId:id,clientX:x,clientY:y,preventDefault(){},stopPropagation(){}})}}
const els=Object.fromEntries(['touchMove','touchStickThumb','touchControls'].map(x=>[x,new El]));const canvas=new El,moves=[],looks=[];
const ctx={window:{},document:{body:new El,getElementById:id=>els[id],querySelector:()=>null,addEventListener(){}},navigator:{},matchMedia:()=>({matches:true,addEventListener(){}}),location:{search:''},URLSearchParams,innerWidth:800,addEventListener(){},clearTimeout,setTimeout};
vm.runInNewContext(fs.readFileSync('mobile-controls.js','utf8'),ctx);
const c=new ctx.window.MobileControls(canvas,{playing:()=>true,move:(...v)=>moves.push(v),look:(...v)=>looks.push(v),dig(){},key(){}});
canvas.fire('pointerdown',1,210,180);assert.equal(c.stickPointer.x,210);assert.equal(els.touchMove.style.left,'210px');assert.deepEqual(moves.at(-1),[0,0]);
canvas.fire('pointermove',1,250,180);assert(moves.at(-1)[0]>.99);
canvas.fire('pointerdown',2,600,200);canvas.fire('pointermove',2,610,205);assert.deepEqual(looks.at(-1),[10,5]);assert.equal(c.stickPointer.id,1);
canvas.fire('pointercancel',1,250,180);assert.deepEqual(moves.at(-1),[0,0]);assert(!els.touchMove.classList.contains('active'));
canvas.fire('pointerdown',3,100,260);assert.equal(c.stickPointer.y,260);c.reset();assert.equal(c.lookPointer,null);assert.equal(c.stickPointer,null);assert(!canvas.hasPointerCapture(3));
console.log('Dynamic joystick: relocated origin, analog movement, concurrent look, cancel/reset passed.');
