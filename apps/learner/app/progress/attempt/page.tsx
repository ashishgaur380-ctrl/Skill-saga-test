"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { learnerAuth } from "../../../lib/firebase";
import { learnerFunction } from "../../../lib/learner-api";
import LearnerNav from "../../components/LearnerNav";

export default function AttemptDetails() {
  const params = useSearchParams();
  const attemptId = params.get("attemptId") || "";
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => onAuthStateChanged(learnerAuth, async user => {
    if (!user || !attemptId) return;
    try {
      setData(await learnerFunction("getLearnerAttemptDetails", { attemptId }, await user.getIdToken()));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load attempt details.");
    }
  }), [attemptId]);

  const attempt = data?.attempt;
  return (
    <div className="ss-shell">
      <header className="ss-top">
        <div className="ss-wrap">
          <Link href="/progress" className="ss-back-link">‹ Back to Progress</Link>
          <div className="ss-brand">SKILL SAGA · REVIEW</div>
          <h1>📝 {attempt?.title || "Quiz Review"}</h1>
          {attempt && <p>{attempt.correct}/{attempt.total} correct · {attempt.percentage}% · ⭐ {attempt.xpEarned} XP · 🪙 {attempt.coinsEarned} coins</p>}
        </div>
      </header>
      <main className="ss-main">
        {error && <div className="error-box">{error}</div>}
        {!data && !error && <section className="ss-card"><p>Loading your answers…</p></section>}
        {!attemptId && <section className="ss-card"><p>Select a quiz attempt from My Progress.</p></section>}
        {data?.questions?.map((q:any) => (
          <section className="ss-card" key={q.questionId}>
            <div className="ss-question-head"><b>Question {q.number}</b><span>{q.correct ? "✅ Correct" : "❌ Incorrect"}</span></div>
            <h2>{q.questionText}</h2>
            <div className="ss-review-options">
              {q.options.map((option:string, index:number) => {
                const selected = q.selectedOption === index;
                const correct = q.correctOption === index;
                return <div key={index} className={selected && correct ? "ss-review-option correct" : selected ? "ss-review-option selected" : correct ? "ss-review-option answer" : "ss-review-option"}>
                  <span>{String.fromCharCode(65 + index)}.</span> {option}
                  {selected && <small> Your answer</small>}
                  {correct && <small> Correct answer</small>}
                </div>;
              })}
            </div>
          </section>
        ))}
      </main>
      <LearnerNav active="Profile" />
    </div>
  );
}
