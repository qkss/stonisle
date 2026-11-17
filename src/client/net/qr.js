// 最小的二维码生成器：只为把联机地址（http://192.168.x.x:4174 这种短网址）画成码，让手机相机一扫就进。
// ponytail: 只做字节模式、纠错等级 L、版本 1–4（最多 78 个字节）、固定掩码 0；这四个版本都只有一个纠错块，不用交错。
// 网址再长就返回 null（界面上只显示文字地址）；要支持长内容再换成完整的库。
// 自检：node qr.js
(() => {
  const EXP = [], LOG = [];
  for (let i = 0, x = 1; i < 255; i++) { EXP[i] = x; LOG[x] = i; x <<= 1; if (x & 256) x ^= 0x11d; }
  const mul = (a, b) => a && b ? EXP[(LOG[a] + LOG[b]) % 255] : 0;
  function ecc(data, n) { // Reed–Solomon：data 除以生成多项式的余数
    let g = [1];
    for (let i = 0; i < n; i++) { const ng = new Array(g.length + 1).fill(0); g.forEach((c, j) => { ng[j] ^= c; ng[j + 1] ^= mul(c, EXP[i]); }); g = ng; }
    const r = new Array(n).fill(0);
    for (const d of data) { const f = d ^ r.shift(); r.push(0); for (let j = 0; j < n; j++) r[j] ^= mul(g[j + 1], f); }
    return r;
  }
  const SPEC = [[19, 7], [34, 10], [55, 15], [80, 20]]; // 版本 1–4、等级 L：[数据码字数, 纠错码字数]
  function codewords(text) {
    const bytes = [...unescape(encodeURIComponent(text))].map(c => c.charCodeAt(0));
    const v = SPEC.findIndex(s => bytes.length <= s[0] - 2);
    if (v < 0) return null;
    const [nd, ne] = SPEC[v], bits = [];
    const push = (val, len) => { for (let i = len - 1; i >= 0; i--) bits.push(val >> i & 1); };
    push(4, 4); push(bytes.length, 8); bytes.forEach(b => push(b, 8)); push(0, Math.min(4, nd * 8 - bits.length));
    while (bits.length % 8) bits.push(0);
    const data = [];
    for (let i = 0; i < bits.length; i += 8) data.push(bits.slice(i, i + 8).reduce((a, b) => a << 1 | b, 0));
    for (let pad = 0xec; data.length < nd; pad ^= 0xec ^ 0x11) data.push(pad);
    return { version: v + 1, all: [...data, ...ecc(data, ne)] };
  }
  function formatBits() { // 等级 L（01）+ 掩码 0（000），BCH(15,5) 再异或 0x5412
    const d = 1 << 3; let rem = d;
    for (let i = 0; i < 10; i++) rem = rem << 1 ^ (rem >> 9) * 0x537;
    return (d << 10 | rem) ^ 0x5412;
  }
  function matrix(text) { // 返回 size×size 的 0/1 数组（[行][列]），放不下返回 null
    const cw = codewords(text);
    if (!cw) return null;
    const size = 17 + 4 * cw.version, m = [], fn = [];
    for (let y = 0; y < size; y++) { m.push(new Array(size).fill(0)); fn.push(new Array(size).fill(false)); }
    const set = (x, y, on) => { if (x >= 0 && y >= 0 && x < size && y < size) { m[y][x] = on ? 1 : 0; fn[y][x] = true; } };
    for (const [cx, cy] of [[3, 3], [size - 4, 3], [3, size - 4]]) // 三个定位角，连同外面一圈白边
      for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) { const d = Math.max(Math.abs(dx), Math.abs(dy)); set(cx + dx, cy + dy, d !== 2 && d !== 4); }
    for (let i = 8; i < size - 8; i++) { set(i, 6, i % 2 === 0); set(6, i, i % 2 === 0); } // 时序线
    if (cw.version > 1) for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) set(size - 7 + dx, size - 7 + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1); // 校正图形
    const f = formatBits(), bit = i => f >> i & 1;
    for (let i = 0; i < 6; i++) set(8, i, bit(i));
    set(8, 7, bit(6)); set(8, 8, bit(7)); set(7, 8, bit(8));
    for (let i = 9; i < 15; i++) set(14 - i, 8, bit(i));
    for (let i = 0; i < 8; i++) set(size - 1 - i, 8, bit(i));
    for (let i = 8; i < 15; i++) set(8, size - 15 + i, bit(i));
    set(8, size - 8, 1);
    let i = 0; // 数据从右下角开始，两列一组上下来回走
    for (let right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (let vert = 0; vert < size; vert++) for (let j = 0; j < 2; j++) {
        const x = right - j, y = (right + 1 & 2) === 0 ? size - 1 - vert : vert;
        if (fn[y][x]) continue;
        const b = i < cw.all.length * 8 ? cw.all[i >> 3] >> (7 - (i & 7)) & 1 : 0; i++;
        m[y][x] = b ^ ((x + y) % 2 === 0 ? 1 : 0);
      }
    }
    return m;
  }
  function draw(canvas, text, px = 5) { // 画到 canvas 上，四周留 4 格白边；放不下就把 canvas 藏起来
    const m = matrix(text);
    canvas.hidden = !m;
    if (!m) return false;
    const n = m.length + 8, g = canvas.getContext('2d');
    canvas.width = canvas.height = n * px;
    g.fillStyle = '#fff'; g.fillRect(0, 0, n * px, n * px); g.fillStyle = '#000';
    m.forEach((row, y) => row.forEach((on, x) => { if (on) g.fillRect((x + 4) * px, (y + 4) * px, px, px); }));
    return true;
  }
  const QR = { matrix, draw };
  if (typeof module === 'undefined') { window.QR = QR; return; }
  module.exports = QR;
  if (require.main === module) {
    const assert = require('assert');
    assert.strictEqual(formatBits(), 0b111011111000100);                 // 标准里 L/掩码0 的格式信息
    const cw = codewords('http://192.168.1.23:4174');
    assert.strictEqual(cw.version, 2); assert.strictEqual(cw.all.length, 44);
    for (let k = 0; k < 10; k++) assert.strictEqual(cw.all.reduce((a, c) => mul(a, EXP[k]) ^ c, 0), 0); // 整串码字在 α^k 处都是 0
    assert.strictEqual(matrix('http://192.168.1.23:4174').length, 25);
    assert.strictEqual(matrix('x'.repeat(79)), null);
    console.log('qr ok');
  }
})();
