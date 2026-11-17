// Pure survival rules; tick only while actively playing, never from wall-clock time.
(function(root){
  const clamp=n=>Math.max(0,Math.min(100,n));
  class Hunger {
    constructor(saved){this.value=clamp(Number.isFinite(saved?.value)?saved.value:100);this.starve=Number.isFinite(saved?.starve)?Math.max(0,Math.min(5,saved.starve)):0;}
    get speed(){return this.value>=20?1:.25+.75*this.value/20;}
    eat(amount){this.value=clamp(this.value+amount);if(this.value>0)this.starve=0;}
    tick(dt,active=false,immune=false){
      if(immune){this.starve=0;return 0;}
      const rate=active?.16:.04,untilEmpty=this.value/rate;
      this.value=clamp(this.value-rate*dt);
      if(this.value>0){this.starve=0;return 0;}
      this.starve+=Math.max(0,dt-untilEmpty);
      const damage=Math.floor((this.starve+1e-9)/5);this.starve=Math.max(0,this.starve-damage*5);return damage;
    }
    toJSON(){return {value:this.value,starve:this.starve};}
  }
  const food={30:[12,4],32:[8,2],112:[10,2],115:[14,3],177:[14,3],178:[16,3],256:[16,3],257:[10,2],258:[10,2],268:[10,3],269:[16,5],270:[16,5],271:[10,3],272:[16,5],273:[26,8],274:[22,6],275:[32,10],276:[32,10],277:[22,6],278:[32,10],279:[24,5]};
  const api={Hunger,food};if(typeof module!=='undefined')module.exports=api;else root.Survival=api;
})(this);
