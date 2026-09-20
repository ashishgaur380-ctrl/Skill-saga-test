"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { learnerAuth } from "../../lib/firebase";
import { learnerFunction } from "../../lib/learner-api";
import LearnerNav from "../components/LearnerNav";

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

      <main className="ss-page">
        {error && <div className="ss-message error">{error}</div>}

        <div className="ss-tabs">
          {[
            ["live", "Live"],
            ["upcoming", "Upcoming"],
            ["mine", "My Competitions"],
            ["ended", "Results"],
          ].map(([value, label]) => (
            <button key={value} className={tab === value ? "active" : ""} onClick={() => setTab(value as typeof tab)}>
              {label}
            </button>
          ))}
        </div>

        <div className="ss-competition-list">
          {visible.map(c => (
            <article key={c.id}>
              <span className="ss-comp-icon">🏆</span>
              <div>
                <span className="ss-pill">{c.entryType === "paid" ? `PAID · ₹${c.entryFee}` : "FREE"}</span>
                <h2>{c.name}</h2>
                <p>{c.description || "Challenge other learners and test your skills."}</p>
                <small>
                  {c.state === "upcoming" ? "Starts soon" : c.state === "ended" ? "Ended" : "Live now"}
                  {" · "}{c.participants || 0}/{c.maxParticipants || "∞"} joined
                </small>

                <div className="ss-action-row">
                  {c.state === "live" && c.joined ? (
                    <Link className="ss-primary" href={"/play?competitionId=" + c.id}>Start Competition</Link>
                  ) : c.state === "live" && c.entryType === "free" ? (
                    <button className="ss-primary" disabled={busyId === c.id || c.participants >= c.maxParticipants} onClick={() => void joinCompetition(c)}>
                      {busyId === c.id ? "Joining…" : c.participants >= c.maxParticipants ? "Full" : "Join Competition"}
                    </button>
                  ) : c.state === "live" && c.entryType === "paid" ? (
                    <button className="ss-primary" disabled>Payment required</button>
                  ) : (
                    <span className="ss-secondary">{c.joined ? "Joined" : "Not open yet"}</span>
                  )}

                  <button className="ss-secondary" disabled={busyId === c.id} onClick={() => void showLeaderboard(c)}>
                    Leaderboard
                  </button>
                </div>
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
