import {getFirestore,FieldValue,Timestamp} from "firebase-admin/firestore";
import {onCall,HttpsError,type CallableRequest} from "firebase-functions/v2/https";
const text=(v:unknown)=>typeof v==="string"?v.trim():"";
function who(r:CallableRequest<unknown>,roles:string[]){const uid=r.auth?.uid,role=r.auth?.token.role;if(!uid)throw new HttpsError("unauthenticated","Authentication is required.");if(typeof role!=="string"||!roles.includes(role))throw new HttpsError("permission-denied","This account is not authorized.");return{uid,role};}
function code(){return Math.random().toString(36).slice(2,8).toUpperCase();}
export const createLearnerLinkCode=onCall(async r=>{
 const {uid}=who(r,["learner"]); const db=getFirestore();
 const existing=await db.collection("learnerLinkCodes").where("learnerId","==",uid).where("active","==",true).limit(5).get();
 const now=Date.now();
 const reusable=existing.docs.find(d=>{const expires=d.data().expiresAt;return expires?.toMillis?.() > now;});
 if(reusable)return {code:reusable.id};
 let value=code(); for(let i=0;i<5;i++){const s=await db.collection("learnerLinkCodes").doc(value).get();if(!s.exists)break;value=code();}
 await db.collection("learnerLinkCodes").doc(value).set({learnerId:uid,active:true,createdAt:FieldValue.serverTimestamp(),expiresAt:Timestamp.fromMillis(Date.now()+15*60*1000)});
 return {code:value};
});
export const linkLearner=onCall(async r=>{
 const {uid,role}=who(r,["parent","teacher"]); const value=text((r.data as any)?.code).toUpperCase();
 if(!value)throw new HttpsError("invalid-argument","Link code is required.");
 const db=getFirestore(), ref=db.collection("learnerLinkCodes").doc(value), snap=await ref.get();
 if(!snap.exists||snap.data()?.active!==true||Number(snap.data()?.expiresAt?.toMillis?.()||0)<=Date.now())throw new HttpsError("not-found","The link code is invalid or expired.");
 const learnerId=text(snap.data()?.learnerId); if(!learnerId)throw new HttpsError("failed-precondition","Invalid link record.");
 const existing=await db.collection("learnerLinks").where("learnerId","==",learnerId).where("guardianId","==",uid).where("status","==","active").limit(1).get();
 if(!existing.empty)return {success:true,linkId:existing.docs[0].id};
 const linkRef=db.collection("learnerLinks").doc();
 await linkRef.set({learnerId,guardianId:uid,guardianRole:role,status:"active",createdAt:FieldValue.serverTimestamp()});
 await ref.update({active:false,usedAt:FieldValue.serverTimestamp(),usedBy:uid});
 return {success:true,linkId:linkRef.id};
});
async function linked(r:CallableRequest<unknown>){const {uid,role}=who(r,["parent","teacher"]);const learnerId=text((r.data as any)?.learnerId);if(!learnerId)throw new HttpsError("invalid-argument","learnerId is required.");const db=getFirestore();const s=await db.collection("learnerLinks").where("guardianId","==",uid).where("learnerId","==",learnerId).where("status","==","active").limit(1).get();if(s.empty)throw new HttpsError("permission-denied","This learner is not linked to your account.");return{uid,role,learnerId,db};}
export const listLinkedLearners=onCall(async r=>{const {uid,role}=who(r,["parent","teacher"]);const s=await getFirestore().collection("learnerLinks").where("guardianId","==",uid).where("status","==","active").limit(100).get();return {items:s.docs.map(d=>({id:d.id,learnerId:text(d.data().learnerId),guardianRole:role,status:text(d.data().status)}))};});
export const getLinkedLearnerProgress=onCall(async r=>{
 const {learnerId,db}=await linked(r); const [a,q]=await Promise.all([db.collection("quizAttempts").where("learnerId","==",learnerId).limit(500).get(),db.collection("users").doc(learnerId).get()]);
 let xp=0,coins=0,correct=0,answered=0; for(const d of a.docs){const x=d.data();xp+=Number(x.xpEarned)||0;coins+=Number(x.coinsEarned)||0;correct+=Number(x.correct)||0;answered+=Array.isArray(x.answers)?x.answers.length:Number(x.total)||0;}
 const quizIds=[...new Set(a.docs.map(d=>text(d.data().quizId)).filter(Boolean))]; const quizDocs=quizIds.length?await db.getAll(...quizIds.map(id=>db.collection("quizzes").doc(id))):[]; const subjectByQuiz=new Map<string,string>(quizDocs.map(d=>[d.id,text(d.data()?.subjectId)||"General"] as [string,string])); const subjectMap=new Map<string,{correct:number,total:number}>(); a.docs.forEach(d=>{const x=d.data();const subject=subjectByQuiz.get(text(x.quizId))||"General";const row=subjectMap.get(subject)||{correct:0,total:0};row.correct+=Number(x.correct)||0;row.total+=Array.isArray(x.answers)?x.answers.length:Number(x.total)||0;subjectMap.set(subject,row);}); const subjectPerformance=[...subjectMap.entries()].map(([subject,v])=>({subject,accuracy:v.total?Math.round(v.correct/v.total*10000)/100:0,correct:v.correct,total:v.total})).sort((x,y)=>x.accuracy-y.accuracy); const attempts=a.docs.map(d=>{const x=d.data();return{id:d.id,quizId:text(x.quizId),subject:subjectByQuiz.get(text(x.quizId))||"General",correct:Number(x.correct)||0,total:Array.isArray(x.answers)?x.answers.length:Number(x.total)||0,percentage:Number(x.percentage)||0,createdAt:x.createdAt??null};}).sort((x,y)=>String(y.createdAt?.toMillis?.()??"").localeCompare(String(x.createdAt?.toMillis?.()??""))).slice(0,20);
 return {learner:{id:learnerId,email:text(q.data()?.email),displayName:text(q.data()?.displayName)},stats:{xp,coins,level:Math.max(1,Math.floor(xp/100)+1),attempts:a.size,correct,answered,accuracy:answered?Math.round(correct/answered*10000)/100:0},subjectPerformance,attempts};
});