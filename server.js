#!/usr/bin/env node
// 岩屿的本地服务：发游戏页面 + 局域网联机的消息转发。不依赖任何包：node server.js [端口]
// 规则：
//   · 本机（127.0.0.1）打开的是主机；主机在设置里打开 “Open to LAN” 之前，局域网里的其他设备一律 403，连页面都拿不到。
//   · 打开后，其他设备访问 http://主机IP:端口 就进主机的世界；主机关掉开关，访客立刻断开。
//   · 不联外网、没有账号，名字只在这台机器的内存里。
// ponytail: 下行用 SSE、上行用 POST，不引 WebSocket 库；每 100ms 一批消息在局域网里够用，嫌延迟再换 ws。
// ponytail: 访客的身份只靠它自己报的 id，同一个 Wi‑Fi 里的人可以冒充别的访客；给孩子在家里玩够用，要上公网必须先加鉴权。
const http = require('http'), fs = require('fs'), path = require('path'), os = require('os');
const ROOT = __dirname, PORT = +process.argv[2] || 4174, MAX_GUESTS = 8;
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.mp3': 'audio/mpeg', '.md': 'text/plain; charset=utf-8', '.css': 'text/css' };

let open = false;
let state = { edits: {}, torches: {}, log: {}, home: null, time: 0 }; // 主机开门时交来的世界改动 + 开门后的逐块改动 + 告示牌/箱子 + 时间
const SharedDrops = require('./shared-drops');
let sharedDrops = new SharedDrops();
const SharedTransit=require('./shared-transit');let sharedTransit=new SharedTransit();
const clients = new Map();                               // id → { res, name, host }

const isLocal = req => ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req.socket.remoteAddress);
const addrs = () => Object.values(os.networkInterfaces()).flat().filter(n => n && n.family === 'IPv4' && !n.internal).map(n => `http://${n.address}:${PORT}`);
const json = (res, code, data) => { res.writeHead(code, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(data)); };
const cleanName = s => String(s || '').replace(/[^A-Za-z0-9 _-]/g, '').trim().slice(0, 12) || 'Player';
const roster = () => [...clients].map(([id, c]) => ({ id, name: c.name, host: c.host }));
const emit = (c, msg) => c.res.write(`data: ${JSON.stringify(msg)}\n\n`);
const broadcast = (msg, except) => { for (const [id, c] of clients) if (id !== except) emit(c, msg); };
const skin = v => typeof v === 'string' && /^[a-z]{1,16}$/.test(v) ? v : 'default', int = v => Number.isInteger(v), num = v => typeof v === 'number' && Number.isFinite(v);

function body(req, limit) { // 读 JSON 请求体；超过上限直接断开
  return new Promise((ok, bad) => {
    let size = 0; const parts = [];
    req.on('data', d => { size += d.length; if (size > limit) { bad(new Error('too large')); req.destroy(); } else parts.push(d); });
    req.on('end', () => { try { ok(JSON.parse(Buffer.concat(parts).toString() || 'null')); } catch (e) { bad(e); } });
    req.on('error', bad);
  });
}

