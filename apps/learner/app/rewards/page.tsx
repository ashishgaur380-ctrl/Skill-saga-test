"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import {onAuthStateChanged} from "firebase/auth";
import {learnerAuth} from "../../lib/firebase";
import { learnerFunction } from "../../lib/learner-api";
type Reward={id:string;name:string;type:string;description:string;coinCost:number};
type Redemption={id:string;rewardId:string;rewardName:string;coinCost:number;status:string};
type Data={wallet:{balance:number;earned:number;spent:number};rewards:Reward[];redemptions:Redemption[]};
async function call(action:string,data:any,token:string){const r=await fetch("/api/learner-quiz",{method:"POST",headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json"},body:JSON.stringify({action,data})});const p=await r.json();if(!r.ok)throw new Error(p?.error?.message||"Request failed.");return p?.data??p;}
export default function Rewards(){const[data,setData]=useState<Data|null>(null),[error,setError]=useState(""),[busy,setBusy]=useState("");
useEffect(()=>onAuthStateChanged(learnerAuth,async user=>{if(!user)return;try{setData(await call("getLearnerRewards",{},await user.getIdToken()));}catch(e:any){setError(e.message);}}),[]);
async function redeem(id:string){if(!learnerAuth.currentUser)return;setBusy(id);setError("");try{await call("redeemReward",{rewardId:id},await learnerAuth.currentUser.getIdToken());setData(await call("getLearnerRewards",{},await learnerAuth.currentUser.getIdToken()));}catch(e:any){setError(e.message);}finally{setBusy("");}}
return <div className="ss-shell"><header className="ss-top"><div className="ss-wrap"><div className="ss-brand">SKILL SAGA · REWARDS</div><h1>Rewards</h1><p>Use your earned coins for available rewards.</p></div></header><main className="ss-main">
<div className="ss-grid"><div className="ss-card"><span className="ss-eyebrow">Coin balance</span><div className="ss-stat">{data?.wallet.balance??0} 🪙</div><p>{data?.wallet.earned??0} earned · {data?.wallet.spent??0} spent</p></div><div className="ss-card"><span className="ss-eyebrow">How to earn</span><h2>Learn & play</h2><p>Complete quizzes and topic practice to earn coins.</p></div></div>
{error&&<div className="ss-card" style={{marginTop:14}}><p>{error}</p></div>}
<section style={{marginTop:20}}><div className="ss-card"><span className="ss-eyebrow">Reward catalogue</span><h2>Available rewards</h2>{!data?.rewards?.length?<p>No active rewards are available yet.</p>:data.rewards.map(r=><div key={r.id} style={{padding:"14px 0",borderTop:"1px solid #e7ebf2"}}><div style={{display:"flex",justifyContent:"space-between",gap:10}}><div><strong>{r.name}</strong><p>{r.type} · {r.description||"A Skill Saga reward."}</p></div><strong>{r.coinCost} 🪙</strong></div><div className="ss-actions"><button className="ss-btn primary" disabled={!!busy||r.coinCost>(data?.wallet.balance??0)} onClick={()=>redeem(r.id)}>{busy===r.id?"Redeeming…":r.coinCost>(data?.wallet.balance??0)?"Not enough coins":"Redeem"}</button></div></div>)}</div></section>
<section style={{marginTop:20}}><div className="ss-card"><span className="ss-eyebrow">Redemption history</span><h2>My requests</h2>{!data?.redemptions?.length?<p>No reward requests yet.</p>:data.redemptions.slice(0,20).map(r=><div key={r.id} style={{padding:"11px 0",borderTop:"1px solid #e7ebf2",display:"flex",justifyContent:"space-between",gap:10}}><span>{r.rewardName}</span><strong>{r.coinCost} 🪙 · {r.status}</strong></div>)}</div></section>
<div className="ss-actions"><Link href="/play" className="ss-btn primary">Earn More Coins</Link><Link href="/profile" className="ss-btn">Profile</Link><Link href="/" className="ss-btn">Home</Link></div>
</main><nav className="ss-nav"><div className="ss-nav-inner">{[["⌂","Home","/"],["📚","Learn","/learn"],["▶","Play","/play"],["🏆","Compete","/compete"],["👤","Profile","/profile"]].map(([i,l,h])=><Link key={l} className={l==="Profile"?"active":""} href={h}><span className="ss-icon">{i}</span>{l}</Link>)}</div></nav></div>}
