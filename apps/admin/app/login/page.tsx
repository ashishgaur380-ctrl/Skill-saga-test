"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../components/auth-provider";

export default function AdminLoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      await signIn(email.trim(), password);
      router.replace("/");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Unable to sign in.";
      if (message.includes("authorized admin role")) {
        setError(message);
      } else if (message.includes("auth/invalid-credential") || message.includes("auth/wrong-password") || message.includes("auth/user-not-found")) {
        setError("Firebase rejected the email/password. Please verify the Firebase user and password.");
      } else if (message.includes("auth/invalid-api-key")) {
        setError("Firebase rejected the Web API key. Please recheck NEXT_PUBLIC_FIREBASE_API_KEY.");
      } else if (message.includes("auth/network-request-failed")) {
        setError("Firebase could not be reached. Check the Codespace network connection.");
      } else {
        setError(`Firebase sign-in error: ${message}`);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand">
          <div className="login-mark">SS</div>
          <div>
            <strong>Skill Saga</strong>
            <span>2.0 Admin Console</span>
          </div>
        </div>

        <div className="login-heading">
          <p className="eyebrow">SECURE ADMIN ACCESS</p>
          <h1>Welcome back</h1>
          <p>Sign in with an authorized Skill Saga administrator account.</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <label>
            Email
            <input
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@example.com"
              required
            />
          </label>

          <label>
            Password
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              required
            />
          </label>

          {error && <div className="login-error" role="alert">{error}</div>}

          <button type="submit" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="login-note">
          Access is controlled by Firebase Authentication and server-issued administrator roles.
        </p>
      </section>
    </main>
  );
}
