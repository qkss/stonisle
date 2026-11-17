// Categories are declared in markup; new tabs need no game logic changes.
(() => {
  const tabs=[...document.querySelectorAll('.settingsTabs [role=tab]')];
  function select(tab,focus=false){
    for(const item of tabs){const active=item===tab;item.setAttribute('aria-selected',String(active));item.tabIndex=active?0:-1;document.getElementById(item.getAttribute('aria-controls')).hidden=!active;}
    document.querySelector('.settingsContent').scrollTop=0;
    if(focus)tab.focus();
  }
  tabs.forEach((tab,i)=>{
    tab.addEventListener('click',()=>select(tab));
    tab.addEventListener('keydown',e=>{
      const next=e.key==='ArrowDown'?(i+1)%tabs.length:e.key==='ArrowUp'?(i+tabs.length-1)%tabs.length:e.key==='Home'?0:e.key==='End'?tabs.length-1:null;
      if(next!==null){e.preventDefault();e.stopPropagation();select(tabs[next],true);}
    });
  });
})();
