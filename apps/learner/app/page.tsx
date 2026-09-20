"use client";
import Link from "next/link";
import { useEffect,useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { learnerAuth } from "../lib/firebase";
import { learnerFunction } from "../lib/learner-api";

type Quiz={id:string;title:string;description:string;questionCount:number};
type Home={stats:{xp:number;coins:number;level:number;streak:number;accuracy:number};dailyQuiz:Quiz|null;weeklyQuiz:Quiz|null;featuredQuizzes:Quiz[]};
async function load(token:string){const r=await learnerFunction("getLearnerHome", {}, token);const p=await r.json();if(!r.ok)throw new Error(p?.error?.message||"Unable to load home.");return p?.data??p;}

function Nav(){return <nav className="ss-nav"><div className="ss-nav-inner">{[["⌂","Home","/"],["📚","Learn","/learn"],["▶","Play","/play"],["🏆","Compete","/compete"],["👤","Profile","/profile"]].map(([i,l,h])=><Link key={l} className={l==="Home"?"active":""} href={h}><span className="ss-icon">{i}</span>{l}</Link>)}</div></nav>}

export default function LearnerHome(){
 const [home,setHome]=useState<Home|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState("");
 useEffect(()=>onAuthStateChanged(learnerAuth,async user=>{if(!user){setLoading(false);return;}try{setHome(await load(await user.getIdToken()));}catch(e:any){setError(e.message||"Unable to load home.");}finally{setLoading(false);}}),[]);
 if(!learnerAuth.currentUser&&!loading)return <main className="ss-shell"><header className="ss-top"><div className="ss-wrap"><div className="ss-brand">SKILL SAGA</div><h1>A smarter way to learn.</h1><p>Sign in to continue your learning journey.</p></div></header><main className="ss-main"><section className="ss-card"><h2>Welcome to Skill Saga</h2><p>Build knowledge through learning, quizzes and competitions.</p><div className="ss-actions"><Link className="ss-btn primary" href="/login">Sign in</Link><Link className="ss-btn" href="/play">Play</Link></div></section></main></main>;
 const s=home?.stats;
 return <div className="ss-shell"><header className="ss-top"><div className="ss-wrap"><div className="ss-brand">SKILL SAGA</div><h1>Good morning, Learner 👋</h1><p>A smarter way to learn — one quiz at a time.</p></div></header><main className="ss-main">
 {error&&<section className="ss-card" style={{marginBottom:14}}><p>{error}</p></section>}
 <section className="ss-card ss-wide" style={{marginBottom:14}}><span className="ss-eyebrow">✨ Today&apos;s mission</span><h2>{home?.dailyQuiz?"Your Daily Quiz is waiting!":"Keep your learning streak alive 🔥"}</h2><p>{home?.dailyQuiz?.description||"Complete a quiz, collect XP and coins, and keep growing."}</p><div className="ss-actions">{home?.dailyQuiz?<Link className="ss-btn primary" href={`/play?quizId=${home.dailyQuiz.id}`}>Start Daily Quiz</Link>:<Link className="ss-btn primary" href="/play">Choose a Quiz</Link>}{home?.weeklyQuiz&&<Link className="ss-btn" href={`/play?quizId=${home.weeklyQuiz.id}`}>Weekly Quiz</Link>}</div></section>
 <section className="ss-grid"><div className="ss-card"><span className="ss-eyebrow">⭐ XP</span><div className="ss-stat">{s?.xp??0}</div><p>Total experience</p></div><div className="ss-card"><span className="ss-eyebrow">🔥 Streak</span><div className="ss-stat">{s?.streak??0} 🔥</div><p>Days in a row</p></div><div className="ss-card"><span className="ss-eyebrow">🪙 Coins</span><div className="ss-stat">{s?.coins??0} 🪙</div><p>Available balance</p></div><div className="ss-card"><span className="ss-eyebrow">🚀 Level</span><div className="ss-stat">{s?.level??1}</div><p>Current level</p></div></section>
 <section style={{marginTop:20}}><div className="ss-card"><span className="ss-eyebrow">🎁 Rewards</span><h2>Learn it. Earn it. Enjoy it.</h2><p>Use your earned coins to explore the reward catalogue.</p><div className="ss-actions"><Link className="ss-btn primary" href="/rewards">Open Rewards</Link></div></div></section><section style={{marginTop:20}}><h2>🎯 Pick your next challenge</h2><div className="ss-grid">{(home?.featuredQuizzes||[]).map(q=><Link href={`/play?quizId=${q.id}`} className="ss-card" key={q.id}><span className="ss-eyebrow">{q.questionCount} questions</span><h3>{q.title}</h3><p>{q.description||"Start learning and test yourself."}</p></Link>)}{!home?.featuredQuizzes?.length&&<div className="ss-card"><p>No additional published quizzes are available yet.</p></div>}</div></section>
 </main><Nav/></div>;
}