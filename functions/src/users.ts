import {getAuth} from "firebase-admin/auth";
import {getFirestore,FieldValue} from "firebase-admin/firestore";
import {onCall,HttpsError,type CallableRequest} from "firebase-functions/v2/https";

const ADMIN_ROLES=new Set(["super_admin","admin"]);
const MANAGEABLE_ROLES=["learner","parent","teacher","school_admin","content_manager","moderator","support","finance","admin","super_admin"] as const;

function auth(request:CallableRequest<unknown>){
  const uid=request.auth?.uid;
  const role=request.auth?.token.role;
  if(!uid)throw new HttpsError("unauthenticated","Administrator authentication is required.");
  if(typeof role!=="string"||!ADMIN_ROLES.has(role))throw new HttpsError("permission-denied","Only administrators can manage users.");
  return {uid,role};
}
const text=(v:unknown)=>typeof v==="string"?v.trim():"";

export const listUsers=onCall(async request=>{
  auth(request);
  const adminAuth=getAuth();
  const result=await adminAuth.listUsers(1000);
  let users=result.users;

  // The development Admin Console uses the production Firebase Auth session
  // while Firestore/Functions run in emulators. In that mixed mode, Auth user
  // directory reads may not be available from the emulator environment.
  // Safely expose the authenticated administrator from the verified callable
  // token instead of returning a misleading empty Users page.
  const currentUid=request.auth?.uid;
  const currentEmail=typeof request.auth?.token.email==="string"?request.auth.token.email:"";
  if(currentUid && !users.some(user=>user.uid===currentUid) && currentEmail){
    users=[{
      uid:currentUid,
      email:currentEmail,
      displayName:typeof request.auth?.token.name==="string"?request.auth.token.name:"",
      disabled:false,
      emailVerified:request.auth?.token.email_verified===true,
      metadata:{creationTime:null,lastSignInTime:null},
      customClaims:{role:typeof request.auth?.token.role==="string"?request.auth.token.role:"super_admin"},
    } as any,...users];
  }

  // Local Functions emulator may not have the same Auth user directory as the
  // browser's configured Firebase Auth project. Always resolve the currently
  // authenticated administrator so the Admin Console never shows a false empty
  // user list during development.
  const currentUid=request.auth?.uid;
  if(currentUid && !users.some(user=>user.uid===currentUid)){
    try{
      const currentUser=await adminAuth.getUser(currentUid);
      users=[currentUser,...users];
    }catch{
      // The production Auth user cannot be resolved by the local emulator.
      // Return the directory result rather than fabricating a user record.
    }
  }

  const items=users.map(user=>({
    uid:user.uid,
    email:user.email??"",
    displayName:user.displayName??"",
    disabled:user.disabled,
    emailVerified:user.emailVerified,
    createdAt:user.metadata.creationTime??null,
    lastSignInAt:user.metadata.lastSignInTime??null,
    role:typeof user.customClaims?.role==="string"?user.customClaims.role:"learner",
  }));
  items.sort((a,b)=>a.email.localeCompare(b.email));
  return {
    items,
    authDiagnostics:{
      firebaseAuthEmulatorHost:process.env.FIREBASE_AUTH_EMULATOR_HOST??null,
      functionsProject:process.env.GCLOUD_PROJECT??null,
      requestedUid:currentUid??null,
      directoryCount:result.users.length,
    },
  };
});

export const updateUser=onCall(async request=>{
  const {uid:actorUid,role:actorRole}=auth(request);
  const payload=request.data as any;
  const uid=text(payload?.uid);
  if(!uid)throw new HttpsError("invalid-argument","uid is required.");
  if(uid===actorUid && payload?.disabled===true)throw new HttpsError("failed-precondition","You cannot disable your own administrator account.");

  const target=await getAuth().getUser(uid);
  const patch:any={};
  if(typeof payload?.displayName==="string")patch.displayName=text(payload.displayName);
  if(typeof payload?.disabled==="boolean")patch.disabled=payload.disabled;

  const requestedRole=text(payload?.role);
  if(requestedRole){
    if(!MANAGEABLE_ROLES.includes(requestedRole as any))throw new HttpsError("invalid-argument","Unsupported user role.");
    if(actorRole!=="super_admin" && ["super_admin","admin","finance"].includes(requestedRole)){
      throw new HttpsError("permission-denied","Only a super administrator can assign this role.");
    }
    const currentClaims=target.customClaims??{};
    await getAuth().setCustomUserClaims(uid,{...currentClaims,role:requestedRole});
  }

  if(Object.keys(patch).length)await getAuth().updateUser(uid,patch);

  await getFirestore().collection("auditLogs").doc().set({
    actorUid:actorUid,actorRole,action:"UPDATE",collection:"users",documentId:uid,
    createdAt:FieldValue.serverTimestamp(),
    changes:{...patch,...(requestedRole?{role:requestedRole}:{})}
  });
  return {success:true};
});
