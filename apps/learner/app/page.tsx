"use client";
// Skill Saga UI 2.0 is the single frozen learner frontend entry point.
import Link from "next/link";
import {useEffect,useState} from "react";
import {onAuthStateChanged} from "firebase/auth";
import {learnerAuth} from "../lib/firebase";
import {learnerFunction} from "../lib/learner-api";
import LearnerNav from "./components/LearnerNav";
export default function Home(){
 const [weeklyQuiz,setWeeklyQuiz]=useState<any>(null),[name,setName]=useState("Aarav"),[dailyQuizId,setDailyQuizId]=useState(""),[weeklyQuizId,setWeeklyQuizId]=useState(""),[homeSettings,setHomeSettings]=useState({homeMissionTitle:"Complete a quiz today",homeMissionDescription:"5 questions · Easy",homeQuote:"Small steps make big achievers!"}),[s,setS]=useState({level:5,xp:320,coins:850,streak:7,quizzes:18,badges:3});
 useEffect(()=>onAuthStateChanged(learnerAuth,async u=>{if(!u)return;setName(u.displayName?.split(" ")[0]||"Aarav");try{const x=await learnerFunction("getLearnerHome",{},await u.getIdToken());if(x?.stats)setS(v=>({...v,...x.stats}));if(x?.settings)setHomeSettings(v=>({...v,...x.settings}));setDailyQuizId(x?.dailyQuiz?.id||"");setWeeklyQuiz(x?.weeklyQuiz||null);setWeeklyQuizId(x?.weeklyQuiz?.id||"");}catch{}}),[]);
 return <div className="ss-app"><header className="ss-header"><div className="ss-logo">📖</div><div><b>Skill Saga</b><small>A smarter way to learn</small></div><button>🔔</button></header><main className="ss-page">
 <section className="ss-home-hero"><div><small>Hello, {name}! 👋</small><h1>Keep learning,<br/>keep growing!</h1><p>Challenge yourself, build skills and become a Skill Saga champion.</p></div><div className="ss-hero-art">🎓</div></section>
 <section className="ss-level"><div className="ss-level-icon">⭐</div><div><b>Level {s.level}</b><span>{s.xp} / 500 XP</span><div className="ss-bar"><i style={{width:Math.min(100,(s.xp/500)*100)+"%"}}/></div></div><strong>›</strong></section>
 <section className="ss-stats"><div>🔥<b>{s.streak}</b><small>Day Streak</small></div><div>🪙<b>{s.coins}</b><small>Coins</small></div><div>🎓<b>{s.quizzes}</b><small>Quizzes</small></div><div>🏅<b>{s.badges}</b><small>Badges</small></div></section>
 <div className="ss-quote">🌟 “{homeSettings.homeQuote}”</div>
 <div className="ss-heading"><b>Today&apos;s Mission</b><Link href="/play">View all →</Link></div>
 <section className="ss-mission"><div className="ss-target">🎯</div><div><small>TODAY&apos;S MISSION</small><h2>{homeSettings.homeMissionTitle}</h2><p>{homeSettings.homeMissionDescription}</p><Link href={dailyQuizId?"/play?quizId="+dailyQuizId:"/play"} className="ss-primary">Start Now →</Link></div><span>✨</span></section>
 <div className="ss-quick"><Link href={dailyQuizId?"/play?quizId="+dailyQuizId:"/play"}>📝<b>Daily Quiz</b></Link><Link href={weeklyQuiz && weeklyQuiz.id?"/play?quizId="+weeklyQuiz.id:"/play"}>🏆<b>Weekly Quiz</b></Link><Link href="/learn">📚<b>Learn</b></Link><Link href="/compete">🏅<b>Compete</b></Link></div>
 </main><LearnerNav active="Home"/></div>
}