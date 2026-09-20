"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { learnerAuth } from "../../lib/firebase";
import { learnerFunction } from "../../lib/learner-api";
import LearnerNav from "../components/LearnerNav";

export default function Rewards() {
  const [data, setData] = useState<any>(null);
  const [filter, setFilter] = useState("All");
  const [showHistory, setShowHistory] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [message, setMessage] = useState("");

  async function reload(user = learnerAuth.currentUser) {
    if (!user) return;
    setData(await learnerFunction("getLearnerRewards", {}, await user.getIdToken()));
  }

  useEffect(() => onAuthStateChanged(learnerAuth, async user => {
    if (!user) return;
    try { await reload(user); }
    catch (e) { setMessage(e instanceof Error ? e.message : "Unable to load rewards."); }
  }), []);

  const rewards = useMemo(() => {
    const all = data?.rewards || [];
    if (filter === "All" || filter === "More") return all;
    const target = filter.toLowerCase();
    return all.filter((r: any) => String(r.type || "").toLowerCase().includes(target.slice(0, -1)));
  }, [data, filter]);

  async function redeem(rewardId: string) {
    const user = learnerAuth.currentUser;
    if (!user) return;
    setBusyId(rewardId); setMessage("");
    try {
      const result = await learnerFunction("redeemReward", { rewardId }, await user.getIdToken());
      setMessage(`Reward requested. Your balance is now ${result?.balance ?? 0} coins.`);
      await reload(user);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Unable to redeem this reward.");
    } finally { setBusyId(""); }
  }

  const redemptions = data?.redemptions || [];

  return (
    <div className="ss-app">
      <header className="ss-inner-header">
        <Link href="/">‹</Link>
        <div><b>Rewards</b><small>Learn · Earn · Redeem</small></div>
        <span>🎁</span>
      </header>

      <main className="ss-page">
        <section className="ss-wallet">
          <small>Your Coins</small>
          <b>🪙 {data?.wallet?.balance ?? 0}</b>
          <button className="ss-secondary" onClick={() => setShowHistory(v => !v)}>
            {showHistory ? "Hide History" : "View History ›"}
          </button>
        </section>

        {message && <div className="ss-message">{message}</div>}

        <div className="ss-filter">
          {["All", "Merchandise", "Vouchers", "More"].map(x =>
            <button key={x} className={filter === x ? "active" : ""} onClick={() => setFilter(x)}>{x}</button>
          )}
        </div>

        {showHistory ? (
          <section className="ss-card">
            <span className="ss-eyebrow">REDEMPTION HISTORY</span>
            <h2>Your reward requests</h2>
            {!redemptions.length ? <p>No reward requests yet.</p> : redemptions.map((r: any) =>
              <div key={r.id} className="ss-leader-row">
                <span>{r.rewardName || "Reward"} · {r.coinCost} coins</span>
                <strong>{r.status}</strong>
              </div>
            )}
          </section>
        ) : (
          <div className="ss-reward-list">
            {rewards.map((r: any) =>
              <article key={r.id}>
                <span>🎁</span>
                <div><b>{r.name}</b><small>{r.description || "A Skill Saga reward"}</small><strong>{r.coinCost} Coins</strong></div>
                <button className="ss-primary" disabled={busyId === r.id || (data?.wallet?.balance ?? 0) < r.coinCost} onClick={() => void redeem(r.id)}>
                  {busyId === r.id ? "Redeeming…" : (data?.wallet?.balance ?? 0) < r.coinCost ? "Need more coins" : "Redeem"}
                </button>
              </article>
            )}
            {!rewards.length && <div className="ss-empty"><strong>No rewards available yet.</strong><span>Rewards published by the Admin Console will appear here.</span></div>}
          </div>
        )}
      </main>

      <LearnerNav active="Profile" />
    </div>
  );
}
