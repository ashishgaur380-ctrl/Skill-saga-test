"use client";
import {useEffect,useState} from "react";
import {onAuthStateChanged} from "firebase/auth";
import {learnerAuth} from "../../lib/firebase";
import {learnerFunction} from "../../lib/learner-api";
import LearnerNav from "../components/LearnerNav";
const APP_BASE=process.env.NEXT_PUBLIC_GITHUB_PAGES==="true"?"/Skill-saga-test":"";
export default function Notifications(){
 const[items,setItems]=useState<any[]>([]),[token,setToken]=useState(""),[error,setError]=useState(""),[loading,setLoading]=useState(true);
 useEffect(()=>onAuthStateChanged(learnerAuth,async u=>{if(!u){window.location.href=APP_BASE+"/login/";return}try{const t=await u.getIdToken(true);setToken(t);const x=await learnerFunction("listRecipientNotifications",{},t);setItems(x?.items||[])}catch(e){setError(e instanceof Error?e.message:"Unable to load notifications.")}finally{setLoading(false)}}),[]);
 async function read(id:string){if(!token)return;try{await learnerFunction("markRecipientNotificationRead",{id},token);setItems(a=>a.map(x=>x.id===id?{...x,readAt:new Date().toISOString()}:x))}catch(e){setError(e instanceof Error?e.message:"Unable to update notification.")}}
 return <div className="ss-app"><header className="ss-inner-header"><a href={APP_BASE+"/"}>‹</a><div><b>Notifications</b><small>Stay updated on your learning journey</small></div><span>🔔</span></header><main className="ss-page"><div className="ss-heading"><b>Your updates</b><span>{items.filter(x=>!x.readAt).length} unread</span></div>{loading&&<div className="ss-message">Loading notifications…</div>}{error&&<div className="ss-message error">{error}</div>}<div className="ss-notification-list">{!loading&&items.length?items.map(x=><div key={x.id} className={"ss-notification "+(!x.readAt?"unread":"")} onClick={()=>void read(x.id)}><span>🔔</span><div><b>{x.title||"Skill Saga update"}</b><p>{x.message||""}</p><small>{x.createdAt?.seconds?new Date(x.createdAt.seconds*1000).toLocaleString():"New"}</small></div></div>):!loading&&!error?<div className="ss-empty"><strong>No notifications yet</strong><span>Important Skill Saga updates will appear here.</span></div>:null}</div></main><LearnerNav active="Home"/></div>
}