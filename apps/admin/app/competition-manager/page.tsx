export default function CompetitionManagerPage() {
  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand">Skill Saga</div>
        <div className="brand-subtitle">Admin Console</div>
        <nav>
          <a className="nav-item" href="/">Dashboard</a>
          <a className="nav-item" href="/academic">Academic Structure</a>
          <a className="nav-item" href="/content">Content</a>
          <a className="nav-item" href="/question-bank">Question Bank</a>
          <a className="nav-item" href="/quiz-manager">Quiz Manager</a>
          <a className="nav-item" href="/competition-manager">Competition Manager</a>
        </nav>
      </aside>
      <section className="content">
        <header className="topbar"><div><p className="eyebrow">COMPETITION</p><h1>Competition Manager</h1><p className="muted">Create and manage learner competitions.</p></div></header>
        <section className="panel"><h2>Competition Manager</h2><p>Module route is active. We will test one small draft competition before building the full competition engine.</p></section>
      </section>
    </main>
  );
}