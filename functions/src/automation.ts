import {getFirestore,FieldValue} from "firebase-admin/firestore";
import {onCall,HttpsError,type CallableRequest} from "firebase-functions/v2/https";
import {onSchedule} from "firebase-functions/v2/scheduler";
import type {Firestore} from "firebase-admin/firestore";
const ROLES=new Set(["super_admin","admin"]);
function auth(r:CallableRequest<unknown>){const uid=r.auth?.uid,role=r.auth?.token.role;if(!uid)throw new HttpsError("unauthenticated","Administrator authentication is required.");if(typeof role!=="string"||!ROLES.has(role))throw new HttpsError("permission-denied","You are not authorized to manage automation.");return{uid,role};}
const text=(v:unknown)=>typeof v==="string"?v.trim():"";
function validate(raw:any){const name=text(raw.name);if(!name)throw new HttpsError("invalid-argument","Automation name is required.");const type=text(raw.type).toLowerCase();if(!["daily_quiz","weekly_quiz","notification"].includes(type))throw new HttpsError("invalid-argument","Invalid automation type.");const action=text(raw.action);if(!action)throw new HttpsError("invalid-argument","Automation action is required.");const schedule=text(raw.schedule)||"daily";const enabled=Boolean(raw.enabled);return{name,type,action,schedule,enabled,active:raw.active===undefined?enabled:Boolean(raw.active)};}
function audit(uid:string,role:string,action:string,id:string){return{actorUid:uid,actorRole:role,action,collection:"automationRules",documentId:id,createdAt:FieldValue.serverTimestamp()};}
export const listAutomationRules=onCall(async r=>{auth(r);const s=await getFirestore().collection("automationRules").limit(500).get();const items=s.docs.map(d=>({id:d.id,...d.data()}));items.sort((a:any,b:any)=>String(a.name??"").localeCompare(String(b.name??"")));return{items};});
export const createAutomationRule=onCall(async r=>{const{uid,role}=auth(r);const data=validate((r.data as any)?.data??{});const db=getFirestore(),ref=db.collection("automationRules").doc();await ref.set({...data,createdBy:uid,updatedBy:uid,createdAt:FieldValue.serverTimestamp(),updatedAt:FieldValue.serverTimestamp()});await db.collection("auditLogs").doc().set(audit(uid,role,"CREATE",ref.id));return{id:ref.id};});
export const updateAutomationRule=onCall(async r=>{const{uid,role}=auth(r);const p=r.data as any,id=text(p?.id);if(!id)throw new HttpsError("invalid-argument","id is required.");const data=validate(p?.data??{});const db=getFirestore(),ref=db.collection("automationRules").doc(id);if(!(await ref.get()).exists)throw new HttpsError("not-found","Automation rule was not found.");await ref.update({...data,updatedBy:uid,updatedAt:FieldValue.serverTimestamp()});await db.collection("auditLogs").doc().set(audit(uid,role,"UPDATE",id));return{success:true};});
export const setAutomationEnabled=onCall(async r=>{const{uid,role}=auth(r);const p=r.data as any,id=text(p?.id);if(!id)throw new HttpsError("invalid-argument","id is required.");const enabled=Boolean(p?.enabled);const db=getFirestore(),ref=db.collection("automationRules").doc(id);if(!(await ref.get()).exists)throw new HttpsError("not-found","Automation rule was not found.");await ref.update({enabled,active:enabled,updatedBy:uid,updatedAt:FieldValue.serverTimestamp()});await db.collection("auditLogs").doc().set(audit(uid,role,enabled?"ENABLE":"DISABLE",id));return{success:true};});

function isDue(schedule:string, now:Date){
  const s=text(schedule).toLowerCase();
  if(s==="daily") return true;
  if(s==="weekly") return now.getUTCDay()===1;
  return false;
}

function runKey(schedule:string, now:Date){
  const s=text(schedule).toLowerCase();
  const day=now.toISOString().slice(0,10);
  if(s==="daily") return `daily:${day}`;
  if(s==="weekly"){
    const d=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate()));
    const dayNum=d.getUTCDay()||7;
    d.setUTCDate(d.getUTCDate()-dayNum+1);
    return `weekly:${d.toISOString().slice(0,10)}`;
  }
  return `${s}:${day}`;
}

