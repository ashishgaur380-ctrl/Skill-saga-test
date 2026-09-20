"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import {onAuthStateChanged} from "firebase/auth";
import {learnerAuth} from "../../lib/firebase";
import {learnerFunction} from "../../lib/learner-api";
import LearnerNav from "../components/LearnerNav";

type Item={id:string;name:string;boardIds?:string[];classIds?:string[];subjectId?:string;chapterId?:string;sortOrder?:number;active?:boolean};
type Material={id:string;title:string;description?:string;type:string;language?:string;fileUrl?:string;boardId?:string;classId?:string;subjectId?:string;skillId?:string;otherCategory?:string;otherTopic?:string};

export default function Learn(){
 const [boards,setBoards]=useState<Item[]>([]),[classes,setClasses]=useState<Item[]>([]),[subjects,setSubjects]=useState<Item[]>([]);
 const [chapters,setChapters]=useState<Item[]>([]),[topics,setTopics]=useState<Item[]>([]),[skillCategories,setSkillCategories]=useState<Item[]>([]),[skills,setSkills]=useState<Item[]>([]),[skillId,setSkillId]=useState("");
 const [boardId,setBoardId]=useState(""),[classId,setClassId]=useState(""),[subjectId,setSubjectId]=useState(""),[chapterId,setChapterId]=useState("");
 const [materials,setMaterials]=useState<Material[]>([]),[skillMaterials,setSkillMaterials]=useState<Material[]>([]),[otherMaterials,setOtherMaterials]=useState<Material[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState("");
 const [busy,setBusy]=useState(false);

 useEffect(()=>onAuthStateChanged(learnerAuth,async u=>{
   if(!u){setLoading(false);return;}
   try{
     const token=await u.getIdToken();
     const [b,c]=await Promise.all([
       learnerFunction("getLearnerAcademic",{collection:"boards"},token),
       learnerFunction("getLearnerAcademic",{collection:"classes"},token)
     ]);
     const bs=b?.items||[], cs=c?.items||[];
     setBoards(bs); setClasses(cs);
     const selectedBoard=bs[0]?.id||"";
     const filteredClasses=cs.filter((x:Item)=>!selectedBoard||!x.boardIds||x.boardIds.includes(selectedBoard));
     const selectedClass=filteredClasses[0]?.id||"";
     setBoardId(selectedBoard); setClassId(selectedClass);
     await loadSubjectLevel(token,selectedBoard,selectedClass,"","");
     const [sc,sm,om]=await Promise.all([learnerFunction("getLearnerAcademic",{collection:"skillCategories"},token),learnerFunction("listPublishedLearningMaterials",{},token),learnerFunction("listPublishedLearningMaterials",{otherOnly:true},token)]);
     setSkillCategories(sc?.items||[]); setSkillMaterials(sm?.items||[]); setOtherMaterials(om?.items||[]);
   }catch(e){setError(e instanceof Error?e.message:"Unable to load learning library.");}
   finally{setLoading(false);}
 }),[]);

 async function loadSubjectLevel(token:string,b:string,c:string,s:string,ch:string){
   setBusy(true); setError("");
   try{
     const subjectRes=await learnerFunction("getLearnerAcademic",{collection:"subjects",boardId:b,classId:c},token);
     const ss=subjectRes?.items||[]; setSubjects(ss);
     const nextSubject=s||"";
     setSubjectId(nextSubject); setChapterId(ch||""); setChapters([]); setTopics([]);
     const m=await learnerFunction("listPublishedLearningMaterials",{boardId:b,classId:c,subjectId:nextSubject},token);
     setMaterials(m?.items||[]);
     if(nextSubject){
       const cr=await learnerFunction("getLearnerAcademic",{collection:"chapters",parentId:nextSubject},token);
       setChapters(cr?.items||[]);
     }
   }catch(e){setError(e instanceof Error?e.message:"Unable to load learning content.");}
   finally{setBusy(false);}
 }

 async function changeBoard(id:string){
   const filtered=classes.filter(x=>!id||!x.boardIds||x.boardIds.includes(id));
   const nextClass=filtered[0]?.id||"";
   setBoardId(id); setClassId(nextClass); setSubjectId(""); setChapterId(""); setTopics([]);
   const u=learnerAuth.currentUser;if(u) await loadSubjectLevel(await u.getIdToken(),id,nextClass,"","");
 }
 async function changeClass(id:string){
   setClassId(id);setSubjectId("");setChapterId("");setTopics([]);
   const u=learnerAuth.currentUser;if(u) await loadSubjectLevel(await u.getIdToken(),boardId,id,"","");
 }
 async function changeSubject(id:string){
   setSubjectId(id);setChapterId("");setTopics([]);
   const u=learnerAuth.currentUser;if(u) await loadSubjectLevel(await u.getIdToken(),boardId,classId,id,"");
 }
 async function changeSkill(id:string){ setSkillId(id); const u=learnerAuth.currentUser; if(!u)return; setBusy(true); try{ const t=await learnerFunction("listPublishedLearningMaterials",{skillId:id},await u.getIdToken()); setSkillMaterials(t?.items||[]); }catch(e){setError(e instanceof Error?e.message:"Unable to load skill content.");}finally{setBusy(false);} }
 async function changeChapter(id:string){
   setChapterId(id);setTopics([]);
   const u=learnerAuth.currentUser;if(!u)return;
   setBusy(true);setError("");
   try{
     const t=await learnerFunction("getLearnerAcademic",{collection:"topics",parentId:id},await u.getIdToken());
     setTopics(t?.items||[]);
   }catch(e){setError(e instanceof Error?e.message:"Unable to load topics.");}
   finally{setBusy(false);}
 }

 const visibleClasses=classes.filter(x=>!boardId||!x.boardIds||x.boardIds.includes(boardId));
 const icons=["🧮","🧪","🌍","📖","🔤","💻","💡","🎨","⚽","💰"];
 const selectedSubject=subjects.find(x=>x.id===subjectId);
 const selectedChapter=chapters.find(x=>x.id===chapterId);

 return <div className="ss-app">
  <header className="ss-inner-header"><Link href="/">‹</Link><div><b>Learn</b><small>Choose your learning journey</small></div><Link href="/progress">📈</Link></header>
  <main className="ss-page">
   <div className="ss-learning-hero"><div><span className="ss-eyebrow">YOUR LEARNING PATH</span><h1>{selectedSubject?.name||"Start Learning"}</h1><p>{selectedChapter?.name||"Pick your board, class and subject to explore lessons."}</p></div><span>📚</span></div>
   <div className="ss-selects">
    <select value={boardId} onChange={e=>void changeBoard(e.target.value)} aria-label="Board"><option value="">Choose Board</option>{boards.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select>
    <select value={classId} onChange={e=>void changeClass(e.target.value)} aria-label="Class"><option value="">Choose Class</option>{visibleClasses.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select>
   </div>
   {error&&<div className="ss-message error">{error}</div>}
   {loading?<section className="ss-library"><p>Loading your learning path…</p></section>:<>
    <div className="ss-step-label"><span>1</span><b>Choose a subject</b></div>
    {subjects.length===0?<div className="ss-empty">No subjects are mapped to this board and class yet.</div>:<div className="ss-subjects">{subjects.map((x,i)=><button className={subjectId===x.id?"selected":""} onClick={()=>void changeSubject(x.id)} key={x.id}><span>{icons[i%icons.length]}</span><div><b>{x.name}</b><small>Explore chapters and lessons</small></div><strong>›</strong></button>)}</div>}
    {subjectId&&<><div className="ss-step-label"><span>2</span><b>Choose a chapter</b><em>{chapters.length} chapters</em></div>
      {chapters.length===0?<div className="ss-empty">No chapters are available for {selectedSubject?.name||"this subject"} yet.</div>:<div className="ss-chapter-list">{chapters.map((x,i)=><button className={chapterId===x.id?"selected":""} onClick={()=>void changeChapter(x.id)} key={x.id}><span>{String(i+1).padStart(2,"0")}</span><div><b>{x.name}</b><small>Open topics</small></div><strong>›</strong></button>)}</div>}
    </>}
    {chapterId&&<><div className="ss-step-label"><span>3</span><b>Choose a topic</b><em>{topics.length} topics</em></div>
      {topics.length===0?<div className="ss-empty">No topics are available in this chapter yet.</div>:<div className="ss-topic-list">{topics.map(x=><article key={x.id}><div><b>{x.name}</b><small>Learn this topic and practice</small></div><Link className="ss-primary" href={"/play?topicId="+encodeURIComponent(x.id)}>Practice →</Link></article>)}</div>}
    </>}
    <section className="ss-library"><div className="ss-heading"><b>Learning Library</b><span>{materials.length} available</span></div>{materials.length===0?<p>{subjectId?"No published material is available for this subject yet.":"Select a subject to see published learning material."}</p>:materials.slice(0,10).map(m=><a href={m.fileUrl||"#"} target="_blank" rel="noreferrer" key={m.id}><div><b>{m.title}</b><small>{m.type} · {m.language||"English"}{m.description?" · "+m.description:""}</small></div><span>Open {m.type.toUpperCase()} →</span></a>)}</section>
    <section className="ss-library"><div className="ss-heading"><b>🧠 Skills</b><span>Learn beyond the syllabus</span></div><div className="ss-subjects">{skillCategories.map((x,i)=><button className="selected" key={x.id} onClick={()=>void (async()=>{const u=learnerAuth.currentUser;if(u){setSkills((await learnerFunction("getLearnerAcademic",{collection:"skills",parentId:x.id},await u.getIdToken())).items||[]);}})()}><span>{["💡","💻","💰","⚽","🎯"][i%5]}</span><div><b>{x.name}</b><small>Explore skills</small></div><strong>›</strong></button>)}</div>{skills.length>0&&<div className="ss-topic-list">{skills.map(x=><article key={x.id}><div><b>{x.name}</b><small>Practice and learning material</small></div><button className="ss-primary" onClick={()=>void changeSkill(x.id)}>Explore →</button></article>)}</div>}{skillId&&skillMaterials.length>0&&<div className="ss-topic-list">{skillMaterials.slice(0,10).map(m=><a key={m.id} href={m.fileUrl||"#"} target="_blank" rel="noreferrer"><div><b>{m.title}</b><small>{m.type} · {m.language||"English"}</small></div><span>Open →</span></a>)}</div>}</section>
    <section className="ss-library"><div className="ss-heading"><b>🌟 Other Learning</b><span>Explore more</span></div>{otherMaterials.length===0?<p>More learning categories will appear here as content is published.</p>:otherMaterials.slice(0,10).map(m=><a key={m.id} href={m.fileUrl||"#"} target="_blank" rel="noreferrer"><div><b>{m.title}</b><small>{m.otherCategory||"Other"} · {m.otherTopic||m.type}</small></div><span>Open →</span></a>)}</section>
   </>}
  </main><LearnerNav active="Learn"/>
 </div>;
}
