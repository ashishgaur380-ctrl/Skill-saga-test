"use client";

import { httpsCallable } from "firebase/functions";
import { useCallback, useEffect, useMemo, useState } from "react";
import { firebaseFunctions } from "../../lib/firebase";

type Board = {
  id: string;
  name: string;
  code: string;
  active: boolean;
  sortOrder: number;
};

type AcademicListResponse = { items: Board[] };
type AcademicIdResponse = { id: string };

const listAcademic = httpsCallable<{ collection: string }, AcademicListResponse>(
  firebaseFunctions,
  "listAcademic"
);
const createAcademic = httpsCallable<
  { collection: string; data: Omit<Board, "id"> },
  AcademicIdResponse
>(firebaseFunctions, "createAcademic");
const updateAcademic = httpsCallable<
  { collection: string; id: string; data: Omit<Board, "id"> },
  { success: boolean }
>(firebaseFunctions, "updateAcademic");
const archiveAcademic = httpsCallable<
  { collection: string; id: string },
  { success: boolean }
>(firebaseFunctions, "archiveAcademic");

const modules = [
  ["boards", "Boards", "Supported education boards and curricula."],
  ["classes", "Classes", "Class levels 1–12 and future levels."],
  ["subjects", "Subjects", "Map subjects to boards and classes."],
  ["chapters", "Chapters", "Organize subject content."],
  ["topics", "Topics", "Organize chapters into reusable topics."],
  ["skills", "Skills", "Manage skill categories and skills."],
] as const;

