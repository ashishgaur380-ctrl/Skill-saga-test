"use client";
import { FormEvent, useEffect, useRef, useState } from "react";
import { RecaptchaVerifier, ConfirmationResult, createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPhoneNumber, updateProfile } from "firebase/auth";
import { learnerAuth } from "../../lib/firebase";

const APP_BASE = process.env.NEXT_PUBLIC_GITHUB_PAGES === "true" ? "/Skill-saga-test" : "";

export default function LoginPage() {
  const [mode,setMode]=useState<"email"|"phone">("email");
  const [authMode,setAuthMode]=useState<"signin"|"signup">("signin");
  const [name,setName]=useState(""),[email,setEmail]=useState(""),[password,setPassword]=useState(""),[phone,setPhone]=useState(""),[otp,setOtp]=useState("");
  const [confirmation,setConfirmation]=useState<ConfirmationResult|null>(null);
  const [busy,setBusy]=useState(false),[error,setError]=useState(""),[message,setMessage]=useState("");
  const recaptcha=useRef<RecaptchaVerifier|null>(null);
  useEffect(()=>()=>{recaptcha.current?.clear();},[]);
  function clearMessages(){setError("");setMessage("");}
  function ensureRecaptcha(){if(typeof window==="undefined")return;if(!recaptcha.current)recaptcha.current=new RecaptchaVerifier(learnerAuth,"recaptcha-container",{size:"invisible"});}
  async function sendOtp(){const digits=phone.replace(/\D/g,"");if(!/^91\d{10}$/.test(digits)){setError("Enter a valid Indian mobile number with +91.");return;}setBusy(true);clearMessages();try{ensureRecaptcha();const result=await signInWithPhoneNumber(learnerAuth,"+"+digits,recaptcha.current!);setConfirmation(result);setMessage("OTP sent. Enter the 6-digit code.");}catch(err:any){recaptcha.current?.clear();recaptcha.current=null;setError(err?.message?.replace("Firebase: ","")||"Unable to send OTP.");}finally{setBusy(false);}}
  async function verifyOtp(e:FormEvent){e.preventDefault();if(!confirmation)return;if(!/^\d{6}$/.test(otp.trim())){setError("Enter the 6-digit OTP.");return;}setBusy(true);clearMessages();try{await confirmation.confirm(otp.trim());window.location.href=APP_BASE+"/";}catch(err:any){setError(err?.message?.replace("Firebase: ","")||"Invalid OTP.");}finally{setBusy(false);}}
  async function resetPassword(){if(!email.trim()){setError("Enter your email first.");return;}setBusy(true);clearMessages();try{await sendPasswordResetEmail(learnerAuth,email.trim());setMessage("Password reset email sent. Check your inbox.");}catch(err:any){setError(err?.message?.replace("Firebase: ","")||"Unable to send reset email.");}finally{setBusy(false);}}
  async function submit(e:FormEvent){e.preventDefault();setBusy(true);clearMessages();try{if(authMode==="signup"){if(name.trim().length<2){setError("Enter your name.");setBusy(false);return;}if(password.length<6){setError("Password must be at least 6 characters.");setBusy(false);return;}const cred=await createUserWithEmailAndPassword(learnerAuth,email.trim(),password);await updateProfile(cred.user,{displayName:name.trim()});window.location.href=APP_BASE+"/";}else{await signInWithEmailAndPassword(learnerAuth,email.trim(),password);window.location.href=APP_BASE+"/";}}catch(err:any){setError(err?.message?.replace("Firebase: ","")||"Unable to continue.");}finally{setBusy(false);}}
  return <main className="page-shell narrow">
    <section className="hero-card"><p className="eyebrow">SKILL SAGA</p><h1>{authMode==="signup"?"Create your account":"Welcome back"}</h1><p className="muted">{authMode==="signup"?"Join Skill Saga and start your learning journey.":"Sign in to access your learning, quizzes, XP and progress."}</p></section>
    <div className="auth-switch"><button className={authMode==="signin"?"active":""} onClick={()=>{setAuthMode("signin");clearMessages();}}>Sign in</button><button className={authMode==="signup"?"active":""} onClick={()=>{setAuthMode("signup");setMode("email");clearMessages();}}>Sign up</button></div>
    <div className="auth-switch"><button className={mode==="email"?"active":""} onClick={()=>{setMode("email");clearMessages();}}>Email</button><button className={mode==="phone"?"active":""} onClick={()=>{setMode("phone");setAuthMode("signin");clearMessages();}}>Mobile OTP</button></div>
    {mode==="email"?<form className="panel form-stack" onSubmit={submit}>
      {authMode==="signup"&&<label>Name<input value={name} onChange={e=>setName(e.target.value)} autoComplete="name" required/></label>}
      <label>Email<input value={email} onChange={e=>setEmail(e.target.value)} type="email" autoComplete="email" required/></label>
      <label>Password<input value={password} onChange={e=>setPassword(e.target.value)} type="password" autoComplete={authMode==="signup"?"new-password":"current-password"} required/></label>
      {error&&<div className="error-box">{error}</div>}{message&&<div className="ss-message">{message}</div>}
      <button className="primary-button" disabled={busy}>{busy?(authMode==="signup"?"Creating account…":"Signing in…"):(authMode==="signup"?"Create account":"Sign in")}</button>
      {authMode==="signin"&&<button type="button" className="secondary-button" onClick={()=>void resetPassword()} disabled={busy}>Forgot / Reset Password</button>}
    </form>:<form className="panel form-stack" onSubmit={verifyOtp}>
      <label>Mobile number<input value={phone} onChange={e=>setPhone(e.target.value)} type="tel" inputMode="tel" placeholder="+91 9876543210" disabled={!!confirmation} required/></label>
      {!confirmation?<button type="button" className="primary-button" onClick={()=>void sendOtp()} disabled={busy}>{busy?"Sending OTP…":"Send OTP"}</button>:<><label>6-digit OTP<input value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,"").slice(0,6))} inputMode="numeric" autoComplete="one-time-code" required/></label><button className="primary-button" disabled={busy}>{busy?"Verifying…":"Verify OTP"}</button><button type="button" className="secondary-button" onClick={()=>{setConfirmation(null);setOtp("");setMessage("");}}>Change number</button></>}
      {error&&<div className="error-box">{error}</div>}{message&&<div className="ss-message">{message}</div>}
    </form>}
    <div id="recaptcha-container" />
    <p className="muted small">Your account is secured by Firebase Authentication. By continuing, you agree to the Skill Saga Terms and Privacy Policy.</p>
  </main>;
}