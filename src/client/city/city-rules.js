// Pure city economy and occupation rules, shared by runtime and tests.
(function(root){
 const COIN=297,BLUEPRINT=298,MINT=299,CAPTURE_SECONDS=30;
 function record(state,id){return (state.cities||={})[id]||=(( {owned:false,capturedAt:null} ));}
 function tick(c,dt,{near,alive,playing,hurt}){if(!near||!alive||!playing||hurt){c.elapsed=0;return false;}c.elapsed=Math.min(CAPTURE_SECONDS,c.elapsed+Math.max(0,Math.min(dt,.1)));return c.elapsed>=CAPTURE_SECONDS;}
 function cost(level,archer){return (archer?35:25)*Math.max(1,Math.min(5,level||1));}
 function mint(inv){if((inv[292]||0)<1)return false;inv[292]--;inv[COIN]=(inv[COIN]||0)+10;return true;}
 function hire(inv,a,level,owned,clear){const price=cost(level,a.archer);if(!owned||a.hp>0||!clear||(inv[COIN]||0)<price)return false;inv[COIN]-=price;a.hp=a.maxHP;a.dead=false;a.deathTime=0;a.flash=0;a.kx=a.kz=0;a.x=a.home[0];a.z=a.home[1];a.path=[];a.repath=0;a.wait=0;a.state=a.duty;return true;}
 function flag(site){return {x:site.x+.5,y:(site.base||30)+(site.blueprint===298?15:26),z:site.z+(site.blueprint===298?-4.5:-5.5)};}
 function access(site){if(site.blueprint===298)return [];const b=site.base||30,out=[];for(let x=-2;x<=2;x++)for(let z=-7;z<=-4;z++){out.push([site.x+x,b+25,site.z+z,site.wall||10]);for(let y=b+26;y<=b+30;y++)out.push([site.x+x,y,site.z+z,0]);}for(let y=b+1;y<=b+26;y++){out.push([site.x+3,y,site.z-5,site.wall||10]);out.push([site.x+3,y,site.z-4,160]);}return out;}
 const api={flag,access,COIN,BLUEPRINT,MINT,CAPTURE_SECONDS,record,tick,cost,mint,hire};if(typeof module!=='undefined')module.exports=api;else root.CityRules=api;
})(this);
