import {getFirestore,FieldValue} from "firebase-admin/firestore";
import {onSchedule} from "firebase-functions/v2/scheduler";
function ms(v:unknown){return Number(v)||0;}
async function notify(db:any,id:string,learnerId:string,title:string,message:string,type:string){
 const ref=db.collection("notifications").doc(`${type}__${id}__${learnerId}`);
 if((await ref.get()).exists)return;
 await ref.create({recipientId:learnerId,recipientRole:"learner",learnerId,title,message,type,competitionId:id,createdAt:FieldValue.serverTimestamp(),readAt:null});
}
async function finalize(db:any,ref:any,data:any){
 const id=ref.id,s=await db.collection("competitionAttempts").where("competitionId","==",id).limit(1000).get();
 const rows=s.docs.map((d:any)=>{const x=d.data();return{learnerId:String(x.learnerId||""),correct:Number(x.correct)||0,marks:Number(x.marks)||0,totalMarks:Number(x.totalMarks)||0,percentage:Number(x.percentage)||0};});
 rows.sort((a:any,b:any)=>b.marks-a.marks||b.correct-a.correct||b.percentage-a.percentage||a.learnerId.localeCompare(b.learnerId));
 const leaderboard=rows.map((x:any,i:number)=>({...x,rank:i+1}));
 await ref.update({lifecycleStatus:"completed",active:false,completedAt:FieldValue.serverTimestamp(),finalizedAt:FieldValue.serverTimestamp(),finalLeaderboard:leaderboard.slice(0,100)});
 for(const row of leaderboard) await notify(db,id,row.learnerId,"Competition result",`${data.name||"Competition"} has ended. Your final rank is #${row.rank} with ${row.percentage}%.`,"competition_result");
 return leaderboard.length;
}
export const runCompetitionLifecycle=onSchedule({schedule:"*/15 * * * *",timeZone:"Asia/Kolkata"},async()=>{
 const db=getFirestore(),now=Date.now(),snap=await db.collection("competitions").where("active","==",true).where("status","==","published").limit(500).get();
 for(const doc of snap.docs){const data=doc.data(),start=ms(data.startAtMs),end=ms(data.endAtMs);
  if(start>0&&start<=now&&String(data.lifecycleStatus||"").toLowerCase()!=="live"){await doc.ref.update({lifecycleStatus:"live",startedAt:FieldValue.serverTimestamp()});const e=await db.collection("competitionEntries").where("competitionId","==",doc.id).limit(1000).get();for(const x of e.docs){const uid=String(x.data().learnerId||"");if(uid)await notify(db,doc.id,uid,"Competition started",`${data.name||"Competition"} is now live. Open Compete to start.`,"competition_started");}}
  if(end>0&&end<=now&&String(data.lifecycleStatus||"").toLowerCase()!=="completed") await finalize(db,doc.ref,data);
 }
});