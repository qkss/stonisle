// Bounded, non-interactive pickup feed; same-item pickups merge while visible.
(() => {
  window.PickupNotices=class {
    constructor(icon,name){this.icon=icon;this.name=name;this.entries=new Map();this.root=document.createElement('div');this.root.id='pickupNotices';this.root.setAttribute('role','status');this.root.setAttribute('aria-live','polite');this.root.setAttribute('aria-relevant','additions text');document.body.append(this.root);addEventListener('resize',()=>this.layout());}
    add(id,count){
      if(!Number.isFinite(count)||count<=0)return;
      let entry=this.entries.get(id);
      if(!entry){
        if(this.entries.size>=3)this.remove(this.entries.keys().next().value);
        const row=document.createElement('div');row.className='pickup-notice';
        const prefix=document.createElement('span');prefix.className='pickup-prefix';prefix.textContent='获得';
        const img=document.createElement('img');img.src=this.icon(id);img.alt='';
        const name=document.createElement('span');name.className='pickup-name';name.textContent=this.name(id);
        const amount=document.createElement('b');row.append(prefix,img,name,amount);this.root.append(row);
        entry={row,amount,count:0,timer:null};this.entries.set(id,entry);row.style.opacity='0';row.style.transform=`translateY(${this.root.getBoundingClientRect().height+8}px)`;this.layout();requestAnimationFrame(()=>{row.style.opacity='1';});
      }
      entry.count+=count;entry.amount.textContent='× '+entry.count;
      clearTimeout(entry.timer);entry.timer=setTimeout(()=>this.remove(id),3000);
    }
    layout(){
      const entries=[...this.entries.values()],gap=matchMedia('(max-height:500px)').matches?4:6;
      let bottom=this.root.getBoundingClientRect().height;
      for(let i=entries.length-1;i>=0;i--){const e=entries[i];bottom-=e.row.getBoundingClientRect().height;e.y=bottom;e.row.style.transform=`translateY(${bottom}px)`;bottom-=gap;}
    }
    remove(id){const e=this.entries.get(id);if(!e)return;clearTimeout(e.timer);this.entries.delete(id);
      if(this.outgoing)this.outgoing.remove();this.outgoing=e.row;
      e.row.style.opacity='0';e.row.style.transform=`translateY(${(e.y||0)-8}px)`;
      setTimeout(()=>{e.row.remove();if(this.outgoing===e.row)this.outgoing=null;},300);this.layout();
    }
  };
})();
