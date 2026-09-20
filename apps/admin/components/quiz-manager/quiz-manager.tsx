"use client";

import {useCallback,useEffect,useState} from "react";
import {firebaseAuth} from "../../lib/firebase";

type Q={id:string;questionText:string;active:boolean};
type Quiz={id:string;title:string;description?:string;questionIds:string[];boardId?:string;classId?:string;subjectId?:string;status:string;active:boolean;publishAtMs?:number|null;expireAtMs?:number|null};
type A={id:string;name:string;code?:string;active:boolean};

async function callQuiz<T>(action:string,data:Record<string,unknown>={}):Promise<T>{
 const u=firebaseAuth.currentUser;if(!u)throw new Error("You are not authenticated.");
 const token=await u.getIdToken();
 const r=await fetch("/api/quiz-manager",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},body:JSON.stringify({action,data}),cache:"no-store"});
 const p=await r.json() as {data?:T;error?:{message?:string}};
 if(!r.ok)throw new Error(p.error?.message||"Quiz operation failed.");
 return p.data as T;
}
async function listA(c:string):Promise<A[]>{
 const u=firebaseAuth.currentUser;if(!u)throw new Error("You are not authenticated.");
 const token=await u.getIdToken();const r=await fetch("/api/academic",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},body:JSON.stringify({action:"listAcademic",data:{collection:c}}),cache:"no-store"});
 const p=await r.json() as {data?:{items:A[]};error?:{message?:string}};if(!r.ok)throw new Error(p.error?.message||"Unable to load academic data.");return p.data?.items??[];
}
const blank={title:"",description:"",questionIds:[] as string[],boardId:"",classId:"",subjectId:"",status:"draft",active:true,publishAtMs:null as number|null,expireAtMs:null as number|null};
export default function QuizManager(){
 const[quizzes,setQuizzes]=useState<Quiz[]>([]),[questions,setQuestions]=useState<Q[]>([]),[academic,setAcademic]=useState<Record<string,A[]>>({}),[form,setForm]=useState(blank),[editing,setEditing]=useState<Quiz|null>(null),[open,setOpen]=useState(false),[loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[error,setError]=useState<string|null>(null),[notice,setNotice]=useState<string|null>(null);
 const loadAll=useCallback(async()=>{
   setLoading(true); setError(null);
   try {
     const [quizResult, questionResult, boards, classes, subjects] = await Promise.all([
       callQuiz<{items:Quiz[]}>("listQuizzes"),
       (async()=>{
         const u=firebaseAuth.currentUser;
         if(!u) throw new Error("You are not authenticated.");
         const token=await u.getIdToken();
         const r=await fetch("/api/question-bank",{
           method:"POST",
           headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},
           body:JSON.stringify({action:"listQuestions",data:{}}),
           cache:"no-store"
         });
         const p=await r.json() as any;
         if(!r.ok) throw new Error(p.error?.message||"Unable to load questions.");
         return (p.data?.items??[]) as Q[];
       })(),
       listA("boards"), listA("classes"), listA("subjects")
     ]);
     setQuizzes(quizResult.items??[]);
     setQuestions(questionResult);
     setAcademic({boards,classes,subjects});
   } catch(e) {
     setError(e instanceof Error?e.message:"Unable to load Quiz Manager.");
   } finally { setLoading(false); }
 },[]);
 useEffect(()=>{void loadAll()},[loadAll]);

 function create(){setEditing(null);setForm({...blank});setOpen(true);setError(null);setNotice(null)}
 function edit(q:Quiz){setEditing(q);setForm({title:q.title,description:q.description??"",questionIds:[...q.questionIds],boardId:q.boardId??"",classId:q.classId??"",subjectId:q.subjectId??"",status:q.status,active:q.active,publishAtMs:q.publishAtMs??null,expireAtMs:q.expireAtMs??null});setOpen(true);setError(null);setNotice(null)}
 async function save(){setSaving(true);setError(null);try{if(editing)await callQuiz("updateQuiz",{id:editing.id,data:form});else await callQuiz("createQuiz",{data:form});setOpen(false);setNotice(editing?"Quiz updated successfully.":"Quiz created successfully.");await loadAll()}catch(e){setError(e instanceof Error?e.message:"Unable to save quiz.")}finally{setSaving(false)}}
 async function archive(q:Quiz){if(!confirm(`Archive "${q.title}"?`))return;setSaving(true);try{await callQuiz("archiveQuiz",{id:q.id});setNotice("Quiz archived.");await loadAll()}catch(e){setError(e instanceof Error?e.message:"Unable to archive quiz.")}finally{setSaving(false)}}
 function toggleQuestion(id:string){setForm(f=>({...f,questionIds:f.questionIds.includes(id)?f.questionIds.filter(x=>x!==id):[...f.questionIds,id]}))}
 return <main className="academic-manager"><header className="academic-header"><div><span className="academic-eyebrow">ASSESSMENT</span><h1>Quiz Manager</h1><p>Build quizzes from the central Question Bank.</p></div><div className="academic-status"><span className="status-dot"/> {quizzes.filter(q=>q.active).length} active</div></header>
 <section className="academic-panel"><div className="academic-panel-header"><div><h2>Quizzes</h2><p>Start with one draft quiz for integration testing.</p></div><button className="primary-button" onClick={create}>+ Add Quiz</button></div>{error&&<div className="academic-message error">{error}</div>}{notice&&<div className="academic-message success">{notice}</div>}
 {loading?<div className="academic-empty"><h3>Loading quizzes…</h3></div>:quizzes.length===0?<div className="academic-empty"><h3>No quizzes yet</h3><p>Create one draft quiz using the test question.</p><button className="secondary-button" onClick={create}>Create test quiz</button></div>:<div className="academic-table-wrap"><table className="academic-table"><thead><tr><th>Title</th><th>Questions</th><th>Status</th><th>Actions</th></tr></thead><tbody>{quizzes.map(q=><tr key={q.id}><td><strong>{q.title}</strong></td><td>{q.questionIds.length}</td><td><span className={q.active?"status-pill active":"status-pill"}>{q.active?q.status:"Archived"}</span></td><td><div className="row-actions"><button className="text-button" onClick={()=>edit(q)}>Edit</button>{q.active&&<button className="text-button danger" disabled={saving} onClick={()=>void archive(q)}>Archive</button>}</div></td></tr>)}</tbody></table></div>}</section>
 {open&&<div className="modal-backdrop"><section className="academic-modal importer-modal"><div className="modal-header"><div><span className="academic-eyebrow">QUIZ</span><h2>{editing?"Edit Quiz":"Add Quiz"}</h2></div><button className="modal-close" onClick={()=>setOpen(false)}>×</button></div><div className="form-grid">
 <label>Title<input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Test Quiz"/></label>
 <label>Publish at (Unix ms)<input type="number" value={form.publishAtMs??""} onChange={e=>setForm({...form,publishAtMs:e.target.value?Number(e.target.value):null})}/></label>\n <label>Expire at (Unix ms)<input type="number" value={form.expireAtMs??""} onChange={e=>setForm({...form,expireAtMs:e.target.value?Number(e.target.value):null})}/></label>\n <label>Status<select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option value="draft">Draft</option><option value="published">Published</option></select></label>
 <label className="full-width">Description<textarea rows={2} value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label>
 <label>Board<select value={form.boardId} onChange={e=>setForm({...form,boardId:e.target.value})}><option value="">Optional</option>{(academic.boards??[]).map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
 <label>Class<select value={form.classId} onChange={e=>setForm({...form,classId:e.target.value})}><option value="">Optional</option>{(academic.classes??[]).map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
 <label>Subject<select value={form.subjectId} onChange={e=>setForm({...form,subjectId:e.target.value})}><option value="">Optional</option>{(academic.subjects??[]).map(x=><option key={x.id} value={x.id}>{x.name} {x.code?`(${x.code})`:""}</option>)}</select></label>
 <fieldset className="academic-fieldset full-width"><legend>Questions</legend>{questions.length===0?<p>No questions available.</p>:questions.map(q=><label key={q.id} className="multi-option"><input type="checkbox" checked={form.questionIds.includes(q.id)} onChange={()=>toggleQuestion(q.id)}/>{q.questionText}{q.active?"":" (Archived)"}</label>)}</fieldset>
 <label className="checkbox-row"><input type="checkbox" checked={form.active} onChange={e=>setForm({...form,active:e.target.checked})}/> Active</label>
 </div>{error&&<div className="academic-message error">{error}</div>}<div className="modal-actions"><button className="secondary-button" onClick={()=>setOpen(false)}>Cancel</button><button className="primary-button" disabled={saving} onClick={()=>void save()}>{saving?"Saving…":editing?"Save changes":"Create"}</button></div></section></div>}</main>
}