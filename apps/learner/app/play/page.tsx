"use client";
import Link from "next/link";
import {useState} from "react";

const questions=[{q:"What is 7 + 5?",options:["10","11","12","13"],answer:"12"},{q:"Which planet is known as the Red Planet?",options:["Earth","Mars","Jupiter","Venus"],answer:"Mars"},{q:"How many days are there in a week?",options:["5","6","7","8"],answer:"7"}];

export default function PlayPage(){
 const [n,setN]=useState(0),[choice,setChoice]=useState<string|null>(null),[score,setScore]=useState(0),[done,setDone]=useState(false);
 const submit=()=>{if(!choice)return;const next=score+(choice===questions[n].answer?1:0);if(n===questions.length-1){setScore(next);setDone(true)}else{setScore(next);setChoice(null);setN(n+1)}};
 if(done)return <div className="ss-shell"><main className="ss-main"><div className="ss-card ss-result"><div className="ss-badge">🎉</div><span className="ss-eyebrow">Quiz complete</span><h1>{score}/{questions.length}</h1><p>Great start. The production quiz engine will replace this demonstration flow.</p><div className="ss-actions" style={{justifyContent:"center"}}><Link href="/" className="ss-btn primary">Back to Home</Link><Link href="/profile" className="ss-btn">View Progress</Link></div></div></main></div>;
 const item=questions[n]; const progress=n===0?"33%":n===1?"66%":"100%";
 return <div className="ss-shell"><header className="ss-top"><div className="ss-wrap"><div className="ss-brand">SKILL SAGA · PLAY</div><h1>Quick Quiz</h1><p>Demo flow for the learner experience.</p></div></header><main className="ss-main"><div className="ss-card"><div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}><span className="ss-eyebrow">Question {n+1} of {questions.length}</span><span className="ss-eyebrow">{score} correct</span></div><div className="ss-progress"><span style={{width:progress}}/></div><h2 style={{marginTop:24,lineHeight:1.35}}>{item.q}</h2>{item.options.map(o=><button key={o} className={choice===o?"ss-quiz-option selected":"ss-quiz-option"} onClick={()=>setChoice(o)}>{o}</button>)}<button className="ss-btn primary full" style={{marginTop:18}} onClick={submit}>{n===questions.length-1?"Finish Quiz":"Next Question"}</button></div></main></div>
}