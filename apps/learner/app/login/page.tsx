"use client";

import { FormEvent, useState } from "react";
import { sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";
import { learnerAuth } from "../../lib/firebase";

export default function LoginPage() {
  const [email,setEmail]=useState(""),[password,setPassword]=useState(""),[busy,setBusy]=useState(false),[error,setError]=useState(""),[message,setMessage]=useState("");
  async function resetPassword(){if(!email.trim()){setError("Enter your email first.");return;}setBusy(true);setError("");setMessage("");try{await sendPasswordResetEmail(learnerAuth,email.trim());setMessage("Password reset email sent. Check your inbox.");}catch(err:any){setError(err?.message?.replace("Firebase: ","")||"Unable to send reset email.");}finally{setBusy(false);}}
  async function submit(e:FormEvent){e.preventDefault();setBusy(true);setError("");try{await signInWithEmailAndPassword(learnerAuth,email.trim(),password);window.location.href="/";}catch(err:any){setError(err?.message?.replace("Firebase: ","")||"Unable to sign in.");}finally{setBusy(false);}}
  return <main className="page-shell narrow"><section className="hero-card"><p className="eyebrow">SKILL SAGA</p><h1>Welcome back</h1><p className="muted">Sign in to access your learning, quizzes, XP and progress.</p></section><form className="panel form-stack" onSubmit={submit}><label>Email<input value={email} onChange={e=>setEmail(e.target.value)} type="email" required/></label><label>Password<input value={password} onChange={e=>setPassword(e.target.value)} type="password" required/></label>{error&&<div className="error-box">{error}</div>}{message&&<div className="ss-message">{message}</div>}<button className="primary-button" disabled={busy}>{busy?"Signing in…":"Sign in"}</button><button type="button" className="secondary-button" onClick={()=>void resetPassword()} disabled={busy}>Forgot / Reset Password</button></form><p className="muted small">Learner registration will be connected through the Admin-controlled account flow.</p></main>;
}