// Simplified game processing chain for a mica-based interference ink.
(function(root){
 const INK=300,MICA=301,OXIDE=302,RESIN=303;
 const RECIPES=[[MICA,1,{154:8}],[OXIDE,1,{12:3}],[RESIN,1,{182:4}],[INK,1,{[MICA]:3,[OXIDE]:2,[RESIN]:2}]];
 const api={INK,MICA,OXIDE,RESIN,RECIPES};if(typeof module!=='undefined')module.exports=api;else root.InkMaterials=api;
})(this);
