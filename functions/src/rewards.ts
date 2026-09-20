import {getFirestore,FieldValue} from "firebase-admin/firestore";
import {onCall,HttpsError,type CallableRequest} from "firebase-functions/v2/https";
const ROLES=new Set(["super_admin","admin","finance"]);
function auth(r:CallableRequest<unknown>){const uid=r.auth?.uid,role=r.auth?.token.role;if(!uid)throw new HttpsError("unauthenticated","Administrator authentication is required.");if(typeof role!=="string"||!ROLES.has(role))throw new HttpsError("permission-denied","You are not authorized to manage rewards.");return{uid,role};}
const text=(v:unknown)=>typeof v==="string"?v.trim():"";
function validate(raw:any){const name=text(raw.name);if(!name)throw new HttpsError("invalid-argument","Reward name is required.");const type=text(raw.type).toLowerCase();if(!type)throw new HttpsError("invalid-argument","Reward type is required.");const cost=Number(raw.coinCost);if(!Number.isInteger(cost)||cost<0)throw new HttpsError("invalid-argument","Coin cost must be a non-negative whole number.");return{name,type,description:text(raw.description),coinCost:cost,active:raw.active===undefined?true:Boolean(raw.active)};}
function audit(uid:string,role:string,action:string,id:string){return{actorUid:uid,actorRole:role,action,collection:"rewards",documentId:id,createdAt:FieldValue.serverTimestamp()};}
export const listRewards=onCall(async r=>{auth(r);const s=await getFirestore().collection("rewards").limit(500).get();const items=s.docs.map(d=>({id:d.id,...d.data()}));items.sort((a:any,b:any)=>String(a.name??"").localeCompare(String(b.name??"")));return{items};});
export const createReward=onCall(async r=>{const{uid,role}=auth(r);const data=validate((r.data as any)?.data??{});const db=getFirestore();const duplicate=await db.collection("rewards").where("name","==",data.name).limit(1).get();if(!duplicate.empty)throw new HttpsError("already-exists","A reward with this name already exists.");const ref=db.collection("rewards").doc();await ref.set({...data,createdBy:uid,updatedBy:uid,createdAt:FieldValue.serverTimestamp(),updatedAt:FieldValue.serverTimestamp()});await db.collection("auditLogs").doc().set(audit(uid,role,"CREATE",ref.id));return{id:ref.id};});
export const updateReward=onCall(async r=>{const{uid,role}=auth(r);const p=r.data as any,id=text(p?.id);if(!id)throw new HttpsError("invalid-argument","id is required.");const data=validate(p?.data??{});const db=getFirestore(),ref=db.collection("rewards").doc(id);if(!(await ref.get()).exists)throw new HttpsError("not-found","Reward was not found.");const duplicate=await db.collection("rewards").where("name","==",data.name).limit(5).get();if(duplicate.docs.some(d=>d.id!==id))throw new HttpsError("already-exists","A reward with this name already exists.");await ref.update({...data,updatedBy:uid,updatedAt:FieldValue.serverTimestamp()});await db.collection("auditLogs").doc().set(audit(uid,role,"UPDATE",id));return{success:true};});
export const archiveReward=onCall(async r=>{const{uid,role}=auth(r),id=text((r.data as any)?.id);if(!id)throw new HttpsError("invalid-argument","id is required.");const db=getFirestore(),ref=db.collection("rewards").doc(id);if(!(await ref.get()).exists)throw new HttpsError("not-found","Reward was not found.");await ref.update({active:false,updatedBy:uid,updatedAt:FieldValue.serverTimestamp()});await db.collection("auditLogs").doc().set(audit(uid,role,"ARCHIVE",id));return{success:true};});

export const listRewardRedemptions=onCall(async r=>{
  const {role}=auth(r);
  const db=getFirestore();
  const status=text((r.data as any)?.status);
  let q:any=db.collection("rewardRedemptions").limit(500);
  if(status) q=q.where("status","==",status);
  const s=await q.get();
  const items=s.docs.map((d:any)=>({id:d.id,...d.data()}));
  items.sort((a:any,b:any)=>String(b.createdAt?.toMillis?.()??"").localeCompare(String(a.createdAt?.toMillis?.()??"")));
  return {items, role};
});

export const updateRewardRedemptionStatus=onCall(async r=>{
  const {uid,role}=auth(r);
  const p=r.data as any, id=text(p?.id), next=text(p?.status).toLowerCase();
  if(!id) throw new HttpsError("invalid-argument","id is required.");
  if(!["approved","fulfilled","rejected"].includes(next)) throw new HttpsError("invalid-argument","Invalid redemption status.");
  const db=getFirestore(), ref=db.collection("rewardRedemptions").doc(id);
  const snap=await ref.get();
  if(!snap.exists) throw new HttpsError("not-found","Redemption was not found.");
  const current=text(snap.data()?.status)||"pending";
  if(current==="fulfilled"||current==="rejected") throw new HttpsError("failed-precondition","This redemption is already closed.");
  if(next==="fulfilled" && current!=="approved") throw new HttpsError("failed-precondition","A redemption must be approved before it is fulfilled.");
  await ref.update({status:next,updatedBy:uid,updatedAt:FieldValue.serverTimestamp()});
  await db.collection("auditLogs").doc().set({
    actorUid:uid,actorRole:role,action:"UPDATE_REDEMPTION_STATUS",collection:"rewardRedemptions",
    documentId:id,fromStatus:current,toStatus:next,createdAt:FieldValue.serverTimestamp()
  });
  return {success:true,status:next};
});