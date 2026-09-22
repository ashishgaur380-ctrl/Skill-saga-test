"use client";

import { useCallback, useEffect, useState } from "react";
import { firebaseAuth, firebaseFunctions } from "../../lib/firebase";
import { httpsCallable } from "firebase/functions";

type C = {
  id: string; name: string; description?: string; quizId: string; boardId?: string; classId?: string;
  maxParticipants: number; entryType: string; entryFee: number; status: string; active: boolean;
  startAtMs?: number | null; endAtMs?: number | null;
};
type Q = { id: string; title: string; active: boolean };
type A = { id: string; name: string; code?: string; active: boolean };

const blank = {
  name: "", description: "", quizId: "", boardId: "", classId: "", maxParticipants: 10,
  entryType: "free", entryFee: 0, startAt: "", endAt: "", status: "draft", active: true,
};

async function call<T>(action: string, data: Record<string, unknown> = {}): Promise<T> {
  if (!firebaseAuth.currentUser) throw new Error("You are not authenticated.");
  try {
    const fn = httpsCallable<Record<string, unknown>, T>(firebaseFunctions, action);
    const result = await fn(data);
    return result.data;
  } catch (error: any) {
    const message =
      error?.message ||
      error?.details ||
      "Competition operation failed.";
    throw new Error(message);
  }
}

async function qs(): Promise<Q[]> {
  const u = firebaseAuth.currentUser;
  if (!u) throw new Error("You are not authenticated.");
  const t = await u.getIdToken();
  const r = await fetch("/api/quiz-manager", {
    method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${t}` },
    body: JSON.stringify({ action: "listQuizzes", data: {} }), cache: "no-store",
  });
  const p = await r.json() as any;
  if (!r.ok) throw new Error(p.error?.message || "Unable to load quizzes.");
  return p.data?.items ?? [];
}

async function ac(c: string): Promise<A[]> {
  const u = firebaseAuth.currentUser;
  if (!u) throw new Error("You are not authenticated.");
  const t = await u.getIdToken();
  const r = await fetch("/api/academic", {
    method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${t}` },
    body: JSON.stringify({ action: "listAcademic", data: { collection: c } }), cache: "no-store",
  });
  const p = await r.json() as any;
  if (!r.ok) throw new Error(p.error?.message || "Unable to load academic data.");
  return p.data?.items ?? [];
}

