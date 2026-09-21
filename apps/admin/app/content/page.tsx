"use client";

import { firebaseAuth, firebaseStorage } from "../../lib/firebase";
import { getDownloadURL, listAll, ref as storageRef, uploadBytesResumable } from "firebase/storage";
import { useEffect, useState } from "react";

declare global { interface Window { XLSX?: any } }

type A={id:string;name:string};
type M={id?:string;title:string;description:string;type:string;boardId:string;classId:string;subjectId:string;chapterId:string;topicId:string;language:string;accessType:string;status:string;fileUrl:string;thumbnailUrl:string;publishAtMs?:number|null;expireAtMs?:number|null};
const blank:M={title:"",description:"",type:"pdf",boardId:"",classId:"",subjectId:"",chapterId:"",topicId:"",language:"English",accessType:"free",status:"draft",fileUrl:"",thumbnailUrl:""};

async function call(action:string,data:any={},token=""){const r=await fetch("/api/content",{method:"POST",headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json"},body:JSON.stringify({action,data}),cache:"no-store"});const p=await r.json();if(!r.ok)throw new Error(p?.error?.message||"Request failed");return p?.data??p;}
async function academic(collection:string,token:string,parentId=""){const r=await fetch("/api/academic",{method:"POST",headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json"},body:JSON.stringify({action:"listAcademic",data:{collection,parentId}})});const p=await r.json();if(!r.ok)throw new Error(p?.error?.message||"Academic request failed");return p?.data?.items||[];}

function parseCsv(text:string){
  const rows:string[][]=[]; let row:string[]=[], cell="", quoted=false;
  for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}else if(c===","&&!quoted){row.push(cell.trim());cell="";}else if((c==="\n"||c==="\r")&&!quoted){if(c==="\r"&&text[i+1]==="\n")i++;row.push(cell.trim());cell="";if(row.some(Boolean))rows.push(row);row=[];}else cell+=c;}
  if(cell||row.length){row.push(cell.trim());if(row.some(Boolean))rows.push(row);}
  return rows;
}
async function loadXlsx(){if(window.XLSX)return window.XLSX;await new Promise<void>((resolve,reject)=>{const s=document.createElement("script");s.src="https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js";s.onload=()=>resolve();s.onerror=()=>reject(new Error("Unable to load Excel parser."));document.head.appendChild(s);});return window.XLSX;}
function key(v:string){return v.toLowerCase().replace(/[^a-z0-9]+/g,"");}
async function listStorageFiles(prefix:string,out:any[]=[]){
  const r=await listAll(storageRef(firebaseStorage,prefix));
  out.push(...r.items);
  for(const p of r.prefixes) await listStorageFiles(p.fullPath,out);
  return out;
}
function academicId(list:A[],value:any){const s=String(value??"").trim();if(!s)return "";return list.find(x=>x.id===s||key(x.name)===key(s))?.id||"";}
function materialFileKey(title:string){return key(title.replace(/\s*-\s*Study Material$/i,"").replace(/\s*-\s*Practice Quiz$/i,""));}
function storageFileKey(path:string){
  let n=path.split("/").pop()||"";
  n=n.replace(/\.(pdf|docx?|pptx?|xlsx?|csv|txt|mp4|webm|jpe?g|png|gif|mp3|wav)$/i,"");
  n=n.replace(/^class\d+_[^_]+_\d+_/i,"");
  n=n.replace(/_study_material$/i,"").replace(/_quiz$/i,"");
  return key(n);
}


export default function ContentPage(){
 const [items,setItems]=useState<M[]>([]),[form,setForm]=useState<M>(blank),[token,setToken]=useState(""),[editing,setEditing]=useState<string|null>(null),[msg,setMsg]=useState("");
 const [boards,setBoards]=useState<A[]>([]),[classes,setClasses]=useState<A[]>([]),[subjects,setSubjects]=useState<A[]>([]),[chapters,setChapters]=useState<A[]>([]),[topics,setTopics]=useState<A[]>([]);
 const [file,setFile]=useState<File|null>(null),[bulkFile,setBulkFile]=useState<File|null>(null),[busy,setBusy]=useState(false);

 useEffect(()=>{(async()=>{const u=firebaseAuth.currentUser;if(!u){setMsg("You are not authenticated.");return;}try{const t=await u.getIdToken();setToken(t);const [x,b,c,s]=await Promise.all([call("listLearningMaterials",{},t),academic("boards",t),academic("classes",t),academic("subjects",t)]);setItems(x.items||[]);setBoards(b);setClasses(c);setSubjects(s);}catch(e:any){setMsg(e.message)}})()},[]);
 const set=(k:keyof M,v:any)=>setForm(x=>({...x,[k]:v}));

 async function uploadFile(){
   const u=firebaseAuth.currentUser;
   if(!u){setMsg("Your admin session has expired. Sign in again.");return;}
   if(!file){setMsg("Choose a file first.");return;}
   setBusy(true);setMsg("Uploading file…");
   try{
     await u.getIdToken(true);
     const safe=file.name.replace(/[^a-zA-Z0-9._-]/g,"_");
     const objectRef=storageRef(firebaseStorage,"learning-materials/"+u.uid+"/"+Date.now()+"_"+safe);
     const metadata={contentType:file.type||"application/octet-stream",cacheControl:"public,max-age=3600"};
     const task=uploadBytesResumable(objectRef,file,metadata);
     const snap=await new Promise<any>((resolve,reject)=>{
       task.on("state_changed",
         state=>setMsg("Uploading file… "+Math.round((state.bytesTransferred/state.totalBytes)*100)+"%"),
         err=>reject(err),
         ()=>resolve(task.snapshot)
       );
     });
     const url=await getDownloadURL(snap.ref);
     set("fileUrl",url);
     setMsg("File uploaded successfully. Save the content record now.");
   }catch(e:any){
     const code=e?.code||"";
     const detail=e?.message||"Upload failed.";
     const hints:Record<string,string>={
       "storage/unauthorized":"Firebase Storage denied this upload. Confirm you are signed in and Storage Rules allow authenticated writes.",
       "storage/unauthenticated":"Your Firebase login session is not authenticated. Sign in again and retry.",
       "storage/retry-limit-exceeded":"Firebase Storage timed out. Check your network and retry.",
       "storage/canceled":"Upload was canceled.",
       "storage/quota-exceeded":"Firebase Storage quota/billing prevented the upload."
     };
     setMsg(hints[code]||("Upload failed ["+(code||"unknown")+"]: "+detail));
   }finally{setBusy(false);}
 }

 async function save(){
   try{setBusy(true);setMsg("Saving…");
     const data={...form,publishAtMs:form.publishAtMs?Number(form.publishAtMs):null,expireAtMs:form.expireAtMs?Number(form.expireAtMs):null};
     if(editing)await call("updateLearningMaterial",{id:editing,data},token);else await call("createLearningMaterial",data,token);
     const x=await call("listLearningMaterials",{},token);setItems(x.items||[]);setForm({...blank});setFile(null);setEditing(null);setMsg("Saved.");
   }catch(e:any){setMsg(e.message)}finally{setBusy(false);}
 }
 async function archive(id:string){if(!window.confirm("Archive this content? It will remain available for historical use."))return;try{await call("archiveLearningMaterial",{id},token);setItems(x=>x.map(i=>i.id===id?{...i,status:"archived"}:i));setMsg("Content archived.");}catch(e:any){setMsg(e.message)}}
 async function remove(id:string,title:string){if(!window.confirm(`Permanently delete "${title}"? This removes the content record and explicitly linked Storage files. This cannot be undone.`))return;try{const result=await call("deleteLearningMaterial",{id},token);setItems(x=>x.filter(i=>i.id!==id));setMsg(`Content deleted. Storage objects removed: ${result.storageObjectsDeleted??0}.`);}catch(e:any){setMsg(e.message)}}

 async function selectBoard(id:string){set("boardId",id);set("classId","");set("subjectId","");set("chapterId","");set("topicId","");setChapters([]);setTopics([]);try{const s=await academic("subjects",token);setSubjects(s.filter((x:A)=>(!id||(x as any).boardIds?.includes(id))));}catch(e:any){setMsg(e.message)}}
 async function selectClass(id:string){set("classId",id);set("subjectId","");set("chapterId","");set("topicId","");setChapters([]);setTopics([]);try{const s=await academic("subjects",token);setSubjects(s.filter((x:A)=>(!form.boardId||(x as any).boardIds?.includes(form.boardId))&&(!id||(x as any).classIds?.includes(id))));}catch(e:any){setMsg(e.message)}}
 async function selectSubject(id:string){set("subjectId",id);set("chapterId","");set("topicId","");setTopics([]);try{const x=await academic("chapters",token);setChapters(x.filter((v:A)=>(v as any).subjectId===id));}catch(e:any){setMsg(e.message)}}
 async function selectChapter(id:string){set("chapterId",id);set("topicId","");try{const x=await academic("topics",token);setTopics(x.filter((v:A)=>(v as any).chapterId===id));}catch(e:any){setMsg(e.message)}}

 async function bulkImport(){
   if(!bulkFile)return;
   setBusy(true);setMsg("Reading bulk file and mapping academic content…");
   try{
     let rows:any[]=[];
     if(bulkFile.name.toLowerCase().endsWith(".csv")||bulkFile.name.toLowerCase().endsWith(".txt")){
       const matrix=parseCsv(await bulkFile.text());if(!matrix.length)throw new Error("The CSV is empty.");
       const headers=matrix[0].map(x=>x.trim().toLowerCase().replace(/\s+/g,""));
       rows=matrix.slice(1).filter(r=>r.some(Boolean)).map(r=>Object.fromEntries(headers.map((h,i)=>[h,r[i]??""])));
     }else if(bulkFile.name.toLowerCase().endsWith(".xlsx")||bulkFile.name.toLowerCase().endsWith(".xls")){
       const XLSX=await loadXlsx();const wb=XLSX.read(await bulkFile.arrayBuffer(),{type:"array"});const sheet=wb.Sheets[wb.SheetNames[0]];rows=XLSX.utils.sheet_to_json(sheet,{defval:""});
     }else throw new Error("Use CSV, XLSX or XLS.");
     if(rows.length>500)throw new Error("Maximum 500 rows per import.");
     if(rows.some(x=>!x.title))throw new Error("Every row must have a title.");

     // Resolve human-readable Board/Class/Subject/Chapter/Topic names to the real Firestore IDs.
     const [allBoards,allClasses,allSubjects,allChapters,allTopics]=await Promise.all([
       academic("boards",token),academic("classes",token),academic("subjects",token),
       academic("chapters",token),academic("topics",token)
     ]);

     // Index existing Storage files once. Files placed anywhere below learning-materials/ can be matched by title.
     const storageFiles=await listStorageFiles("learning-materials");
     const normalize=(r:any)=>{
       const boardId=academicId(allBoards,r.boardid||r.boardId||r.board);
       const classId=academicId(allClasses,r.classid||r.classId||r.class);
       const subjectPool=allSubjects.filter((x:any)=>(!boardId||x.boardIds?.includes(boardId))&&(!classId||x.classIds?.includes(classId)));
       const subjectId=academicId(subjectPool.length?subjectPool:allSubjects,r.subjectid||r.subjectId||r.subject);
       const chapterPool=allChapters.filter((x:any)=>!subjectId||x.subjectId===subjectId);
       const chapterId=academicId(chapterPool.length?chapterPool:allChapters,r.chapterid||r.chapterId||r.chapter);
       const topicPool=allTopics.filter((x:any)=>!chapterId||x.chapterId===chapterId);
       const topicId=academicId(topicPool.length?topicPool:allTopics,r.topicid||r.topicId||r.topic);

       if((r.board||r.boardId)&&!boardId)throw new Error("Board not found: "+r.board);
       if((r.class||r.classId)&&!classId)throw new Error("Class not found: "+r.class);
       if((r.subject||r.subjectId)&&!subjectId)throw new Error("Subject not found: "+r.subject);
       if((r.chapter||r.chapterId)&&!chapterId)throw new Error("Chapter not found: "+r.chapter);
       if((r.topic||r.topicId)&&!topicId)throw new Error("Topic not found: "+r.topic);

       let fileUrl=r.fileurl||r.fileUrl||"";
       let storagePath=r.storagepath||r.storagePath||"";
       if(!fileUrl && storagePath){
         const match=storageFiles.find((x:any)=>x.fullPath===storagePath);
         if(!match)throw new Error("Storage file not found: "+storagePath);
         storagePath=match.fullPath; fileUrl="__RESOLVE__";
       }
       if(!fileUrl){
         const wanted=materialFileKey(r.title||"");
         const match=storageFiles.find((x:any)=>{
           const fk=storageFileKey(x.fullPath);
           return fk===wanted;
         });
         if(match){storagePath=match.fullPath;fileUrl="__RESOLVE__";}
       }
       return {title:r.title||"",description:r.description||"",type:(r.type||"pdf").toLowerCase(),boardId,classId,subjectId,chapterId,topicId,language:r.language||"English",accessType:r.accesstype||r.accessType||r.access||"free",status:r.status||"draft",fileUrl,storagePath,thumbnailUrl:r.thumbnailurl||r.thumbnailUrl||"",publishAtMs:r.publishatms||r.publishAtMs||null,expireAtMs:r.expireatms||r.expireAtMs||null};
     };

     const payload=rows.map((r,i)=>{try{return normalize(r);}catch(e:any){throw new Error(`Row ${i+1}: ${e.message||"mapping failed"}`);}});
     for(const item of payload){
       if(item.fileUrl==="__RESOLVE__"&&item.storagePath){
         item.fileUrl=await getDownloadURL(storageRef(firebaseStorage,item.storagePath));
       }
     }
     const result=await call("bulkCreateLearningMaterials",{rows:payload},token);
     setMsg(`Imported ${result.created||payload.length} learning materials with academic mapping and Storage links.`);
     const x=await call("listLearningMaterials",{},token);setItems(x.items||[]);setBulkFile(null);
   }catch(e:any){setMsg(e.message||"Bulk import failed.")}finally{setBusy(false);}
 }

 return <main className="shell"><aside className="sidebar"><div className="brand">Skill Saga</div><div className="brand-subtitle">Admin Console</div><nav><a className="nav-item" href="/">Dashboard</a><a className="nav-item" href="/academic">Academic Structure</a><a className="nav-item" href="/content">Content</a><a className="nav-item" href="/question-bank">Question Bank</a></nav></aside><section className="content">
 <header className="topbar"><div><p className="eyebrow">CONTENT</p><h1>Learning Content Manager</h1><p className="muted">Upload, map, schedule and publish content for Skill Saga UI 2.0.</p></div></header>

 <section className="panel"><h2>Bulk Import</h2><p className="muted">CSV/XLSX/XLS · up to 500 rows. The importer resolves Board → Class → Subject → Chapter → Topic names to the academic IDs automatically. If <b>fileUrl</b> is blank, it also auto-matches a file already uploaded anywhere under <b>learning-materials/</b> by its filename/title.</p><div className="actions"><input type="file" accept=".csv,.xlsx,.xls,.txt" onChange={e=>setBulkFile(e.target.files?.[0]||null)}/><button disabled={!bulkFile||busy} onClick={()=>void bulkImport()}>{busy?"Processing…":"Import Content"}</button></div></section>

 <section className="panel"><h2>{editing?"Edit content":"Add learning content"}</h2><div className="grid">
 <label>Title<input value={form.title} onChange={e=>set("title",e.target.value)}/></label><label>Description<input value={form.description} onChange={e=>set("description",e.target.value)}/></label>
 <label>Type<select value={form.type} onChange={e=>set("type",e.target.value)}><option value="pdf">PDF / Notes</option><option value="video">Video</option><option value="article">Article / Text</option><option value="link">External Link</option><option value="image">Image</option><option value="audio">Audio</option><option value="worksheet">Worksheet</option><option value="presentation">Presentation</option></select></label>
 <label>Board<select value={form.boardId} onChange={e=>void selectBoard(e.target.value)}><option value="">All boards</option>{boards.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
 <label>Class<select value={form.classId} onChange={e=>void selectClass(e.target.value)}><option value="">All classes</option>{classes.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
 <label>Subject<select disabled={!form.boardId||!form.classId} value={form.subjectId} onChange={e=>void selectSubject(e.target.value)}><option value="">All subjects</option>{subjects.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
 <label>Chapter<select disabled={!form.subjectId} value={form.chapterId} onChange={e=>void selectChapter(e.target.value)}><option value="">All chapters</option>{chapters.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
 <label>Topic<select disabled={!form.chapterId} value={form.topicId} onChange={e=>set("topicId",e.target.value)}><option value="">All topics</option>{topics.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
 <label>Language<input value={form.language} onChange={e=>set("language",e.target.value)}/></label><label>Access<select value={form.accessType} onChange={e=>set("accessType",e.target.value)}><option>free</option><option>premium</option><option>assigned</option></select></label>
 <label>Status<select value={form.status} onChange={e=>set("status",e.target.value)}><option>draft</option><option>published</option><option>archived</option></select></label>
 <label className="full-width">File<input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,video/*,image/*,audio/*" onChange={e=>setFile(e.target.files?.[0]||null)}/><div className="actions"><button type="button" disabled={!file||busy} onClick={()=>void uploadFile()}>{busy?"Uploading…":"Upload to Firebase Storage"}</button></div><small>{form.fileUrl?"Uploaded file linked to this content.":"No file uploaded yet."}</small></label>
 <label>File URL<input value={form.fileUrl} onChange={e=>set("fileUrl",e.target.value)}/></label>
 <label>Publish at Unix ms<input type="number" value={form.publishAtMs??""} onChange={e=>set("publishAtMs",e.target.value)}/></label><label>Expire at Unix ms<input type="number" value={form.expireAtMs??""} onChange={e=>set("expireAtMs",e.target.value)}/></label>
 </div><div className="actions"><button disabled={busy} onClick={()=>void save()}>{editing?"Update":"Create"}</button>{editing&&<button onClick={()=>{setEditing(null);setForm({...blank});setFile(null)}}>Cancel</button>}<span>{msg}</span></div></section>

 <section className="panel"><h2>Content library</h2>{items.map(i=><article className="panel" key={i.id}><strong>{i.title}</strong><p>{i.type} · {i.status} · {i.boardId||"All boards"} · {i.classId||"All classes"} · {i.subjectId||"All subjects"}</p><p>{i.description}</p>{i.fileUrl&&<a href={i.fileUrl} target="_blank" rel="noreferrer">Open file</a>}{" "}<button onClick={()=>{setEditing(i.id!);setForm(i)}}>Edit</button>{" "}<button onClick={()=>void archive(i.id!)}>Archive</button>{" "}<button onClick={()=>void remove(i.id!,i.title)}>Delete</button></article>)}</section>
 </section></main>;
}
