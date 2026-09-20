"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { learnerFunction } from "../../lib/learner-api";
import { learnerAuth } from "../../lib/firebase";
import LearnerNav from "../components/LearnerNav";

export default function Profile() {
  const [name, setName] = useState("Learner");
  const [stats, setStats] = useState<any>({ level: 1, streak: 0, coins: 0 });
  const [linkCode, setLinkCode] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => onAuthStateChanged(learnerAuth, async u => {
    if (!u) return;
    setName(u.displayName || u.email?.split("@")[0] || "Learner");
    try {
      const token = await u.getIdToken();
      const result = await learnerFunction("getLearnerStats", {}, token);
      setStats(result?.stats || {});
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Unable to load profile.");
    }
  }), []);

  async function deleteAccount() {
    if (!window.confirm("Request deletion of your Skill Saga account? You will be signed out and access will be disabled.")) return;
    const user = learnerAuth.currentUser;
    if (!user) return;
    try {
      await learnerFunction("requestAccountDeletion", {}, await user.getIdToken());
      setMessage("Account deletion requested. Your account has been disabled.");
      await signOut(learnerAuth);
      window.location.href = "/login/";
    } catch (e) { setMessage(e instanceof Error ? e.message : "Unable to request account deletion."); }
  }

  async function createLinkCode() {
    const user = learnerAuth.currentUser;
    if (!user) return;
    try {
      const result = await learnerFunction("createLearnerLinkCode", {}, await user.getIdToken());
      setLinkCode(result?.code || "");
      setMessage("Share this code with your parent or teacher. It expires in 15 minutes.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Unable to create link code.");
    }
  }

  return (
    <div className="ss-app">
      <header className="ss-inner-header">
        <Link href="/">‹</Link>
        <div><b>Profile</b><small>Skill Saga learner</small></div>
        <span>⚙️</span>
      </header>

      <main className="ss-page">
        <section className="ss-profile-card">
          <div className="ss-avatar">👦</div>
          <div><h1>{name}</h1><p>Your learning journey</p><small>Keep learning, keep growing!</small></div>
          <span>✎</span>
        </section>

        <section className="ss-profile-stats">
          <div>⭐<b>{stats.level ?? 1}</b><small>Level</small></div>
          <div>🔥<b>{stats.streak ?? 0}</b><small>Day Streak</small></div>
          <div>🪙<b>{stats.coins ?? 0}</b><small>Coins</small></div>
        </section>

        {message && <div className="ss-message">{message}</div>}

        <div className="ss-menu">
          <Link href="/progress">❓ <b>Quiz History & Progress</b> <span>›</span></Link>
          <Link href="/progress">⌁ <b>My Progress</b> <span>›</span></Link>
          <button className="ss-menu-button" onClick={() => void createLinkCode()}>
            👨‍👩‍👧 <b>Parent / Teacher Link</b> <span>›</span>
          </button>
          {linkCode && <div className="ss-link-code"><small>Share this 15-minute code</small><strong>{linkCode}</strong></div>}
          <Link href="/rewards">🎁 <b>Rewards & Coins</b> <span>›</span></Link>
          <Link href="/community">💬 <b>Community</b> <span>›</span></Link>
          <Link href="/profile">⚙️ <b>Settings</b> <span>›</span></Link>
          <Link href="/privacy">🔒 <b>Privacy Policy</b> <span>›</span></Link>
          <Link href="/terms">📄 <b>Terms of Use</b> <span>›</span></Link>
          <button className="ss-menu-button" onClick={() => void deleteAccount()}>🗑️ <b>Request Account Deletion</b> <span>›</span></button>
          <Link href="/profile">❔ <b>Help & Support</b> <span>›</span></Link>
          <button className="ss-logout" onClick={() => void signOut(learnerAuth)}>↪ Log Out</button>
        </div>
      </main>

      <LearnerNav active="Profile" />
    </div>
  );
}
