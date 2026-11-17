const assert=require('node:assert/strict'),C=require('./city-crafts.js');
assert.deepEqual(C.grades,['下品','中品','上品','极品']);
assert.deepEqual(C.probabilities,[[100,0,0,0],[100,0,0,0],[35,65,0,0],[10,30,60,0],[0,10,35,55]]);
assert.deepEqual(C.odds([2,3]),[22.5,47.5,30,0]);
for(const base of [304,305,306]){
 let last=0;for(let grade=0;grade<4;grade++){const s=C.items[C.pillId(base,grade)],power=s.heal||s.rate*s.duration||s.food;assert.ok(power>last);last=power;assert.equal(s.gradeIndex,grade);}
 for(let age=0;age<5;age++){
  const counts=[0,0,0,0];for(let roll=0;roll<100;roll++){const need=C.alchemyRecipes(age).find(r=>r[0]===base)[2],inv={...need},result=C.brew(inv,base,age,true,undefined,()=> (roll+.5)/100);counts[result.grade]++;assert.equal(inv[(base===305?350:355)+age],0);assert.equal(inv[result.id],result.count);}
  assert.deepEqual(counts,C.probabilities[age]);
 }
}
let inv={...C.alchemyRecipes(1)[0][2]},r=C.brew(inv,304,1,true,undefined,()=>.24);assert.equal(r.count,2);assert.equal(r.id,304);
inv={355:99};const before=JSON.stringify(inv);assert.equal(C.brew(inv,304,4,true),false);assert.equal(JSON.stringify(inv),before);
inv={...C.alchemyRecipes(4)[0][2]};assert.equal(C.brew(inv,304,4,false),false);
const e=new C.Effects();e.use(C.pillId(305,3));e.tick(5);const restored=new C.Effects(JSON.parse(JSON.stringify(e)));assert.equal(restored.tick(100),70);assert.equal(e.canUse(305),false);
inv={304:2,400:3,404:4,408:5};C.mergeLegacy(inv);assert.deepEqual(inv,{304:5,305:4,306:5});
assert.equal(C.recipes.filter(r=>C.cityFor(r[0])==='云岚城').length,3);
console.log('Probability boundaries, all recipes/ages, bonus yield, exact consumption, denied craft, grade effects and legacy stacks passed.');
