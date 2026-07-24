"use client";

import {useCallback,useEffect,useMemo,useState,type FormEvent} from "react";
import {createPortal} from "react-dom";
import {
 getOrCreateDeviceId,
 getSavedNickname,
 getWeeklyRanking,
 rankingConfigured,
 saveNickname,
 submitDailyScore,
 type RankingRow,
} from "./ranking";

type CampaignSnapshot={
 champion:boolean;
 teamRating:number;
 chemistry:number;
 wins:number;
 goalDifference:number;
};

const lisbonDay=()=>new Intl.DateTimeFormat("en-CA",{
 timeZone:"Europe/Lisbon",
 year:"numeric",
 month:"2-digit",
 day:"2-digit",
}).format(new Date());

const dayLabel=(day:string)=>day?day.split("-").reverse().join("/"):"hoje";

const weekKeyFromDay=(day:string)=>{
 const date=new Date(`${day}T12:00:00Z`);
 const weekday=date.getUTCDay()||7;
 date.setUTCDate(date.getUTCDate()-weekday+1);
 return date.toISOString().slice(0,10);
};

function ensureHost(after:Element|null,className:string,placement:"after"|"inside"){
 if(!after)return null;
 const existing=document.querySelector<HTMLElement>(`.${className}`);
 if(existing)return existing;
 const host=document.createElement("div");
 host.className=className;
 if(placement==="after")after.insertAdjacentElement("afterend",host);
 else{
  const restart=after.querySelector(".restart-link");
  if(restart)after.insertBefore(host,restart);
  else after.append(host);
 }
 return host;
}

function readCampaignSnapshot():CampaignSnapshot|null{
 const end=document.querySelector<HTMLElement>(".cup .end");
 const title=document.querySelector(".cup .game-title .eyebrow")?.textContent||"";
 if(!end||!title.includes("Draft do dia"))return null;
 const scoreElements=Array.from(document.querySelectorAll<HTMLElement>(".cup .route > div strong"));
 if(!scoreElements.length)return null;
 let wins=0,goalDifference=0;
 for(const element of scoreElements){
  const match=element.textContent?.match(/(-?\d+)\s*[–-]\s*(-?\d+)/);
  if(match)goalDifference+=Number(match[1])-Number(match[2]);
  if(element.classList.contains("V"))wins++;
 }
 const teamRating=Number.parseInt(document.querySelector<HTMLElement>(".cup .game-title .round")?.textContent||"",10);
 const chemistryBar=Array.from(document.querySelectorAll<HTMLElement>(".cup .team .bar")).find(bar=>bar.querySelector("span")?.textContent?.trim()==="Química");
 const chemistry=Number.parseInt(chemistryBar?.querySelector("b")?.textContent||"",10);
 if(!Number.isFinite(teamRating)||!Number.isFinite(chemistry))return null;
 return{champion:end.classList.contains("champion"),teamRating,chemistry,wins,goalDifference};
}

function RankingBoard({rows,loading,error,onRefresh,dailyKey}:{rows:RankingRow[];loading:boolean;error:string;onRefresh:()=>void;dailyKey:string}){
 return <section className="weekly-ranking"><div className="weekly-ranking-head"><div><span className="eyebrow">Competição semanal</span><h2>Ranking Legends</h2><p>Conta apenas o melhor resultado de cada dispositivo durante a semana. Campeões, vitórias e diferença de golos decidem quem fica acima.</p></div><button className="ranking-refresh" onClick={onRefresh} disabled={loading}>{loading?"A atualizar…":"Atualizar ranking ↻"}</button></div><div className="ranking-table"><div className="ranking-row head"><span>#</span><span>Nickname</span><span>Pontos</span><span>V</span><span>DG</span><span>XI</span><span>Química</span></div>{rows.length?rows.slice(0,20).map(row=><div className="ranking-row" key={`${row.ranking_position}-${row.nickname}-${row.daily_key}`}><span>{row.ranking_position}</span><b>{row.nickname}<small>{row.champion?"Campeão":"Participante"} · {dayLabel(row.daily_key)}</small></b><span className="ranking-score">{row.score}</span><span>{row.wins}</span><span>{row.goal_difference>0?`+${row.goal_difference}`:row.goal_difference}</span><span>{row.team_rating}</span><span>{row.chemistry}</span></div>):<p className="ranking-empty">{loading?"A carregar o ranking…":rankingConfigured?"Ainda não há resultados nesta semana. O palco está vazio, tragicamente.":"O ranking ficará disponível no deploy de produção."}</p>}</div>{error&&<p className="ranking-error">{error}</p>}<p className="ranking-error">Semana de {dayLabel(weekKeyFromDay(dailyKey))}</p></section>;
}