async function claimRun(db:Firestore, ruleId:string, key:string){
  const ref=db.collection("automationLocks").doc(`${ruleId}__${key}`);
  let claimed=false;
  await db.runTransaction(async tx=>{
    const snap=await tx.get(ref);
    if(snap.exists) return;
    tx.create(ref,{ruleId,runKey:key,claimedAt:FieldValue.serverTimestamp()});
    claimed=true;
  });
  return claimed;
}

async function runQuizAutomation(db:any, rule:any){
  const type=text(rule.type).toLowerCase();
  const pattern=type==="daily_quiz"?/daily/i:/weekly/i;
  const targetId=text(rule.targetQuizId);
  if(targetId){
    const target=await db.collection("quizzes").doc(targetId).get();
    if(target.exists && target.data()?.active===true && target.data()?.status==="published"){
      await db.collection("systemSettings").doc("platform").set({[type==="daily_quiz"?"dailyQuizId":"weeklyQuizId"]:target.id},{merge:true});
      return {success:true,quizId:target.id};
    }
  }
  const snap=await db.collection("quizzes").where("active","==",true).where("status","==","published").limit(100).get();
  const now=Date.now();
  const quiz=snap.docs.map((d:any)=>({id:d.id,...d.data()})).find((x:any)=>{
    const publish=Number(x.publishAtMs), expire=Number(x.expireAtMs);
    return pattern.test(text(x.title)) && (!Number.isFinite(publish)||publish<=now) && (!Number.isFinite(expire)||expire>now);
  });
  if(!quiz) return {success:false,message:"No matching published quiz found."};
  const key=type==="daily_quiz"?"dailyQuizId":"weeklyQuizId";
  await db.collection("systemSettings").doc("platform").set({[key]:quiz.id}, {merge:true});
  return {success:true,quizId:quiz.id};
}

async function runNotificationAutomation(db:Firestore, rule:any){
  const ref=db.collection("notificationJobs").doc();
  await ref.set({ruleId:rule.id,type:"notification",action:text(rule.action),status:"queued",createdAt:FieldValue.serverTimestamp()});
  return {success:true,jobId:ref.id};
}

export const runAutomationEngine=onSchedule({schedule:"0 * * * *",timeZone:"Asia/Kolkata"},async()=>{
  const db=getFirestore();
  const snap=await db.collection("automationRules").where("active","==",true).where("enabled","==",true).limit(500).get();
  const now=new Date();
  for(const doc of snap.docs){
    const rule=doc.data();
    if(!isDue(text(rule.schedule),now)) continue;
    const key=runKey(text(rule.schedule),now);
    if(!(await claimRun(db,doc.id,key))) continue;
    const type=text(rule.type).toLowerCase();
    let result:any;
    try {
      if(type==="daily_quiz"||type==="weekly_quiz") result=await runQuizAutomation(db,{id:doc.id,...rule});
      else if(type==="notification") result=await runNotificationAutomation(db,{id:doc.id,...rule});
      else continue;
    } catch(error:any) {
      result={success:false,message:error?.message??"Automation action failed."};
    }
    await db.collection("automationRuns").doc().set({ruleId:doc.id,type,success:result.success,message:result.message??null,targetId:result.quizId??result.jobId??null,ranAt:FieldValue.serverTimestamp(),runKey:key});
  }
});


export const runAutomationEngineNow=onCall(async r=>{
  auth(r);
  const db=getFirestore();
  const snap=await db.collection("automationRules").where("active","==",true).where("enabled","==",true).limit(500).get();
  const now=new Date();
  const results:any[]=[];
  for(const doc of snap.docs){
    const rule=doc.data();
    if(!isDue(text(rule.schedule),now)) continue;
    const key=runKey(text(rule.schedule),now);
    if(!(await claimRun(db,doc.id,key))) {
      results.push({ruleId:doc.id,skipped:true,reason:"Already run for this schedule period."});
      continue;
    }
    const type=text(rule.type).toLowerCase();
    let result:any;
    try {
      if(type==="daily_quiz"||type==="weekly_quiz") result=await runQuizAutomation(db,{id:doc.id,...rule});
      else if(type==="notification") result=await runNotificationAutomation(db,{id:doc.id,...rule});
      else continue;
    } catch(error:any) {
      result={success:false,message:error?.message??"Automation action failed."};
    }
    await db.collection("automationRuns").doc().set({ruleId:doc.id,type,success:result.success,message:result.message??null,targetId:result.quizId??result.jobId??null,ranAt:FieldValue.serverTimestamp(),runKey:key});
    results.push({ruleId:doc.id,...result});
  }
  return {success:true,results};
});
