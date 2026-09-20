"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { learnerAuth } from "../../lib/firebase";
import { learnerFunction } from "../../lib/learner-api";
import LearnerNav from "../components/LearnerNav";

type ProgressData = {
  summary: { attempts:number; correct:number; questions:number; accuracy:number; xp:number; coins:number; level:number; streak:number };
  subjects: any[];
  topics: any[];
};

export default function Progress() {
  const [data, setData] = useState<ProgressData | null>(null);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [error, setError] = useState("");

  useEffect(() => onAuthStateChanged(learnerAuth, async user => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const [progress, history] = await Promise.all([
        learnerFunction("getLearnerProgress", {}, token),
        learnerFunction("listLearnerAttempts", {}, token),
      ]);
      setData(progress);
      setAttempts(history?.items || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load progress.");
    }
  }), []);

  const s = data?.summary;
  return (
    <div className="ss-shell">
      <header className="ss-top">
        <div className="ss-wrap">
          <div className="ss-brand">SKILL SAGA · PROGRESS</div>
          <h1>📊 My Progress</h1>
          <p>Track your learning, review every quiz, and strengthen weak topics.</p>
        </div>
      </header>

      <main className="ss-main">
        {error && <div className="error-box">{error}</div>}

        <section className="ss-progress-hero">
          <span>Current Level</span>
          <b>Level {s?.level ?? 1}</b>
          <div className="ss-progress"><span style={{ width: Math.min(100, ((s?.xp ?? 0) % 500) / 5) + "%" }} /></div>
          <small>{(s?.xp ?? 0) % 500} / 500 XP to next level</small>
        </section>

        <section className="ss-home-stats">
          <div><b>⭐ {s?.xp ?? 0}</b><small>XP</small></div>
          <div><b>🔥 {s?.streak ?? 0}</b><small>Streak</small></div>
          <div><b>🎯 {s?.accuracy ?? 0}%</b><small>Accuracy</small></div>
          <div><b>📝 {s?.attempts ?? 0}</b><small>Attempts</small></div>
        </section>

        <section className="ss-card">
          <h2>Learning summary</h2>
          <div className="ss-stat-list">
            <p><span>Questions answered</span><b>{s?.questions ?? 0}</b></p>
            <p><span>Correct answers</span><b>{s?.correct ?? 0}</b></p>
            <p><span>Coins earned</span><b>🪙 {s?.coins ?? 0}</b></p>
          </div>
        </section>

        <section className="ss-card">
          <h2>📚 Subject mastery</h2>
          <p>Performance is calculated from your completed quiz answers.</p>
          {!data?.subjects?.length && <small>No subject performance yet. Complete a quiz to start building mastery.</small>}
          {data?.subjects?.map((x:any) => (
            <div className="ss-mastery-row" key={x.id}>
              <div><b>{x.name}</b><small>{x.questions} questions · {x.correct} correct</small></div>
              <strong>{x.accuracy}%</strong>
            </div>
          ))}
        </section>

        <section className="ss-card">
          <h2>🎯 Topic mastery</h2>
          {!data?.topics?.length && <small>No topic mastery yet.</small>}
          {data?.topics?.slice(0, 20).map((x:any) => (
            <Link href={"/play?topicId=" + encodeURIComponent(x.id)} className="ss-mastery-row ss-mastery-link" key={x.id}>
              <div><b>{x.name}</b><small>{x.chapterName} · {x.questions} questions</small></div>
              <strong>{x.accuracy}% →</strong>
            </Link>
          ))}
        </section>

        <section className="ss-card">
          <div className="ss-section-heading"><div><h2>📝 Quiz history</h2><p>Open any attempt to review each question and answer.</p></div></div>
          {!attempts.length && <small>No quiz attempts yet. Start a quiz to see your history here.</small>}
          {attempts.map((a:any) => (
            <Link href={"/progress/attempt?attemptId=" + encodeURIComponent(a.id)} className="ss-history-row" key={a.id}>
              <div>
                <b>{a.quizId ? "Quiz attempt" : "Practice attempt"}</b>
                <small>{a.correct}/{a.total} correct · {a.percentage}%</small>
              </div>
              <span>Review →</span>
            </Link>
          ))}
        </section>

        <div className="ss-actions">
          <Link href="/learn" className="ss-btn primary">Continue Learning</Link>
          <Link href="/play" className="ss-btn">Practice</Link>
        </div>
      </main>

      <LearnerNav active="Profile" />
    </div>
  );
}
