"use client";
import{useEffect,useState}from"react";
import{firebaseAuth}from"../../lib/firebase";

type Settings={
 appName:string;tagline:string;maintenanceMode:boolean;learnerRegistration:boolean;
 parentRegistration:boolean;teacherRegistration:boolean;communityEnabled:boolean;
 competitionsEnabled:boolean;premiumEnabled:boolean;dailyQuizId:string;weeklyQuizId:string;
 homeMissionTitle:string;homeMissionDescription:string;homeQuote:string;
};
const defaults:Settings={appName:"Skill Saga",tagline:"A smarter way to learn",maintenanceMode:false,learnerRegistration:true,parentRegistration:true,teacherRegistration:true,communityEnabled:true,competitionsEnabled:true,premiumEnabled:true,dailyQuizId:"",weeklyQuizId:"",homeMissionTitle:"Complete a quiz today",homeMissionDescription:"5 questions · Easy",homeQuote:"Small steps make big achievers!"};

export default function SystemSettingsManager(){
 const[settings,setSettings]=useState<Settings>(defaults),[quizzes,setQuizzes]=useState<any[]>([]),[loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[message,setMessage]=useState<string|null>(null),[error,setError]=useState<string|null>(null);
 async function call(action:string,data:any={}){
  const u=firebaseAuth.currentUser;if(!u)throw new Error("You are not authenticated.");
  const token=await u.getIdToken();
  const r=await fetch("/api/system-settings",{method:"POST",headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json"},body:JSON.stringify({action,data})});
  const p=await r.json();if(!r.ok)throw new Error(p.error?.message||"System settings request failed.");return p.data;
 }
 useEffect(()=>{(async()=>{try{const p=await call("getSystemSettings");setSettings({...defaults,...p.settings}); const q=await callQuizList(); setQuizzes(q);}catch(e){setError(e instanceof Error?e.message:"Unable to load system settings.");}finally{setLoading(false)}})()},[]);
 async function callQuizList(){const u=firebaseAuth.currentUser;if(!u)throw new Error("You are not authenticated.");const token=await u.getIdToken();const r=await fetch("/api/quiz-manager",{method:"POST",headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json"},body:JSON.stringify({action:"listQuizzes",data:{}}),cache:"no-store"});const p=await r.json();if(!r.ok)throw new Error(p.error?.message||"Unable to load quizzes.");return p.data?.items??[];}
 function toggle(key:keyof Settings){setSettings(s=>({...s,[key]:!s[key]}))}
 async function save(){setSaving(true);setMessage(null);setError(null);try{const p=await call("updateSystemSettings",{settings});setSettings({...defaults,...p.settings});setMessage("System settings saved successfully.");}catch(e){setError(e instanceof Error?e.message:"Unable to save system settings.");}finally{setSaving(false)}}
 if(loading)return <main className="academic-manager"><section className="academic-panel">Loading system settings…</section></main>;
 return <main className="academic-manager">
  <header className="academic-header"><div><span className="academic-eyebrow">SYSTEM SETTINGS</span><h1>System Settings</h1><p>Central platform controls. Changes are stored server-side.</p></div><button className="primary-button" onClick={save} disabled={saving}>{saving?"Saving…":"Save Changes"}</button></header>
  {message&&<div className="academic-message success">{message}</div>}{error&&<div className="academic-message error">{error}</div>}
  <section className="academic-panel"><div className="academic-panel-header"><div><h2>Platform Identity</h2><p>Basic application identity used across the platform.</p></div></div><div className="form-grid">
   <label>App Name<input value={settings.appName} onChange={e=>setSettings(s=>({...s,appName:e.target.value}))}/></label>
   <label>Tagline<input value={settings.tagline} onChange={e=>setSettings(s=>({...s,tagline:e.target.value}))}/></label>
  </div></section>
  <section className="academic-panel"><div className="academic-panel-header"><div><h2>Learner UI 2.0 Home Control</h2><p>Control what Skill Saga UI 2.0 displays on the learner Home screen.</p></div></div>
<div className="form-grid">
<label>Daily Quiz<select value={settings.dailyQuizId} onChange={e=>setSettings(s=>({...s,dailyQuizId:e.target.value}))}><option value="">No daily quiz selected</option>{quizzes.map(q=><option key={q.id} value={q.id}>{q.title} · {q.status}</option>)}</select></label>
<label>Weekly Quiz<select value={settings.weeklyQuizId} onChange={e=>setSettings(s=>({...s,weeklyQuizId:e.target.value}))}><option value="">No weekly quiz selected</option>{quizzes.map(q=><option key={q.id} value={q.id}>{q.title} · {q.status}</option>)}</select></label>
<label>Mission Title<input value={settings.homeMissionTitle} onChange={e=>setSettings(s=>({...s,homeMissionTitle:e.target.value}))}/></label>
<label>Mission Description<input value={settings.homeMissionDescription} onChange={e=>setSettings(s=>({...s,homeMissionDescription:e.target.value}))}/></label>
<label className="full-width">Home Quote<input value={settings.homeQuote} onChange={e=>setSettings(s=>({...s,homeQuote:e.target.value}))}/></label>
</div></section>
<section className="academic-panel"><div className="academic-panel-header"><div><h2>Platform Controls</h2><p>Enable or disable major platform capabilities.</p></div></div>
   {[
    ["maintenanceMode","Maintenance Mode","Temporarily place the platform into maintenance mode."],
    ["learnerRegistration","Learner Registration","Allow new learner accounts."],
    ["parentRegistration","Parent Registration","Allow new parent accounts."],
    ["teacherRegistration","Teacher Registration","Allow new teacher accounts."],
    ["communityEnabled","Community","Enable the learner community."],
    ["competitionsEnabled","Competitions","Enable quiz competitions."],
    ["premiumEnabled","Premium Features","Enable premium platform features."]
   ].map(([key,label,desc])=><div key={key} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 0",borderBottom:"1px solid rgba(255,255,255,.08)"}}><div><strong>{label}</strong><p className="muted">{desc}</p></div><button className={settings[key as keyof Settings]?"primary-button":"secondary-button"} onClick={()=>toggle(key as keyof Settings)}>{settings[key as keyof Settings]?"Enabled":"Disabled"}</button></div>)}
  </section>
 </main>
}
