import {getFirestore,FieldValue} from "firebase-admin/firestore";
import {getStorage} from "firebase-admin/storage";
import {onCall,HttpsError} from "firebase-functions/v2/https";
import type {CallableRequest} from "firebase-functions/v2/https";

const roles=new Set(["admin","super_admin","content_manager"]);
function auth(r:CallableRequest<unknown>){const uid=r.auth?.uid,role=r.auth?.token.role;if(!uid||typeof role!=="string"||!roles.has(role))throw new HttpsError("permission-denied","Content manager access required.");return{uid,role};}
const text=(v:unknown)=>typeof v==="string"?v.trim():"";
const num=(v:unknown)=>{const n=Number(v);return Number.isFinite(n)?n:null;};
const allowedTypes=new Set(["pdf","video","article","link","image","audio","worksheet","presentation"]);
const allowedAccess=new Set(["free","premium","assigned"]);
const allowedStatus=new Set(["draft","published","archived"]);


function storagePathFromUrl(value:unknown):string|null{
  if(typeof value!=="string"||!value.trim())return null;
  const raw=value.trim();
  if(raw.startsWith("gs://")){const slash=raw.indexOf("/",5);return slash>5?decodeURIComponent(raw.slice(slash+1)):null;}
  try{const url=new URL(raw);const match=url.pathname.match(/\/o\/(.+)$/);return match?decodeURIComponent(match[1]):null;}catch{return null;}
}
async function deleteStorageForMaterial(data:any){
  const paths=new Set<string>();
  for(const field of ["fileUrl","thumbnailUrl","storagePath","filePath","mediaUrl","thumbnailPath"]){
    const value=data?.[field];
    const path=field.endsWith("Url")?storagePathFromUrl(value):(typeof value==="string"&&value.trim()?value.trim():null);
    if(path)paths.add(path);
  }
  let deleted=0;const bucket=getStorage().bucket();
  for(const path of paths){try{await bucket.file(path).delete();deleted++;}catch(e:any){if(String(e?.code)!=="404")throw e;}}
  return deleted;
}

function validate(d:any){
  const title=text(d.title);
  if(!title)throw new HttpsError("invalid-argument","Title is required.");
  const type=text(d.type)||"pdf";
  if(!allowedTypes.has(type))throw new HttpsError("invalid-argument","Invalid content type.");
  const accessType=text(d.accessType)||"free";
  if(!allowedAccess.has(accessType))throw new HttpsError("invalid-argument","Invalid access type.");
  const status=text(d.status)||"draft";
  if(!allowedStatus.has(status))throw new HttpsError("invalid-argument","Invalid content status.");
  const p=num(d.publishAtMs??d.scheduledAtMs),e=num(d.expireAtMs);
  if(p!==null&&e!==null&&e<=p)throw new HttpsError("invalid-argument","Expiry must be after publish time.");
  const tags=Array.isArray(d.tags)?d.tags.map((tag:unknown)=>text(tag)).filter(Boolean).slice(0,50):[];
  if(tags.some((t:string)=>t.length>100))throw new HttpsError("invalid-argument","Tags are limited to 100 characters.");
  return {
    title:title.slice(0,300),description:text(d.description).slice(0,5000),type,
    boardId:text(d.boardId),classId:text(d.classId),subjectId:text(d.subjectId),
    chapterId:text(d.chapterId),topicId:text(d.topicId),language:(text(d.language)||"English").slice(0,80),
    difficulty:text(d.difficulty).slice(0,40),tags,accessType,status,
    fileUrl:text(d.fileUrl).slice(0,2000),storagePath:text(d.storagePath).slice(0,1000),thumbnailUrl:text(d.thumbnailUrl).slice(0,2000),
    publishAtMs:p,expireAtMs:e,storagePath:text(d.storagePath).slice(0,1000),
  };
}

async function ensureAcademicReferences(d:any){
  const checks:[string,string][]=[
    ["boards",d.boardId],["classes",d.classId],["subjects",d.subjectId],
    ["chapters",d.chapterId],["topics",d.topicId],
  ];
  const required=checks.filter(([,id])=>Boolean(id));
  if(!required.length)return;
  const db=getFirestore();
  const docs=await Promise.all(required.map(([collection,id])=>db.collection(collection).doc(id).get()));
  docs.forEach((snap,i)=>{
    if(!snap.exists||snap.data()?.active!==true)throw new HttpsError("failed-precondition",`Referenced ${required[i][0]} record is missing or inactive.`);
  });
}

