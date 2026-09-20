"use client";
import {useEffect,useState} from "react";
import {onAuthStateChanged} from "firebase/auth";
import {learnerAuth} from "../../lib/firebase";
import {learnerFunction} from "../../lib/learner-api";
import LearnerNav from "../components/LearnerNav";
export default function Compete(){const [items,setItems]=useState<any[]>([]),[token,setToken]=useState("");
useEffect(()=>onAuthStateChanged(learnerAuth,async u=>{if(!u)return;const t=await u.getIdToken();setToken(t);try{setItems((await learnerFunction("listPublishedCompetitions",{},t))?.items||[]);}catch{}}),[]);
return <div className="ss-app"><header className="ss-inner-header"><span>‹</span><div><b>Compete</b><small>Challenge yourself and climb the leaderboard!</small></div></header><main className="ss-page"><div className="ss-tabs"><button className="active">Live</button><button>Upcoming</button><button>My Competitions</button></div><div className="ss-competition-list">{items.map((c:any)=><article key={c.id}><span className="ss-comp-icon">🏆</span><div><span className="ss-pill">{c.entryType==="paid"?"PAID":"FREE"}</span><h2>{c.name}</h2><p>{c.description||"Challenge other learners."}</p><small>◷ Starts soon · {c.participants||0} joined</small><button className="ss-primary">Join Competition</button></div></article>)}{!items.length&&<div className="ss-empty">Live and upcoming competitions will appear here.</div>}</div></main><LearnerNav active="Compete"/></div>}