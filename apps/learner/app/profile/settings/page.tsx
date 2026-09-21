"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged, sendPasswordResetEmail, signOut } from "firebase/auth";
import { learnerAuth } from "../../../lib/firebase";
import LearnerNav from "../../components/LearnerNav";

const APP_BASE = process.env.NEXT_PUBLIC_GITHUB_PAGES === "true" ? "/Skill-saga-test" : "";

export default function ProfileSettings() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("Learner");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    const saved = window.localStorage.getItem("skill-saga-notifications");
    if (saved !== null) setNotifications(saved !== "false");
    return onAuthStateChanged(learnerAuth, user => {
      if (!user) return;
      setEmail(user.email || "");
      setName(user.displayName || user.email?.split("@")[0] || "Learner");
    });
  }, []);

  function toggleNotifications() {
    const next = !notifications;
    setNotifications(next);
    window.localStorage.setItem("skill-saga-notifications", String(next));
    setMessage(next ? "Notification preference enabled on this device." : "Notification preference disabled on this device.");
    setError("");
  }

  async function resetPassword() {
    if (!email) { setError("No email address is available for this account."); return; }
    setBusy(true); setError(""); setMessage("");
    try {
      await sendPasswordResetEmail(learnerAuth, email);
      setMessage("Password reset email sent. Check your inbox.");
    } catch (e:any) {
      setError(e?.message?.replace(/^Firebase:\s*/i, "") || "Unable to send password reset email.");
    } finally { setBusy(false); }
  }

  async function logout() {
    try { await signOut(learnerAuth); }
    finally { window.location.replace(APP_BASE + "/login/"); }
  }

  return <div className="ss-app">
    <header className="ss-inner-header">
      <Link href="/profile">‹</Link>
      <div><b>Settings</b><small>Account & preferences</small></div>
      <span>⚙️</span>
    </header>
    <main className="ss-page">
      <section className="ss-card">
        <h2>Account</h2>
        <p><b>{name}</b><br/>{email || "Email not available"}</p>
        <Link href="/profile" className="ss-primary ss-wide">Edit Profile</Link>
      </section>

      <section className="ss-card" id="password">
        <h2>🔐 Password</h2>
        <p>For security, Skill Saga sends a password reset link to your registered email.</p>
        <button className="ss-primary ss-wide" onClick={() => void resetPassword()} disabled={busy}>{busy ? "Sending…" : "Send Password Reset Email"}</button>
      </section>

      <section className="ss-card">
        <h2>🔔 Notifications</h2>
        <p>Control notification preference for this device.</p>
        <button className={notifications ? "ss-primary ss-wide" : "ss-secondary ss-wide"} onClick={toggleNotifications}>{notifications ? "Notifications On" : "Notifications Off"}</button>
      </section>

      <section className="ss-card" id="help">
        <h2>❔ Help & Support</h2>
        <p>For account or learning issues, return to your Profile and use the Parent / Teacher Link or contact the Skill Saga administrator.</p>
      </section>

      {error && <div className="error-box">{error}</div>}
      {message && <div className="ss-message">{message}</div>}

      <section className="ss-card">
        <button className="ss-secondary ss-wide" onClick={() => void logout()}>↪ Log Out</button>
      </section>
    </main>
    <LearnerNav active="Profile" />
  </div>;
}
