export * from "./data-original";

import {players as basePlayers,type Player} from "./data-original";

type PlayerCompare=(a:Player,b:Player)=>number;

const FEATURED_IDS=["eusebio","aimar","jonas"] as const;
const hash=(value:string)=>[...value].reduce((sum,char,index)=>sum+char.charCodeAt(0)*(index+11),0);
const classicScore=(id:string,multiplier:number)=>(hash(id)*multiplier)%997;

let featuredId:string=FEATURED_IDS[0];
let featuredOffered=false;

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

function shuffle(items:Player[]){
 for(let index=items.length-1;index>0;index--){
  const swapIndex=Math.floor(Math.random()*(index+1));
  [items[index],items[swapIndex]]=[items[swapIndex],items[index]];
 }
}

class PlayerPool extends Array<Player>{
 static get [Symbol.species](){return PlayerPool}

 sort(compare?:PlayerCompare):this{
  if(!compare||detectClassicMultiplier(this,compare)===null){
   return super.sort(compare) as this;
  }

  const goalkeeperPack=this.length>0&&this.every(player=>player.positions.includes("GR"));
  if(goalkeeperPack){
   featuredId=FEATURED_IDS[Math.floor(Math.random()*FEATURED_IDS.length)];
   featuredOffered=false;
  }

  shuffle(this);

  if(!featuredOffered){
   const featuredIndex=this.findIndex(player=>player.id===featuredId);
   if(featuredIndex>=0){
    const visibleIndex=Math.min(3,this.length-1);
    [this[visibleIndex],this[featuredIndex]]=[this[featuredIndex],this[visibleIndex]];
    featuredOffered=true;
   }
  }

  return this;
 }
}

export const players:Player[]=PlayerPool.from(basePlayers);