function relay(from, sender, msg) { // 只转发认识的消息，字段逐个检查；访客发来的东西不能原样信
  if (!msg || typeof msg !== 'object') return;
  let out = null;
  if (msg.t === 'p' && [msg.x, msg.y, msg.z, msg.yaw].every(num)) out = { t: 'p', x: msg.x, y: msg.y, z: msg.z, yaw: msg.yaw, pitch: num(msg.pitch) ? Math.max(-1.6, Math.min(1.6, msg.pitch)) : 0, held: int(msg.held) ? msg.held : 0, bk: int(msg.bk) ? msg.bk : 0, ws: skin(msg.ws), bs: skin(msg.bs), cloak: int(msg.cloak) ? msg.cloak : 0, low: !!msg.low, sw: !!msg.sw, air: !!msg.air, dn: !!msg.dn };
  else if(sender.host&&msg.t==='transit'&&Array.isArray(msg.carts)&&int(msg.seq)&&msg.seq>(sender.transitSequence||0)){sender.transitSequence=msg.seq;state.transitState={carts:sharedTransit.publish(msg.carts)};broadcast({t:'transit',carts:state.transitState.carts});return;}
  else if(msg.t==='asignal'&&typeof msg.uid==='string'){const c=sharedTransit.carts.get(msg.uid),p=sender.position;if(c&&c.kind==='device'&&c.block===621&&p&&Math.hypot(p.x-c.node.x,p.y-c.node.y,p.z-c.node.z)<7)out={t:'asignal',uid:c.uid};}
  else if (msg.t === 'look' && msg.look && typeof msg.look === 'object' && Array.isArray(msg.gear)) out = { t: 'look', weaponSkin:['default','destiny','ember','frost'].includes(msg.weaponSkin)?msg.weaponSkin:'default', look: Object.fromEntries(['skin', 'style', 'hair', 'shirt', 'pants', 'skirt', 'size', 'acc', 'outfit'].map(k => [k, int(msg.look[k]) ? msg.look[k] : 0])), gear: msg.gear.slice(0, 4).map(v => int(v) && v >= 0 && v < 256 ? v : 0) }; // 角色形象和身上的装备
  else if (msg.t === 'hit' && int(msg.id) && [msg.dealt, msg.dx, msg.dz].every(num) && msg.dealt > 0 && msg.dealt <= 50) out = { t: 'hit', id: msg.id, dealt: msg.dealt, dx: msg.dx, dz: msg.dz }; // 访客打中了一只生物，主机来算
  else if (msg.t === 'pk' && state.pk && typeof msg.to === 'string' && num(msg.d) && msg.d > 0 && msg.d <= 20) out = { t: 'pk', to: msg.to, d: msg.d };                              // 玩家打玩家：主机允许才转发
  else if(msg.t==='gh'&&typeof msg.id==='string'&&msg.id.startsWith('castle-guard-')&&num(msg.dealt)&&msg.dealt>0&&msg.dealt<=50)out={t:'gh',id:msg.id,dealt:msg.dealt};
  else if(sender.host&&msg.t==='cg'&&msg.data&&Array.isArray(msg.data.units)){const data={cities:msg.data.cities||{},units:msg.data.units.slice(0,320)};state.castleGuards=msg.data.saved||state.castleGuards;out={t:'cg',data};}
  else if(msg.t==='checkpoint')out={t:'checkpoint'};
  else if(sender.host&&msg.t==='checkpointSaved'&&typeof msg.to==='string')out={t:'checkpointSaved',to:msg.to,ok:!!msg.ok};
  else if (sender.host && msg.t === 'm' && Array.isArray(msg.list)) out = { t: 'm', list: msg.list.slice(0, 80) };                // 以下几种只有主机能发：全部生物的状态
  else if (sender.host && msg.t === 'loot' && typeof msg.to === 'string' && msg.items && typeof msg.items === 'object') out = { t: 'loot', to: msg.to, items: msg.items, sad: !!msg.sad };
  else if (sender.host && msg.t === 'hurt' && typeof msg.to === 'string' && num(msg.d)) out = { t: 'hurt', to: msg.to, d: msg.d, slow: !!msg.slow, push: Array.isArray(msg.push) && msg.push.slice(0, 2).every(num) ? msg.push.slice(0, 2) : null };
  else if (sender.host && msg.t === 'pkmode') { state.pk = !!msg.on; out = { t: 'pkmode', on: state.pk }; }
  else if (msg.t === 'b' && [msg.x, msg.y, msg.z, msg.id].every(int) && msg.y >= 0 && msg.y < 96 && msg.id >= 0 && msg.id < 1024) {
    out = { t: 'b', x: msg.x, y: msg.y, z: msg.z, id: msg.id };
    state.log[msg.x + ',' + msg.y + ',' + msg.z] = msg.id;
  } else if (msg.t === 'tc' && typeof msg.k === 'string') { // 放下/收回火把；r 为空表示收回
    const r = msg.r, ok = r && [r.x, r.y, r.z].every(int) && r.y > 0 && r.y < 96 && Array.isArray(r.n) && r.n.length === 3 && r.n.every(int) && r.n.reduce((a, b) => a + Math.abs(b), 0) === 1 && r.n[1] >= 0 && msg.k === r.x + ',' + r.y + ',' + r.z;
    if (ok) { out = { t: 'tc', k: msg.k, r: { x: r.x, y: r.y, z: r.z, n: r.n } }; state.torches[msg.k] = out.r; }
    else if (r === null && /^-?\d+,\d+,-?\d+$/.test(msg.k)) { out = { t: 'tc', k: msg.k, r: null }; delete state.torches[msg.k]; }
  } else if (msg.t === 'h' && msg.d && typeof msg.d.signs === 'object' && typeof msg.d.chests === 'object') {
    out = { t: 'h', d: { signs: msg.d.signs, chests: msg.d.chests } }; state.home = out.d;
  } else if (msg.t === 't' && sender.host && num(msg.time) && int(msg.seq) && msg.seq>(sender.clockSequence||0)) { sender.clockSequence=msg.seq; out = { t: 't', time: msg.time }; state.time = msg.time; }
  if(out&&out.t==='p')sender.position=out;
  if (out) broadcast({ from, ...out }, from);
}

