"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { learnerFunction } from "../../lib/learner-api";
import { learnerAuth } from "../../lib/firebase";
import LearnerNav from "../components/LearnerNav";
import ProfileMenu from "../components/profile/ProfileMenu";
const APP_BASE = process.env.NEXT_PUBLIC_GITHUB_PAGES === "true" ? "/Skill-saga-test" : "";

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
      window.location.href = APP_BASE+"/login/";
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
        <section className="ss-profile-performance"><div><span>🎯</span><b>{stats.accuracy ?? 0}%</b><small>Accuracy</small></div><div><span>📝</span><b>{stats.attempts ?? 0}</b><small>Quizzes Attempted</small></div><div><span>🏅</span><b>{stats.marks ?? 0}</b><small>Marks Earned</small></div></section>

        {message && <div className="ss-message">{message}</div>}

        <ProfileMenu linkCode={linkCode} onLinkCode={()=>void createLinkCode()} onDelete={()=>void deleteAccount()} onLogout={()=>void signOut(learnerAuth)}/>
      </main>

      <LearnerNav active="Profile" />
    </div>
  );
}
