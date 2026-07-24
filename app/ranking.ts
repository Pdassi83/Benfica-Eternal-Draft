export type RankingRow={
 ranking_position:number;
 nickname:string;
 score:number;
 champion:boolean;
 wins:number;
 goal_difference:number;
 team_rating:number;
 chemistry:number;
 daily_key:string;
};

export type SubmittedScore={
 saved_as_best:boolean;
 best_score:number;
 saved_nickname:string;
 saved_daily_key:string;
 saved_week_key:string;
};

export type ScoreSubmission={
 dailyKey:string;
 nickname:string;
 deviceId:string;
 champion:boolean;
 teamRating:number;
 chemistry:number;
 wins:number;
 goalDifference:number;
};

const supabaseUrl=process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/,"")||"";
const publishableKey=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||"";

export const rankingConfigured=Boolean(supabaseUrl&&publishableKey);

async function rpc<T>(name:string,payload:Record<string,unknown>):Promise<T>{
 if(!rankingConfigured)throw new Error("O ranking ainda não está configurado.");
 const response=await fetch(`${supabaseUrl}/rest/v1/rpc/${name}`,{
  method:"POST",
  headers:{apikey:publishableKey,"Content-Type":"application/json"},
  body:JSON.stringify(payload),
 });
 if(!response.ok){
  let message=`Erro ${response.status}`;
  try{const body=await response.json() as {message?:string};message=body.message||message}catch{}
  throw new Error(message);
 }
 return response.json() as Promise<T>;
}

export async function getWeeklyRanking(weekKey?:string):Promise<RankingRow[]>{
 return rpc<RankingRow[]>("get_weekly_ranking",{p_week_key:weekKey||null});
}

export async function submitDailyScore(input:ScoreSubmission):Promise<SubmittedScore>{
 const rows=await rpc<SubmittedScore[]>("submit_daily_score",{
  p_daily_key:input.dailyKey,
  p_nickname:input.nickname,
  p_device_id:input.deviceId,
  p_champion:input.champion,
  p_team_rating:input.teamRating,
  p_chemistry:input.chemistry,
  p_wins:input.wins,
  p_goal_difference:input.goalDifference,
 });
 if(!rows[0])throw new Error("O Supabase não devolveu o resultado guardado.");
 return rows[0];
}

const DEVICE_KEY="benfica-legends-device-id";
const NICKNAME_KEY="benfica-legends-nickname";

function fallbackUuid(){
 return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,char=>{
  const random=Math.floor(Math.random()*16),value=char==="x"?random:(random&3)|8;
  return value.toString(16);
 });
}

export function getOrCreateDeviceId(){
 const stored=window.localStorage.getItem(DEVICE_KEY);
 if(stored)return stored;
 const id=window.crypto?.randomUUID?.()||fallbackUuid();
 window.localStorage.setItem(DEVICE_KEY,id);
 return id;
}

export function getSavedNickname(){return window.localStorage.getItem(NICKNAME_KEY)||""}
export function saveNickname(nickname:string){window.localStorage.setItem(NICKNAME_KEY,nickname)}
