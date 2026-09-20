import {getFirestore,FieldValue} from "firebase-admin/firestore";
import {onCall,HttpsError,type CallableRequest} from "firebase-functions/v2/https";

const ROLES=new Set(["super_admin","admin"]);
const ID="platform";
const defaults={
  appName:"Skill Saga",
  tagline:"A smarter way to learn",
  maintenanceMode:false,
  learnerRegistration:true,
  parentRegistration:true,
  teacherRegistration:true,
  communityEnabled:true,
  competitionsEnabled:true,
  premiumEnabled:true,
  academicEnabled:true,
  contentEnabled:true,
  assessmentEnabled:true,
  progressEnabled:true,
  rewardsEnabled:true,
  notificationsEnabled:true,
  analyticsEnabled:true,
  automationEnabled:true,
  learnerEnabled:true,
  guardianEnabled:true,
  coachingEnabled:false,
  schoolEnabled:false,
  liveClassesEnabled:false,
  marketplaceEnabled:false,
  careerEnabled:false,
  dailyQuizId:"",
  weeklyQuizId:"",
  homeMissionTitle:"Complete a quiz today",
  homeMissionDescription:"5 questions · Easy",
  homeQuote:"Small steps make big achievers!",
};

function auth(request:CallableRequest<unknown>){
  const uid=request.auth?.uid;
  const role=request.auth?.token.role;
  if(!uid)throw new HttpsError("unauthenticated","Administrator authentication is required.");
  if(typeof role!=="string"||!ROLES.has(role))throw new HttpsError("permission-denied","Only administrators can manage system settings.");
  return {uid,role};
}
const text=(v:unknown)=>typeof v==="string"?v.trim():"";

export const getSystemSettings=onCall(async request=>{
  auth(request);
  const ref=getFirestore().collection("systemSettings").doc(ID);
  const snap=await ref.get();
  if(!snap.exists)return {settings:defaults,exists:false};
  return {settings:{...defaults,...snap.data()},exists:true};
});

export const updateSystemSettings=onCall(async request=>{
  const {uid,role}=auth(request);
  const raw=(request.data as any)?.settings??{};
  const settings={
    appName:text(raw.appName)||defaults.appName,
    tagline:text(raw.tagline)||defaults.tagline,
    maintenanceMode:Boolean(raw.maintenanceMode),
    learnerRegistration:Boolean(raw.learnerRegistration),
    parentRegistration:Boolean(raw.parentRegistration),
    teacherRegistration:Boolean(raw.teacherRegistration),
    communityEnabled:Boolean(raw.communityEnabled),
    competitionsEnabled:Boolean(raw.competitionsEnabled),
    premiumEnabled:Boolean(raw.premiumEnabled),
    academicEnabled:Boolean(raw.academicEnabled), contentEnabled:Boolean(raw.contentEnabled),
    assessmentEnabled:Boolean(raw.assessmentEnabled), progressEnabled:Boolean(raw.progressEnabled),
    rewardsEnabled:Boolean(raw.rewardsEnabled), notificationsEnabled:Boolean(raw.notificationsEnabled),
    analyticsEnabled:Boolean(raw.analyticsEnabled), automationEnabled:Boolean(raw.automationEnabled),
    learnerEnabled:Boolean(raw.learnerEnabled), guardianEnabled:Boolean(raw.guardianEnabled),
    coachingEnabled:Boolean(raw.coachingEnabled), schoolEnabled:Boolean(raw.schoolEnabled),
    liveClassesEnabled:Boolean(raw.liveClassesEnabled), marketplaceEnabled:Boolean(raw.marketplaceEnabled),
    careerEnabled:Boolean(raw.careerEnabled),
    dailyQuizId:text(raw.dailyQuizId),
    weeklyQuizId:text(raw.weeklyQuizId),
    homeMissionTitle:text(raw.homeMissionTitle)||defaults.homeMissionTitle,
    homeMissionDescription:text(raw.homeMissionDescription)||defaults.homeMissionDescription,
    homeQuote:text(raw.homeQuote)||defaults.homeQuote,
  };
  const db=getFirestore();
  await db.collection("systemSettings").doc(ID).set({
    ...settings,updatedBy:uid,updatedAt:FieldValue.serverTimestamp()
  },{merge:true});
  await db.collection("auditLogs").doc().set({
    actorUid:uid,actorRole:role,action:"UPDATE",collection:"systemSettings",documentId:ID,
    createdAt:FieldValue.serverTimestamp()
  });
  return {success:true,settings};
});
