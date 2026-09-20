"use client";
// Skill Saga UI 2.0 is the single frozen learner frontend entry point.
import Link from "next/link";
import {useEffect,useState} from "react";
import {onAuthStateChanged} from "firebase/auth";
import {learnerAuth} from "../lib/firebase";
import {learnerFunction} from "../lib/learner-api";
import LearnerNav from "./components/LearnerNav";
import HomeLevel from "./components/home/HomeLevel";
import HomeStats from "./components/home/HomeStats";
import HomeMission from "./components/home/HomeMission";
import HomeQuickPlay from "./components/home/HomeQuickPlay";
import HomeContinue from "./components/home/HomeContinue";
import HomeHighlights from "./components/home/HomeHighlights";
const APP_BASE = process.env.NEXT_PUBLIC_GITHUB_PAGES === "true" ? "/Skill-saga-test" : "";
export default function Home(){
 const [weeklyQuiz,setWeeklyQuiz]=useState<any>(null),[name,setName]=useState("Aarav"),[dailyQuizId,setDailyQuizId]=useState(""),[weeklyQuizId,setWeeklyQuizId]=useState(""),[continueTopic,setContinueTopic]=useState<any>(null),[homeSettings,setHomeSettings]=useState({homeMissionTitle:"Complete a quiz today",homeMissionDescription:"5 questions · Easy",homeQuote:"Small steps make big achievers!"}),[s,setS]=useState({level:5,xp:320,coins:850,streak:7,quizzes:18,badges:3,accuracy:0});
 useEffect(()=>onAuthStateChanged(learnerAuth,async u=>{if(!u){window.location.href=APP_BASE+"/login/";return;}setName(u.displayName?.split(" ")[0]||"Aarav");try{const x=await learnerFunction("getLearnerHome",{},await u.getIdToken());if(x?.stats)setS(v=>({...v,...x.stats}));
     try{const p=await learnerFunction("getLearnerProgress",{},await u.getIdToken()); setContinueTopic((p?.topics||[])[0]||null);}catch{}if(x?.settings)setHomeSettings(v=>({...v,...x.settings}));setDailyQuizId(x?.dailyQuiz?.id||"");setWeeklyQuiz(x?.weeklyQuiz||null);setWeeklyQuizId(x?.weeklyQuiz?.id||"");}catch{}}),[]);
 return <div className="ss-app"><header className="ss-header"><div className="ss-logo">📖</div><div><b>Skill Saga</b><small>A smarter way to learn</small></div><Link href="/notifications" aria-label="Notifications">🔔</Link></header><main className="ss-page">
 <section className="ss-home-hero"><div><small>Hello, {name}! 👋</small><h1>Keep learning,<br/>keep growing!</h1><p>Challenge yourself, build skills and become a Skill Saga champion.</p></div><div className="ss-hero-art">🎓</div></section>
 <HomeLevel level={s.level} xp={s.xp}/>
 <HomeStats streak={s.streak} coins={s.coins} quizzes={s.quizzes} badges={s.badges}/>
 <div className="ss-quote">🌟 “{homeSettings.homeQuote}”</div>
 <div className="ss-heading"><b>Today&apos;s Mission</b><Link href="/play">View all →</Link></div>
 <HomeMission title={homeSettings.homeMissionTitle} description={homeSettings.homeMissionDescription} quizId={dailyQuizId}/>
 <HomeQuickPlay dailyQuizId={dailyQuizId} weeklyQuizId={weeklyQuiz?.id||""}/>
 <HomeContinue topic={continueTopic}/>
 <HomeHighlights accuracy={s.accuracy} streak={s.streak} badges={s.badges}/>
 </main><LearnerNav active="Home"/></div>
}