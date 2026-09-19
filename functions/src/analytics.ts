import {getFirestore} from "firebase-admin/firestore";
import {onCall,type CallableRequest,HttpsError} from "firebase-functions/v2/https";

const ROLES=new Set(["super_admin","admin","support"]);

export const getAnalyticsSummary=onCall(async(r:CallableRequest<unknown>)=>{
  const uid=r.auth?.uid;
  const role=r.auth?.token.role;
  if(!uid)throw new HttpsError("unauthenticated","Authentication is required.");
  if(typeof role!=="string"||!ROLES.has(role))throw new HttpsError("permission-denied","Not authorized.");

  const db=getFirestore();
  const names=["questions","quizzes","competitions","rewards","notificationTemplates","communityPosts","automationRules"] as const;

  // Use Firestore server-side aggregation counts rather than downloading documents.
  // This keeps Analytics scalable when the real content library becomes large.
  const results=await Promise.all(
    names.map(async(name)=>{
      const snapshot=await db.collection(name).count().get();
      return [name, snapshot.data().count] as const;
    })
  );

  return {
    counts:Object.fromEntries(results),
    generatedAt:new Date().toISOString(),
  };
});