function closeDoor() { // 主机关门：通知访客，然后断开
  open = false; sharedDrops=new SharedDrops();
  for (const [id, c] of clients) if (!c.host) { emit(c, { t: 'closed' }); c.res.end(); clients.delete(id); }
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x'), local = isLocal(req), host = local && url.searchParams.get('guest') !== '1'; // ?guest=1：在主机这台电脑上开第二个窗口当访客，测试用
  if (!local && !open) { res.writeHead(403, { 'Content-Type': 'text/plain' }); return res.end('This world is closed.'); }
  try {
    if (url.pathname === '/net/hello') return json(res, 200, { host, open, hosted: roster().some(c => c.host), addrs: addrs(), players: roster(), state: host ? undefined : state });
    if (url.pathname === '/net/open' && req.method === 'POST') {
      if (!host) return json(res, 403, {});
      const b = await body(req, 64 << 20);
      if (b && b.on) { sharedTransit=new SharedTransit([...(b.transitState?.carts||[]),...Object.values(b.transitState?.devices||{})]);open = true; state = { transitState:{carts:sharedTransit.snapshot()},castleGuards:b.castleGuards||{}, exploration:b.exploration||null, edits: b.edits || {}, torches: b.torches && typeof b.torches === 'object' ? b.torches : {}, log: {}, home: b.home || null, time: +b.time || 0, world: String(b.world || '').slice(0, 32) }; } else closeDoor();
      return json(res, 200, { open, addrs: addrs() });
    }
    if (url.pathname === '/net/events') {
      const id = String(url.searchParams.get('id') || '').slice(0, 16);
      if (!id || clients.has(id) || (!host && (!open || roster().filter(c => !c.host).length >= MAX_GUESTS))) return json(res, 403, {});
      res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store', Connection: 'keep-alive' });
      if (host) for (const [oid, c] of clients) if (c.host) { emit(c, { t: 'taken' }); c.res.end(); clients.delete(oid); broadcast({ t: 'leave', id: oid }); } // 主机只能有一个：这台电脑上新开门的窗口接手，旧的那个退出联机
      const me = { res, name: cleanName(url.searchParams.get('name')), host };
      emit(me, { t: 'roster', players: roster() });
      if(!host)emit(me,{t:'t',time:state.time});
      sharedDrops.prune(); emit(me,{t:'drops',items:[...sharedDrops.items.values()].map(d=>({...d,age:Date.now()-d.created}))});
      emit(me,{t:'transit',carts:sharedTransit.snapshot()});
      clients.set(id, me); broadcast({ t: 'join', id, name: me.name, host }, id);
      req.on('close', () => { if (clients.get(id) === me) { clients.delete(id); broadcast({ t: 'leave', id }); } });
      return;
    }
    if (['/net/drop','/net/pick'].includes(url.pathname) && req.method === 'POST') {
      const who=url.searchParams.get('id'),sender=clients.get(who);
      if(!sender)return json(res,403,{});
      const b=await body(req,4096);
      if(url.pathname==='/net/drop'){
        const p=sender.position;
        if(!p||p.dn||!b||Math.hypot(b.x-p.x,b.z-p.z)>3||b.y>p.y+2)return json(res,400,{});
        const item=sharedDrops.create(who,b);if(!item)return json(res,400,{});
        broadcast({t:'drop',item});return json(res,200,{item});
      }
      const item=sharedDrops.claim(who,b&&b.key,sender.position);
      if(item)broadcast({t:'dropGone',key:item.key});
      return json(res,200,{item});
    }
    if(url.pathname==='/net/transit'&&req.method==='POST'){
      const who=url.searchParams.get('id'),sender=clients.get(who);if(!sender)return json(res,403,{});
      const b=await body(req,4096),cached=sharedTransit.results.has(who+':'+b?.op);
      if(b?.action==='work'&&!cached){if(!sender.host||!Array.isArray(b.edits)||b.edits.length>4||!Array.isArray(b.expected)||b.expected.length!==b.edits.length||!b.edits.every(e=>Array.isArray(e)&&e.length===4&&e.every(int)&&e[1]>0&&e[1]<96&&e[3]>=0&&e[3]<1024)||!b.expected.every(e=>Array.isArray(e)&&e.length===4&&e.every(int)&&(!Object.hasOwn(state.log,e.slice(0,3).join(','))||state.log[e.slice(0,3).join(',')]===e[3])))return json(res,200,{ok:false,n:0,carts:sharedTransit.snapshot()});}
      const result=sharedTransit.transact(who,b||{},sender.position,sender.host);
      if(result.ok&&b.action==='work'&&!cached)for(const [x,y,z,id] of b.edits){state.log[[x,y,z].join(',')]=id;broadcast({t:'b',x,y,z,id});} 

      state.transitState={carts:sharedTransit.snapshot()};broadcast({t:'transit',carts:state.transitState.carts});return json(res,200,{...result,carts:state.transitState.carts});
    }
    if (url.pathname === '/net/send' && req.method === 'POST') {
      const id = url.searchParams.get('id'), sender = clients.get(id);
      if (!sender) return json(res, 403, {});
      const list = await body(req, 256 << 10);
      if (Array.isArray(list)) for (const m of list.slice(0, 500)) relay(id, sender, m);
      return json(res, 200, {});
    }
    // 其余都是静态文件：只给本目录里的普通文件，点开头的文件和目录（配音工具、.claude 等）不给
    const rel = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname), file = path.join(ROOT, rel);
    if (!file.startsWith(ROOT + path.sep) || rel.split('/').some(s => s.startsWith('.')) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    fs.createReadStream(file).pipe(res);
  } catch (e) { if (!res.headersSent) json(res, 400, {}); else res.end(); }
}).listen(PORT, '0.0.0.0', () => console.log(`Stonisle: http://localhost:${PORT}  (LAN: ${addrs().join(', ') || 'no network'}; closed until the host opens it)`));