export default function RankingIntegration(){
 const[dailyKey]=useState(lisbonDay);
 const[homeHost,setHomeHost]=useState<HTMLElement|null>(null);
 const[scoreHost,setScoreHost]=useState<HTMLElement|null>(null);
 const[snapshot,setSnapshot]=useState<CampaignSnapshot|null>(null);
 const[rows,setRows]=useState<RankingRow[]>([]);
 const[loading,setLoading]=useState(false);
 const[error,setError]=useState("");
 const[nickname,setNickname]=useState("");
 const[submitting,setSubmitting]=useState(false);
 const[submissionStatus,setSubmissionStatus]=useState("");

 const loadRanking=useCallback(async()=>{
  if(!rankingConfigured)return;
  setLoading(true);setError("");
  try{setRows(await getWeeklyRanking(weekKeyFromDay(dailyKey)))}
  catch(reason){setError(reason instanceof Error?reason.message:"Não foi possível carregar o ranking.")}
  finally{setLoading(false)}
 },[dailyKey]);

 useEffect(()=>{
  setNickname(getSavedNickname());
  void loadRanking();
 },[loadRanking]);

 useEffect(()=>{
  const sync=()=>{
   const daily=document.querySelector(".daily-challenge");
   const nextHome=daily?ensureHost(daily,"ranking-react-host","after"):null;
   if(nextHome!==homeHost)setHomeHost(nextHome);

   const end=document.querySelector<HTMLElement>(".cup .end");
   const nextSnapshot=readCampaignSnapshot();
   const nextScore=end&&nextSnapshot?ensureHost(end,"score-submit-host","inside"):null;
   if(nextScore!==scoreHost)setScoreHost(nextScore);
   setSnapshot(current=>JSON.stringify(current)===JSON.stringify(nextSnapshot)?current:nextSnapshot);
  };
  sync();
  const observer=new MutationObserver(sync);
  observer.observe(document.body,{childList:true,subtree:true});
  return()=>observer.disconnect();
 },[homeHost,scoreHost]);

 const scoreSummary=useMemo(()=>snapshot?`${snapshot.wins} vitórias · DG ${snapshot.goalDifference>0?"+":""}${snapshot.goalDifference} · XI ${snapshot.teamRating} · química ${snapshot.chemistry}`:"",[snapshot]);

 const submit=async(event:FormEvent<HTMLFormElement>)=>{
  event.preventDefault();
  if(!snapshot)return;
  const clean=nickname.trim().replace(/\s+/g," ");
  if(clean.length<3||clean.length>20){setSubmissionStatus("Erro: usa entre 3 e 20 caracteres.");return}
  setSubmitting(true);setSubmissionStatus("");
  try{
   const saved=await submitDailyScore({dailyKey,nickname:clean,deviceId:getOrCreateDeviceId(),champion:snapshot.champion,teamRating:snapshot.teamRating,chemistry:snapshot.chemistry,wins:snapshot.wins,goalDifference:snapshot.goalDifference});
   saveNickname(clean);setNickname(clean);
   setSubmissionStatus(saved.saved_as_best?`Melhor resultado guardado: ${saved.best_score} pontos ✓`:`Mantivemos o teu melhor resultado: ${saved.best_score} pontos.`);
   await loadRanking();
  }catch(reason){setSubmissionStatus(`Erro: ${reason instanceof Error?reason.message:"não foi possível guardar."}`)}
  finally{setSubmitting(false)}
 };

 return <>
  {homeHost&&createPortal(<RankingBoard rows={rows} loading={loading} error={error} onRefresh={loadRanking} dailyKey={dailyKey}/>,homeHost)}
  {scoreHost&&snapshot&&createPortal(<div className="score-submit"><span>Ranking semanal</span><h3>Regista o teu resultado</h3><p>{scoreSummary}. Escolhe um nickname público para guardar o melhor resultado deste dia.</p><form onSubmit={submit}><input value={nickname} onChange={event=>setNickname(event.target.value)} minLength={3} maxLength={20} placeholder="Nickname, 3 a 20 caracteres" autoComplete="nickname"/><button className="primary" disabled={submitting}>{submitting?"A guardar…":"Entrar no ranking →"}</button></form>{submissionStatus&&<p className={`score-submit-status ${submissionStatus.startsWith("Erro")?"error":""}`}>{submissionStatus}</p>}</div>,scoreHost)}
 </>;
}
