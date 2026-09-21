import {NextRequest,NextResponse} from "next/server";
export const runtime="nodejs";
const projectId=process.env.GCLOUD_PROJECT??"skill-saga-2";
const region=process.env.FIREBASE_FUNCTIONS_REGION??"us-central1";
const base=process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS==="true"?`http://127.0.0.1:5001/${projectId}/${region}`:(process.env.FIREBASE_FUNCTIONS_BASE_URL??`https://${region}-${projectId}.cloudfunctions.net`);
const actions=new Set(["listQuestions","createQuestion","updateQuestion","archiveQuestion","bulkImportQuestions"]);
export async function POST(req:NextRequest){
 const authorization=req.headers.get("authorization");if(!authorization)return NextResponse.json({error:{message:"Authentication is required."}},{status:401});
 let b:any;try{b=await req.json()}catch{return NextResponse.json({error:{message:"Invalid request body."}},{status:400})}
 if(!actions.has(b.action))return NextResponse.json({error:{message:"Unsupported question action."}},{status:400});
 try{const r=await fetch(`${base}/${b.action}`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:authorization},body:JSON.stringify({data:b.data??{}}),cache:"no-store"});const t=await r.text();let p:any;try{p=JSON.parse(t)}catch{p={error:{message:t}}}return NextResponse.json(p,{status:r.status});}
 catch(e){return NextResponse.json({error:{message:e instanceof Error?e.message:"Unable to reach Functions."}},{status:502});}
}