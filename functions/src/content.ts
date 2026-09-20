import {getFirestore,FieldValue} from "firebase-admin/firestore";
import {onCall,HttpsError,type CallableRequest} from "firebase-functions/v2/https";
const roles=new Set(["admin","super_admin","content_manager"]);
function auth(r:CallableRequest<unknown>){const uid=r.auth?.uid,role=r.auth?.token.role;if(!uid||typeof role!=="string"||!roles.has(role))throw new HttpsError("permission-denied","Content manager access required.");return{uid,role};}
const text=(v:unknown)=>typeof v==="string"?v.trim():"";
const num=(v:unknown)=>{const n=Number(v);return Number.isFinite(n)?n:null;};
function clean(x:any){return {id:x.id,title:text(x.title),description:text(x.description),type:text(x.type)||"pdf",boardId:text(x.boardId),classId:text(x.classId),subjectId:text(x.subjectId),chapterId:text(x.chapterId),topicId:text(x.topicId),language:text(x.language)||"English",difficulty:text(x.difficulty),tags:Array.isArray(x.tags)?x.tags:[],accessType:text(x.accessType)||"free",status:text(x.status)||"draft",fileUrl:text(x.fileUrl),thumbnailUrl:text(x.thumbnailUrl),publishAtMs:num(x.publishAtMs??x.scheduledAtMs),expireAtMs:num(x.expireAtMs),createdBy:text(x.createdBy),createdAt:x.createdAt??null,updatedAt:x.updatedAt??null};}
function validate(d:any){if(!text(d.title))throw new HttpsError("invalid-argument","Title is required.");if(!["pdf","video","article","link"].includes(text(d.type)||"pdf"))throw new HttpsError("invalid-argument","Invalid content type.");const p=num(d.publishAtMs??d.scheduledAtMs),e=num(d.expireAtMs);if(p!==null&&e!==null&&e<=p)throw new HttpsError("invalid-argument","Expiry must be after publish time.");}
export const listLearningMaterials=onCall(async r=>{auth(r);const s=await getFirestore().collection("learningMaterials").orderBy("updatedAt","desc").limit(500).get();return {items:s.docs.map(d=>clean({...d.data(),id:d.id}))};});
export const createLearningMaterial=onCall(async r=>{const {uid}=auth(r);const d:any=r.data||{};validate(d);const ref=getFirestore().collection("learningMaterials").doc();const now=FieldValue.serverTimestamp();await ref.set({...d,title:text(d.title),type:text(d.type)||"pdf",status:text(d.status)||"draft",createdBy:uid,createdAt:now,updatedAt:now});return {id:ref.id};});
export const updateLearningMaterial=onCall(async r=>{auth(r);const id=text((r.data as any)?.id),d:any=(r.data as any)?.data;if(!id||!d)throw new HttpsError("invalid-argument","id and data are required.");validate(d);await getFirestore().collection("learningMaterials").doc(id).set({...d,updatedAt:FieldValue.serverTimestamp()},{merge:true});return {id};});
export const archiveLearningMaterial=onCall(async r=>{auth(r);const id=text((r.data as any)?.id);if(!id)throw new HttpsError("invalid-argument","id is required.");await getFirestore().collection("learningMaterials").doc(id).set({status:"archived",updatedAt:FieldValue.serverTimestamp()},{merge:true});return {id};});

export const bulkCreateLearningMaterials=onCall(async r=>{
  const {uid}=auth(r);
  const rows=Array.isArray((r.data as any)?.rows)?(r.data as any).rows:[];
  if(!rows.length||rows.length>500) throw new HttpsError("invalid-argument","Upload between 1 and 500 content rows.");
  const db=getFirestore(), batch=db.batch(), now=FieldValue.serverTimestamp();
  rows.forEach((raw:any,index:number)=>{
    const d={...raw};
    try{validate(d);}catch(e){throw new HttpsError("invalid-argument",`Row ${index+1}: ${e instanceof Error?e.message:"invalid content"}`);}
    const ref=db.collection("learningMaterials").doc();
    batch.set(ref,{...d,title:text(d.title),type:text(d.type)||"pdf",status:text(d.status)||"draft",createdBy:uid,createdAt:now,updatedAt:now});
  });
  await batch.commit();
  return {created:rows.length};
});
