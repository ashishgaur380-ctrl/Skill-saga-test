"use client";

import { FormEvent, useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { learnerAuth } from "../../lib/firebase";

export default function LoginPage() {
  const [email,setEmail]=useState(""),[password,setPassword]=useState(""),[busy,setBusy]=useState(false),[error,setError]=useState("");
  async function submit(e:FormEvent){e.preventDefault();setBusy(true);setError("");try{await signInWithEmailAndPassword(learnerAuth,email.trim(),password);window.location.href="/";}catch(err:any){setError(err?.message?.replace("Firebase: ","")||"Unable to sign in.");}finally{setBusy(false);}}
  return <main className="page-shell narrow"><section className="hero-card"><p className="eyebrow">SKILL SAGA</p><h1>Welcome back</h1><p className="muted">Sign in to access your learning, quizzes, XP and progress.</p></section><form className="panel form-stack" onSubmit={submit}><label>Email<input value={email} onChange={e=>setEmail(e.target.value)} type="email" required/></label><label>Password<input value={password} onChange={e=>setPassword(e.target.value)} type="password" required/></label>{error&&<div className="error-box">{error}</div>}<button className="primary-button" disabled={busy}>{busy?"Signing in…":"Sign in"}</button></form><p className="muted small">Learner registration will be connected through the Admin-controlled account flow.</p></main>;
}