"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { learnerAuth } from "../../lib/firebase";
import { learnerFunction } from "../../lib/learner-api";
import LearnerNav from "../components/LearnerNav";
import CompeteTabs from "../components/compete/CompeteTabs";

type Competition = {
  id: string;
  name: string;
  description?: string;
  maxParticipants: number;
  entryType: string;
  entryFee: number;
  participants: number;
  joined: boolean;
  startAtMs?: number | null;
  endAtMs?: number | null;
  state?: "live" | "upcoming" | "ended";
};

type LeaderboardRow = {
  rank: number;
  learnerId: string;
  correct: number;
  marks: number;
  totalMarks: number;
  percentage: number;
};

export default function Compete() {
  const [items, setItems] = useState<Competition[]>([]);
  const [tab, setTab] = useState<"live" | "upcoming" | "mine" | "ended">("live");
  const [token, setToken] = useState("");
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [leaderboard, setLeaderboard] = useState<{ id: string; name: string; rows: LeaderboardRow[] } | null>(null);

  useEffect(() => onAuthStateChanged(learnerAuth, async user => {
    if (!user) return;
    try {
      const t = await user.getIdToken();
      setToken(t);
      const result = await learnerFunction("listPublishedCompetitions", {}, t);
      setItems(result?.items || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load competitions.");
    }
  }), []);

  async function joinCompetition(c: Competition) {
    if (!token) return;
    setBusyId(c.id);
    setError("");
    try {
      await learnerFunction("joinCompetition", { competitionId: c.id }, token);
      setItems(prev => prev.map(x => x.id === c.id ? { ...x, joined: true, participants: x.participants + 1 } : x));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to join competition.");
    } finally {
      setBusyId("");
    }
  }

  async function showLeaderboard(c: Competition) {
    if (!token) return;
    setBusyId(c.id);
    setError("");
    try {
      const result = await learnerFunction("getCompetitionLeaderboard", { competitionId: c.id }, token);
      setLeaderboard({ id: c.id, name: c.name, rows: result?.items || [] });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load leaderboard.");
    } finally {
      setBusyId("");
    }
  }

  const visible = useMemo(() => items.filter(c =>
    tab === "mine" ? c.joined : c.state === tab
  ), [items, tab]);

  return (
    <div className="ss-app">
      <header className="ss-inner-header">
        <Link href="/" aria-label="Back">‹</Link>
        <div><b>Compete</b><small>Challenge yourself and climb the leaderboard!</small></div>
      </header>

      <main className="ss-page"><div className="ss-card" style={{marginBottom:18}}><div className="ss-card-head"><div><span className="ss-eyebrow">COMMUNITY</span><h2>Discuss & Learn</h2><p>Ask questions, share tips and celebrate progress.</p></div><Link className="ss-primary" href="/community">Open Forum →</Link></div></div>
        {error && <div className="ss-message error">{error}</div>}

        <CompeteTabs tab={tab} onTab={setTab}/>
              </div>
            </article>
          ))}

          {!visible.length && (
            <div className="ss-empty">
              <strong>{tab === "live" ? "No live competitions yet" : tab === "upcoming" ? "No upcoming competitions yet" : tab === "ended" ? "No completed competitions yet" : "You have not joined a competition yet"}</strong>
              <span>Published competitions from the Admin Console will appear here automatically.</span>
            </div>
          )}
        </div>

        {leaderboard && (
          <section className="ss-card" style={{ marginTop: 18 }}>
            <div className="ss-card-head">
              <div><span className="ss-eyebrow">LEADERBOARD</span><h2>{leaderboard.name}</h2></div>
              <button className="ss-secondary" onClick={() => setLeaderboard(null)}>Close</button>
            </div>
            {!leaderboard.rows.length ? <p>No submissions yet.</p> : leaderboard.rows.map(row => (
              <div key={row.learnerId} className="ss-leader-row">
                <span>#{row.rank} · {row.learnerId === learnerAuth.currentUser?.uid ? "You" : "Learner"}</span>
                <strong>{row.marks} marks · {row.percentage}%</strong>
              </div>
            ))}
          </section>
        )}
      </main>

      <LearnerNav active="Compete" />
    </div>
  );
}
