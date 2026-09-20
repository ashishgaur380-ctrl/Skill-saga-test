"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import {onAuthStateChanged} from "firebase/auth";
import {learnerAuth} from "../../lib/firebase";
import {learnerFunction} from "../../lib/learner-api";
import LearnerNav from "../components/LearnerNav";

type Item={id:string;name:string;boardIds?:string[];classIds?:string[];subjectId?:string};
type Material={id:string;title:string;description?:string;type:string;language?:string;fileUrl?:string;boardId?:string;classId?:string;subjectId?:string};

export default function Learn(){
 const [boards,setBoards]=useState<Item[]>([]),[classes,setClasses]=useState<Item[]>([]),[subjects,setSubjects]=useState<Item[]>([]);
 const [boardId,setBoardId]=useState(""),[classId,setClassId]=useState(""),[subjectId,setSubjectId]=useState("");
 const [materials,setMaterials]=useState<Material[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState("");
 useEffect(()=>onAuthStateChanged(learnerAuth,async u=>{
   if(!u){setLoading(false);return;}
   try{
     const token=await u.getIdToken();
     const [b,c]=await Promise.all([learnerFunction("getLearnerAcademic",{collection:"boards"},token),learnerFunction("getLearnerAcademic",{collection:"classes"},token)]);
     const bs=b?.items||[], cs=c?.items||[]; setBoards(bs); setClasses(cs);
     const selectedBoard=bs[0]?.id||""; const filteredClasses=cs.filter((x:Item)=>!selectedBoard||!x.boardIds||x.boardIds.includes(selectedBoard));
     const selectedClass=filteredClasses[0]?.id||""; setBoardId(selectedBoard);setClassId(selectedClass);
     const s=await learnerFunction("getLearnerAcademic",{collection:"subjects",boardId:selectedBoard,classId:selectedClass},token); setSubjects(s?.items||[]);
     const m=await learnerFunction("listPublishedLearningMaterials",{boardId:selectedBoard,classId:selectedClass},token); setMaterials(m?.items||[]);
   }catch(e){setError(e instanceof Error?e.message:"Unable to load learning library.");} finally{setLoading(false);}
 }),[]);
 async function refresh(nextBoard:string,nextClass:string,nextSubject:string){const u=learnerAuth.currentUser;if(!u)return;try{setError("");const token=await u.getIdToken();const s=await learnerFunction("getLearnerAcademic",{collection:"subjects",boardId:nextBoard,classId:nextClass},token);setSubjects(s?.items||[]);const m=await learnerFunction("listPublishedLearningMaterials",{boardId:nextBoard,classId:nextClass,subjectId:nextSubject},token);setMaterials(m?.items||[]);}catch(e){setError(e instanceof Error?e.message:"Unable to refresh learning content.");}}
 async function changeBoard(id:string){setBoardId(id);setSubjectId("");const filtered=classes.filter(x=>!id||!x.boardIds||x.boardIds.includes(id));const nextClass=filtered[0]?.id||"";setClassId(nextClass);await refresh(id,nextClass,"");}
 async function changeClass(id:string){setClassId(id);setSubjectId("");await refresh(boardId,id,"");}
 async function changeSubject(id:string){setSubjectId(id);await refresh(boardId,classId,id);}
 const visibleClasses=classes.filter(x=>!boardId||!x.boardIds||x.boardIds.includes(boardId));
 const icons=["🧮","🧪","🌍","📖","🔤","💻","💡"];
 return <div className="ss-app"><header className="ss-inner-header"><Link href="/">‹</Link><div><b>Learn</b><small>Choose your learning journey</small></div><span>⌕</span></header><main className="ss-page">
 <div className="ss-selects"><select value={boardId} onChange={e=>void changeBoard(e.target.value)} aria-label="Board">{boards.length===0&&<option value="">Board</option>}{boards.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select><select value={classId} onChange={e=>void changeClass(e.target.value)} aria-label="Class">{visibleClasses.length===0&&<option value="">Class</option>}{visibleClasses.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></div>
 {subjects.length>0&&<div className="ss-subjects">{subjects.map((x,i)=><Link href={"/learn?subject="+encodeURIComponent(x.id)} data-practice-href={"/play?topicId="+encodeURIComponent(x.id)} onClick={()=>void changeSubject(x.id)} key={x.id}><span>{icons[i%icons.length]}</span><div><b>{x.name}</b><small>Explore subject</small></div><strong>›</strong></Link>)}</div>}
 {loading&&<section className="ss-library"><div className="ss-heading"><b>Learning Library</b><span>Loading…</span></div></section>}
 {error&&<section className="ss-library"><div className="ss-heading"><b>Learning Library</b><span>!</span></div><p>{error}</p></section>}
 {!loading&&!error&&<section className="ss-library"><div className="ss-heading"><b>Learning Library</b><span>{materials.length} available</span></div>{materials.length===0?<p>No published learning material is available for this selection yet.</p>:materials.slice(0,10).map(m=><a href={m.fileUrl||"#"} target="_blank" rel="noreferrer" key={m.id}><b>{m.title}</b><small>{m.type} · {m.language||"English"}{m.description?" · "+m.description:""}</small><span>Open {m.type.toUpperCase()}</span>›</a>)}</section>}
 </main><LearnerNav active="Learn"/></div>;
}