export default function AcademicManager() {
  const [activeModule, setActiveModule] = useState("boards");
  const [boards, setBoards] = useState<Board[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [editing, setEditing] = useState<Board | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ name: "", code: "", sortOrder: 0, active: true });

  const current = useMemo(
    () => modules.find((item) => item[0] === activeModule) ?? modules[0],
    [activeModule]
  );

  const loadBoards = useCallback(async () => {
    if (activeModule !== "boards") return;
    setLoading(true);
    setError(null);
    try {
      const result = await listAcademic({ collection: "boards" });
      setBoards(result.data.items ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load boards. Make sure the Academic Functions are deployed."
      );
    } finally {
      setLoading(false);
    }
  }, [activeModule]);

  useEffect(() => {
    void loadBoards();
  }, [loadBoards]);

  const filteredBoards = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return boards;
    return boards.filter(
      (board) =>
        board.name.toLowerCase().includes(query) ||
        board.code.toLowerCase().includes(query)
    );
  }, [boards, search]);

  function openCreate() {
    setEditing(null);
    setForm({ name: "", code: "", sortOrder: boards.length, active: true });
    setFormOpen(true);
    setError(null);
    setNotice(null);
  }

  function openEdit(board: Board) {
    setEditing(board);
    setForm({
      name: board.name,
      code: board.code,
      sortOrder: board.sortOrder,
      active: board.active,
    });
    setFormOpen(true);
    setError(null);
    setNotice(null);
  }

  async function saveBoard() {
    if (!form.name.trim() || !form.code.trim()) {
      setError("Board name and code are required.");
      return;
    }

    setSaving(true);
    setError(null);
    setNotice(null);

    try {
      const data = {
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        sortOrder: Number(form.sortOrder),
        active: form.active,
      };

      if (editing) {
        await updateAcademic({ collection: "boards", id: editing.id, data });
        setNotice("Board updated successfully.");
      } else {
        await createAcademic({ collection: "boards", data });
        setNotice("Board created successfully.");
      }

      setFormOpen(false);
      setEditing(null);
      await loadBoards();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save board.");
    } finally {
      setSaving(false);
    }
  }

  async function archiveBoard(board: Board) {
    if (!window.confirm(`Archive "${board.name}"? It will no longer be active for new academic mappings.`)) {
      return;
    }

    setSaving(true);
    setError(null);
    setNotice(null);

    try {
      await archiveAcademic({ collection: "boards", id: board.id });
      setNotice("Board archived.");
      await loadBoards();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to archive board.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="academic-manager">
      <header className="academic-header">
        <div>
          <span className="academic-eyebrow">SYSTEM CONFIGURATION</span>
          <h1>Academic Structure</h1>
          <p>Central academic configuration for Learn, Play, assignments and competitions.</p>
        </div>
        <div className="academic-status"><span className="status-dot" /> Server-authoritative</div>
      </header>

      <nav className="academic-tabs" aria-label="Academic modules">
        {modules.map(([key, name]) => (
          <button
            key={key}
            type="button"
            className={activeModule === key ? "academic-tab active" : "academic-tab"}
            onClick={() => { setActiveModule(key); setSearch(""); setError(null); setNotice(null); }}
          >
            {name}
          </button>
        ))}
      </nav>

      {activeModule !== "boards" ? (
        <section className="academic-panel">
          <div className="academic-panel-header">
            <div><h2>{current[1]}</h2><p>{current[2]}</p></div>
          </div>
          <div className="academic-empty">
            <div className="empty-icon">◎</div>
            <h3>{current[1]} manager is next</h3>
            <p>The same server-authoritative CRUD pattern used for Boards will be applied to this academic entity.</p>
          </div>
        </section>
      ) : (
        <section className="academic-panel">
          <div className="academic-panel-header">
            <div><h2>Boards</h2><p>Manage supported education boards and curricula.</p></div>
            <button type="button" className="primary-button" onClick={openCreate}>+ Add Board</button>
          </div>

          <div className="academic-toolbar">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search boards by name or code..."
              aria-label="Search boards"
            />
            <span className="record-count">{boards.length} board{boards.length === 1 ? "" : "s"}</span>
          </div>

          {error && <div className="academic-message error">{error}</div>}
          {notice && <div className="academic-message success">{notice}</div>}

          {loading ? (
            <div className="academic-empty"><h3>Loading boards…</h3></div>
          ) : filteredBoards.length === 0 ? (
            <div className="academic-empty">
              <div className="empty-icon">◎</div>
              <h3>{search ? "No matching boards" : "No boards configured yet"}</h3>
              <p>{search ? "Try a different search term." : "Create the first board to start building the central academic hierarchy."}</p>
              {!search && <button type="button" className="secondary-button" onClick={openCreate}>Create first board</button>}
            </div>
          ) : (
            <div className="academic-table-wrap">
              <table className="academic-table">
                <thead><tr><th>Board</th><th>Code</th><th>Status</th><th>Order</th><th>Actions</th></tr></thead>
                <tbody>
                  {filteredBoards.map((board) => (
                    <tr key={board.id}>
                      <td><strong>{board.name}</strong></td>
                      <td><code>{board.code}</code></td>
                      <td><span className={board.active ? "status-pill active" : "status-pill"}>{board.active ? "Active" : "Archived"}</span></td>
                      <td>{board.sortOrder}</td>
                      <td>
                        <div className="row-actions">
                          <button type="button" className="text-button" onClick={() => openEdit(board)}>Edit</button>
                          {board.active && <button type="button" className="text-button danger" disabled={saving} onClick={() => void archiveBoard(board)}>Archive</button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {formOpen && (
        <div className="modal-backdrop" role="presentation">
          <section className="academic-modal" role="dialog" aria-modal="true" aria-labelledby="board-form-title">
            <div className="modal-header">
              <div><span className="academic-eyebrow">ACADEMIC STRUCTURE</span><h2 id="board-form-title">{editing ? "Edit Board" : "Add Board"}</h2></div>
              <button type="button" className="modal-close" onClick={() => setFormOpen(false)} aria-label="Close">×</button>
            </div>
            <div className="form-grid">
              <label>Board name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. CBSE" /></label>
              <label>Board code<input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g. CBSE" /></label>
              <label>Sort order<input type="number" min="0" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} /></label>
              <label className="checkbox-row"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Active</label>
            </div>
            {error && <div className="academic-message error">{error}</div>}
            <div className="modal-actions">
              <button type="button" className="secondary-button" onClick={() => setFormOpen(false)} disabled={saving}>Cancel</button>
              <button type="button" className="primary-button" onClick={() => void saveBoard()} disabled={saving}>{saving ? "Saving…" : editing ? "Save changes" : "Create board"}</button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
