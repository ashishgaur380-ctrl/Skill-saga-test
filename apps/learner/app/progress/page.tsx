"use client";
import Link from "next/link";
import { useEffect,useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { learnerAuth } from "../../lib/firebase";

type Topic={id:string;name:string;chapterId:string;chapterName:string;subjectId:string;questions:number;correct:number;accuracy:number;marks:number;totalMarks:number;marksPercentage:number;attempts:number};
type Subject={id:string;name:string;questions:number;correct:number;accuracy:number;marks:number;totalMarks:number;marksPercentage:number};
type Data={summary:{attempts:number;questions:number;correct:number;accuracy:number;marks:number;totalMarks:number;marksPercentage:number};subjects:Subject[];topics:Topic[]};

async function call(token:string){const r=await fetch("/api/learner-quiz",{method:"POST",headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json"},body:JSON.stringify({action:"getLearnerProgress",data:{}})});const p=await r.json();if(!r.ok)throw new Error(p?.error?.message||"Request failed.");return p?.data??p;}

export default function Progress(){
 const [data,setData]=useState<Data|null>(null),[error,setError]=useState(""),[loading,setLoading]=useState(true);
 useEffect(()=>onAuthStateChanged(learnerAuth,async user=>{if(!user){setLoading(false);return;}try{const token=await user.getIdToken();setData(await call(token));}catch(e:any){setError(e.message||"Unable to load progress.");}finally{setLoading(false);}}),[]);
 const s=data?.summary;
 return <div className="ss-shell"><header className="ss-top"><div className="ss-wrap"><div className="ss-brand">SKILL SAGA · PROGRESS</div><h1>My Progress</h1><p>See how your learning is developing across subjects and topics.</p></div></header><main className="ss-main">
 {loading&&<div className="ss-card"><p>Loading your progress…</p></div>}
 {error&&<div className="ss-card"><p>{error}</p></div>}
 {data&&<>
 <div className="ss-grid">
  <div className="ss-card"><span className="ss-eyebrow">Questions</span><div className="ss-stat">{s?.questions??0}</div><p>Answered</p></div>
  <div className="ss-card"><span className="ss-eyebrow">Correct</span><div className="ss-stat">{s?.correct??0}</div><p>Correct answers</p></div>
  <div className="ss-card"><span className="ss-eyebrow">Accuracy</span><div className="ss-stat">{s?.accuracy??0}%</div><p>Question accuracy</p></div>
  <div className="ss-card"><span className="ss-eyebrow">Marks</span><div className="ss-stat">{s?.marks??0}/{s?.totalMarks??0}</div><p>{s?.marksPercentage??0}% of available marks</p></div>
 </div>
 <section style={{marginTop:20}}><div className="ss-card"><span className="ss-eyebrow">Subject Performance</span><h2>Subjects</h2>{data.subjects.length===0?<p>No subject performance yet. Complete a quiz or topic practice to start building your progress.</p>:data.subjects.map(x=><div key={x.id} style={{padding:"14px 0",borderTop:"1px solid #e7ebf2"}}><div style={{display:"flex",justifyContent:"space-between",gap:10}}><strong>{x.name}</strong><strong>{x.accuracy}%</strong></div><p>{x.correct}/{x.questions} correct · {x.marks}/{x.totalMarks} marks</p><div className="ss-progress" style={{marginTop:9}}><span style={{width:`${Math.min(100,Math.max(0,x.accuracy))}%`}}/></div></div>)}</div></section>
 <section style={{marginTop:20}}><div className="ss-card"><span className="ss-eyebrow">Topic Performance</span><h2>Topics</h2>{data.topics.length===0?<p>No topic-level performance yet.</p>:data.topics.slice(0,30).map(x=><div key={x.id+`-${x.chapterId}`} style={{padding:"14px 0",borderTop:"1px solid #e7ebf2"}}><div style={{display:"flex",justifyContent:"space-between",gap:10}}><div><strong>{x.name}</strong><p>{x.chapterName} · {x.attempts} practice/quiz attempt{x.attempts===1?"":"s"}</p></div><strong>{x.accuracy}%</strong></div><p>{x.correct}/{x.questions} correct · {x.marks}/{x.totalMarks} marks</p><div className="ss-progress" style={{marginTop:9}}><span style={{width:`${Math.min(100,Math.max(0,x.accuracy))}%`}}/></div></div>)}</div></section>
 </>}
 <div className="ss-actions"><Link href="/learn" className="ss-btn primary">Continue Learning</Link><Link href="/profile" className="ss-btn">Profile</Link><Link href="/" className="ss-btn">Home</Link></div>
 </main><Nav/></div>;
}
function Nav(){return <nav className="ss-nav"><div className="ss-nav-inner">{[["⌂","Home","/"],["📚","Learn","/learn"],["▶","Play","/play"],["🏆","Compete","/compete"],["👤","Profile","/profile"]].map(([i,l,h])=><Link key={l} className={l==="Profile"?"active":""} href={h}><span className="ss-icon">{i}</span>{l}</Link>)}</div></nav>}
