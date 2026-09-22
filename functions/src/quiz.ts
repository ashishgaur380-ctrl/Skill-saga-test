import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { onCall, HttpsError, type CallableRequest } from "firebase-functions/v2/https";

const ROLES = new Set(["super_admin","admin","content_manager"]);

function auth(request: CallableRequest<unknown>) {
  const uid = request.auth?.uid;
  const role = request.auth?.token.role;
  if (!uid) throw new HttpsError("unauthenticated","Administrator authentication is required.");
  if (typeof role !== "string" || !ROLES.has(role)) throw new HttpsError("permission-denied","You are not authorized to manage quizzes.");
  return {uid,role};
}
const text=(v:unknown)=>typeof v==="string"?v.trim():"";

function validate(raw:any) {
  const title=text(raw.title);
  if(!title) throw new HttpsError("invalid-argument","Quiz title is required.");
  const questionIds=Array.isArray(raw.questionIds)?raw.questionIds.filter((x:any)=>text(x)):[];
  if(!questionIds.length) throw new HttpsError("invalid-argument","At least one question is required.");
  const status=text(raw.status).toLowerCase()||"draft";
  const quizType=text(raw.quizType).toUpperCase()||"ACADEMIC";
  if(!["ACADEMIC","SKILL","OTHER"].includes(quizType)) throw new HttpsError("invalid-argument","Invalid quiz type.");
  const accessMode=text(raw.accessMode).toUpperCase()||"FREE";
  if(!["FREE","XP_UNLOCK","COIN_UNLOCK","PREMIUM","ASSIGNED"].includes(accessMode)) throw new HttpsError("invalid-argument","Invalid quiz access mode.");
  const requiredXp=Math.max(0,Number(raw.requiredXp)||0);
  const requiredCoins=Math.max(0,Number(raw.requiredCoins)||0);

  if(!["draft","published"].includes(status)) throw new HttpsError("invalid-argument","Status must be Draft or Published.");
  const chapterId=text(raw.chapterId), topicId=text(raw.topicId), skillCategoryId=text(raw.skillCategoryId), skillId=text(raw.skillId);
  if(status==="published") {
    if(quizType==="ACADEMIC" && (!text(raw.boardId)||!text(raw.classId)||!text(raw.subjectId)||!chapterId||!topicId)) throw new HttpsError("failed-precondition","Published academic quizzes require Board, Class, Subject, Chapter and Topic.");
    if(quizType==="SKILL" && (!skillCategoryId||!skillId)) throw new HttpsError("failed-precondition","Published skill quizzes require Skill Category and Skill.");
  }
  const publishAtMs = raw.publishAtMs == null || raw.publishAtMs === "" ? null : Number(raw.publishAtMs);
  const expireAtMs = raw.expireAtMs == null || raw.expireAtMs === "" ? null : Number(raw.expireAtMs);
  if (publishAtMs !== null && !Number.isFinite(publishAtMs)) throw new HttpsError("invalid-argument","publishAtMs must be a valid timestamp.");
  if (expireAtMs !== null && !Number.isFinite(expireAtMs)) throw new HttpsError("invalid-argument","expireAtMs must be a valid timestamp.");
  if (publishAtMs !== null && expireAtMs !== null && expireAtMs <= publishAtMs) throw new HttpsError("invalid-argument","expireAtMs must be later than publishAtMs.");
  return {
    title, description:text(raw.description), quizType, chapterId, topicId, skillCategoryId, skillId, otherCategory:text(raw.otherCategory), otherTopic:text(raw.otherTopic), questionIds:[...new Set(questionIds.map(text))] as string[],
    boardId:text(raw.boardId), classId:text(raw.classId), subjectId:text(raw.subjectId),
    accessMode, requiredXp, requiredCoins, premiumRequired:accessMode==="PREMIUM", assignedOnly:accessMode==="ASSIGNED",
    publishAtMs, expireAtMs, status, active:raw.active===undefined?true:Boolean(raw.active)
  };
}
async function ensureQuestions(ids:string[], published:boolean, data:any) {
  const db=getFirestore();
  if(published){
    if(data.quizType==="ACADEMIC"){
      const refs=[["boards",data.boardId],["classes",data.classId],["subjects",data.subjectId],["chapters",data.chapterId],["topics",data.topicId]] as const;
      for(const [collection,id] of refs){const s=await db.collection(collection).doc(id).get(); if(!s.exists||s.data()?.active!==true) throw new HttpsError("failed-precondition",`Referenced ${collection} record is missing or inactive.`);}
    }
    if(data.quizType==="SKILL"){
      const refs=[["skillCategories",data.skillCategoryId],["skills",data.skillId]] as const;
      for(const [collection,id] of refs){const s=await db.collection(collection).doc(id).get(); if(!s.exists||s.data()?.active!==true) throw new HttpsError("failed-precondition",`Referenced ${collection} record is missing or inactive.`);}
    }
  }
  for(const id of ids) {
    const snap=await db.collection("questions").doc(id).get();
    if(!snap.exists) throw new HttpsError("not-found",`Question ${id} was not found.`);
    if(published && (snap.data()?.active !== true || snap.data()?.status !== "published")) throw new HttpsError("failed-precondition","Published quizzes can only contain active published questions.");
  }
}
function audit(uid:string,role:string,action:string,id:string){
  return {actorUid:uid,actorRole:role,action,collection:"quizzes",documentId:id,createdAt:FieldValue.serverTimestamp()};
}
export const listQuizzes=onCall({ invoker: "public" }, async request=>{
  auth(request);
  const snap=await getFirestore().collection("quizzes").limit(500).get();
  const items=snap.docs.map(d=>({id:d.id,...d.data()}));
  items.sort((a:any,b:any)=>String(a.title??"").localeCompare(String(b.title??"")));
  return {items};
});
export const createQuiz=onCall({ invoker: "public" }, async request=>{
  const {uid,role}=auth(request); const data=validate((request.data as any)?.data??{});
  await ensureQuestions(data.questionIds,data.status==="published",data);
  const db=getFirestore(); const ref=db.collection("quizzes").doc();
  await ref.set({...data,createdBy:uid,updatedBy:uid,createdAt:FieldValue.serverTimestamp(),updatedAt:FieldValue.serverTimestamp()});
  await db.collection("auditLogs").doc().set(audit(uid,role,"CREATE",ref.id));
  return {id:ref.id};
});
export const updateQuiz=onCall({ invoker: "public" }, async request=>{
  const {uid,role}=auth(request); const p=request.data as any; const id=text(p?.id);
  if(!id) throw new HttpsError("invalid-argument","id is required.");
  const data=validate(p?.data??{}); await ensureQuestions(data.questionIds,data.status==="published",data);
  const db=getFirestore(); const ref=db.collection("quizzes").doc(id);
  if(!(await ref.get()).exists) throw new HttpsError("not-found","Quiz was not found.");
  await ref.update({...data,updatedBy:uid,updatedAt:FieldValue.serverTimestamp()});
  await db.collection("auditLogs").doc().set(audit(uid,role,"UPDATE",id));
  return {success:true};
});
export const archiveQuiz=onCall({ invoker: "public" }, async request=>{
  const {uid,role}=auth(request); const id=text((request.data as any)?.id);
  if(!id) throw new HttpsError("invalid-argument","id is required.");
  const db=getFirestore(); const ref=db.collection("quizzes").doc(id);
  if(!(await ref.get()).exists) throw new HttpsError("not-found","Quiz was not found.");
  await ref.update({active:false,status:"draft",updatedBy:uid,updatedAt:FieldValue.serverTimestamp()});
  await db.collection("auditLogs").doc().set(audit(uid,role,"ARCHIVE",id));
  return {success:true};
});