function clean(x:any){
  return {id:x.id,title:text(x.title),description:text(x.description),type:text(x.type)||"pdf",
    boardId:text(x.boardId),classId:text(x.classId),subjectId:text(x.subjectId),chapterId:text(x.chapterId),topicId:text(x.topicId),
    language:text(x.language)||"English",difficulty:text(x.difficulty),tags:Array.isArray(x.tags)?x.tags:[],
    accessType:text(x.accessType)||"free",status:text(x.status)||"draft",fileUrl:text(x.fileUrl),storagePath:text(x.storagePath),thumbnailUrl:text(x.thumbnailUrl),
    publishAtMs:num(x.publishAtMs??x.scheduledAtMs),expireAtMs:num(x.expireAtMs),createdBy:text(x.createdBy),
    createdAt:x.createdAt??null,updatedAt:x.updatedAt??null};
}

export const listLearningMaterials=onCall(async r=>{
  auth(r);
  const s=await getFirestore().collection("learningMaterials").orderBy("updatedAt","desc").limit(500).get();
  return {items:s.docs.map(d=>clean({...d.data(),id:d.id}))};
});

export const createLearningMaterial=onCall(async r=>{
  const {uid}=auth(r);const d=validate(r.data||{});await ensureAcademicReferences(d);
  const ref=getFirestore().collection("learningMaterials").doc(),now=FieldValue.serverTimestamp();
  await ref.set({...d,createdBy:uid,createdAt:now,updatedAt:now});return{id:ref.id};
});

export const updateLearningMaterial=onCall(async r=>{
  auth(r);const id=text((r.data as any)?.id),raw=(r.data as any)?.data;
  if(!id||!raw)throw new HttpsError("invalid-argument","id and data are required.");
  const d=validate(raw);await ensureAcademicReferences(d);
  const ref=getFirestore().collection("learningMaterials").doc(id);
  if(!(await ref.get()).exists)throw new HttpsError("not-found","Learning material was not found.");
  await ref.set({...d,updatedAt:FieldValue.serverTimestamp()},{merge:true});return{id};
});

export const archiveLearningMaterial=onCall(async r=>{
  auth(r);const id=text((r.data as any)?.id);if(!id)throw new HttpsError("invalid-argument","id is required.");
  await getFirestore().collection("learningMaterials").doc(id).set({status:"archived",updatedAt:FieldValue.serverTimestamp()},{merge:true});return{id};
});

export const bulkCreateLearningMaterials=onCall(async r=>{
  const {uid}=auth(r);const rows=Array.isArray((r.data as any)?.rows)?(r.data as any).rows:[];
  if(!rows.length||rows.length>500)throw new HttpsError("invalid-argument","Upload between 1 and 500 content rows.");
  const db=getFirestore(),batch=db.batch(),now=FieldValue.serverTimestamp();
  for(let i=0;i<rows.length;i++){
    let d:any;
    try{d=validate(rows[i]);await ensureAcademicReferences(d);}catch(e){
      if(e instanceof HttpsError)throw new HttpsError("invalid-argument",`Row ${i+1}: ${e.message}`);
      throw e;
    }
    const ref=db.collection("learningMaterials").doc();
    batch.set(ref,{...d,createdBy:uid,createdAt:now,updatedAt:now});
  }
  await batch.commit();return{created:rows.length};
});

export const deleteLearningMaterial=onCall(async r=>{
  const {uid}=auth(r);
  const id=text((r.data as any)?.id);if(!id)throw new HttpsError("invalid-argument","id is required.");
  const db=getFirestore();const ref=db.collection("learningMaterials").doc(id);const snap=await ref.get();
  if(!snap.exists)throw new HttpsError("not-found","Learning material was not found.");
  const storageObjectsDeleted=await deleteStorageForMaterial(snap.data());
  await ref.delete();
  await db.collection("auditLogs").doc().set({actorUid:uid,action:"DELETE_LEARNING_MATERIAL",collection:"learningMaterials",documentId:id,storageObjectsDeleted,createdAt:FieldValue.serverTimestamp()});
  return{id,storageObjectsDeleted};
});
