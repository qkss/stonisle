const assert = require('node:assert/strict');
const Core = require('./core');
const empty = () => new Uint8Array(Core.CH * Core.CH * Core.H);
const world = new Core.World(empty);
world.set(2, 20, 2, 158);
const mesh = Core.meshChunk(world, 0, 0).solid;
assert.deepEqual(mesh, Core.meshChunk(world, 0, 0).solid);
for (const key of ['pos', 'nor', 'uv', 'col']) assert([...mesh[key]].every(Number.isFinite));
const ys = [...mesh.pos].filter((_, i) => i % 3 === 1);
assert(Math.max(...ys) > 21.02 && Math.max(...ys) < 21.08);
const restored = new Core.World(empty, JSON.parse(JSON.stringify(world.edits)));
assert.deepEqual(mesh.pos, Core.meshChunk(restored, 0, 0).solid.pos);
const model = Core.cobbleModel();
assert(model.idx.every(i => i >= 0 && i < model.pos.length / 3));
for (let i = 0; i < model.idx.length; i += 3) {
  const ids = model.idx.slice(i, i + 3), p = ids.map(n => model.pos.slice(n * 3, n * 3 + 3));
  const u = p[1].map((q, k) => q - p[0][k]), v = p[2].map((q, k) => q - p[0][k]);
  const cross = [u[1]*v[2]-u[2]*v[1], u[2]*v[0]-u[0]*v[2], u[0]*v[1]-u[1]*v[0]];
  const n = model.nor.slice(ids[0]*3, ids[0]*3+3);
  assert(cross.reduce((sum, q, k) => sum + q*n[k], 0) >= -1e-8);
}
console.log('Cobble relief: valid outward geometry, bounded height, deterministic save/load.');
// Adjacent chunks independently reconstruct the same raised edge and shading.
const seamWorld = new Core.World(empty);
seamWorld.set(15,20,2,158); seamWorld.set(16,20,2,158);
const seam = (m,x) => {
  const points = new Set();
  for(let i=0;i<m.pos.length/3;i++)if(Math.abs(m.pos[i*3]-x)<1e-6 && m.pos[i*3+1]>21.001){
    points.add([m.pos[i*3+1],m.pos[i*3+2],...m.nor.slice(i*3,i*3+3),...m.col.slice(i*3,i*3+3)].map(v=>v.toFixed(4)).join(','));
  }
  return [...points].sort();
};
const left=seam(Core.meshChunk(seamWorld,0,0).solid,16),right=seam(Core.meshChunk(seamWorld,1,0).solid,0);
assert(left.length>3);assert.deepEqual(left,right);
console.log('Chunk boundary: matching stone heights, normals and colors.');
