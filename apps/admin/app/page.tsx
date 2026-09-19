const modules = [
  "Users",
  "Academic Structure",
  "Content",
  "Question Bank",
  "Quiz Manager",
  "Competition Manager",
  "Automation",
  "Community",
  "Rewards",
  "Notifications",
  "Analytics",
  "System Settings"
];

export default function AdminHome() {
  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand">Skill Saga</div>
        <div className="brand-subtitle">Admin Console</div>
        <nav>
          {modules.map((module) => (
            <button className="nav-item" key={module}>{module}</button>
          ))}
        </nav>
      </aside>

      <section className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">SKILL SAGA 2.0</p>
            <h1>Administration Console</h1>
            <p className="muted">Central control for learning, assessment, competition and platform operations.</p>
          </div>
          <span className="environment">DEVELOPMENT</span>
        </header>

        <section className="cards">
          <article><span>Users</span><strong>—</strong><small>Connect Firebase</small></article>
          <article><span>Published Content</span><strong>—</strong><small>Not connected</small></article>
          <article><span>Quiz Activity</span><strong>—</strong><small>Not connected</small></article>
          <article><span>Automation Health</span><strong>—</strong><small>Not connected</small></article>
        </section>

        <section className="panel">
          <h2>Foundation status</h2>
          <ul>
            <li>Repository foundation: ready</li>
            <li>Database contracts: defined</li>
            <li>Security baseline: deny by default</li>
            <li>Firebase environment: awaiting project configuration</li>
            <li>Authentication: next implementation step</li>
          </ul>
        </section>
      </section>
    </main>
  );
}
