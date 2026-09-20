import {getFirestore} from "firebase-admin/firestore";
import {onCall,type CallableRequest,HttpsError} from "firebase-functions/v2/https";
const ROLES=new Set(["super_admin","admin","support"]);
export const getAnalyticsSummary=onCall(async(r:CallableRequest<unknown>)=>{
  const uid=r.auth?.uid,role=r.auth?.token.role;
  if(!uid)throw new HttpsError("unauthenticated","Authentication is required.");
  if(typeof role!=="string"||!ROLES.has(role))throw new HttpsError("permission-denied","Not authorized.");
  const db=getFirestore();
  const names=["users","questions","quizzes","quizAttempts","competitions","competitionEntries","rewards","rewardRedemptions","learningMaterials","notificationTemplates","communityPosts","automationRules"] as const;
  const results=await Promise.all(names.map(async name=>{
    const snap=await db.collection(name).count().get();
    return [name,snap.data().count] as const;
  }));
  return {
    counts:Object.fromEntries(results),
    environment:{projectId:process.env.GCLOUD_PROJECT??null,firestoreEmulatorHost:process.env.FIRESTORE_EMULATOR_HOST??null},
    generatedAt:new Date().toISOString()
  };
});