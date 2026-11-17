// Multi-pointer controls: walking, jumping and looking can happen together.
(() => {
  window.MobileControls=class {
    constructor(canvas,actions){
      this.canvas=canvas;this.actions=actions;this.pointers=new Map();this.lookPointer=null;this.stickPointer=null;
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
      addEventListener('resize',()=>this.reset());
      const controls=document.getElementById('touchControls');
      controls.addEventListener('pointerdown',e=>{
        const button=e.target.closest('button');
        if(!button||!this.mobile||!actions.playing())return;
        e.preventDefault();e.stopPropagation();button.setPointerCapture(e.pointerId);
        this.pointers.set(e.pointerId,button);button.classList.add('active');
        if(button.dataset.key)actions.key(button.dataset.key,true);
        if(button.dataset.action==='jump')actions.key('Space',true);
        if(button.dataset.action==='dig')actions.dig(true);
        if(button.dataset.action==='place'){
          const food=actions.food?.();
          if(food){this.stopEating();this.eatingId=food;button.classList.add('eating');
            const bite=()=>{if(!actions.playing()||actions.food?.()!==food){this.stopEating();return;}actions.place();if(this.eatingId===food)this.eatTimer=setTimeout(bite,900);};
            this.eatTimer=setTimeout(bite,550);
          }else (actions.drop||actions.place)(); // 手机上这个按钮是“扔掉手里的东西”；放方块改成点屏幕
        }
      });
      const release=e=>{
        const button=this.pointers.get(e.pointerId);if(!button)return;
        this.pointers.delete(e.pointerId);
        if([...this.pointers.values()].includes(button))return;
        button.classList.remove('active');
        if(button.dataset.action==='place')this.stopEating();
        if(button.dataset.key)actions.key(button.dataset.key,false);
        if(button.dataset.action==='jump')actions.key('Space',false);
        if(button.dataset.action==='dig')actions.dig(false);
      };
      for(const type of ['pointerup','pointercancel','lostpointercapture'])controls.addEventListener(type,release);
      canvas.addEventListener('pointerdown',e=>{
        if((e.pointerType!=='touch'&&!preview)||!this.mobile||!actions.playing())return;
        // Only bare game canvas starts movement, so inventory/buttons keep their own touches.
        if(e.clientX<innerWidth*.45){
          if(this.stickPointer)return;
          e.preventDefault();canvas.setPointerCapture(e.pointerId);
          this.stick.style.left=e.clientX+'px';this.stick.style.top=e.clientY+'px';
          this.stick.style.bottom='auto';this.stick.classList.add('active');
          this.stickPointer={id:e.pointerId,x:e.clientX,y:e.clientY,radius:this.stick.getBoundingClientRect().width*.31};
          updateStick(e);return;
        }
        if(this.lookPointer)return;
        e.preventDefault();canvas.setPointerCapture(e.pointerId);
        // 右半边：拖动转视角；轻点 = 在点到的地方放方块/使用；按住不动 0.4 秒 = 挖点到的那一格（手指挪动就跟着挖）
        const p=this.lookPointer={id:e.pointerId,x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY,t:Date.now(),moved:0,mining:false};
        clearTimeout(this.pressTimer);
        this.pressTimer=setTimeout(()=>{if(this.lookPointer!==p||p.moved>12||!actions.aimAt)return;p.mining=true;actions.aimAt(p.x,p.y);actions.dig(true);},400);
      });
      canvas.addEventListener('pointermove',e=>{
        if(this.stickPointer?.id===e.pointerId){updateStick(e);return;}
        const p=this.lookPointer;if(!p||p.id!==e.pointerId)return;
        e.preventDefault();p.moved=Math.max(p.moved,Math.hypot(e.clientX-p.sx,e.clientY-p.sy));
        if(p.mining)actions.aimAt(e.clientX,e.clientY);else actions.look(e.clientX-p.x,e.clientY-p.y);p.x=e.clientX;p.y=e.clientY;
      });
      for(const type of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(type,e=>{
        if(this.stickPointer?.id===e.pointerId)this.resetStick();
        const p=this.lookPointer;if(p?.id!==e.pointerId)return;
        this.lookPointer=null;clearTimeout(this.pressTimer);
        if(p.mining){actions.dig(false);actions.aimAt(null);}
        else if(e.type==='pointerup'&&p.moved<=12&&Date.now()-p.t<400&&actions.aimAt){actions.aimAt(p.sx,p.sy);actions.place();actions.aimAt(null);}
      });
      addEventListener('blur',()=>this.reset());
      document.addEventListener('visibilitychange',()=>{if(document.hidden)this.reset();});
    }
    stopEating(){clearTimeout(this.eatTimer);this.eatTimer=null;this.eatingId=0;document.querySelector('[data-action="place"]')?.classList.remove('eating');}
    refreshUse(){
      const food=this.actions.food?.(),button=document.querySelector('[data-action="place"]');
      if(this.eatingId&&food!==this.eatingId)this.stopEating();
      button.textContent=food?'Eat':'Drop';button.setAttribute('aria-label',food?'Hold to eat':'Drop held item');
    }
    resetStick(){
      const id=this.stickPointer?.id;this.stickPointer=null;
      if(id!==undefined&&this.canvas.hasPointerCapture(id))this.canvas.releasePointerCapture(id);
      this.thumb.style.transform='translate(0px,0px)';
      this.stick.classList.remove('active');this.actions.move(0,0);
    }
    reset(){
      this.stopEating();this.resetStick();
      for(const button of this.pointers.values())button.classList.remove('active');
      clearTimeout(this.pressTimer);if(this.lookPointer?.mining)this.actions.aimAt?.(null);
      this.pointers.clear();this.lookPointer=null;
      for(const key of ['KeyW','KeyA','KeyS','KeyD','Space'])this.actions.key(key,false);
      this.actions.dig(false);
    }
  };
})();
