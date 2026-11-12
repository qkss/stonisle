// Multi-pointer controls: walking, jumping and looking can happen together.
(() => {
  window.MobileControls=class {
    constructor(canvas,actions){
      this.actions=actions;this.pointers=new Map();this.lookPointer=null;this.stickPointer=null;
      this.stick=document.getElementById('touchMove');this.thumb=document.getElementById('touchStickThumb');
      const coarse=matchMedia('(pointer: coarse)');
      // Explicit temporary-world preview for desktop QA; normal device detection is unchanged.
      const query=new URLSearchParams(location.search),preview=query.get('preview')==='materials'&&query.get('touch')==='1';
      const detect=()=>{
        this.mobile=preview || coarse.matches || (navigator.maxTouchPoints>0 && /Android|iPhone|iPad|iPod/.test(navigator.userAgent)) || (navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
        document.body.classList.toggle('mobile',this.mobile);
        if(!this.mobile)this.reset();
      };
      coarse.addEventListener('change',detect);detect();
      const updateStick=e=>{
        const p=this.stickPointer;if(!p||p.id!==e.pointerId)return;
        e.preventDefault();
        const dx=e.clientX-p.x,dy=e.clientY-p.y,length=Math.hypot(dx,dy);
        const distance=Math.min(length,p.radius),scale=length?distance/length:0;
        this.thumb.style.transform=`translate(${dx*scale}px,${dy*scale}px)`;
        const strength=Math.max(0,(distance/p.radius-.12)/.88);
        actions.move(length?dx/length*strength:0,length?-dy/length*strength:0);
      };
      this.stick.addEventListener('pointerdown',e=>{
        if(!this.mobile||!actions.playing()||this.stickPointer)return;
        e.preventDefault();e.stopPropagation();
        const r=this.stick.getBoundingClientRect();
        this.stickPointer={id:e.pointerId,x:r.left+r.width/2,y:r.top+r.height/2,radius:r.width*.31};
        this.stick.setPointerCapture(e.pointerId);this.stick.classList.add('active');updateStick(e);
      });
      this.stick.addEventListener('pointermove',updateStick);
      for(const type of ['pointerup','pointercancel','lostpointercapture'])this.stick.addEventListener(type,e=>{
        if(this.stickPointer?.id===e.pointerId)this.resetStick();
      });
      addEventListener('resize',()=>this.resetStick());
      const controls=document.getElementById('touchControls');
      controls.addEventListener('pointerdown',e=>{
        const button=e.target.closest('button');
        if(!button||!this.mobile||!actions.playing())return;
        e.preventDefault();e.stopPropagation();button.setPointerCapture(e.pointerId);
        this.pointers.set(e.pointerId,button);button.classList.add('active');
        if(button.dataset.key)actions.key(button.dataset.key,true);
        if(button.dataset.action==='jump')actions.key('Space',true);
        if(button.dataset.action==='dig')actions.dig(true);
        if(button.dataset.action==='place')actions.place();
      });
      const release=e=>{
        const button=this.pointers.get(e.pointerId);if(!button)return;
        this.pointers.delete(e.pointerId);
        if([...this.pointers.values()].includes(button))return;
        button.classList.remove('active');
        if(button.dataset.key)actions.key(button.dataset.key,false);
        if(button.dataset.action==='jump')actions.key('Space',false);
        if(button.dataset.action==='dig')actions.dig(false);
      };
      for(const type of ['pointerup','pointercancel','lostpointercapture'])controls.addEventListener(type,release);
      canvas.addEventListener('pointerdown',e=>{
        if(e.pointerType!=='touch'||!this.mobile||!actions.playing()||this.lookPointer)return;
        e.preventDefault();canvas.setPointerCapture(e.pointerId);
        this.lookPointer={id:e.pointerId,x:e.clientX,y:e.clientY};
      });
      canvas.addEventListener('pointermove',e=>{
        const p=this.lookPointer;if(!p||p.id!==e.pointerId)return;
        e.preventDefault();actions.look(e.clientX-p.x,e.clientY-p.y);p.x=e.clientX;p.y=e.clientY;
      });
      for(const type of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(type,e=>{if(this.lookPointer?.id===e.pointerId)this.lookPointer=null;});
      addEventListener('blur',()=>this.reset());
      document.addEventListener('visibilitychange',()=>{if(document.hidden)this.reset();});
    }
    resetStick(){
      this.stickPointer=null;this.thumb.style.transform='translate(0px,0px)';
      this.stick.classList.remove('active');this.actions.move(0,0);
    }
    reset(){
      this.resetStick();
      for(const button of this.pointers.values())button.classList.remove('active');
      this.pointers.clear();this.lookPointer=null;
      for(const key of ['KeyW','KeyA','KeyS','KeyD','Space'])this.actions.key(key,false);
      this.actions.dig(false);
    }
  };
})();
