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

  // Diagnostic-safe server-side read: use the same Firestore connection used by
  // the other admin functions and return both counts and a few document IDs.
  // This temporarily helps verify that Analytics is reading the same database.
  const results=await Promise.all(
    names.map(async(name)=>{
      const snapshot=await db.collection(name).limit(10).get();
      return [name,{
        count:snapshot.size,
        sampleIds:snapshot.docs.slice(0,5).map(doc=>doc.id),
      }] as const;
    })
  );

  return {
    counts:Object.fromEntries(results.map(([name,value])=>[name,value.count])),
    diagnostics:Object.fromEntries(results),
    environment:{
      projectId:process.env.GCLOUD_PROJECT??null,
      firestoreEmulatorHost:process.env.FIRESTORE_EMULATOR_HOST??null,
    },
    generatedAt:new Date().toISOString(),
  };
});
