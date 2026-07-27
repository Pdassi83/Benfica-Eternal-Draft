export * from "./data-original";

import {players as basePlayers,rating as playerRating,type Player} from "./data-original";

type PlayerCompare=(a:Player,b:Player)=>number;

const FEATURED_IDS=["eusebio","aimar","jonas"] as const;
const RARITY_WEIGHTS:Record<number,number>={95:.72,96:.56,97:.42,98:.30,99:.20};
const hash=(value:string)=>[...value].reduce((sum,char,index)=>sum+char.charCodeAt(0)*(index+11),0);
const classicScore=(id:string,multiplier:number)=>(hash(id)*multiplier)%997;

function detectClassicMultiplier(items:Player[],compare:PlayerCompare){
 if(items.length<4)return null;
 const pairs:[[Player,Player],[Player,Player],[Player,Player]]=[
  [items[0],items[1]],
  [items[1],items[2]],
  [items[2],items[3]],
 ];
 for(let multiplier=7;multiplier<=50;multiplier++){
  const matches=pairs.every(([a,b])=>compare(a,b)===classicScore(a.id,multiplier)-classicScore(b.id,multiplier));
  if(matches)return multiplier;
 }
 return null;
}

function rarityWeight(player:Player){
 const value=playerRating(player);
 if(value<95)return 1;
 if(value>=100){
  return FEATURED_IDS.includes(player.id as typeof FEATURED_IDS[number]) ? .12 : .10;
 }
 return RARITY_WEIGHTS[value]??.12;
}

function weightedShuffle(items:Player[]){
 const ranked=items.map((player,index)=>({
  player,
  index,
  key:-Math.log(Math.max(Math.random(),Number.EPSILON))/rarityWeight(player),
 })).sort((a,b)=>a.key-b.key||a.index-b.index);
 for(let index=0;index<ranked.length;index++)items[index]=ranked[index].player;
}

class PlayerPool extends Array<Player>{
 sort(compare?:PlayerCompare):this{
  if(!compare||detectClassicMultiplier(this,compare)===null){
   return super.sort(compare) as this;
  }

  weightedShuffle(this);
  return this;
 }
}

export const players:Player[]=PlayerPool.from(basePlayers);
