export default function ContentPage() {
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
            <p className="eyebrow">CONTENT</p>
            <h1>Content Management</h1>
            <p className="muted">Central management for learning content.</p>
          </div>
        </header>
        <section className="panel">
          <h2>Content module</h2>
          <p>Module route is active. Content workflows will be added and tested here.</p>
        </section>
      </section>
    </main>
  );
}
