// 从 lang.js 里取出全部台词（不开浏览器）：node voices/lines.js > voices/lines.json
// ponytail: 用一个“什么都能调用”的假 DOM 把 lang.js 跑起来，只为了拿 Lang.lines()；lang.js 初始化时若依赖真实 DOM 的返回值，这里要跟着补
const fs = require('fs'), vm = require('vm'), path = require('path');
const stub = new Proxy(function () {}, { get: (t, k) => (k === Symbol.toPrimitive ? () => '' : stub), apply: () => stub, construct: () => stub, set: () => true });
const win = { document: stub, localStorage: { getItem: () => null, setItem() {}, removeItem() {} }, performance: { now: () => 0 }, setInterval() {}, setTimeout() {}, clearTimeout() {},
  addEventListener() {}, Date, Math, JSON, Object, Set, Map, Promise, RegExp,
  URLSearchParams, location: { search: '' }, navigator: stub, THREE: stub, WickMaterials: stub, Core: require('../core.js'), requestAnimationFrame() {} };
win.window = win;
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'lang.js'), 'utf8'), win);
const lines = win.Lang.lines(), wick = new Set(lines.wick);
// Other modules use Wick for their spoken feedback, too.
for(const file of ['home.js','farm.js','blast.js','game.js','net.js']){
 const src=fs.readFileSync(path.join(__dirname,'..',file),'utf8');
 const re=/(?:\bwick|\bsay|Lang\.say)\(\s*'((?:\\.|[^'\\])*)'/g;
 for(const m of src.matchAll(re))wick.add(m[1].replace(/\\'/g,"'"));
}
for(const line of ['Hold iron ore or gold ore. The furnace takes fuel from your bag.', 'Hold iron ore or gold ore to melt it.', 'Hot! An iron ingot.', 'Hot! A gold ingot.', 'Hold meat to cook it.', 'It needs wood.', 'It is near water. It will grow fast.', 'A seed! Water helps it grow.', 'I need arrows.', 'I need pellets.', 'World saved. Respawn point set.', 'The host could not save. Please try again.'])wick.add(line);
const skins=['skins.js','change-v2.js'].map(file=>fs.readFileSync(path.join(__dirname,'..',file),'utf8')).join('\n');
for(const m of skins.matchAll(/\bname:\s*'([^']+)'/g))if(m[1]!=='My own look')wick.add('A new skin! '+m[1]+'!');
lines.wick=[...wick];process.stdout.write(JSON.stringify(lines,null,1));
