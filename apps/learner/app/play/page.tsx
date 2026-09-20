"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import {onAuthStateChanged} from "firebase/auth";
import {learnerAuth} from "../../lib/firebase";
import {learnerFunction} from "../../lib/learner-api";
import LearnerNav from "../components/LearnerNav";

type Mode="quiz"|"topic"|"competition"|"assigned";
export default function Play(){
 const [quizzes,setQuizzes]=useState<any[]>([]),[quiz,setQuiz]=useState<any>(null),[mode,setMode]=useState<Mode>("quiz"),[contextId,setContextId]=useState("");
 const [category,setCategory]=useState<"all"|"academic"|"skills"|"other">("all"),[q,setQ]=useState(0),[answers,setAnswers]=useState<number[]>([]),[result,setResult]=useState<any>(null),[showReview,setShowReview]=useState(false),[token,setToken]=useState(""),[error,setError]=useState("");
 useEffect(()=>onAuthStateChanged(learnerAuth,async u=>{
   if(!u)return;
   const t=await u.getIdToken();setToken(t);
   try{
     const params=new URLSearchParams(window.location.search);
     const topicId=params.get("topicId")||"", competitionId=params.get("competitionId")||"", quizId=params.get("quizId")||"", assigned=params.get("assigned")||"";
     if(assigned){setMode("assigned");setContextId(assigned);await startQuiz(assigned,t);}
     else if(topicId){setMode("topic");setContextId(topicId);await startTopic(topicId,t);}
     else if(competitionId){setMode("competition");setContextId(competitionId);await startCompetition(competitionId,t);}
     else{
       const list=(await learnerFunction("listPublishedQuizzes",{},t))?.items||[];setQuizzes(list);
       if(quizId) await startQuiz(quizId,t);
     }
   }catch(e){setError(e instanceof Error?e.message:"Unable to load practice.");}
 }),[]);

 async function startQuiz(id:string,t=token){const x=await learnerFunction("getQuizForAttempt",{quizId:id},t);setQuiz(x);setAnswers(new Array(x.questions?.length||0).fill(-1));setQ(0);setResult(null);}
 async function startTopic(id:string,t=token){const x=await learnerFunction("getTopicPractice",{topicId:id},t);setQuiz(x);setAnswers(new Array(x.questions?.length||0).fill(-1));setQ(0);setResult(null);}
 async function startCompetition(id:string,t=token){const x=await learnerFunction("getCompetitionQuiz",{competitionId:id},t);setQuiz(x);setAnswers(new Array(x.questions?.length||0).fill(-1));setQ(0);setResult(null);}
 async function submit(){
   try{
     setError("");
     let x:any;
     if(mode==="topic") x=await learnerFunction("submitTopicPractice",{topicId:contextId,answers},token);
     else if(mode==="competition") x=await learnerFunction("submitCompetitionAttempt",{competitionId:contextId,answers},token);
     else x=await learnerFunction("submitQuizAttempt",{quizId:quiz.id,answers,submissionId:crypto.randomUUID()},token);
     setResult(x?.result||x);
   }catch(e){setError(e instanceof Error?e.message:"Unable to submit.");}
 }
 if(result)return <div className="ss-app"><header className="ss-inner-header"><Link href={mode==="competition"?"/compete":"/play"}>‹</Link><div><b>{mode==="competition"?"Competition Result":"Practice Result"}</b><small>{mode==="competition"?"Your official competition score":"Keep learning and improving"}</small></div><span>🏆</span></header><main className="ss-page ss-result-page"><div className="ss-confetti">🎉</div><h1>Great Job!</h1><p>You scored {result.correct} out of {result.total}</p><div className="ss-score">{result.percentage}%</div>{mode!=="competition"&&<div className="ss-result-stats"><span>🪙<b>+{result.coinsEarned||0}</b><small>Coins</small></span><span>⭐<b>+{result.xpEarned||0}</b><small>XP</small></span><span>🔥<b>+1</b><small>Streak</small></span></div>}{mode==="competition"?<Link className="ss-primary wide" href="/compete">Back to Competitions</Link>:<><button className="ss-primary wide" onClick={()=>setShowReview(v=>!v)}>{showReview?"Hide Review":"Review Answers"}</button>{showReview&&<div className="ss-review">{(result.answers||[]).map((a:any,i:number)=><div key={a.questionId||i} className={a.correct?"ss-review-correct":"ss-review-wrong"}><b>Q{i+1}</b> {a.correct?"✓ Correct":"✗ Incorrect"} · {a.marks}/{a.maxMarks} marks</div>)}</div>}<Link className="ss-secondary wide" href="/">Back to Home</Link></>}</main><LearnerNav active="Play"/></div>;
 return <div className="ss-app"><header className="ss-inner-header"><Link href="/">‹</Link><div><b>{mode==="competition"?"Competition":mode==="topic"?"Topic Practice":"Play"}</b><small>{mode==="competition"?"Compete for your leaderboard position":mode==="topic"?"Practice what you just learned":"Challenge yourself and grow"}</small></div><span>⌕</span></header><main className="ss-page">
  {error&&<div className="ss-message error">{error}</div>}
  {quiz?<section className="ss-practice"><div className="ss-qtop"><b>Question {q+1} of {quiz.questions.length}</b><span>{mode==="competition"?"🏆 Official":"⏱ Practice"}</span></div><div className="ss-bar"><i style={{width:((q+1)/quiz.questions.length)*100+"%"}}/></div><h2>{quiz.questions[q]?.questionText}</h2>{quiz.questions[q]?.options?.map((o:string,i:number)=><button className={"ss-option "+(answers[q]===i?"selected":"")} key={i} onClick={()=>setAnswers(a=>a.map((v,j)=>j===q?i:v))}><b>{String.fromCharCode(65+i)}</b>{o}</button>)}<div className="ss-actions">{q>0&&<button className="ss-secondary" onClick={()=>setQ(q-1)}>Previous</button>}{q<quiz.questions.length-1?<button className="ss-primary" disabled={answers[q]<0} onClick={()=>setQ(q+1)}>Next</button>:<button className="ss-primary" disabled={answers.some(a=>a<0)} onClick={()=>void submit()}>Submit</button>}</div></section>:<><div className="ss-heading"><b>Choose a Quiz</b><Link href="/learn">Learn topics →</Link></div><div className="ss-play-categories"><button onClick={()=>setCategory("all")}>🌈<b>All</b><small>Everything</small></button><button onClick={()=>setCategory("academic")}>📚<b>Academic</b><small>Class & subjects</small></button><button onClick={()=>setCategory("skills")}>🧠<b>Skills</b><small>Skill challenges</small></button><button onClick={()=>setCategory("other")}>🌟<b>Other</b><small>More learning</small></button><Link href="/play">📝<b>Daily Quiz</b><small>Quick daily challenge</small></Link><Link href="/play">⚡<b>Quick Practice</b><small>Practice published quizzes</small></Link><Link href="/play">🎯<b>Mixed Quiz</b><small>Test across topics</small></Link><Link href="/assignments">📌<b>Assigned</b><small>Tasks from teachers</small></Link></div><div className="ss-quiz-list">{quizzes.filter(x=>category==="all"||String(x.quizType||"ACADEMIC").toLowerCase()===category.slice(0,-1)).map(x=><button key={x.id} onClick={()=>void startQuiz(x.id)}><span>🧪</span><div><b>{x.title}</b><small>{x.questionCount||5} Questions · {x.difficulty||"Practice"}</small></div><strong>›</strong></button>)}{!quizzes.length&&<div className="ss-empty">Published quizzes will appear here.</div>}</div></>}
 </main><LearnerNav active="Play"/></div>
}