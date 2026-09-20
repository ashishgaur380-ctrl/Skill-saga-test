"use client";
import Link from "next/link";
import { useEffect,useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { learnerAuth } from "../../lib/firebase";

type Item={id:string;name:string;code?:string;numericLevel?:number};
async function load(collection:string,token:string,data:any={}){const r=await fetch("/api/learner-quiz",{method:"POST",headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json"},body:JSON.stringify({action:"getLearnerAcademic",data:{collection,...data}})});const p=await r.json();if(!r.ok)throw new Error(p?.error?.message||"Unable to load academic data.");return p?.data?.items||[];}

function Nav(){return <nav className="ss-nav"><div className="ss-nav-inner">{[["⌂","Home","/"],["📚","Learn","/learn"],["▶","Play","/play"],["🏆","Compete","/compete"],["👤","Profile","/profile"]].map(([i,l,h])=><Link key={l} className={l==="Learn"?"active":""} href={h}><span className="ss-icon">{i}</span>{l}</Link>)}</div></nav>}

export default function Learn(){
 const [token,setToken]=useState(""),[boards,setBoards]=useState<Item[]>([]),[classes,setClasses]=useState<Item[]>([]),[subjects,setSubjects]=useState<Item[]>([]),[chapters,setChapters]=useState<Item[]>([]),[selectedBoard,setSelectedBoard]=useState<Item|null>(null),[selectedClass,setSelectedClass]=useState<Item|null>(null),[selectedSubject,setSelectedSubject]=useState<Item|null>(null),[selectedChapter,setSelectedChapter]=useState<Item|null>(null),[topics,setTopics]=useState<Item[]>([]),[error,setError]=useState("");
 useEffect(()=>onAuthStateChanged(learnerAuth,async user=>{if(!user){setError("Please sign in to browse your academic content.");return;}try{const t=await user.getIdToken();setToken(t);setBoards(await load("boards",t));}catch(e:any){setError(e.message);}}),[]);
 async function chooseBoard(b:Item){setSelectedBoard(b);setSelectedClass(null);setSelectedSubject(null);setSelectedChapter(null);setSubjects([]);setChapters([]);setTopics([]);try{setClasses(await load("classes",token,{parentId:b.id}));}catch(e:any){setError(e.message);}}
 async function chooseClass(c:Item){setSelectedClass(c);setSelectedSubject(null);setSelectedChapter(null);setChapters([]);setTopics([]);try{setSubjects(await load("subjects",token,{boardId:selectedBoard?.id,classId:c.id}));}catch(e:any){setError(e.message);}}
 async function chooseSubject(s:Item){setSelectedSubject(s);setSelectedChapter(null);setTopics([]);try{setChapters(await load("chapters",token,{parentId:s.id}));}catch(e:any){setError(e.message);}}
 async function chooseChapter(c:Item){setSelectedChapter(c);try{setTopics(await load("topics",token,{parentId:c.id}));}catch(e:any){setError(e.message);}}
function practiceUrl(topicId:string){return `/play?topicId=${topicId}`;}
 if(!learnerAuth.currentUser)return <main className="ss-shell"><header className="ss-top"><div className="ss-wrap"><div className="ss-brand">SKILL SAGA · LEARN</div><h1>Learn</h1><p>Sign in to browse your academic learning path.</p></div></header><main className="ss-main"><section className="ss-card"><p>{error}</p><Link href="/login" className="ss-btn primary">Sign in</Link></section></main></main>;
 return <div className="ss-shell"><header className="ss-top"><div className="ss-wrap"><div className="ss-brand">SKILL SAGA · LEARN</div><h1>Learn</h1><p>Choose your path, discover topics and practice at your own pace ✨</p></div></header><main className="ss-main">
 {error&&<section className="ss-card" style={{marginBottom:14}}><p>{error}</p></section>}
 <section className="ss-card"><span className="ss-eyebrow">🗺️ 1 · Choose your board</span><div className="ss-actions">{boards.map(b=><button key={b.id} className={selectedBoard?.id===b.id?"ss-btn primary":"ss-btn"} onClick={()=>chooseBoard(b)}>{b.name}</button>)}</div></section>
 {selectedBoard&&<section className="ss-card" style={{marginTop:14}}><span className="ss-eyebrow">🎒 2 · Choose your class</span><div className="ss-actions">{classes.map(c=><button key={c.id} className={selectedClass?.id===c.id?"ss-btn primary":"ss-btn"} onClick={()=>chooseClass(c)}>{c.name}</button>)}</div></section>}
 {selectedClass&&<section className="ss-card" style={{marginTop:14}}><span className="ss-eyebrow">📚 3 · Pick a subject</span><div className="ss-grid" style={{marginTop:12}}>{subjects.map(s=><button key={s.id} className="ss-card" style={{textAlign:"left",cursor:"pointer"}} onClick={()=>chooseSubject(s)}><h3>{s.name}</h3><p>{s.code||"Subject"}</p></button>)}</div></section>}
 {selectedSubject&&<section className="ss-card" style={{marginTop:14}}><span className="ss-eyebrow">🧩 4 · Pick a chapter</span><div className="ss-grid" style={{marginTop:12}}>{chapters.map(c=><button key={c.id} className="ss-card" style={{textAlign:"left",cursor:"pointer"}} onClick={()=>chooseChapter(c)}><h3>{c.name}</h3></button>)}</div></section>}
 {selectedChapter&&<section className="ss-card" style={{marginTop:14}}><span className="ss-eyebrow">🎯 5 · Choose a topic</span>{topics.length?<div className="ss-grid" style={{marginTop:12}}>{topics.map(t=><div key={t.id} className="ss-card"><h3>{t.name}</h3><p>Practice questions linked to this topic.</p><div className="ss-actions"><Link href={practiceUrl(t.id)} className="ss-btn primary">Practice Topic</Link></div></div>)}</div>:<p style={{marginTop:12}}>No topics have been published for this chapter yet.</p>}<div className="ss-actions"><Link href="/play" className="ss-btn primary">Practice with Quiz</Link></div></section>}
 </main><Nav/></div>;
}