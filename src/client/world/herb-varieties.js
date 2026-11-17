// Age is a rarity grade, not real-time years. Seeds always grow ordinary stock.
(function(root){
 const ages=['普通','十年','百年','千年','万年'],ageEnglish=['ordinary','ten-year','hundred-year','thousand-year','ten-thousand-year'];
 const colors=['#a6bd95','#86b6c6','#b6a4d5','#d6b565','#eee0a5'];
 const tier=roll=>roll<.0015?4:roll<.015?3:roll<.08?2:roll<.30?1:0;
 const list=Array.from({length:10},(_,i)=>{const family=Math.floor(i/5),rank=i%5,name=family?'人参':'雪莲';return {id:350+i,seed:360+family,seedName:name+'种子',young:370+i*2,growing:371+i*2,seconds:family?900:720,family,rank,name:ages[rank]+name,en:ageEnglish[rank]+' '+(family?'ginseng':'snow lotus'),tile:96+i,color:colors[rank],top:(family?.66:.6)+rank*.07};});
 const api={list,ages,tier};if(typeof module!=='undefined')module.exports=api;else root.HerbVarieties=api;
})(this);
