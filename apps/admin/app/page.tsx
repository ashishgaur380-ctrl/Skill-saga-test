"use client";

import Link from "next/link";
import { useAuth } from "../components/auth-provider";

const modules = [
  { label: "Users", href: null },
  { label: "Academic Structure", href: "/academic" },
  { label: "Content", href: "/content" },
  { label: "Question Bank", href: "/question-bank" },
  { label: "Quiz Manager", href: "/quiz-manager" },
  { label: "Competition Manager", href: "/competition-manager" },
  { label: "Automation", href: "/automation" },
  { label: "Community", href: "/community" },
  { label: "Rewards", href: null },
  { label: "Notifications", href: null },
  { label: "Analytics", href: null },
  { label: "System Settings", href: null },
];

export default function AdminHome() {
  const { user, role, signOut } = useAuth();

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand">Skill Saga</div>
        <div className="brand-subtitle">Admin Console</div>
        <nav>
          {modules.map((module) => {
            const className = "nav-item";

            if (module.href) {
              return (
                <Link className={className} href={module.href} key={module.label}>
                  {module.label}
                </Link>
              );
            }

            return (
              <button className={className} key={module.label} type="button" disabled>
                {module.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <section className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">SKILL SAGA 2.0</p>
            <h1>Administration Console</h1>
            <p className="muted">Central control for learning, assessment, competition and platform operations.</p>
          </div>
          <div className="admin-session">
            <div>
              <strong>{user?.email}</strong>
              <span>{role}</span>
            </div>
            <button className="signout" onClick={() => signOut()}>Sign out</button>
          </div>
        </header>

        <section className="cards">
          <article><span>Users</span><strong>—</strong><small>Firebase connected after configuration</small></article>
          <article><span>Published Content</span><strong>—</strong><small>Central content engine</small></article>
          <article><span>Quiz Activity</span><strong>—</strong><small>Quiz engine</small></article>
          <article><span>Automation Health</span><strong>—</strong><small>Automation engine</small></article>
        </section>

        <section className="panel">
          <h2>Foundation status</h2>
          <ul>
            <li>Repository foundation: ready</li>
            <li>Database contracts: defined</li>
            <li>Security baseline: deny by default</li>
            <li>Firebase client authentication: implemented</li>
            <li>Administrator role verification: implemented</li>
          </ul>
        </section>
      </section>
    </main>
  );
}
