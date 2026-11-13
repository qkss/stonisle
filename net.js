// 局域网联机（配合 server.js）。用普通静态服务打开时 /net/hello 不存在，这个文件什么都不做，游戏照常单人。
// 主机：设置 → World → “Open to LAN”，把显示的地址发给别人；关掉开关访客就断开。
// 访客：打开那个地址，直接进主机的世界（不读也不写自己的世界存档，只记自己的背包和装备）。
// 同步的东西：玩家位置、方块的放置和挖掉（门的开关也是方块）、告示牌和箱子、时间、动物和怪物（主机统一计算）。
// 主机还可以打开“Players can hit each other”，允许玩家互相攻击。
// game.js 里四处各一行调用：guestSave() / world() / block() / 存档时看 Net.guest；home.js 里两处。
(() => {
  const forced = new URLSearchParams(location.search).get('guest') === '1' ? 'guest=1' : ''; // 在主机电脑上开第二个窗口当访客，测试用
  let hello = null;
  try { // ponytail: 同步请求——访客要在建世界之前拿到主机的改动；只在本地服务上发一次
    const x = new XMLHttpRequest(); x.open('GET', '/net/hello?' + forced, false); x.send();
    if (x.status === 200) hello = JSON.parse(x.responseText);
  } catch (e) { /* 不是 server.js 起的服务：没有联机 */ }
  if (!hello || typeof hello.host !== 'boolean') return;

  const guest = !hello.host, id = Math.random().toString(36).slice(2, 10), ME = 'stonisle.lan.me', HOSTING = 'stonisle.lan.hosting', NAME = 'stonisle.lan.name';
  const state = hello.state || {}, players = new Map(); // 别的玩家：id → { name, host, mesh, to: [x, y, z, yaw] }
  let gearKey = '', es = null, out = [], applying = false, last = '', name = localStorage.getItem(NAME) || '', pk = !!state.pk;
  const saveId = parseInt(new URLSearchParams(location.search).get('save'), 10) || 1; // 主机正在玩的是哪个世界（和 game.js 的算法一样）
  const read = k => { try { return JSON.parse(localStorage.getItem(k)) || {}; } catch (e) { return {}; } };
  const post = (path, data) => fetch(path, { method: 'POST', body: JSON.stringify(data) }).catch(() => {});
  const send = m => { if (es) out.push(m); };

  window.Net = {
    guest, state,
    guestSave() { const me = read(ME); return { edits: state.edits || {}, time: state.time, inv: me.inv, slots: me.slots, equip: me.equip }; },
    world(w) { if (guest) for (const k in state.log || {}) w.set(...k.split(',').map(Number), state.log[k]); }, // 主机开门之后的改动
    block(x, y, z, b) { if (!applying) send({ t: 'b', x, y, z, id: b }); },
    home(d) { if (!applying) send({ t: 'h', d }); },
    // —— 生物和战斗 ——主机算全部生物；怪物追最近的玩家，咬到访客就发 hurt；访客打中生物发 hit，打死了主机发 loot
    others() { return [...players].filter(([, pl]) => pl.to && !pl.dn).map(([pid, pl]) => ({ id: pid, x: pl.to[0], y: pl.to[1], z: pl.to[2], held: pl.held, cloak: pl.cloak, low: pl.low })); },
    hurt(to, d, slow, push) { send({ t: 'hurt', to, d, slow, push: push || null }); },
    hit(mob, dealt, dx, dz) { send({ t: 'hit', id: mob, dealt, dx, dz }); },
    pkTarget(o, d, max) { // 准星射线上最近的别的玩家（主机没开互相攻击就没有）
      let best = null;
      if (pk && es) for (const [pid, pl] of players) if (pl.to) {
        const t = MobPhysics.ray({ x: pl.mesh.position.x, y: pl.mesh.position.y, z: pl.mesh.position.z, a: 0, bounds: { min: [-0.3, 0, -0.3], max: [0.3, 1.8, 0.3] } }, o, d, best ? best.t : max);
        if (t !== null) best = { t, id: pid, name: pl.name };
      }
      return best;
    },
    pkHit(to, d) { send({ t: 'pk', to, d }); },
    look() { sendLook(); }, // 在设置里换了形象
  };

  const cleanName = v => String(v || '').replace(/[^A-Za-z0-9 _-]/g, '').trim().slice(0, 12) || 'Player'; // 名字在设置里填，不弹输入框（有的环境不支持）
  name = cleanName(name);

  // —— 别的玩家：一个方块小人，头顶名字 ——
  function avatar(pid, pname, look, gear) { // 形象由对方自己选（avatar.js）；还没收到时先按编号给一个
    const h = [...pid].reduce((a, c) => a + c.charCodeAt(0) * 37, 0);
    const g = Avatar.build(look || { skin: h % 6, style: h % 4, hair: h % 8, shirt: h % 9, pants: h % 6 }, gear || []);
    const c = document.createElement('canvas'); c.width = 256; c.height = 64;
    const x = c.getContext('2d'); x.font = 'bold 34px system-ui'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillStyle = '#0009'; x.fillRect(0, 8, 256, 48); x.fillStyle = '#fff'; x.fillText(pname, 128, 33);
    const tag = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), depthTest: false })); tag.scale.set(1.4, 0.35, 1); tag.position.y = 2.2; g.add(tag);
    g.visible = false; game.scene.add(g);
    return g;
  }
  function join(pl) { if (pl.id !== id && !players.has(pl.id)) players.set(pl.id, { name: pl.name, host: pl.host, mesh: avatar(pl.id, pl.name), to: null, ph: 0 }); list(); }
  function sendLook() { send({ t: 'look', look: Avatar.look, gear: [...game.equip] }); gearKey = game.equip.join(); }
  function leave(pid) { const pl = players.get(pid); if (pl) { game.scene.remove(pl.mesh); players.delete(pid); } list(); }

  function handle(m) {
    if (m.t === 'roster') m.players.forEach(join);
    else if (m.t === 'join') { join(m); last = ''; sendLook(); }                       // 有人进来：下一拍把自己的位置再发一次
    else if (m.t === 'leave') leave(m.id);
    else if (m.t === 'p') { const pl = players.get(m.from); if (pl) { if (!pl.to) pl.mesh.position.set(m.x, m.y, m.z); pl.to = [m.x, m.y, m.z, m.yaw]; if (m.held !== pl.held) Avatar.hold(pl.mesh, m.held); pl.held = m.held; pl.cloak = m.cloak; pl.low = m.low; pl.air = m.air; pl.dn = m.dn; if (m.sw && !(pl.sw > 0)) pl.sw = 0.3; /* 对方在挥手：播 0.3 秒的挥动 */ pl.mesh.visible = true; } }
    else if (m.t === 'look') { const pl = players.get(m.from); if (pl) { const old = pl.mesh; pl.mesh = avatar(m.from, pl.name, m.look, m.gear); pl.mesh.position.copy(old.position); pl.mesh.rotation.y = old.rotation.y; pl.mesh.visible = old.visible; Avatar.hold(pl.mesh, pl.held); game.scene.remove(old); } }
    else if (m.t === 'm' && guest) game.mobSync(m.list);
    else if (m.t === 'hit' && !guest) { const r = game.mobHit(m.id, m.dealt, m.dx, m.dz); if (r && r.loot) send({ t: 'loot', to: m.from, items: r.loot, sad: r.sad }); }
    else if (m.t === 'loot') { if (m.to === id) game.takeLoot(m.items, m.sad); }
    else if (m.t === 'hurt') { if (m.to === id) { game.hurt(m.d); if (m.slow) game.slow(); if (m.push) game.push(m.push[0], m.push[1]); } }
    else if (m.t === 'pk') { if (pk && m.to === id) game.hurt(m.d); }
    else if (m.t === 'pkmode') { pk = m.on; list(); }
    else if (m.t === 'b') { applying = true; try { game.setBlock(m.x, m.y, m.z, m.id); } finally { applying = false; } }
    else if (m.t === 'h') { applying = true; try { Home.sync(m.d); } finally { applying = false; } }
    else if (m.t === 't' && guest) game.time = m.time;
    else if (m.t === 'taken') { sessionStorage.removeItem(HOSTING); disconnect(); const b = document.getElementById('lan'); if (b) b.checked = false; list(); if (info) info.textContent = 'Another window on this computer is hosting now. This window is playing alone.'; }
    else if (m.t === 'closed') { disconnect(); document.body.insertAdjacentHTML('beforeend', '<div style="position:fixed;inset:0;z-index:99;display:grid;place-items:center;background:#000c;color:#fff;font:20px system-ui;text-align:center">The host closed the world.<br>Ask them to open it again, then reload this page.</div>'); }
  }
  function connect() {
    if (es) return;
    es = new EventSource(`/net/events?id=${id}&name=${encodeURIComponent(name)}${forced && '&' + forced}`);
    es.onmessage = e => handle(JSON.parse(e.data));
    sendLook();
  }
  function disconnect() { if (es) es.close(); es = null; out = []; for (const pid of [...players.keys()]) leave(pid); }

  // —— 设置里的那一块 ——
  let info;
  function list() {
    if (!info) return;
    const who = [...players.values()].map(pl => pl.name + (pl.host ? ' (host)' : '')).join(', ');
    if (guest) info.textContent = `You are visiting a shared world as ${name}. ` + (who ? `Also here: ${who}. ` : '') + (pk ? 'Players can hit each other.' : '');
    else if (!es) info.textContent = 'Only you can play in this world.';
    else { info.innerHTML = `Send this address to players on the same Wi‑Fi:<br>${(hello.addrs.length ? hello.addrs : ['(no network found)']).map(a => `<b style="user-select:all">${a}</b>`).join('<br>')}<br>${who ? 'Here now: ' + who + '.' : 'Nobody has joined yet.'}<br>Or scan this with a phone camera:<br><canvas id="lanQr" style="margin-top:6px;border-radius:6px"></canvas>`; if (hello.addrs.length && window.QR) QR.draw(document.getElementById('lanQr'), hello.addrs[0]); else document.getElementById('lanQr').hidden = true; }
  }
  function joinCard() { // 访客的开始界面：不选也不建自己的世界，告诉他要进谁的哪个世界，填昵称、选形象，点 Join 才连上
    const $ = i => document.getElementById(i), host = (hello.players.find(pl => pl.host) || {}).name || 'the host';
    for (const i of ['saveCards', 'newSave', 'saveForm']) $(i).style.display = 'none';
    $('saveIntro').textContent = `You are joining ${host}'s world “${state.world || 'World'}”.`;
    $('saveIntro').insertAdjacentHTML('afterend', '<label for="joinName" style="display:block;margin:14px 0 6px">Your name</label><input id="joinName" maxlength="12" autocomplete="off" placeholder="Type your name" style="width:100%;box-sizing:border-box;font:inherit;padding:11px;border:1px solid #957a50;border-radius:4px;background:#211b16;color:#f6e6c7">');
    if (Avatar.direct) Avatar.direct($('start')); // 访客没有存档：在这里直接选形象
    const box = $('joinName'), start = $('start'), ok = () => { start.disabled = !box.value.trim(); };
    box.value = localStorage.getItem(NAME) || ''; start.textContent = 'Join'; start.hidden = false; box.oninput = ok; ok();
    start.addEventListener('click', () => {
      if (es) return;
      name = cleanName(box.value); localStorage.setItem(NAME, name); $('lanName').value = name; box.disabled = true; start.textContent = 'Play';
      connect(); list();
    });
  }
  async function setOpen(on) {
    if (on) {
      const h = read('stonisle.home');
      const r = await post('/net/open', { on: true, world: read('stonisle.save.v2' + (saveId > 1 ? '.' + saveId : '')).name || 'World', edits: game.world.edits, home: { signs: h.signs || {}, chests: h.chests || {} }, time: game.time });
      if (r && r.ok) { sessionStorage.setItem(HOSTING, '1'); hello.addrs = (await r.json()).addrs; connect(); send({ t: 'pkmode', on: pk }); }
    } else { sessionStorage.removeItem(HOSTING); disconnect(); await post('/net/open', { on: false }); }
    list();
  }

  addEventListener('load', () => {
    if (!window.game) return;
    document.getElementById('lanOff').remove(); // 没有 server.js 时（线上版）这一页只有那段说明
    document.getElementById('settings-together').insertAdjacentHTML('afterbegin', '<h2>Play together</h2><label>Your name <input id="lanName" maxlength="12" style="width:120px"></label>' +
      (guest ? '' : '<label><input id="lan" type="checkbox"> Open to LAN <small>(players on your Wi‑Fi can join this world)</small></label><label><input id="lanPk" type="checkbox"> Players can hit each other <small>(PK)</small></label>') + '<p class="settingsHint" id="lanInfo"></p>');
    info = document.getElementById('lanInfo');
    const nameBox = document.getElementById('lanName'); nameBox.value = name;
    nameBox.onchange = () => { name = nameBox.value = cleanName(nameBox.value); localStorage.setItem(NAME, name); if (es) { disconnect(); connect(); } list(); }; // 改名：重新连一次，别人看到新名字
    if (guest) joinCard();
    else { const pkBox = document.getElementById('lanPk'); pkBox.onchange = () => { pk = pkBox.checked; send({ t: 'pkmode', on: pk }); };
      const box = document.getElementById('lan'); box.onchange = () => setOpen(box.checked); if (hello.open && (!hello.hosted || sessionStorage.getItem(HOSTING))) { /* 这个窗口刷新前就是主机，或者没有别的窗口在当主机 */ box.checked = true; setOpen(true); } } // 主机刷新页面：门还开着，把世界重新交一次
    list();
    setInterval(() => { // 每 100ms：自己的位置变了就报一次，攒着的消息一起发
      if (!es || es.readyState !== 1) return; /* 连接还没建好就发会被服务器拒掉，第一批消息（形象、装备）就丢了；先攒着 */
      const p = game.p, held = game.held, cloak = game.cloak, low = game.low, sw = game.swinging, air = game.air, dn = game.dead, now = [p.x, p.y, p.z, game.yaw].map(v => +v.toFixed(2)).join() + held + cloak + low + sw + air + dn;
      if (now !== last) { last = now; out.push({ t: 'p', x: p.x, y: p.y, z: p.z, yaw: game.yaw, held, cloak, low, sw, air, dn }); }
      if (game.equip.join() !== gearKey) sendLook();                          // 换了装备：别人看到的样子跟着变
      if (!guest && players.size) out.push({ t: 'm', list: game.mobState() }); // 主机：有访客在，就把全部生物的状态报出去
      if (out.length) { post('/net/send?id=' + id, out); out = []; }
    }, 100);
    setInterval(() => { // 每 5 秒：主机报时间；访客把自己的背包和装备记在本机
      if (!es) return;
      if (guest) localStorage.setItem(ME, JSON.stringify({ inv: game.inv, slots: game.slots, equip: game.equip })); else send({ t: 't', time: game.time });
    }, 5000);
    (function smooth() { // 别人的小人平滑地挪到最新位置
      for (const pl of players.values()) if (pl.to) { const m = pl.mesh.position; const moved = Math.hypot(pl.to[0] - m.x, pl.to[2] - m.z); m.x += (pl.to[0] - m.x) * 0.3; m.y += (pl.to[1] - m.y) * 0.3; m.z += (pl.to[2] - m.z) * 0.3; pl.mesh.rotation.y = pl.to[3];
        pl.ph += moved > 0.01 ? 0.3 : 0; pl.sw = Math.max(0, (pl.sw || 0) - 1 / 60);
        const swim = Avatar.inWater(m.x, m.y, m.z); if (swim) pl.ph += 0.1;
        Avatar.pose(pl.mesh, pl.ph, moved > 0.01 ? 1 : 0, pl.sw > 0 ? 1 - pl.sw / 0.3 + 0.01 : 0, pl.air && !swim, swim); if (pl.dn) { pl.mesh.rotation.x = 1.5; pl.mesh.visible = (pl.dnT = (pl.dnT || 0) + 1 / 60) < 2.5; } else if (pl.dnT) { pl.dnT = 0; pl.mesh.rotation.x = 0; m.set(pl.to[0], pl.to[1], pl.to[2]); pl.mesh.visible = true; } } // 对方倒下了：仰面躺着
      requestAnimationFrame(smooth);
    })();
  });
})();
