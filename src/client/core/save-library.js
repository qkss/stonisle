(function(root){
  class SaveLibrary {
    constructor(storage){this.storage=storage;}
    key(id){return 'stonisle.save.v2'+(id===1?'':'.'+id);}
    read(id){try{return JSON.parse(this.storage.getItem(this.key(id)))||{};}catch{return {};}}
    list(){
      const ids=new Set();
      for(let i=0;i<this.storage.length;i++){const key=this.storage.key(i),m=/^stonisle\.save\.v2(?:\.(\d+))?$/.exec(key);if(m)ids.add(m[1]?+m[1]:1);}
      if(this.storage.getItem('stonisle.save.v1'))ids.add(1);
      return [...ids].sort((a,b)=>a-b).map(id=>{const s=this.read(id);return {id,name:s.name||`World ${id}`,lastPlayed:s.lastPlayed||null,legacy:!s.name};});
    }
    name(value){const name=value.trim();if(!name||name.length>32)throw new Error('Enter a name (1–32 characters).');return name;}
    create(value){const name=this.name(value),used=new Set(this.list().map(s=>s.id));let id=1;while(used.has(id))id++;this.storage.setItem(this.key(id),JSON.stringify({name,lastPlayed:null}));return id;}
    rename(id,value){const name=this.name(value),data=this.read(id);this.storage.setItem(this.key(id),JSON.stringify({...data,name}));}
    save(id,data){const old=this.read(id);this.storage.setItem(this.key(id),JSON.stringify({...data,name:old.name||`World ${id}`,lastPlayed:Date.now()}));}
  }
  if(typeof module!=='undefined')module.exports=SaveLibrary;else root.SaveLibrary=SaveLibrary;
})(this);
