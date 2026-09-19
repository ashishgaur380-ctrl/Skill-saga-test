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
  if(!["draft","published"].includes(status)) throw new HttpsError("invalid-argument","Status must be Draft or Published.");
  return {
    title, description:text(raw.description), questionIds:[...new Set(questionIds.map(text))],
    boardId:text(raw.boardId), classId:text(raw.classId), subjectId:text(raw.subjectId),
    status, active:raw.active===undefined?true:Boolean(raw.active)
  };
}
async function ensureQuestions(ids:string[], published:boolean) {
  const db=getFirestore();
  for(const id of ids) {
    const snap=await db.collection("questions").doc(id).get();
    if(!snap.exists) throw new HttpsError("not-found",`Question ${id} was not found.`);
    if(published && snap.data()?.active !== true) throw new HttpsError("failed-precondition","Published quizzes can only contain active questions.");
  }
}
function audit(uid:string,role:string,action:string,id:string){
  return {actorUid:uid,actorRole:role,action,collection:"quizzes",documentId:id,createdAt:FieldValue.serverTimestamp()};
}
export const listQuizzes=onCall(async request=>{
  auth(request);
  const snap=await getFirestore().collection("quizzes").limit(500).get();
  const items=snap.docs.map(d=>({id:d.id,...d.data()}));
  items.sort((a:any,b:any)=>String(a.title??"").localeCompare(String(b.title??"")));
  return {items};
});
export const createQuiz=onCall(async request=>{
  const {uid,role}=auth(request); const data=validate((request.data as any)?.data??{});
  await ensureQuestions(data.questionIds,false);
  const db=getFirestore(); const ref=db.collection("quizzes").doc();
  await ref.set({...data,createdBy:uid,updatedBy:uid,createdAt:FieldValue.serverTimestamp(),updatedAt:FieldValue.serverTimestamp()});
  await db.collection("auditLogs").doc().set(audit(uid,role,"CREATE",ref.id));
  return {id:ref.id};
});
export const updateQuiz=onCall(async request=>{
  const {uid,role}=auth(request); const p=request.data as any; const id=text(p?.id);
  if(!id) throw new HttpsError("invalid-argument","id is required.");
  const data=validate(p?.data??{}); await ensureQuestions(data.questionIds,data.status==="published");
  const db=getFirestore(); const ref=db.collection("quizzes").doc(id);
  if(!(await ref.get()).exists) throw new HttpsError("not-found","Quiz was not found.");
  await ref.update({...data,updatedBy:uid,updatedAt:FieldValue.serverTimestamp()});
  await db.collection("auditLogs").doc().set(audit(uid,role,"UPDATE",id));
  return {success:true};
});
export const archiveQuiz=onCall(async request=>{
  const {uid,role}=auth(request); const id=text((request.data as any)?.id);
  if(!id) throw new HttpsError("invalid-argument","id is required.");
  const db=getFirestore(); const ref=db.collection("quizzes").doc(id);
  if(!(await ref.get()).exists) throw new HttpsError("not-found","Quiz was not found.");
  await ref.update({active:false,status:"draft",updatedBy:uid,updatedAt:FieldValue.serverTimestamp()});
  await db.collection("auditLogs").doc().set(audit(uid,role,"ARCHIVE",id));
  return {success:true};
});