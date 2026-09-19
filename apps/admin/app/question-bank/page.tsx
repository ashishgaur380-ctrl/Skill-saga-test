export default function QuestionBankPage() {
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
        </nav>
      </aside>
      <section className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">QUESTION BANK</p>
            <h1>Question Bank</h1>
            <p className="muted">Central question creation, review and management.</p>
          </div>
        </header>
        <section className="panel">
          <h2>Question Bank module</h2>
          <p>Module route is active. Question workflows will be added and tested here.</p>
        </section>
      </section>
    </main>
  );
}
