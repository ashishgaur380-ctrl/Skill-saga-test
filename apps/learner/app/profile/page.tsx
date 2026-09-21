"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, updateProfile } from "firebase/auth";
import { learnerFunction } from "../../lib/learner-api";
import { learnerAuth } from "../../lib/firebase";
import LearnerNav from "../components/LearnerNav";
import ProfileMenu from "../components/profile/ProfileMenu";

const APP_BASE = process.env.NEXT_PUBLIC_GITHUB_PAGES === "true" ? "/Skill-saga-test" : "";

export default function Profile() {
  const [name, setName] = useState("Learner");
  const [email, setEmail] = useState("");
  const [stats, setStats] = useState<any>({ level: 1, streak: 0, coins: 0 });
  const [linkCode, setLinkCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => onAuthStateChanged(learnerAuth, async u => {
    if (!u) return;
    const display = u.displayName || u.email?.split("@")[0] || "Learner";
    setName(display);
    setDraftName(display);
    setEmail(u.email || "");
    try {
      const token = await u.getIdToken();
      const result = await learnerFunction("getLearnerStats", {}, token);
      setStats(result?.stats || {});
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load profile.");
    }
  }), []);

  async function saveProfile() {
    const value = draftName.trim();
    if (value.length < 2) { setError("Name must contain at least 2 characters."); return; }
    if (value.length > 60) { setError("Name must be 60 characters or fewer."); return; }
    const user = learnerAuth.currentUser;
    if (!user) { setError("Please sign in again."); return; }
    setSaving(true); setError(""); setMessage("");
    try {
      await learnerFunction("updateLearnerProfile", { displayName: value }, await user.getIdToken());
      await updateProfile(user, { displayName: value });
      setName(value);
      setEditing(false);
      setMessage("Profile updated successfully.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to update profile.");
    } finally { setSaving(false); }
  }

  async function deleteAccount() {
    if (!window.confirm("Request deletion of your Skill Saga account? You will be signed out and access will be disabled.")) return;
    const user = learnerAuth.currentUser;
    if (!user) return;
    try {
      await learnerFunction("requestAccountDeletion", {}, await user.getIdToken());
      setMessage("Account deletion requested. Your account has been disabled.");
      await signOut(learnerAuth);
      window.location.replace(APP_BASE + "/login/");
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to request account deletion."); }
  }

  async function createLinkCode() {
    const user = learnerAuth.currentUser;
    if (!user) return;
    try {
      const result = await learnerFunction("createLearnerLinkCode", {}, await user.getIdToken());
      setLinkCode(result?.code || "");
      setMessage("Share this code with your parent or teacher. It expires in 15 minutes.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to create link code.");
    }
  }

  async function logout() {
    setError(""); setMessage("");
    try { await signOut(learnerAuth); }
    catch (e) { setError(e instanceof Error ? e.message : "Sign out failed."); }
    finally { window.location.replace(APP_BASE + "/login/"); }
  }

  return (
    <div className="ss-app">
      <header className="ss-inner-header">
        <Link href="/">‹</Link>
        <div><b>Profile</b><small>Skill Saga learner</small></div>
        <button type="button" className="ss-profile-settings-button" onClick={() => window.location.assign("/profile/settings/")} aria-label="Profile settings">⚙️</button>
      </header>

      <main className="ss-page">
        <section className="ss-profile-card">
          <div className="ss-avatar">👦</div>
          <div><h1>{name}</h1><p>Your learning journey</p><small>{email || "Keep learning, keep growing!"}</small></div>
          <button type="button" className="ss-profile-edit" onClick={() => { setDraftName(name); setEditing(true); setError(""); setMessage(""); }} aria-label="Edit profile">✎ <span>Edit</span></button>
        </section>

        {editing && <section className="ss-card ss-profile-editor">
          <h2>Edit Profile</h2>
          <p>Update the name shown across Skill Saga.</p>
          <label>Name<input value={draftName} onChange={e => setDraftName(e.target.value)} maxLength={60} autoFocus /></label>
          <div className="ss-actions"><button className="ss-secondary" onClick={() => setEditing(false)} disabled={saving}>Cancel</button><button className="ss-primary" onClick={() => void saveProfile()} disabled={saving}>{saving ? "Saving…" : "Save Changes"}</button></div>
        </section>}

        <section className="ss-profile-stats">
          <div>⭐<b>{stats.level ?? 1}</b><small>Level</small></div>
          <div>🔥<b>{stats.streak ?? 0}</b><small>Day Streak</small></div>
          <div>🪙<b>{stats.coins ?? 0}</b><small>Coins</small></div>
        </section>

        <section className="ss-profile-performance">
          <div><span>🎯</span><b>{stats.accuracy ?? 0}%</b><small>Accuracy</small></div>
          <div><span>📝</span><b>{stats.attempts ?? 0}</b><small>Quizzes Attempted</small></div>
          <div><span>🏅</span><b>{stats.marks ?? 0}</b><small>Marks Earned</small></div>
        </section>

        {error && <div className="error-box">{error}</div>}
        {message && <div className="ss-message">{message}</div>}

        <ProfileMenu linkCode={linkCode} onLinkCode={() => void createLinkCode()} onDelete={() => void deleteAccount()} onLogout={() => void logout()} />
      </main>
      <LearnerNav active="Profile" />
    </div>
  );
}