function toLocalInput(ms?: number | null) {
  if (!Number.isFinite(Number(ms))) return "";
  const d = new Date(Number(ms));
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function CompetitionManager() {
  const [items, setItems] = useState<C[]>([]);
  const [quizzes, setQuizzes] = useState<Q[]>([]);
  const [academic, setAcademic] = useState<Record<string, A[]>>({});
  const [form, setForm] = useState({ ...blank });
  const [editing, setEditing] = useState<C | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [c, q, b, cl] = await Promise.all([
        call<{ items: C[] }>("listCompetitions"), qs(), ac("boards"), ac("classes"),
      ]);
      setItems(c.items ?? []); setQuizzes(q); setAcademic({ boards: b, classes: cl });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load competitions.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  function create() {
    setEditing(null); setForm({ ...blank }); setOpen(true); setError(null); setNotice(null);
  }

  function edit(x: C) {
    setEditing(x);
    setForm({
      name: x.name, description: x.description ?? "", quizId: x.quizId, boardId: x.boardId ?? "",
      classId: x.classId ?? "", maxParticipants: x.maxParticipants, entryType: x.entryType,
      entryFee: x.entryFee ?? 0, startAt: toLocalInput(x.startAtMs), endAt: toLocalInput(x.endAtMs),
      status: x.status, active: x.active,
    });
    setOpen(true); setError(null); setNotice(null);
  }

  async function save() {
    setSaving(true); setError(null);
    try {
      const data = {
        name: form.name, description: form.description, quizId: form.quizId, boardId: form.boardId,
        classId: form.classId, maxParticipants: form.maxParticipants, entryType: form.entryType,
        entryFee: form.entryFee, status: form.status, active: form.active,
        startAtMs: form.startAt ? new Date(form.startAt).getTime() : null,
        endAtMs: form.endAt ? new Date(form.endAt).getTime() : null,
      };
      if (editing) await call("updateCompetition", { id: editing.id, data });
      else await call("createCompetition", { data });
      setOpen(false);
      setNotice(editing ? "Competition updated successfully." : "Competition created successfully.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save competition.");
    } finally { setSaving(false); }
  }

  async function archive(x: C) {
    if (!confirm(`Archive "${x.name}"?`)) return;
    setSaving(true); setError(null);
    try { await call("archiveCompetition", { id: x.id }); setNotice("Competition archived."); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to archive competition."); }
    finally { setSaving(false); }
  }

  return (
    <main className="academic-manager">
      <header className="academic-header">
        <div><span className="academic-eyebrow">COMPETITION</span><h1>Competition Manager</h1><p>Configure live challenges, scheduling, capacity and entry rules.</p></div>
      </header>

      <section className="academic-panel">
        <div className="academic-panel-header">
          <div><h2>Competitions</h2><p>Published competitions flow directly into Skill Saga UI 2.0.</p></div>
          <button className="primary-button" onClick={create}>+ Add Competition</button>
        </div>
        {error && <div className="academic-message error">{error}</div>}
        {notice && <div className="academic-message success">{notice}</div>}
        {loading ? <div className="academic-empty"><h3>Loading…</h3></div> :
          !items.length ? <div className="academic-empty"><h3>No competitions yet</h3><p>Create a draft, assign a published quiz and schedule it.</p><button className="secondary-button" onClick={create}>Create competition</button></div> :
          <div className="academic-table-wrap"><table className="academic-table"><thead><tr><th>Name</th><th>Quiz</th><th>Schedule</th><th>Participants</th><th>Status</th><th>Actions</th></tr></thead><tbody>
            {items.map(x => <tr key={x.id}>
              <td><strong>{x.name}</strong></td>
              <td>{quizzes.find(q => q.id === x.quizId)?.title ?? x.quizId}</td>
              <td>{x.startAtMs ? new Date(x.startAtMs).toLocaleString() : "Immediate"}{x.endAtMs ? ` → ${new Date(x.endAtMs).toLocaleString()}` : ""}</td>
              <td>{x.maxParticipants}</td>
              <td><span className={x.active ? "status-pill active" : "status-pill"}>{x.active ? x.status : "Archived"}</span></td>
              <td><div className="row-actions"><button className="text-button" onClick={() => edit(x)}>Edit</button>{x.active && <button className="text-button danger" disabled={saving} onClick={() => void archive(x)}>Archive</button>}</div></td>
            </tr>)}
          </tbody></table></div>}
      </section>

      {open && <div className="modal-backdrop"><section className="academic-modal importer-modal">
        <div className="modal-header"><div><span className="academic-eyebrow">COMPETITION</span><h2>{editing ? "Edit Competition" : "Add Competition"}</h2></div><button className="modal-close" onClick={() => setOpen(false)}>×</button></div>
        <div className="form-grid">
          <label>Name<input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Weekly Skill Challenge" /></label>
          <label>Status<select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}><option value="draft">Draft</option><option value="published">Published</option></select></label>
          <label className="full-width">Description<textarea rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></label>
          <label>Quiz<select value={form.quizId} onChange={e => setForm({ ...form, quizId: e.target.value })}><option value="">Select quiz</option>{quizzes.map(q => <option key={q.id} value={q.id}>{q.title}{q.active ? "" : " (Archived)"}</option>)}</select></label>
          <label>Board<select value={form.boardId} onChange={e => setForm({ ...form, boardId: e.target.value })}><option value="">All boards</option>{(academic.boards ?? []).map(x => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
          <label>Class<select value={form.classId} onChange={e => setForm({ ...form, classId: e.target.value })}><option value="">All classes</option>{(academic.classes ?? []).map(x => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
          <label>Max participants<input type="number" min="1" value={form.maxParticipants} onChange={e => setForm({ ...form, maxParticipants: Number(e.target.value) })} /></label>
          <label>Entry<select value={form.entryType} onChange={e => setForm({ ...form, entryType: e.target.value })}><option value="free">Free</option><option value="paid">Paid</option></select></label>
          {form.entryType === "paid" && <label>Entry fee (₹)<input type="number" min="1" step="1" value={form.entryFee} onChange={e => setForm({ ...form, entryFee: Number(e.target.value) })} /></label>}
          <label>Starts at<input type="datetime-local" value={form.startAt} onChange={e => setForm({ ...form, startAt: e.target.value })} /></label>
          <label>Ends at<input type="datetime-local" value={form.endAt} onChange={e => setForm({ ...form, endAt: e.target.value })} /></label>
          <label className="checkbox-row"><input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} /> Active</label>
        </div>
        {error && <div className="academic-message error">{error}</div>}
        <div className="modal-actions"><button className="secondary-button" onClick={() => setOpen(false)}>Cancel</button><button className="primary-button" disabled={saving} onClick={() => void save()}>{saving ? "Saving…" : editing ? "Save changes" : "Create"}</button></div>
      </section></div>}
    </main>
  );
}
