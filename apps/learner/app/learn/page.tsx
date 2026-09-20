"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import {onAuthStateChanged} from "firebase/auth";
import {learnerAuth} from "../../lib/firebase";
import {learnerFunction} from "../../lib/learner-api";
import LearnerNav from "../components/LearnerNav";
const subjects=[["🧮","Mathematics","12 Chapters"],["🧪","Science","14 Chapters"],["🌍","Social Science","10 Chapters"],["📖","English","8 Chapters"],["🔤","Hindi","8 Chapters"],["💻","Computer & Technology","6 Chapters"],["💡","General Knowledge","8 Chapters"]];
export default function Learn(){const [board,setBoard]=useState("CBSE"),[cls,setCls]=useState("Class 6"),[materials,setMaterials]=useState<any[]>([]);
useEffect(()=>onAuthStateChanged(learnerAuth,async u=>{if(!u)return;try{setMaterials((await learnerFunction("listPublishedLearningMaterials",{},await u.getIdToken()))?.items||[]);}catch{}}),[]);
return <div className="ss-app"><header className="ss-inner-header"><Link href="/">‹</Link><div><b>Learn</b><small>Choose your learning journey</small></div><span>⌕</span></header><main className="ss-page">
<div className="ss-selects"><select value={board} onChange={e=>setBoard(e.target.value)}><option>CBSE</option><option>ICSE</option><option>State Board</option></select><select value={cls} onChange={e=>setCls(e.target.value)}><option>Class 6</option><option>Class 5</option><option>Class 7</option></select></div>
<div className="ss-subjects">{subjects.map(([icon,title,count])=><Link href={"/learn?subject="+encodeURIComponent(title)} key={title}><span>{icon}</span><div><b>{title}</b><small>{count}</small></div><strong>›</strong></Link>)}</div>
{materials.length>0&&<section className="ss-library"><div className="ss-heading"><b>Learning Library</b><span>New</span></div>{materials.slice(0,3).map(m=><a href={m.fileUrl||"#"} target="_blank" rel="noreferrer" key={m.id}><b>{m.title}</b><small>{m.type} · {m.language}</small>›</a>)}</section>}
</main><LearnerNav active="Learn"/></div>}