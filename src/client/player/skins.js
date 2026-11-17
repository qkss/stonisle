// 角色皮肤：一整套现成的造型，比“肤色 / 发型 / 上衣”这些选项细节多得多。在设置 → Character 里选；要先解锁才能穿。
// 一套皮肤 = 名字 + 怎么得到（how，给玩家看的一句话；got(game)，满足了就解锁）+ look（盖掉哪些基本选项）+ extra（往小人身上加的零件）。
// extra 拿到的工具：part(宽, 高, 深, x, y, z, 颜色, 挂在哪) 加一个小方块；swing = [左腿, 右腿, 左臂, 右臂] 四个关节（零件挂上去就跟着摆）；
//   tint / shade 调亮调暗；head / body 表示头上、身上是不是穿着护甲（穿了就别画帽子、胸前的东西）。小人脸朝 -z，身高约 1.9。
// 以后加新皮肤：在 LIST 末尾加一项（不要改已有皮肤的顺序，存档里记的是序号）。
// 解锁记在这台设备上（stonisle.skins），所有世界通用；联机时别人看得到你穿的皮肤。
(() => {
  const ring = (n, f) => { for (let i = 0; i < n; i++) f(Math.sin(i / n * 6.283), Math.cos(i / n * 6.283), i); };
  const hood = (a, col, lining) => { // 兜帽：后面、头顶、两侧包住头，后脑勺再鼓出一点
    a.part(0.52, 0.36, 0.1, 0, 1.7, 0.25, col); a.part(0.52, 0.09, 0.5, 0, 1.935, 0.03, col); for (const x of [-0.26, 0.26]) a.part(0.07, 0.34, 0.42, x, 1.72, 0.05, col);
    a.part(0.4, 0.05, 0.05, 0, 1.9, -0.215, lining); a.part(0.2, 0.14, 0.12, 0, 1.6, 0.33, a.shade(col, 0.88));
  };
  const LIST = [
    { name: 'My own look', how: '' }, // 0：不用皮肤，按自己选的肤色、发型、衣服来
    { name: 'Forest Ranger', how: 'Finish all of Wick\'s tasks.', got: g => window.Lang && Lang.quest >= 20, look: { shirt: 3, pants: 1, skirt: 0, acc: 0 },
      extra(a) { // 森林游侠：绿兜帽斗篷、背上的箭袋、皮带和小包、护腕、翻边靴
        const G = '#3f7a3a', D = '#2c5a2a', L = '#7a5230', GOLD = '#d8b040';
        if (!a.head) hood(a, G, D);
        a.part(0.64, 0.07, 0.36, 0, 1.385, 0, G); a.part(0.52, 0.62, 0.05, 0, 1.06, 0.175, G); a.part(0.58, 0.34, 0.05, 0, 0.6, 0.195, D);
        for (const x of [-0.22, -0.07, 0.08, 0.23]) a.part(0.1, 0.1, 0.05, x, 0.4, 0.195, x > 0 ? G : D);   // 斗篷下摆的破边
        a.part(0.07, 0.07, 0.03, 0, 1.37, -0.19, GOLD);
        const q = a.part(0.13, 0.52, 0.11, 0.1, 1.2, 0.26, L); q.rotation.z = 0.32;                             // 箭袋斜背着，露出三支箭羽
        [['#e8e0c8', -0.02], ['#c84a3c', 0.03], ['#e8e0c8', 0.08]].forEach(([c, x]) => { const f = a.part(0.035, 0.1, 0.06, x - 0.02, 1.5, 0.27, c); f.rotation.z = 0.32; });
        if (!a.body) { a.part(0.5, 0.06, 0.28, 0, 0.86, 0, L); a.part(0.08, 0.08, 0.02, 0, 0.86, -0.145, GOLD); for (const x of [-0.19, 0.19]) { a.part(0.12, 0.13, 0.07, x, 0.8, -0.16, a.shade(L, 0.85)); a.part(0.12, 0.03, 0.075, x, 0.855, -0.16, L); } }
        for (const arm of [a.swing[2], a.swing[3]]) { a.part(0.165, 0.13, 0.195, 0, -0.43, 0, L, arm); a.part(0.17, 0.025, 0.2, 0, -0.37, 0, GOLD, arm); }
        for (const leg of [a.swing[0], a.swing[1]]) { a.part(0.235, 0.07, 0.25, 0, -0.55, 0, L, leg); a.part(0.24, 0.025, 0.255, 0, -0.52, 0, a.tint(L, 0.3), leg); }
      } },
    { name: 'Silver Knight', how: 'Make an iron sword.', got: g => (g.inv[26] || 0) > 0, look: { shirt: 7, pants: 2, skirt: 0, acc: 0 },
      extra(a) { // 白银骑士：胸甲和护肩、臂甲腿甲、红披风、头上一圈银冠和红缨
        const S = '#c8ced6', S2 = '#8e98a6', R = '#b8303a', GOLD = '#e0b840';
        if (!a.body) { a.part(0.5, 0.42, 0.03, 0, 1.15, -0.145, S); a.part(0.06, 0.42, 0.035, 0, 1.15, -0.15, S2); a.part(0.2, 0.05, 0.04, 0, 1.2, -0.155, GOLD); a.part(0.05, 0.2, 0.04, 0, 1.17, -0.156, GOLD);
          a.part(0.5, 0.42, 0.03, 0, 1.15, 0.145, S); for (const x of [-0.16, 0, 0.16]) a.part(0.15, 0.16, 0.035, x, 0.8, -0.15, x ? S2 : S); }
        for (const arm of [a.swing[2], a.swing[3]]) { a.part(0.25, 0.13, 0.28, 0, -0.02, 0, S, arm); a.part(0.26, 0.03, 0.29, 0, -0.09, 0, GOLD, arm); a.part(0.17, 0.2, 0.2, 0, -0.42, 0, S2, arm); a.part(0.18, 0.04, 0.21, 0, -0.33, 0, S, arm); }
        for (const leg of [a.swing[0], a.swing[1]]) { a.part(0.235, 0.26, 0.25, 0, -0.44, 0, S, leg); a.part(0.14, 0.09, 0.05, 0, -0.3, -0.13, S2, leg); a.part(0.24, 0.03, 0.255, 0, -0.56, 0, GOLD, leg); }
        a.part(0.54, 0.06, 0.06, 0, 1.4, 0.15, GOLD); a.part(0.52, 0.86, 0.04, 0, 0.96, 0.19, R); a.part(0.52, 0.05, 0.045, 0, 0.55, 0.19, GOLD); a.part(0.44, 0.84, 0.01, 0, 0.96, 0.213, a.shade(R, 0.8));
        if (!a.head) { a.part(0.46, 0.06, 0.46, 0, 1.87, 0, S); a.part(0.1, 0.08, 0.03, 0, 1.9, -0.235, GOLD); for (let i = 0; i < 4; i++) a.part(0.06, 0.12 - i * 0.02, 0.09, 0, 2.0 - i * 0.012, -0.08 + i * 0.09, i % 2 ? a.shade(R, 0.85) : R); }
      } },
    { name: 'Star Mage', how: 'Find three amethysts.', got: g => (g.inv[82] || 0) >= 3, look: { shirt: 5, pants: 2, skirt: 2, acc: 0 },
      extra(a) { // 星星法师：紫长袍（连衣裙那一套裙摆）上缀着星星、高领、金腰带，一顶弯尖的宽檐帽
        const P = '#5a48b0', P2 = '#3e3284', GOLD = '#f0c84a', star = (x, y, z) => { a.part(0.05, 0.02, 0.012, x, y, z, GOLD); a.part(0.02, 0.05, 0.012, x, y, z, GOLD); };
        if (!a.body) { for (const [x, y] of [[-0.15, 1.24], [0.14, 1.12], [-0.08, 0.98], [0.17, 1.3]]) star(x, y, -0.142); a.part(0.5, 0.05, 0.28, 0, 0.84, 0, GOLD); a.part(0.09, 0.09, 0.02, 0, 0.84, -0.15, '#fff4c0'); a.part(0.3, 0.1, 0.04, 0, 1.4, 0.11, P2); }
        for (const [x, y, z] of [[-0.2, 0.62, -0.24], [0.16, 0.5, -0.27], [0.02, 0.4, -0.3], [-0.14, 0.66, 0.24], [0.2, 0.45, 0.28]]) star(x, y, z);
        for (const arm of [a.swing[2], a.swing[3]]) { a.part(0.2, 0.14, 0.24, 0, -0.34, 0, P, arm); a.part(0.21, 0.03, 0.25, 0, -0.41, 0, GOLD, arm); }
        if (!a.head) { a.part(0.74, 0.03, 0.74, 0, 1.9, 0, P2); a.part(0.44, 0.14, 0.44, 0, 1.985, 0, P); a.part(0.46, 0.045, 0.46, 0, 1.94, 0, GOLD); a.part(0.31, 0.13, 0.31, 0.01, 2.115, 0.01, P); a.part(0.2, 0.12, 0.2, 0.04, 2.235, 0.03, P2);
          a.part(0.11, 0.1, 0.11, 0.1, 2.33, 0.05, P); a.part(0.06, 0.06, 0.06, 0.17, 2.36, 0.06, GOLD); star(0, 2.0, -0.226); }
      } },
    { name: 'Panda Hoodie', how: 'Meet a panda.', got: () => { try { return JSON.parse(localStorage.getItem('stonisle.met') || '[]').includes('panda'); } catch (e) { return false; } }, look: { shirt: 7, pants: 2, skirt: 0, acc: 0 },
      extra(a) { // 熊猫卫衣：白兜帽上两只黑耳朵和黑眼圈，黑袖子、黑手套，肚子上一个大口袋
        const W = '#f4f1ea', B = '#26221f', GR = '#d8d2c6';
        if (!a.head) { hood(a, W, GR); for (const x of [-0.18, 0.18]) { a.part(0.15, 0.13, 0.08, x, 2.02, 0.03, B); a.part(0.08, 0.07, 0.085, x, 2.01, 0.028, '#5a504a'); a.part(0.1, 0.1, 0.02, x * 0.9, 1.93, -0.225, B); } a.part(0.07, 0.05, 0.02, 0, 1.9, -0.228, B); }
        for (const arm of [a.swing[2], a.swing[3]]) { a.part(0.185, 0.32, 0.225, 0, -0.14, 0, B, arm); a.part(0.16, 0.26, 0.19, 0, -0.42, 0, B, arm); a.part(0.17, 0.15, 0.2, 0, -0.59, 0, B, arm); a.part(0.1, 0.05, 0.02, 0, -0.6, -0.105, '#e8a0a8', arm); }
        if (!a.body) { a.part(0.28, 0.13, 0.02, 0, 0.95, -0.142, GR); a.part(0.28, 0.02, 0.022, 0, 1.015, -0.143, a.shade(GR, 0.8)); for (const x of [-0.05, 0.05]) a.part(0.02, 0.16, 0.02, x, 1.27, -0.143, GR); a.part(0.5, 0.05, 0.28, 0, 0.8, 0, B); }
        a.part(0.12, 0.11, 0.08, 0, 0.84, 0.17, W);
        for (const leg of [a.swing[0], a.swing[1]]) a.part(0.235, 0.05, 0.25, 0, -0.56, 0, W, leg);
      } },
    { name: 'Snow Traveler', how: 'Walk far to the north.', got: g => Core.climateAt(g.p.x, g.p.z) === 0, look: { shirt: 4, pants: 5, skirt: 0, acc: 0 },
      extra(a) { // 雪地旅人：毛领毛边的厚外套、大扣子、红围巾红手套、耳罩、毛口靴
        const F = '#f6f4ee', R = '#c8403c', C = '#3c78b8';
        if (!a.body) { a.part(0.58, 0.1, 0.38, 0, 1.4, 0, F); a.part(0.53, 0.08, 0.3, 0, 0.8, 0, F); a.part(0.04, 0.5, 0.02, 0, 1.1, -0.142, a.shade(C, 0.75)); for (const y of [1.26, 1.12, 0.98]) a.part(0.06, 0.06, 0.025, 0.07, y, -0.145, '#f0d890');
          a.part(0.36, 0.09, 0.3, 0, 1.44, -0.02, R); a.part(0.12, 0.3, 0.05, -0.1, 1.27, -0.16, R); for (const x of [-0.14, -0.1, -0.06]) a.part(0.025, 0.05, 0.05, x, 1.1, -0.16, a.tint(R, 0.4)); }
        for (const arm of [a.swing[2], a.swing[3]]) { a.part(0.195, 0.07, 0.235, 0, -0.29, 0, F, arm); a.part(0.17, 0.16, 0.2, 0, -0.58, 0, R, arm); a.part(0.175, 0.03, 0.205, 0, -0.5, 0, a.tint(R, 0.35), arm); }
        for (const leg of [a.swing[0], a.swing[1]]) { a.part(0.24, 0.08, 0.255, 0, -0.55, 0, F, leg); a.part(0.235, 0.12, 0.31, 0, -0.65, -0.035, '#6a4a30', leg); }
        if (!a.head) { a.part(0.48, 0.035, 0.07, 0, 1.94, 0, a.shade(R, 0.8)); for (const x of [-0.235, 0.235]) { a.part(0.08, 0.16, 0.16, x, 1.66, 0, F); a.part(0.085, 0.09, 0.09, x, 1.66, 0, R); } }
      } },
    { name: 'Island Dancer', how: 'Walk far to the south.', got: g => Core.climateAt(g.p.x, g.p.z) === 2, look: { shirt: 1, pants: 3, skirt: 1, acc: 0 },
      extra(a) { // 海岛舞者：脖子上一圈花环、头上别一朵花、草裙的一条条草叶、手环脚环
        const FL = ['#f0688a', '#f8d848', '#ffffff', '#f09838'];
        if (!a.body) ring(10, (sx, cz, i) => { a.part(0.085, 0.07, 0.085, sx * 0.25, 1.37 - Math.abs(sx) * 0.03, cz * 0.16, FL[i % 4]); a.part(0.035, 0.075, 0.035, sx * 0.25, 1.372 - Math.abs(sx) * 0.03, cz * 0.16, '#f0b030'); });
        ring(16, (sx, cz, i) => { const s = a.part(0.05, 0.34 + (i % 3) * 0.03, 0.02, sx * 0.3, 0.5, cz * 0.25, i % 2 ? '#7aa83c' : '#9cc050'); s.rotation.y = Math.atan2(sx, cz); s.rotation.x = 0.12; });
        if (!a.head) { for (const [dx, dy] of [[0.05, 0], [-0.05, 0], [0, 0.05], [0, -0.05]]) a.part(0.06, 0.06, 0.03, 0.2 + dx, 1.86 + dy, -0.2, '#f0688a'); a.part(0.045, 0.045, 0.04, 0.2, 1.86, -0.205, '#f8d848'); a.part(0.07, 0.03, 0.03, 0.27, 1.82, -0.19, '#5c9a48'); }
        for (const arm of [a.swing[2], a.swing[3]]) { a.part(0.16, 0.03, 0.19, 0, -0.5, 0, '#f8d848', arm); a.part(0.16, 0.03, 0.19, 0, -0.46, 0, '#f0688a', arm); }
        for (const leg of [a.swing[0], a.swing[1]]) a.part(0.205, 0.035, 0.225, 0, -0.5, 0, '#f09838', leg);
      } },
    { name:'胡桃 · Hu Tao', how:'Make a torch.', got:g=>(g.inv[24]||0)>0, eyes:'#b94352', face:'hutao', look:{skin:0,hair:0,style:1,shirt:8,pants:2,skirt:0,acc:0},
      extra(a){
        const dark='#29232b',trim='#60454c',red='#a43d4b',gold='#c4a579';
        if(!a.head){
          a.part(.57,.045,.55,0,1.91,0,dark);a.part(.43,.18,.42,0,2.01,.01,dark);a.part(.445,.033,.435,0,1.955,.01,trim);
          a.part(.085,.15,.014,0,2.015,-.215,'#d9c6a8');a.part(.038,.012,.018,0,2.04,-.225,trim);a.part(.012,.075,.018,0,2.015,-.225,trim);
          for(const [x,y] of [[.16,2.05],[.21,2.01],[.23,2.08]]){for(const [dx,dy] of [[-.02,0],[.02,0],[0,.02],[0,-.02]])a.part(.028,.028,.023,x+dx,y+dy,-.20,red);a.part(.014,.014,.025,x,y,-.214,gold);}
        }
        if(!a.body){
          const coat=a.part(.485,.60,.28,0,1.08,0,'#392a30'),parent=coat.parent;
          // Fine woven fabric, shared by coat, sleeves and hanging panels.
          if(!this.fabric){const c=document.createElement('canvas');c.width=c.height=64;const ctx=c.getContext('2d');ctx.fillStyle='#ffffff';ctx.fillRect(0,0,64,64);for(let i=0;i<64;i+=2){ctx.fillStyle=i%4?'#eee9e5':'#f7f4f0';ctx.fillRect(i,0,1,64);ctx.fillStyle='#e9e4df';ctx.fillRect(0,i,64,1);}this.fabric=new THREE.CanvasTexture(c);this.fabric.wrapS=this.fabric.wrapT=THREE.RepeatWrapping;this.fabric.repeat.set(3,5);}
          const fabric=m=>{m.material.map=this.fabric;m.material.needsUpdate=true;return m;};fabric(coat);
          const stitch=(pts,col=gold,r=.003,to=parent)=>{const curve=new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(...p)));const m=new THREE.Mesh(new THREE.TubeGeometry(curve,24,r,4,false),new THREE.MeshLambertMaterial({color:col}));to.add(m);return m;};
          const curl=(x,y,z,k=1,to=parent)=>stitch([[x,y,z],[x+.04*k,y+.025,z],[x+.065*k,y+.065,z],[x+.045*k,y+.085,z],[x+.018*k,y+.065,z],[x+.037*k,y+.048,z]],'#a78b76',.003,to);
          for(const sign of [-1,1]){
            const collar=a.part(.13,.13,.025,sign*.065,1.345,-.155,'#8f302c');collar.rotation.z=sign*.40;
            const lapel=a.part(.09,.18,.018,sign*.10,1.29,-.17,'#251f25');lapel.rotation.z=sign*-.42;
            stitch([[sign*.18,1.30,-.157],[sign*.13,1.19,-.157],[sign*.055,1.14,-.157]],'#776250');
            stitch([[0,1.23,-.176],[sign*.06,1.215,-.176],[sign*.042,1.17,-.176],[0,1.23,-.176]],gold,.005);
            for(const y of [1.10,.997])stitch([[0,y,-.16],[sign*.042,y+.018,-.16],[sign*.058,y,-.16],[sign*.038,y-.016,-.16],[0,y,-.16]],'#1c171d',.007);
            for(let i=0;i<3;i++)curl(sign*(.07+i*.045),.84+i*.035,-.153,sign);
            stitch([[sign*.035,.83,-.155],[sign*.12,.82,-.155],[sign*.21,.91,-.155]],gold,.003);
            // Split coat tails with piping, embroidery and hanging tassels.
            const hem=new THREE.Group();hem.position.set(sign*.18,.855,.16);parent.add(hem);a.secondary(hem,sign, .7);
            const tail=fabric(a.part(.18,.45,.035,0,-.225,0,'#33262d',hem));tail.rotation.z=sign*.13;
            for(const edge of [-1,1])stitch([[edge*.077,.21,-.023],[edge*.077,-.19,-.023]],gold,.003,tail);
            curl(-.04,-.10,-.024,1,tail);curl(.02,.02,-.024,-1,tail);
            a.part(.045,.045,.025,0,-.225,-.03,gold,tail);
            const tassel=(to,x,y,z,phase)=>{const knot=new THREE.Group();knot.position.set(x,y,z);to.add(knot);a.secondary(knot,phase,1.3);
              for(let i=0;i<5;i++)stitch([[(i-2)*.007,0,0],[(i-2)*.008,-.045,.005],[(i-2)*.009,-.09+(i%2)*.008,.008]],'#d0b990',.0035,knot);
            };
            tassel(tail,0,-.25,-.03,sign+.7);
            const cord=new THREE.Group();cord.position.set(sign*.06,.88,-.17);parent.add(cord);a.secondary(cord,sign+2,.8);
            stitch([[0,0,0],[sign*.035,-.12,-.01],[sign*.05,-.23,-.01]],gold,.005,cord);
            tassel(cord,sign*.05,-.22,-.01,sign+3);

          }
          for(const arm of [a.swing[2],a.swing[3]]){
            fabric(a.part(.195,.18,.23,0,-.065,0,'#392a30',arm));
            fabric(a.part(.205,.39,.24,0,-.34,0,'#392a30',arm));fabric(a.part(.23,.12,.26,0,-.52,0,'#281e25',arm));
            for(const z of [-.134,.134]){
              stitch([[-.105,-.46,z],[0,-.465,z],[.105,-.46,z]],gold,.003,arm);
              stitch([[-.105,-.56,z],[0,-.565,z],[.105,-.56,z]],'#9b7961',.003,arm);
              curl(-.065,-.41,z,1,arm);curl(.065,-.41,z,-1,arm);
              stitch([[-.09,-.31,z],[0,-.39,z],[.09,-.31,z]],'#a78b76',.003,arm);
            }
          }
        }
        if(!a.legs)for(const leg of [a.swing[0],a.swing[1]]){a.part(.215,.15,.235,0,-.1,0,dark,leg);a.part(.195,.20,.215,0,-.29,0,'#f2cfbb',leg);a.part(.205,.19,.23,0,-.48,0,'#eee4d9',leg);a.part(.21,.026,.235,0,-.40,0,red,leg);a.part(.085,.06,.018,0,-.46,-.124,red,leg);a.part(.235,.13,.315,0,-.65,-.035,dark,leg);}
      }
    },
    {name:'嫦娥 · Chang’e',art:'assets/characters/change-front.png',how:'Available from the start.',unlocked:true,face:'change',eyes:'#a83872',hairColor:'#ddd9d3',look:{skin:0,hair:5,style:7,shirt:7,pants:5,skirt:0,acc:0},
      extra(a){
        const jade='#287e82',silk='#9bdcd2',gold='#c9a34e',ivory='#eee4d2',silver='#ddd9d3';
        const root=a.part(.001,.001,.001,0,1,0,jade).parent;
        const panel=(pts,z,depth,col,to=root)=>{const cy=pts.reduce((n,p)=>n+p[1],0)/pts.length,sh=new THREE.Shape();pts.forEach(([x,y],i)=>i?sh.lineTo(x,y-cy):sh.moveTo(x,y-cy));sh.closePath();const geo=new THREE.ExtrudeGeometry(sh,{depth,bevelEnabled:true,bevelThickness:.003,bevelSize:.003,bevelSegments:1,steps:1});geo.translate(0,0,-depth/2);const m=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({color:col}));m.position.set(0,cy,z);to.add(m);return m;};
        const line=(pts,col=gold,r=.004,to=root)=>{const curve=new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(...p)));const m=new THREE.Mesh(new THREE.TubeGeometry(curve,20,r,5,false),new THREE.MeshLambertMaterial({color:col}));to.add(m);return m;};
        const jewel=(x,y,z,size,to=root)=>{const m=new THREE.Mesh(new THREE.OctahedronGeometry(size),new THREE.MeshPhongMaterial({color:silk,shininess:65}));m.position.set(x,y,z);m.scale.z=.5;to.add(m);return m;};
        const pearl=(x,y,z,r=.012,to=root)=>{const m=new THREE.Mesh(new THREE.SphereGeometry(r,8,6),new THREE.MeshPhongMaterial({color:ivory,shininess:45}));m.position.set(x,y,z);to.add(m);return m;};
        if(!this.ribbonWeave){
          const c=document.createElement('canvas');c.width=96;c.height=256;const ctx=c.getContext('2d');
          for(let y=0;y<256;y++)for(let x=0;x<96;x++){const u=x/95,t=y/255,fold=Math.cos(u*Math.PI*2+.35*Math.sin(t*5)),weave=((x+y)%3===0?2:0),v=Math.round(211+fold*12+Math.sin(t*14)*3-weave);ctx.fillStyle=`rgb(${v},${v},${v})`;ctx.fillRect(x,y,1,1);}
          ctx.globalCompositeOperation='destination-in';const alpha=ctx.createLinearGradient(0,0,96,0);alpha.addColorStop(0,'rgba(255,255,255,.45)');alpha.addColorStop(.12,'rgba(255,255,255,.86)');alpha.addColorStop(.5,'rgba(255,255,255,1)');alpha.addColorStop(.88,'rgba(255,255,255,.86)');alpha.addColorStop(1,'rgba(255,255,255,.45)');ctx.fillStyle=alpha;ctx.fillRect(0,0,96,256);this.ribbonWeave=new THREE.CanvasTexture(c);this.ribbonWeave.anisotropy=4;
        }
        const silkRibbon=(points,width,to)=>{
          const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),v=[],colors=[],uvs=[],ids=[],frames=[],rows=48,cols=6;
          const seed=points[2][0]*2;
          for(let i=0;i<=rows;i++){
            const t=i/rows,p=curve.getPoint(t),tan=curve.getTangent(t),side=new THREE.Vector3(-tan.y,tan.x,0).normalize();
            frames.push({p,tan,side,t});
            for(let j=0;j<=cols;j++){v.push(0,0,0);uvs.push(j/cols,1-t);const c=new THREE.Color(j===0||j===cols?'#9f986e':j===1||j===5?'#537f79':'#66958d');colors.push(c.r,c.g,c.b);if(i<rows&&j<cols){const n=i*(cols+1)+j;ids.push(n,n+1,n+cols+1,n+1,n+cols+2,n+cols+1);}}
          }
          const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3).setUsage(THREE.DynamicDrawUsage));geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.setIndex(ids);
          geo.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));const mesh=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({map:this.ribbonWeave,vertexColors:true,side:THREE.DoubleSide,transparent:true,opacity:.70,depthWrite:false}));mesh.frustumCulled=false;to.add(mesh);
          const animate=(time,walk,phase)=>{const pos=geo.attributes.position;
            for(let i=0;i<=rows;i++){const {p,tan,side,t}=frames[i],axis=side.clone().applyAxisAngle(tan,Math.sin(t*5+seed)*.40+Math.sin(time*1.25-t*4+seed)*.13*t),normal=new THREE.Vector3().crossVectors(tan,axis),w=width*(.82+.09*Math.sin(t*Math.PI))*(1-.38*t);
              for(let j=0;j<=cols;j++){const u=j/cols-.5,fold=Math.cos(u*Math.PI)*Math.sin(t*7-time*1.3)*.004*t,flutter=Math.sin(time*1.3-t*4+seed)*.018*t+Math.sin(phase-t*3)*walk*.018*t;
                pos.setXYZ(i*(cols+1)+j,p.x+axis.x*u*w+normal.x*fold,p.y+axis.y*u*w+normal.y*fold+flutter*.35,p.z+axis.z*u*w+normal.z*fold+flutter);
              }}pos.needsUpdate=true;geo.computeVertexNormals();};
          (to.userData.fabricMotion ||= []).push(animate);animate(0,0,0);
        };
        // Flattened sculpted locks: curved centerlines, tapered tips, shaded cross-sections.
        const hairLock=(pts,width,depth,col)=>{
          const origin=new THREE.Vector3(...pts[0]),curve=new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(...p).sub(origin))),v=[],colors=[],ids=[],rows=20,sides=8;
          for(let i=0;i<=rows;i++){const t=i/rows,p=curve.getPoint(t),tan=curve.getTangent(t),side=new THREE.Vector3(-tan.y,tan.x,0).normalize(),normal=new THREE.Vector3().crossVectors(tan,side).normalize(),taper=1-.88*Math.pow(t,3);
            for(let j=0;j<sides;j++){const angle=j/sides*Math.PI*2,dx=Math.cos(angle)*width*.5*taper,dz=Math.sin(angle)*depth*.5*taper;v.push(p.x+side.x*dx+normal.x*dz,p.y+side.y*dx+normal.y*dz,p.z+side.z*dx+normal.z*dz);const c=new THREE.Color(col).multiplyScalar(.86+.14*Math.max(0,Math.sin(angle))+.04*Math.sin(t*Math.PI));colors.push(c.r,c.g,c.b);if(i<rows){const n=i*sides+j,k=i*sides+(j+1)%sides;ids.push(n,k,n+sides,k,k+sides,n+sides);}}
          }
          for(let j=1;j<sides-1;j++){ids.push(0,j+1,j);const end=rows*sides;ids.push(end,end+j,end+j+1);}
          const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.setIndex(ids);geo.computeVertexNormals();const mesh=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({vertexColors:true}));mesh.position.copy(origin);mesh.userData.hair=true;root.add(mesh);
        };
        if(!a.head){
          const cap=new THREE.Mesh(new THREE.SphereGeometry(.225,20,10,0,Math.PI*2,0,Math.PI/2),new THREE.MeshLambertMaterial({color:'#bcbab4'}));cap.scale.set(1,.62,1);cap.position.set(0,1.79,.012);cap.userData.hair=true;root.add(cap);
          for(let i=0;i<7;i++){const x=(i-3)*.061;hairLock([[x,1.86,.13],[x*1.12,1.75,.205],[x*1.16,1.58,.21],[x*.95,1.47+Math.abs(i-3)*.014,.17]],.093,.045,i%2?'#b5b5b3':'#c9c6bd');}
          for(const sign of [-1,1]){
            for(let i=0;i<3;i++){const x=sign*(.025+i*.055);hairLock([[x,1.88,-.15],[x+sign*.025,1.81,-.222],[x+sign*.012,1.75,-.237],[x+sign*(i===2?.03:-.025),1.70+(i%2)*.035,-.231]],.085-i*.006,.028,i%2?'#bab9b3':'#d0ccc2');}
            for(let i=0;i<2;i++)hairLock([[sign*(.185+i*.033),1.83,-.04+i*.06],[sign*(.225+i*.026),1.71,-.11+i*.06],[sign*(.27+i*.025),1.54,-.08+i*.06],[sign*(.235+i*.032),1.47,-.10+i*.06],[sign*(.20+i*.025),1.51,-.14+i*.06]],.09-i*.014,.05,i?'#b7b9b8':'#cdc9c1');
          }
          a.part(.44,.055,.42,0,1.93,0,gold);
          for(const sign of [-1,1]){
            if(!this.headbandPattern){const c=document.createElement('canvas');c.width=128;c.height=256;const ctx=c.getContext('2d');ctx.fillStyle='#e3ddbf';ctx.fillRect(0,0,128,256);ctx.strokeStyle='#b29948';ctx.lineWidth=2;ctx.strokeRect(5,5,118,246);
              for(const [x,y] of [[43,70],[78,159]]){ctx.fillStyle='#c8ab51';for(let k=0;k<5;k++){const angle=k/5*Math.PI*2;ctx.beginPath();ctx.ellipse(x+Math.cos(angle)*12,y+Math.sin(angle)*12,8,12,angle,0,Math.PI*2);ctx.fill();}ctx.fillStyle='#88a99b';ctx.beginPath();ctx.arc(x,y,5,0,Math.PI*2);ctx.fill();}
              ctx.beginPath();ctx.moveTo(36,220);ctx.bezierCurveTo(100,190,18,115,72,35);ctx.stroke();this.headbandPattern=new THREE.CanvasTexture(c);}
            const v=[],uv=[],ids=[],rows=14,cols=8;
            for(let j=0;j<=rows;j++)for(let k=0;k<=cols;k++){const t=j/rows,u=k/cols-.5,w=.13+.045*Math.sin(t*Math.PI/2);v.push(sign*(.105+.13*t)+u*w,.25*t+sign*u*.035,-.025*Math.sin(t*Math.PI)-.035*t*t+Math.cos(u*Math.PI)*.006);uv.push(k/cols,1-t);if(j<rows&&k<cols){const n=j*(cols+1)+k;ids.push(n,n+1,n+cols+1,n+1,n+cols+2,n+cols+1);}}
            const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(ids);geo.computeVertexNormals();const band=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({map:this.headbandPattern,side:THREE.DoubleSide}));band.position.y=1.98;band.userData.hair=true;root.add(band);
            a.part(.10,.10,.11,sign*.245,1.88,-.03,gold);jewel(sign*.245,1.88,-.095,.045);
          }
          panel([[-.12,1.96],[0,2.13],[.12,1.96],[0,1.92]],-.235,.028,gold);jewel(0,1.995,-.26,.065);
          for(const sign of [-1,1]){
            for(let i=0;i<3;i++){const petal=panel([[sign*.16,1.92],[sign*(.20+i*.025),1.99+i*.012],[sign*(.25+i*.015),1.94],[sign*.20,1.89]],-.10,.015,i%2?gold:'#dcae96');petal.rotation.z=sign*i*.12;}
            for(let i=0;i<4;i++)pearl(sign*.25,1.82-i*.035,-.12,.014);
            jewel(sign*.25,1.66,-.12,.023);

          }

        }
        // Golden veil is part of Chang'e's identity and follows the same head joint as her face.
        {
          const v=[],uv=[],ids=[],rows=16,cols=32;
          for(let j=0;j<=rows;j++)for(let k=0;k<=cols;k++){const t=j/rows,u=k/cols-.5;v.push(u*(.305-.065*t),-t*(.158-.060*Math.pow(Math.abs(u)*2,1.6)),-.208-.008*Math.cos(u*Math.PI)+.0009*Math.sin(u*Math.PI*6)*t);uv.push(k/cols,1-t);if(j<rows&&k<cols){const n=j*(cols+1)+k;ids.push(n,n+1,n+cols+1,n+1,n+cols+2,n+cols+1);}}
          if(!this.veilWeave){
            const c=document.createElement('canvas');c.width=192;c.height=128;const ctx=c.getContext('2d');
            // Muted pale gold, shaded at the cheeks and lower edge; tiny woven variation.
            for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++){
              const u=x/(c.width-1),t=y/(c.height-1),edge=Math.pow(Math.abs(u-.5)*2,1.6),fold=Math.sin(u*Math.PI*5+t*.6)*1.8,weave=((x+y)%3===0?-1.2:.4),shade=-12*edge-6*t*t+fold+weave;
              ctx.fillStyle=`rgb(${Math.round(192+shade)},${Math.round(163+shade)},${Math.round(85+shade*.7)})`;ctx.fillRect(x,y,1,1);
            }
            ctx.fillStyle='#c9af70';ctx.fillRect(0,2,c.width,1);this.veilWeave=new THREE.CanvasTexture(c);this.veilWeave.anisotropy=4;
          }

          const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(ids);geo.computeVertexNormals();const veil=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({map:this.veilWeave,side:THREE.DoubleSide,transparent:true,opacity:.92,depthWrite:false}));veil.position.y=1.62;veil.renderOrder=2;veil.userData.hair=true;root.add(veil);
          const rest=new Float32Array(v);geo.attributes.position.setUsage(THREE.DynamicDrawUsage);veil.frustumCulled=false;
          // Only the free fabric moves; the pearl-trimmed upper edge remains attached to the face.
          veil.userData.fabricMotion=[(time,walk,phase)=>{const pos=geo.attributes.position;
            for(let n=0;n<pos.count;n++){const t=Math.floor(n/(cols+1))/rows,u=(n%(cols+1))/cols-.5,w=t*t;
              const drift=(Math.sin(time*1.45-u*3-t)*.00045+Math.sin(phase-.9-u*2)*walk*.0008)*w;
              pos.setXYZ(n,rest[n*3]+drift*.35,rest[n*3+1]+Math.sin(time*1.6+u*5-t)*.0003*w+Math.sin(phase-1.2)*walk*.0004*w,rest[n*3+2]+drift);
            }pos.needsUpdate=true;geo.computeVertexNormals();}];
          a.secondary(veil,0,0);

          for(let i=0;i<9;i++)pearl((i-4)*.035,1.621,-.225,.004);

        }
        if(!a.body){
          // Elliptical fitted bodice: narrower waist and a gently rounded shoulder line.
          const rings=[[.78,.185,.13],[.88,.157,.115],[1.01,.15,.11],[1.16,.19,.13],[1.30,.207,.13],[1.37,.17,.105]],v=[],ids=[],n=24;
          for(const [y,rx,rz] of rings)for(let k=0;k<=n;k++){const angle=k/n*Math.PI*2;v.push(Math.sin(angle)*rx,y,Math.cos(angle)*rz);}
          for(let j=0;j<rings.length-1;j++)for(let k=0;k<n;k++){const i=j*(n+1)+k;ids.push(i,i+1,i+n+1,i+1,i+n+2,i+n+1);}
          const bodice=new THREE.BufferGeometry();bodice.setAttribute('position',new THREE.Float32BufferAttribute(v,3));bodice.setIndex(ids);bodice.computeVertexNormals();root.add(new THREE.Mesh(bodice,new THREE.MeshLambertMaterial({color:jade,side:THREE.DoubleSide})));

          for(const sign of [-1,1]){
            panel([[sign*.02,1.37],[sign*.20,1.34],[sign*.14,1.19],[0,1.10]],-.158,.018,ivory);
            line([[sign*.19,1.34,-.173],[sign*.11,1.19,-.173],[0,1.1,-.173]]);
            panel([[sign*.04,1.16],[sign*.13,1.12],[sign*.10,1.02],[0,1.01]],-.17,.014,gold);
          }
          a.part(.325,.065,.245,0,.875,0,'#205e69');jewel(0,.88,-.18,.06);
          if(!this.sleeveEmbroidery){
            const c=document.createElement('canvas');c.width=512;c.height=256;const ctx=c.getContext('2d');ctx.strokeStyle='#e5bf69';ctx.fillStyle='#efd49a';ctx.lineWidth=2.2;ctx.lineCap='round';
            for(const y of [194,201,238,245]){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(512,y);ctx.stroke();}
            for(let k=0;k<8;k++){const x=k*64;ctx.beginPath();ctx.moveTo(x,225);ctx.bezierCurveTo(x+12,213,x+45,213,x+48,224);ctx.bezierCurveTo(x+48,236,x+26,237,x+28,226);ctx.bezierCurveTo(x+30,220,x+36,222,x+36,226);ctx.stroke();ctx.beginPath();ctx.moveTo(x+32,180);ctx.bezierCurveTo(x+8,157,x+18,133,x+32,120);ctx.bezierCurveTo(x+46,133,x+56,157,x+32,180);ctx.stroke();ctx.beginPath();ctx.arc(x+32,188,2.5,0,Math.PI*2);ctx.fill();}
            this.sleeveEmbroidery=new THREE.CanvasTexture(c);this.sleeveEmbroidery.anisotropy=4;
          }
          for(const [i,arm] of [a.swing[2],a.swing[3]].entries()){
            // Replace the generic sleeve blocks; keep the hand and the shoulder joint.
            for(const child of arm.children.slice(0,-1)){arm.remove(child);child.geometry?.dispose();child.material?.dispose();}
            const sign=i?1:-1,sleeve=new THREE.Group();arm.add(sleeve);a.secondary(sleeve,i+4,.22);
            const vertices=[],colors=[],uv=[],indices=[],rows=20,cols=32;
            for(let j=0;j<=rows;j++)for(let k=0;k<=cols;k++){
              const t=j/rows,angle=k/cols*Math.PI*2,flare=Math.pow(t,1.65),fold=Math.cos(angle*7)*.009*t*t,r=.097+.095*flare+fold;
              vertices.push(Math.cos(angle)*r+sign*.065*flare,-.035-.51*t+.012*Math.sin(angle*3)*t*t,Math.sin(angle)*(r*1.02));
              const c=new THREE.Color(t<.22?ivory:t>.94?silk:jade).multiplyScalar(.95+.05*Math.cos(angle*7));colors.push(c.r,c.g,c.b);uv.push(k/cols,1-t);
              if(j<rows&&k<cols){const n=j*(cols+1)+k;indices.push(n,n+1,n+cols+1,n+1,n+cols+2,n+cols+1);}
            }
            const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3).setUsage(THREE.DynamicDrawUsage));geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();
            sleeve.add(new THREE.Mesh(geo,new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide})));
            sleeve.add(new THREE.Mesh(geo,new THREE.MeshLambertMaterial({map:this.sleeveEmbroidery,transparent:true,side:THREE.DoubleSide,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1})));
            const rest=new Float32Array(vertices);sleeve.userData.fabricMotion=[(time,walk,phase)=>{const pos=geo.attributes.position;for(let n=0;n<pos.count;n++){const t=Math.floor(n/(cols+1))/rows,w=t*t;pos.setXYZ(n,rest[n*3]+Math.sin(time*1.4+sign)*.004*w,rest[n*3+1],rest[n*3+2]+(Math.sin(phase-.8+sign*.35)*walk*.018+Math.sin(time*1.3+sign)*.005)*w);}pos.needsUpdate=true;geo.computeVertexNormals();}];
            // Two thin scalloped cloth layers drape over the sleeve root, with narrow embroidered hems.
            for(let layer=0;layer<2;layer++){
              const v=[],c=[],uv=[],idx=[],rows=10,cols=40;
              for(let j=0;j<=rows;j++)for(let k=0;k<=cols;k++){
                const t=j/rows,angle=k/cols*Math.PI*2,r=.072+(.055+layer*.009)*Math.sin(t*Math.PI/2),scallop=(.5+.5*Math.cos(angle*7))*.018*t*t;
                v.push(Math.cos(angle)*r,.032-layer*.018-(.115-layer*.018)*t-scallop,Math.sin(angle)*r*1.10);
                const color=new THREE.Color(j===rows?'#baa466':layer?'#aec3b1':'#c9c7ac').multiplyScalar(.92+.08*Math.cos(angle*7));c.push(color.r,color.g,color.b);uv.push(k/cols,.25+.75*t);
                if(j<rows&&k<cols){const n=j*(cols+1)+k;idx.push(n,n+1,n+cols+1,n+1,n+cols+2,n+cols+1);}
              }
              const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(c,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();arm.add(new THREE.Mesh(geo,new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide})));
              arm.add(new THREE.Mesh(geo,new THREE.MeshLambertMaterial({map:this.sleeveEmbroidery,transparent:true,side:THREE.DoubleSide,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1,color:'#c4b489'})));
            }
            for(const x of [-.055,0,.055])pearl(x,-.105,-.125,.0055,arm);

          }
          // Floating silk loops fan out behind the shoulders, clear of the face and hands.
          for(const sign of [-1,1]){
            const ribbon=new THREE.Group();ribbon.position.set(sign*.20,1.30,.16);root.add(ribbon);a.secondary(ribbon,sign,.5);
            if(sign===1){
              silkRibbon([[0,0,0],[.22,.20,.14],[.54,.48,.18],[.70,.57,.08],[.66,.25,-.04],[.42,.16,-.10],[.58,-.08,.02]],.20,ribbon);
              silkRibbon([[0,-.36,-.12],[.20,-.45,-.23],[.43,-.66,-.22],[.57,-.71,-.08],[.43,-.54,.08]],.14,ribbon);
            }else{
              silkRibbon([[0,0,0],[-.22,.12,.22],[-.38,-.04,.30],[-.31,-.33,.22],[-.48,-.50,.08],[-.61,-.66,.14]],.19,ribbon);
              silkRibbon([[0,-.37,-.15],[-.13,-.56,-.22],[-.24,-.79,-.12],[-.43,-.94,.06]],.13,ribbon);
            }
            for(let i=0;i<3;i++){
              const x=sign*(.055+i*.055);
              panel([[x-sign*.025,.84],[x+sign*.025,.84],[x+sign*.065,.64-i*.035],[x,.58-i*.035],[x-sign*.035,.65]],-.195-i*.006,.018,i%2?ivory:gold);
            }
            line([[sign*.145,1.10,-.125],[sign*.10,1.035,-.125],[sign*.14,.97,-.125],[sign*.15,1.02,-.125]],gold,.003);
            for(let i=0;i<3;i++)pearl(sign*(.07+i*.055),.83,-.211,.012);
          }

        }
        if(!a.legs){
          // Embroidery is mapped onto the moving cloth itself, avoiding floating rigid ornaments.
          if(!this.skirtEmbroidery){
            const c=document.createElement('canvas');c.width=256;c.height=512;const ctx=c.getContext('2d');ctx.strokeStyle='#e8c474';ctx.fillStyle='#f3d796';ctx.lineCap='round';ctx.lineJoin='round';
            const stroke=(fn,w=2)=>{ctx.lineWidth=w;ctx.beginPath();fn();ctx.stroke();};
            for(const x of [22,234])stroke(()=>{ctx.moveTo(x,18);ctx.lineTo(x,476);},2);
            stroke(()=>{ctx.moveTo(22,474);ctx.quadraticCurveTo(128,505,234,474);},3);
            stroke(()=>{ctx.moveTo(30,463);ctx.quadraticCurveTo(128,490,226,463);},1.3);
            for(const sign of [-1,1]){
              ctx.save();ctx.translate(128,0);ctx.scale(sign,1);
              stroke(()=>{ctx.moveTo(0,431);ctx.bezierCurveTo(70,420,100,347,68,326);ctx.bezierCurveTo(28,298,15,359,50,363);ctx.bezierCurveTo(77,367,65,337,51,343);},3);
              stroke(()=>{ctx.moveTo(18,416);ctx.bezierCurveTo(42,383,5,358,13,332);ctx.bezierCurveTo(20,307,40,302,31,277);},2);
              for(let i=0;i<3;i++)stroke(()=>{const y=390-i*26;ctx.moveTo(22+i*7,y);ctx.quadraticCurveTo(55+i*5,y-26,72+i*3,y-20);ctx.quadraticCurveTo(55,y+1,22+i*7,y);},1.6);
              ctx.restore();
            }
            for(const y of [135,225,440]){stroke(()=>{ctx.moveTo(128,y-15);ctx.quadraticCurveTo(145,y,128,y+15);ctx.quadraticCurveTo(111,y,128,y-15);},2);ctx.beginPath();ctx.arc(128,y,2.6,0,Math.PI*2);ctx.fill();}
            this.skirtEmbroidery=new THREE.CanvasTexture(c);this.skirtEmbroidery.anisotropy=4;
          }
          for(const sign of [-1,1])for(const layer of [0,1,2]){
            const skirt=new THREE.Group();skirt.position.set(sign*(layer?.14:.105),.80,layer===2?.20:layer===1?.06:-.17);skirt.rotation.y=sign*(layer===2?-.35:layer===1?.65:.16);root.add(skirt);a.secondary(skirt,sign+1+layer,.4);
            // Curved flared cloth panel with a scalloped hem and broad shallow folds.
            const verts=[],colors=[],indices=[],uvs=[],rows=18,cols=12;
            for(let i=0;i<=rows;i++)for(let j=0;j<=cols;j++){
              const t=i/rows,u=j/cols-.5,w=(layer===0?.14:.19)+(layer===0?.10:.16)*Math.sin(t*Math.PI/2),hem=(layer===0?.25:layer===1?.52:.68)+.035*Math.cos(u*Math.PI*2);
              verts.push(u*w+sign*(layer===0?.035:layer===1?.14:.30)*t*t,-t*hem,.02+(layer===2?.24:layer===1?.09:-.06)*t*t+.018*Math.cos(u*Math.PI*4)*t);
              uvs.push(j/cols,1-i/rows);
              const edge=j===0||j===cols||i===rows,c=new THREE.Color(edge?gold:j<2||j>10?silk:layer===0?'#d4ad57':layer===1?jade:'#4ea5a4');colors.push(c.r,c.g,c.b);
              if(i<rows&&j<cols){const n=i*(cols+1)+j;indices.push(n,n+1,n+cols+1,n+1,n+cols+2,n+cols+1);}
            }
            const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geo.setIndex(indices);geo.computeVertexNormals();skirt.add(new THREE.Mesh(geo,new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide})));
            skirt.add(new THREE.Mesh(geo,new THREE.MeshLambertMaterial({map:this.skirtEmbroidery,transparent:true,side:THREE.DoubleSide,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1})));
            const rest=new Float32Array(verts);skirt.userData.fabricMotion=[(time,walk,phase)=>{const pos=geo.attributes.position;for(let i=0;i<pos.count;i++){const t=Math.floor(i/(cols+1))/rows;pos.setZ(i,rest[i*3+2]+Math.sin(time*1.5-t*3+sign)*.009*t*t+Math.sin(phase-t*2+sign)*walk*.014*t*t);}pos.needsUpdate=true;geo.computeVertexNormals();}];

          }
          for(const leg of [a.swing[0],a.swing[1]]){a.part(.218,.43,.245,0,-.25,0,'#e9c7b9',leg);a.part(.222,.20,.265,0,-.56,0,ivory,leg);a.part(.23,.045,.28,0,-.64,-.01,gold,leg);a.part(.23,.10,.31,0,-.68,-.03,ivory,leg);}
        }
      }
    },
    { name: 'Cloud Kitten', how: 'Sleep in your bed.', got: () => !!(window.Home && Home.sleeps > 0), eyes: '#4f8fd0', hairColor: '#eeebf2', shirtColor: '#cfe2f4', pantsColor: '#bcd6f0', look: { hair: 5, style: 13, shirt: 7, pants: 5, skirt: 1, acc: 0 },
      extra(a) { /* 云朵小猫：宽松奶蓝卫衣（粉爪印、领口蓝蝴蝶结、大口袋、背后堆着的兜帽）、斜挎小皮包上坐着一只小玩偶；头上推着一副护目镜和两只小猫耳；荷叶边袜子配短靴 */
        const B = '#cfe2f4', B2 = '#a9c8e6', W = '#fbfaf7', PK = '#f4a6b4', R = '#5aa0dc', L = '#b8834e', L2 = '#8a5a34', GL = '#86e4f2';
        const paw = (x, y, z, to, s = 1) => { a.part(0.05 * s, 0.045 * s, 0.01, x, y, z, PK, to); for (const [dx, dy] of [[-0.032, 0.042], [0, 0.056], [0.032, 0.042]]) a.part(0.022 * s, 0.022 * s, 0.01, x + dx * s, y + dy * s, z, PK, to); };
        if (!a.head) {
          for (const x of [-0.15, 0.15]) { const e = a.part(0.1, 0.12, 0.06, x, 1.93, 0.06, W); e.rotation.z = -x; a.part(0.05, 0.06, 0.02, x, 1.92, 0.025, PK).rotation.z = -x; }
          for (const x of [-0.24, 0.24]) a.part(0.03, 0.05, 0.42, x, 1.86, 0, L2);
          a.part(0.46, 0.05, 0.03, 0, 1.86, 0.215, L2);
          for (const x of [-0.105, 0.105]) { const f = a.part(0.17, 0.12, 0.07, x, 1.9, -0.2, L); f.rotation.x = -0.5; const g = a.part(0.12, 0.075, 0.02, x, 1.9, -0.24, GL); g.rotation.x = -0.5; a.part(0.035, 0.03, 0.022, x - 0.03, 1.915, -0.25, '#ffffff').rotation.x = -0.5; }
          a.part(0.06, 0.035, 0.05, 0, 1.9, -0.2, L2);
          for (const x of [-0.125, 0.125]) a.part(0.06, 0.028, 0.01, x, 1.605, -0.203, '#f4b0ba');
        }
        if (!a.body) {
          a.part(0.52, 0.56, 0.32, 0, 1.08, 0, B); a.part(0.54, 0.05, 0.34, 0, 0.8, 0, W);
          for (let i = 0; i < 9; i++) for (const z of [-0.175, 0.175]) a.part(0.05, 0.04, 0.012, -0.24 + i * 0.06, 0.765, z, i % 2 ? W : '#e6eef6');
          a.part(0.3, 0.14, 0.02, 0, 0.95, -0.17, B2); a.part(0.3, 0.02, 0.022, 0, 1.02, -0.171, a.shade(B2, 0.85));
          paw(-0.13, 1.2, -0.166); paw(0.14, 1.08, -0.166, undefined, 0.8); paw(0.1, 1.24, 0.166);
          a.part(0.3, 0.05, 0.08, 0, 1.38, -0.12, W);
          for (const s of [-1, 1]) { a.part(0.09, 0.07, 0.03, s * 0.055, 1.33, -0.185, R); const t = a.part(0.03, 0.11, 0.02, s * 0.03, 1.25, -0.185, R); t.rotation.z = s * 0.25; }
          a.part(0.04, 0.05, 0.035, 0, 1.33, -0.19, a.shade(R, 0.75));
          a.part(0.42, 0.2, 0.1, 0, 1.3, 0.2, B); a.part(0.32, 0.06, 0.08, 0, 1.39, 0.19, B2);
          for (const z of [-0.172, 0.172]) a.part(0.045, 0.64, 0.02, 0, 1.1, z, L2).rotation.z = -0.64;
          a.part(0.17, 0.13, 0.07, -0.16, 0.86, -0.2, L); a.part(0.175, 0.05, 0.075, -0.16, 0.91, -0.2, L2); a.part(0.04, 0.035, 0.01, -0.16, 0.89, -0.24, '#e8c870');
          a.part(0.11, 0.1, 0.09, -0.12, 0.98, -0.21, W); for (const x of [-0.145, -0.095]) a.part(0.025, 0.006, 0.01, x, 0.985, -0.256, '#3a2e2a');
          for (const x of [-0.16, -0.08]) a.part(0.03, 0.04, 0.03, x, 1.045, -0.21, W);
          for (const x of [-0.145, -0.095]) a.part(0.035, 0.025, 0.012, x, 1.005, -0.26, L);
        }
        for (const arm of [a.swing[2], a.swing[3]]) { a.part(0.2, 0.36, 0.24, 0, -0.3, 0, B, arm); a.part(0.21, 0.045, 0.25, 0, -0.5, 0, W, arm); paw(0, -0.28, -0.125, arm, 0.75); }
        if (!a.legs) for (const leg of [a.swing[0], a.swing[1]]) {
          a.part(0.22, 0.18, 0.24, 0, -0.49, 0, W, leg); a.part(0.26, 0.05, 0.28, 0, -0.39, 0, W, leg);
          for (let k = 0; k < 4; k++) a.part(0.05, 0.03, 0.012, -0.09 + k * 0.06, -0.425, -0.141, '#e6eef6', leg);
          a.part(0.24, 0.15, 0.32, 0, -0.635, -0.035, L, leg); a.part(0.25, 0.04, 0.33, 0, -0.56, -0.035, L2, leg); a.part(0.245, 0.04, 0.325, 0, -0.705, -0.035, '#e9cfa4', leg);
          for (const y of [-0.6, -0.64]) a.part(0.08, 0.015, 0.01, 0, y, -0.2, '#f3e2c4', leg);
        }
      } },
    { name: '陆雪琪 · Lu Xueqi', how: 'Make an iron sword in the snowy north.', got: g => (g.inv[26] || 0) > 0 && Core.climateAt(g.p.x, g.p.z) === 0, anime: true, eyes: '#4f6aa8', hairColor: '#1d1a24', shirtColor: '#eef2f8', pantsColor: '#e4ebf5', look: { style: 4, shirt: 7, pants: 5, skirt: 2, acc: 0 },
      extra(a) { /* 白衣仙子：黑长直发高高挽一个发髻、银色翼形发冠配蓝水晶、蓝色耳坠；白色高领长裙、胸前银线和蓝宝石、银色束腰甲、半透明的大袖和披帛 */
        const H = '#1d1a24', H2 = '#2c2836', SIL = '#c9d3e2', SIL2 = '#8f9cb3', BL = '#6fb4f0', GAUZE = '#dbe8f8';
        const sheer = m => { m.material.transparent = true; m.material.opacity = 0.7; m.material.depthWrite = false; return m; };
        if (!a.head) {
          a.soft(0.46, 0.15, 0.46, 0, 1.85, 0.01, H);                                                     /* 发顶 */
          a.soft(0.44, 0.42, 0.08, 0, 1.65, 0.215, H); a.soft(0.42, 0.5, 0.07, 0, 1.2, 0.235, H2); a.soft(0.34, 0.32, 0.06, 0, 0.83, 0.24, H); /* 背后长直发垂到腰 */
          for (const x of [-0.12, 0, 0.12]) a.soft(0.1, 0.12, 0.05, x, 0.64, 0.24, H2);                    /* 发梢分几缕 */
          for (const s of [-1, 1]) {
            a.soft(0.06, 0.3, 0.32, s * 0.215, 1.7, 0.05, H);                                              /* 两侧 */
            a.soft(0.21, 0.07, 0.045, s * 0.1, 1.79, -0.212, H).rotation.z = s * -0.22;                    /* 中分刘海往两边撇 */
            a.soft(0.06, 0.26, 0.05, s * 0.2, 1.63, -0.17, H);                                             /* 鬓边一缕 */
            a.soft(0.085, 0.74, 0.05, s * 0.2, 1.36, -0.165, H2);                                        /* 胸前垂下的长发 */
            a.soft(0.06, 0.1, 0.04, s * 0.2, 0.95, -0.165, H);
            const wing = a.part(0.2, 0.03, 0.04, s * 0.16, 1.99, 0.09, SIL); wing.rotation.z = s * 0.12;      /* 翼形发冠 */
            a.part(0.05, 0.05, 0.03, s * 0.26, 2.0, 0.09, BL).rotation.z = 0.785;
            a.part(0.02, 0.06, 0.02, s * 0.215, 1.55, -0.02, SIL); a.part(0.04, 0.06, 0.02, s * 0.215, 1.5, -0.02, BL).rotation.z = 0.785; /* 耳坠 */
          }
          a.soft(0.17, 0.13, 0.16, 0, 1.98, 0.08, H); a.soft(0.12, 0.08, 0.12, 0, 2.07, 0.08, H2);             /* 发髻 */
          a.part(0.05, 0.12, 0.05, 0, 2.06, 0.0, SIL); a.part(0.06, 0.06, 0.03, 0, 2.1, -0.02, BL).rotation.z = 0.785;
        }
        if (!a.body) {
          a.part(0.2, 0.09, 0.19, 0, 1.43, 0, '#f4f7fb'); a.part(0.21, 0.015, 0.2, 0, 1.47, 0, SIL);          /* 高领 */
          a.part(0.05, 0.05, 0.02, 0, 1.36, -0.15, BL).rotation.z = 0.785;
          for (const s of [-1, 1]) { const v = a.part(0.015, 0.3, 0.01, s * 0.07, 1.2, -0.137, SIL); v.rotation.z = s * 0.45; const c = a.part(0.012, 0.14, 0.01, s * 0.15, 1.08, -0.137, SIL2); c.rotation.z = s * -0.5; }
          a.part(0.52, 0.15, 0.3, 0, 0.87, 0, SIL); a.part(0.53, 0.02, 0.31, 0, 0.95, 0, SIL2); a.part(0.53, 0.02, 0.31, 0, 0.79, 0, SIL2); /* 束腰甲 */
          for (const s of [-1, 1]) a.part(0.05, 0.22, 0.22, s * 0.27, 0.86, 0, SIL2);
          a.part(0.06, 0.08, 0.02, 0, 0.87, -0.16, BL).rotation.z = 0.785;
          a.part(0.015, 0.3, 0.015, 0, 0.64, -0.19, SIL); a.part(0.035, 0.05, 0.02, 0, 0.47, -0.19, BL).rotation.z = 0.785; /* 腰前垂下的银链 */
        }
        for (const arm of [a.swing[2], a.swing[3]]) {
          a.part(0.19, 0.3, 0.23, 0, -0.14, 0, '#f4f7fb', arm); a.part(0.2, 0.02, 0.24, 0, -0.29, 0, SIL, arm);
          sheer(a.part(0.28, 0.28, 0.32, 0, -0.43, 0.01, GAUZE, arm)); sheer(a.part(0.2, 0.32, 0.03, 0, -0.66, 0.13, GAUZE, arm)); /* 半透明大袖，袖尾垂下来 */
        }
        if (!a.legs) for (const leg of [a.swing[0], a.swing[1]]) { a.part(0.23, 0.13, 0.31, 0, -0.65, -0.035, '#eef2f8', leg); a.part(0.235, 0.02, 0.315, 0, -0.6, -0.035, SIL, leg); }
      } },
    { name: '紫雾 · Violet Mist', how: 'Pick a lily.', got: g => (g.inv[79] || 0) > 0, anime: true, eyes: '#9a4a8a', hairColor: '#4a3468', shirtColor: '#f3eef6', pantsColor: '#9b7cc8', look: { style: 4, shirt: 7, pants: 5, skirt: 1, acc: 0 },
      extra(a) { /* 紫雾仙子：深紫长发、额前一条细金链坠一颗粉宝石、侧边一朵紫花；无袖白衣，胸前一道紫色门襟和金丝项圈，金色腰饰；手臂上挽着半透明的紫纱 */
        const H = '#4a3468', H2 = '#5c4380', GOLD = '#d8b45a', PUR = '#9b7cc8', GEM = '#e070c0', SKIN = '#dcbbae', GAUZE = '#b79be0';
        const sheer = m => { m.material.transparent = true; m.material.opacity = 0.55; m.material.depthWrite = false; return m; };
        const gem = (x, y, z, w, col, to) => { const m = a.part(w, w, 0.015, x, y, z, col, to); m.rotation.z = 0.785; return m; };
        if (!a.head) {
          a.soft(0.46, 0.15, 0.46, 0, 1.85, 0.01, H);
          a.soft(0.45, 0.42, 0.08, 0, 1.65, 0.215, H); a.soft(0.43, 0.5, 0.07, 0, 1.2, 0.235, H2); a.soft(0.37, 0.22, 0.06, 0, 0.88, 0.24, H);
          for (const s of [-1, 1]) {
            a.soft(0.06, 0.3, 0.32, s * 0.215, 1.7, 0.05, H);
            a.soft(0.21, 0.07, 0.045, s * 0.1, 1.79, -0.212, H).rotation.z = s * -0.25;
            a.soft(0.08, 0.34, 0.05, s * 0.2, 1.58, -0.17, H); a.soft(0.08, 0.3, 0.05, s * 0.215, 1.27, -0.165, H2); a.soft(0.06, 0.12, 0.04, s * 0.2, 1.08, -0.165, H); /* 胸前微卷的两缕 */
            const pin = a.part(0.12, 0.025, 0.03, s * 0.15, 1.95, -0.06, GOLD); pin.rotation.z = s * 0.4;
            a.part(0.015, 0.07, 0.015, s * 0.215, 1.55, -0.03, GOLD); gem(s * 0.215, 1.5, -0.03, 0.035, PUR);  /* 耳坠 */
          }
          a.part(0.3, 0.015, 0.01, 0, 1.762, -0.236, GOLD); gem(0, 1.745, -0.24, 0.03, GEM);                /* 额链和宝石 */
          for (const [dx, dy] of [[0.04, 0], [-0.04, 0], [0, 0.04], [0, -0.04]]) a.part(0.05, 0.05, 0.03, 0.2 + dx, 1.9 + dy, -0.14, '#a868c8');
          a.part(0.035, 0.035, 0.035, 0.2, 1.9, -0.155, '#f0d0f0');                                          /* 侧边的紫花 */
        }
        if (!a.body) {
          a.part(0.12, 0.42, 0.02, 0, 1.06, -0.142, PUR); gem(0, 1.14, -0.155, 0.06, GEM);
          a.part(0.3, 0.03, 0.22, 0, 1.4, 0, GOLD); gem(0, 1.32, -0.15, 0.045, PUR);                            /* 金丝项圈 */
          for (const s of [-1, 1]) { const f = a.part(0.015, 0.24, 0.01, s * 0.13, 1.27, -0.142, GOLD); f.rotation.z = s * 0.6; const c = a.part(0.012, 0.16, 0.01, s * 0.19, 1.18, -0.142, GOLD); c.rotation.z = s * -0.3; }
          a.part(0.54, 0.07, 0.32, 0, 0.82, 0, GOLD); for (const s of [-1, 1]) { const w = a.part(0.15, 0.1, 0.03, s * 0.17, 0.77, -0.17, GOLD); w.rotation.z = s * 0.35; }
          sheer(a.part(0.62, 0.5, 0.02, 0, 0.47, 0.23, '#efe8f6'));                                          /* 背后长到小腿的白纱 */
        }
        for (const arm of [a.swing[2], a.swing[3]]) {
          a.part(0.175, 0.31, 0.215, 0, -0.13, 0, SKIN, arm);                                                /* 无袖 */
          a.part(0.18, 0.02, 0.22, 0, -0.2, 0, GOLD, arm); a.part(0.155, 0.02, 0.185, 0, -0.5, 0, GOLD, arm);
          sheer(a.part(0.26, 0.3, 0.3, 0, -0.4, 0.02, GAUZE, arm)); sheer(a.part(0.2, 0.35, 0.03, 0, -0.68, 0.14, GAUZE, arm)); /* 挽在手肘的紫纱 */
        }
        if (!a.legs) for (const leg of [a.swing[0], a.swing[1]]) { a.part(0.23, 0.12, 0.31, 0, -0.65, -0.035, '#efe6f2', leg); a.part(0.235, 0.02, 0.315, 0, -0.6, -0.035, GOLD, leg); }
      } },
    { name: '熔岩机甲 · Ember Mech', how: 'Make an iron block.', got: g => (g.inv[56] || 0) > 0, shirtColor: '#3a3a40', pantsColor: '#3a3a40', look: { style: 4, shirt: 8, pants: 2, skirt: 0, acc: 0 },
      extra(a) { /* 熔岩机甲：深红装甲配铜色饰边，头盔一条横向青色目镜和铜色顶鳍，胸口一颗菱形熔核，背上两个喷口，掌心亮青光 */
        const R = '#a8302c', R2 = '#6e1e1c', CU = '#c98a46', TEAL = '#5fe0e8', DARK = '#34343a', ORANGE = '#ff9a3c';
        if (!a.head) {
          a.part(0.44, 0.42, 0.42, 0, 1.645, -0.01, R); a.part(0.4, 0.11, 0.015, 0, 1.67, -0.226, DARK); a.part(0.34, 0.05, 0.02, 0, 1.67, -0.232, TEAL);
          a.part(0.3, 0.1, 0.03, 0, 1.5, -0.226, R2); for (const x of [-0.06, 0, 0.06]) a.part(0.025, 0.06, 0.01, x, 1.5, -0.243, DARK);
          a.part(0.05, 0.12, 0.34, 0, 1.9, 0.01, CU); a.part(0.46, 0.03, 0.44, 0, 1.79, -0.01, CU);
          for (const s of [-1, 1]) { a.part(0.05, 0.13, 0.13, s * 0.235, 1.64, 0, DARK); a.part(0.055, 0.04, 0.04, s * 0.237, 1.64, -0.03, TEAL); }
        }
        if (!a.body) {
          a.part(0.52, 0.4, 0.3, 0, 1.17, 0, R); a.part(0.53, 0.025, 0.31, 0, 1.37, 0, CU); a.part(0.43, 0.22, 0.28, 0, 0.9, 0, DARK);
          for (const y of [0.95, 0.87]) for (const s of [-1, 1]) a.part(0.17, 0.065, 0.02, s * 0.1, y, -0.145, R2);
          const core = a.part(0.12, 0.12, 0.02, 0, 1.18, -0.16, CU); core.rotation.z = 0.785; const hot = a.part(0.07, 0.07, 0.025, 0, 1.18, -0.165, ORANGE); hot.rotation.z = 0.785;
          for (const s of [-1, 1]) { const v = a.part(0.12, 0.025, 0.01, s * 0.15, 1.27, -0.152, R2); v.rotation.z = s * -0.4; }
          a.part(0.53, 0.06, 0.31, 0, 0.78, 0, CU);
          for (const s of [-1, 1]) { a.part(0.12, 0.3, 0.1, s * 0.1, 1.15, 0.2, DARK); a.part(0.13, 0.03, 0.11, s * 0.1, 1.29, 0.2, CU); a.part(0.08, 0.1, 0.08, s * 0.1, 0.96, 0.2, ORANGE); }
        }
        for (const arm of [a.swing[2], a.swing[3]]) {
          a.part(0.26, 0.15, 0.28, 0, 0, 0, R, arm); a.part(0.27, 0.03, 0.29, 0, -0.075, 0, CU, arm);
          a.part(0.2, 0.25, 0.24, 0, -0.42, 0, R, arm); a.part(0.21, 0.025, 0.25, 0, -0.3, 0, CU, arm);
          a.part(0.17, 0.14, 0.2, 0, -0.59, 0, R2, arm); a.part(0.06, 0.06, 0.01, 0, -0.6, -0.105, TEAL, arm);
        }
        if (!a.legs) for (const leg of [a.swing[0], a.swing[1]]) {
          a.part(0.235, 0.2, 0.26, 0, -0.15, 0, R, leg); a.part(0.12, 0.08, 0.04, 0, -0.32, -0.14, CU, leg);
          a.part(0.235, 0.22, 0.26, 0, -0.45, 0, R, leg); a.part(0.25, 0.15, 0.33, 0, -0.64, -0.04, R2, leg); a.part(0.255, 0.025, 0.335, 0, -0.57, -0.04, CU, leg);
        }
      } },
    ...(typeof window==='undefined' ? [require('./change-v2.js')] : [window.ChangeV2Skin]),
    ...(typeof window==='undefined'?require('./steward-skins.js').list:window.StewardSkins.list),
  ];
  // —— 拥有哪些皮肤 ——
  const KEY = 'stonisle.skins';
  const own = raw => { let o; try { o = JSON.parse(raw); } catch (e) { o = null; } return new Set([0, ...(Array.isArray(o) ? o.filter(i => Number.isInteger(i) && i > 0 && i < LIST.length) : [])]); };
  const newly = (owned, game) => LIST.map((s, i) => i).filter(i => i && !owned.has(i) && LIST[i].got && LIST[i].got(game)); // 这一刻刚满足条件的皮肤
  if (typeof document === 'undefined') { module.exports = { LIST, own, newly }; return; }
  let owned = own(localStorage.getItem(KEY));
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify([...owned])); } catch (e) { /* 存不下就不记 */ } };
  setInterval(() => { // 每 4 秒看一眼有没有新解锁的
    if (!window.game || !game.playing) return;
    let fresh; try { fresh = newly(owned, game); } catch (e) { return; }
    if (!fresh.length) return;
    for (const i of fresh) owned.add(i);
    save();
    if (window.Lang) Lang.say(`A new skin! ${LIST[fresh[0]].name}!`, false, 1.4);
    if (window.Avatar && Avatar.refresh) Avatar.refresh();
  }, 4000);
  window.Skins = { list: LIST, has: i => owned.has(i) || (LIST[i]?.city&&StewardSkins.owned(window.game,LIST[i].city)) || !!LIST[i]?.unlocked || (Number.isInteger(i) && i >= 0 && i < LIST.length && !!window.Creative?.on && !window.Net?.guest), unlock(i) { owned.add(i); save(); }, get owned() { return [...owned]; } };
})();
