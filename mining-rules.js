// Digging balance: base seconds × tool/material duration factor.
// Kept independent of rendering so progression and timing can be tested in Node.
(function(root){
  const blocks={
    1:['soil',1.1],2:['soil',.9],3:['rock',4.8],4:['sand',.7],
    6:['wood',2.4],7:['leaf',.35],8:['wood',1.8],9:['rock',4],10:['rock',5.6],
    11:['rock',6],12:['rock',7],13:['rock',8],14:['rock',10],15:['sand',.5],
    // 第一批建筑方块（PRD FR-019）：玻璃 砂岩 磨光石 茅草 雪砖 屋瓦 铁块 金块 晶块 灯
    // 80–86 黑曜石 方解石 紫水晶 钻石 红/绿/蓝宝石；90–95 水泥 黄砖 深色砖 浅/深/红木板
    80:['rock',16],81:['rock',2.4],82:['rock',5],83:['rock',12],84:['rock',9],85:['rock',9],86:['rock',9],
    90:['rock',4.5],91:['rock',4],92:['rock',4.4],93:['wood',1.8],94:['wood',1.8],95:['wood',1.8],
    // 60–73 门 窗 床 花 浆果丛 树苗
    60:['wood',1.5],61:['wood',1.5],62:['wood',1.5],63:['wood',1.5],64:['sand',.6],65:['sand',.6],66:['wood',1.2],67:['wood',1.2],
    96:['sand',.8],97:['wood',1], // 荧光玻璃、冰灯
    74:['wood',.6],75:['wood',.6],76:['wood',2], // 告示牌、箱子
    116:['leaf',.15],117:['leaf',.15],118:['leaf',.15],179:['wood',.8],119:['leaf',.8],143:['leaf',.8],144:['leaf',.35],145:['leaf',.35],152:['leaf',.35], // 蘑菇、南瓜、西瓜、三种果树的树冠
    159:['leaf',.35],176:['leaf',.35],199:['leaf',.35], // 香蕉树叶、葡萄藤、荔枝树叶
    183:['leaf',.6], // 粘液方块
    154:['rock',5.6],155:['rock',5],156:['rock',6],157:['rock',4.4],158:['rock',4], // 花岗岩、大理石、石英石、石板岩、鹅卵石
    77:['leaf',.15],78:['leaf',.15],79:['leaf',.15],87:['leaf',.15],88:['leaf',.15],99:['leaf',.15],89:['wood',.6],98:['soil',.9], // 新花、幼苗、竹子、耕地
    68:['leaf',.15],69:['leaf',.15],70:['leaf',.15],71:['leaf',.3],72:['leaf',.3],73:['leaf',.15],
    50:['sand',.8],51:['rock',3.2],52:['rock',4.8],53:['leaf',.6],54:['sand',.7],55:['rock',4],56:['rock',9],57:['rock',9],58:['rock',9],59:['wood',1],
  };
  for(const id of [...Array.from({length:16},(_,i)=>160+i),180,181,182,...Array.from({length:15},(_,i)=>184+i),...Array.from({length:56},(_,i)=>200+i)])blocks[id]=['wood',id<184?2.4:1.5];
  // Unknown items, blocks, food and torches dig like bare hands.
  const tools={
    16:{rock:.5,wood:1.1,soil:.95,sand:1,leaf:1.2}, // wooden pick：比空手快一倍，比石镐慢一半多
    17:{rock:1.25,wood:.5,soil:1.1,sand:1.1,leaf:.7}, // wooden axe
    18:{rock:1.35,wood:1.2,soil:.5,sand:.5,leaf:1}, // wooden shovel
    153:{rock:1.5,wood:.95,soil:1.2,sand:1.2,leaf:.6}, // wooden sword
    20:{rock:.22,wood:1.1,soil:.9,sand:1,leaf:1.2}, // stone pick
    21:{rock:1.25,wood:.23,soil:1.1,sand:1.1,leaf:.6}, // stone axe
    22:{rock:1.35,wood:1.2,soil:.24,sand:.24,leaf:1}, // stone shovel
    23:{rock:1.5,wood:.9,soil:1.2,sand:1.2,leaf:.45}, // stone sword
    25:{rock:.12,wood:.9,soil:.75,sand:.85,leaf:1}, // iron pick
    19:{rock:1,wood:1.1,soil:.01,sand:.01,leaf:1}, // drill pick：泥土和沙子一下挖掉
    28:{rock:.07,wood:.9,soil:.75,sand:.85,leaf:1}, // heart pick：挖岩石最快
    26:{rock:1.3,wood:.75,soil:1.1,sand:1.1,leaf:.3}, // iron sword
  };
  function seconds(block,item=0){
    const entry=blocks[block];if(!entry)return Infinity;
    const [kind,base]=entry;return Math.max(.12,base*(tools[item]?.[kind]??1));
  }
  function advance(progress,block,item,dt){
    // Store completed work, not elapsed time: switching tools cannot reprice past work.
    return Math.min(1,Math.max(0,progress)+Math.max(0,dt)/seconds(block,item));
  }
  class DamageStore {
    constructor(saved={}){
      this.records=Object.create(null);
      for(const r of Object.values(saved||{}))if(r && [r.x,r.y,r.z,r.id].every(Number.isInteger) && r.y>0 && blocks[r.id] && Number.isFinite(r.progress) && r.progress>0 && r.progress<1)
        this.records[`${r.x},${r.y},${r.z}`]={x:r.x,y:r.y,z:r.z,id:r.id,progress:r.progress};
    }
    clear(x,y,z){delete this.records[`${x},${y},${z}`];}
    get(hit,id){
      const r=this.records[`${hit.x},${hit.y},${hit.z}`];
      if(r&&r.id!==id){this.clear(hit.x,hit.y,hit.z);return 0;}
      return r?r.progress:0;
    }
    dig(hit,id,item,dt){
      const progress=advance(this.get(hit,id),id,item,dt);
      if(progress>0)this.records[`${hit.x},${hit.y},${hit.z}`]={x:hit.x,y:hit.y,z:hit.z,id,progress};
      return progress;
    }
  }
  const api={seconds,advance,DamageStore};
  if(typeof module!=='undefined')module.exports=api;else root.MiningRules=api;
})(this);
