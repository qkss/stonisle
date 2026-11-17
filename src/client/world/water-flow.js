// Finite-distance voxel water. Only generated/placed water is a source;
// propagated water retains a level in the save and can never become a source.
(function(root){
  const AIR=0,WATER=5,H=64,DIR=[[1,0],[-1,0],[0,1],[0,-1]],key=(x,y,z)=>`${x},${y},${z}`;
  class WaterFlow {
    // opts.id / opts.max：同一套规则也用来流岩浆（id 287，最多流 3 格）；只有水挂在 world.water 上给建网格用
    constructor(world,saved={},active=()=>true,onChange=()=>{},opts={}){
      this.id=opts.id||WATER;this.max=opts.max||7;world[this.id===WATER?'water':'lava']=this;
      this.world=world;this.active=active;this.onChange=onChange;
      this.cells=Object.create(null);this.pending=new Map();this.activated=new Set();
      for(const r of Object.values(saved||{}))if(r&&[r.x,r.y,r.z,r.level].every(Number.isInteger)&&r.y>0&&r.y<H&&r.level>=0&&r.level<=this.max)
        this.cells[key(r.x,r.y,r.z)]={x:r.x,y:r.y,z:r.z,level:r.level,falling:!!r.falling};
    }
    read(x,y,z){if(y<0)return 3;if(y>=H)return AIR;return this.active(x,z)?this.world.get(x,y,z):3;}
    info(x,y,z){
      if(this.read(x,y,z)!==this.id)return null;
      const r=this.cells[key(x,y,z)];return r?{level:r.level,falling:r.falling,source:false}:{level:0,falling:false,source:true};
    }
    supported(x,y,z){const b=this.read(x,y-1,z);if(b!==this.id)return b!==AIR;const r=this.info(x,y-1,z);return r.source||!r.falling;}
    enqueue(x,y,z){if(y>0&&y<H&&this.active(x,z))this.pending.set(key(x,y,z),[x,y,z]);}
    wake(x,y,z){this.enqueue(x,y,z);this.enqueue(x,y-1,z);this.enqueue(x,y+1,z);for(const [dx,dz] of DIR)this.enqueue(x+dx,y,z+dz);}
    edited(x,y,z){delete this.cells[key(x,y,z)];this.wake(x,y,z);}
    activate(cx,cz){
      const ck=cx+','+cz;if(this.activated.has(ck))return;this.activated.add(ck);
      const data=this.world.chunk(cx,cz);
      for(let y=1;y<H;y++)for(let z=0;z<16;z++)for(let x=0;x<16;x++){
        const wx=cx*16+x,wz=cz*16+z,b=data[x+z*16+y*256],edge=x===0||x===15||z===0||z===15;
        if(b===this.id){
          if(this.cells[key(wx,y,wz)]||this.read(wx,y-1,wz)===AIR||DIR.some(([dx,dz])=>this.read(wx+dx,y,wz+dz)===AIR))this.wake(wx,y,wz);
        }else if(b===AIR&&edge&&DIR.some(([dx,dz])=>this.read(wx+dx,y,wz+dz)===this.id))this.wake(wx,y,wz);
      }
    }
    deactivate(cx,cz){this.activated.delete(cx+','+cz);}
    tick(budget=256){
      // A snapshot makes propagation rate independent of queue insertion order.
      const batch=[];for(const [k,p] of this.pending){this.pending.delete(k);batch.push(p);if(batch.length>=budget)break;}
      let changes=0;
      for(const [x,y,z] of batch){
        if(!this.active(x,z))continue;
        const k=key(x,y,z),b=this.read(x,y,z),old=this.cells[k];
        if(b!==AIR&&b!==this.id){if(old)delete this.cells[k];continue;}
        if(b===this.id&&!old)continue; // immutable source until the player replaces it
        const above=this.info(x,y+1,z);let level=8;
        if(above)level=above.level;
        else for(const [dx,dz] of DIR){const n=this.info(x+dx,y,z+dz);if(n&&this.supported(x+dx,y,z+dz))level=Math.min(level,n.level+1);}
        const falling=!!above||!this.supported(x,y,z);
        if(level>this.max){
          if(old){delete this.cells[k];this.world.set(x,y,z,AIR);this.wake(x,y,z);this.onChange(x,y,z);changes++;}
        }else if(!old||old.level!==level||old.falling!==falling){
          this.cells[k]={x,y,z,level,falling};if(b!==this.id)this.world.set(x,y,z,this.id);
          this.wake(x,y,z);this.onChange(x,y,z);changes++;
        }
      }
      return changes;
    }
    renderInfo(x,y,z){if(this.world.get(x,y,z)!==this.id)return null;return this.cells[key(x,y,z)]||{level:0,falling:false,source:true};}
    height(x,y,z){const r=this.renderInfo(x,y,z);return !r?0:this.world.get(x,y+1,z)===this.id||r.falling?1:.88-r.level*(this.max<7?.2:.1);}
    corner(x,y,z){
      let sum=0,count=0,air=0,source=false,min=1,max=0;
      for(const dx of [-1,0])for(const dz of [-1,0]){
        const h=this.height(x+dx,y,z+dz);if(h>=1)return 1;
        if(h>0){sum+=h;count++;min=Math.min(min,h);max=Math.max(max,h);source ||= !!this.renderInfo(x+dx,y,z+dz).source;}
        else if(this.world.get(x+dx,y,z+dz)===AIR)air++;
      }
      // The leading edge of finite flow meets the ground instead of a vertical lip.
      if(air&&!source&&(count===1||max-min<1e-6))return 0;
      return count?sum/count:0;
    }
    visual(x,y,z){
      const r=this.renderInfo(x,y,z);if(!r)return {flow:[0,0,0,1],foam:0};
      let dx=0,dz=0,depth=1,shore=false;
      for(const [a,b] of DIR){const n=this.renderInfo(x+a,y,z+b),id=this.world.get(x+a,y,z+b);
        if(id!==AIR&&id!==WATER)shore=true;
        if(n){const drop=n.level-r.level;dx+=a*drop;dz+=b*drop;}
        else if(id===AIR){dx+=a;dz+=b;}
      }
      const len=Math.hypot(dx,dz);if(len){dx/=len;dz/=len;}
      while(depth<6&&this.world.get(x,y-depth,z)===WATER)depth++;
      const landing=r.falling&&this.world.get(x,y-1,z)!==AIR&&this.world.get(x,y-1,z)!==WATER;
      return {flow:[dx,dz,r.falling?1:0,depth],foam:landing?1:shore&&len?.24:0};
    }
  }
  if(typeof module!=='undefined')module.exports=WaterFlow;else root.WaterFlow=WaterFlow;
})(this);
