export default function QuizManagerPage() {
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
        </nav>
      </aside>
      <section className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">ASSESSMENT</p>
            <h1>Quiz Manager</h1>
            <p className="muted">Create and manage quizzes from the central Question Bank.</p>
          </div>
        </header>
        <section className="panel">
          <h2>Quiz Manager</h2>
          <p>Module route is active. We will test one draft quiz before building the full quiz engine.</p>
        </section>
      </section>
    </main>
  );
}
