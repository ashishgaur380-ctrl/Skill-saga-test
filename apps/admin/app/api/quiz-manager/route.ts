import { NextRequest, NextResponse } from "next/server";
const allowedActions=new Set(["listQuizzes","createQuiz","updateQuiz","archiveQuiz","listLearningMaterials","createLearningMaterial","updateLearningMaterial","archiveLearningMaterial"]);
const projectId=process.env.GCLOUD_PROJECT??"skill-saga-2";
export async function POST(request:NextRequest){
 const authorization=request.headers.get("authorization");
 if(!authorization)return NextResponse.json({error:{message:"Authentication is required."}},{status:401});
 let body:any; try{body=await request.json();}catch{return NextResponse.json({error:{message:"Invalid request body."}},{status:400});}
 const action=typeof body.action==="string"?body.action:"";
 if(!allowedActions.has(action))return NextResponse.json({error:{message:"Unsupported quiz action."}},{status:400});
 try{
  const r=await fetch(`http://127.0.0.1:5001/${projectId}/us-central1/${action}`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:authorization},body:JSON.stringify({data:body.data}),cache:"no-store"});
  const t=await r.text(); let p:any; try{p=JSON.parse(t)}catch{p={error:{message:t||"Invalid emulator response."}}}
  if(!r.ok)return NextResponse.json(p,{status:r.status});
  const value=p?.data??p?.result??p;
  return NextResponse.json({data:value?.data&&Object.keys(value).length===1?value.data:value},{status:r.status});
 }catch(e){return NextResponse.json({error:{message:e instanceof Error?e.message:"Unable to reach Functions emulator."}},{status:502});}
}