// 存档导出 / 导入：设置 → World 里的两个按钮。
// 导出：把这台设备上岩屿的全部数据（所有世界、家、学过的单词、任务进度、角色形象、设置）存成一个 .json 文件。
// 导入：选一个导出的文件，替换这台设备上的全部岩屿数据，然后重新载入页面。
// 文件只在本机读写，不上传任何地方。
(() => {
  const PRE = 'stonisle.', SKIP = 'stonisle.lan.me'; // 访客在别人世界里的背包不算自己的存档
  const keys = () => Object.keys(localStorage).filter(k => k.startsWith(PRE) && k !== SKIP);
  function exportSave() {
    dispatchEvent(new Event('pagehide')); // game.js 在 pagehide 时存盘：先让它把刚才的改动写进去
    const data = { app: 'stonisle', version: 1, saved: new Date().toISOString(), keys: Object.fromEntries(keys().map(k => [k, localStorage.getItem(k)])) };
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(data)], { type: 'application/json' }));
    a.download = `stonisle-save-${data.saved.slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 10000);
  }
  function check(data) { // 只认自己导出的格式：键都以 stonisle. 开头，值都是字符串
    if (!data || data.app !== 'stonisle' || !data.keys || typeof data.keys !== 'object') return null;
    const list = Object.entries(data.keys);
    return list.length && list.every(([k, v]) => k.startsWith(PRE) && typeof v === 'string') ? list.filter(([k]) => k !== SKIP) : null;
  }
  function apply(list) { // 整体替换；写不下（浏览器空间不够）就恢复原样
    const old = keys().map(k => [k, localStorage.getItem(k)]);
    const put = l => { keys().forEach(k => localStorage.removeItem(k)); l.forEach(([k, v]) => localStorage.setItem(k, v)); };
    try { put(list); } catch (e) { try { put(old); } catch (e2) { /* 原样也放不回去的话没有别的办法 */ } return false; }
    return true;
  }
  async function importSave(file) {
    let list = null;
    try { list = check(JSON.parse(await file.text())); } catch (e) { /* 不是 JSON */ }
    if (!list) return alert('This is not a Stonisle save file.');
    const worlds = list.filter(([k]) => /^stonisle\.save\./.test(k)).length;
    if (!confirm(`Load this save file (${worlds} world${worlds === 1 ? '' : 's'})?\nEverything saved on this device now will be replaced.`)) return;
    if (!apply(list)) return alert('There is not enough room to load this save file. Nothing was changed.');
    // ponytail: 游戏在页面关闭时还会再存一次，会把刚导入的盖掉；这里直接把写入关掉再刷新，不去改 game.js 的存盘流程
    Storage.prototype.setItem = () => {};
    location.reload();
  }
  if (typeof document === 'undefined') { module.exports = { check }; return; }
  document.getElementById('reset').insertAdjacentHTML('afterend',
    '<h2>Save file</h2><p class="settingsHint">Your worlds live only in this browser. Export a save file to keep a copy, or to move them to another device.</p>' +
    '<button id="saveExport">Export save file</button> <button id="saveImport">Import save file</button><input id="saveFile" type="file" accept=".json,application/json" hidden>');
  const file = document.getElementById('saveFile');
  document.getElementById('saveExport').onclick = exportSave;
  document.getElementById('saveImport').onclick = () => file.click();
  file.onchange = () => { if (file.files[0]) importSave(file.files[0]); file.value = ''; };
  window.Backup = { exportSave, importSave, check, apply };
})();
