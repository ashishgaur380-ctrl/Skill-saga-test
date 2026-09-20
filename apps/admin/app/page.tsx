"use client";

import Link from "next/link";
import { useAuth } from "../components/auth-provider";

const modules = [
  ["👥","Users","/users"],["🗺️","Academic Structure","/academic"],["📝","Content","/content"],
  ["❓","Question Bank","/question-bank"],["🎯","Quiz Manager","/quiz-manager"],["🏆","Competition Manager","/competition-manager"],
  ["⚙️","Automation","/automation"],["💬","Community","/community"],["🎁","Rewards","/rewards"],
  ["🔔","Notifications","/notifications"],["📊","Analytics","/analytics"],["🛠️","System Settings","/system-settings"],
] as const;

export default function AdminHome() {
  const { user, role, signOut } = useAuth();
  return <main className="shell">
    <aside className="sidebar">
      <div className="brand">Skill Saga</div>
      <div className="brand-subtitle">2.0 · Admin Console</div>
      <nav aria-label="Admin navigation">
        {modules.map(([icon,label,href])=><Link className="nav-item" href={href} key={href}><span>{icon}</span>{label}</Link>)}
      </nav>
    </aside>
    <section className="content">
      <header className="topbar">
        <div>
          <p className="eyebrow">SKILL SAGA 2.0</p>
          <h1>Administration Console</h1>
          <p className="muted">One control center for learning, assessment, competition and platform operations.</p>
        </div>
        <div className="admin-session">
          <div><strong>{user?.email}</strong><span>{role}</span></div>
          <button className="signout" onClick={() => signOut()}>Sign out</button>
        </div>
      </header>
      <section className="cards">
        <article><span>👥 Users</span><strong>—</strong><small>User management is connected to Firebase Auth.</small></article>
        <article><span>📚 Published Content</span><strong>—</strong><small>Academic and content management is ready.</small></article>
        <article><span>🎯 Quiz Activity</span><strong>—</strong><small>Question, quiz and competition engines are connected.</small></article>
        <article><span>⚡ Automation Health</span><strong>—</strong><small>Automation controls are available from the console.</small></article>
      </section>
      <section className="panel">
        <p className="eyebrow">PLATFORM FOUNDATION</p>
        <h2>Skill Saga control center</h2>
        <ul>
          <li>Centralized administration with role-based access.</li>
          <li>Academic structure, question bank and quiz management.</li>
          <li>Competitions, rewards, community and notifications.</li>
          <li>Automation, analytics and system-level feature controls.</li>
          <li>Server-side Firebase functions remain the trusted business-logic boundary.</li>
        </ul>
      </section>
    </section>
  </main>;
}
