"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { firebaseAuth } from "../../lib/firebase";

type Item = { id: string; name: string; active: boolean; code?: string; subjectId?: string; chapterId?: string; categoryId?: string };
type Question = {
  id: string; questionText: string; options: string[]; correctOption: number;
  explanation?: string; difficulty: string; marks: number;
  boardId: string; classId: string; subjectId: string; chapterId: string; topicId: string; skillId?: string;
  status: string; active: boolean;
};

async function callQuestion<T>(action: string, data: Record<string, unknown> = {}): Promise<T> {
  const user = firebaseAuth.currentUser;
  if (!user) throw new Error("You are not authenticated. Please sign in again.");
  const token = await user.getIdToken();
  const response = await fetch("/api/question-bank", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ action, data }),
    cache: "no-store",
  });
  const payload = await response.json() as { data?: T; error?: { message?: string } };
  if (!response.ok) throw new Error(payload.error?.message || "Question Bank operation failed.");
  return payload.data as T;
}

async function listAcademic(collection: string): Promise<Item[]> {
  const user = firebaseAuth.currentUser;
  if (!user) throw new Error("You are not authenticated.");
  const token = await user.getIdToken();
  const response = await fetch("/api/academic", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ action: "listAcademic", data: { collection } }),
    cache: "no-store",
  });
  const payload = await response.json() as { data?: { items: Item[] }; error?: { message?: string } };
  if (!response.ok) throw new Error(payload.error?.message || "Unable to load academic data.");
  return payload.data?.items ?? [];
}

const blank = {
  questionText: "", options: ["", "", "", ""], correctOption: 0, explanation: "",
  difficulty: "easy", marks: 1, boardId: "", classId: "", subjectId: "", chapterId: "",
  topicId: "", skillId: "", status: "draft", active: true,
};

export default function QuestionBankManager() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [academic, setAcademic] = useState<Record<string, Item[]>>({});
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState<Question | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [bulkFile, setBulkFile] = useState<File | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [q, boards, classes, subjects, chapters, topics] = await Promise.all([
        callQuestion<{ items: Question[] }>("listQuestions"),
        listAcademic("boards"), listAcademic("classes"), listAcademic("subjects"),
        listAcademic("chapters"), listAcademic("topics"),
      ]);
      setQuestions(q.items ?? []);
      setAcademic({ boards, classes, subjects, chapters, topics });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load Question Bank.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const active = (key: string) => academic[key] ?? [];
  const chapterLabel = (id: string) => active("chapters").find(x => x.id === id)?.name ?? id;
  const subjectLabel = (id: string) => active("subjects").find(x => x.id === id)?.name ?? id;

  function openCreate() {
    setEditing(null); setForm({ ...blank }); setOpen(true); setError(null); setNotice(null);
  }
  function openEdit(q: Question) {
    setEditing(q);
    setForm({
      questionText: q.questionText, options: [...q.options], correctOption: q.correctOption,
      explanation: q.explanation ?? "", difficulty: q.difficulty, marks: q.marks,
      boardId: q.boardId, classId: q.classId, subjectId: q.subjectId, chapterId: q.chapterId,
      topicId: q.topicId ?? "", skillId: q.skillId ?? "", status: q.status, active: q.active,
    });
    setOpen(true); setError(null); setNotice(null);
  }

  function parseCsv(input: string) {
    const rows: string[][] = []; let row: string[] = [], cell = "", quoted = false;
    for (let i = 0; i < input.length; i++) {
      const c = input[i];
      if (c === '"') { if (quoted && input[i + 1] === '"') { cell += '"'; i++; } else quoted = !quoted; }
      else if (c === ',' && !quoted) { row.push(cell.trim()); cell = ""; }
      else if ((c === "\n" || c === "\r") && !quoted) { if (c === "\r" && input[i + 1] === "\n") i++; row.push(cell.trim()); cell = ""; if (row.some(Boolean)) rows.push(row); row = []; }
      else cell += c;
    }
    if (cell || row.length) { row.push(cell.trim()); if (row.some(Boolean)) rows.push(row); }
    return rows;
  }

  async function bulkImport() {
    if (!bulkFile) return;
    setSaving(true); setError(null); setNotice(null);
    try {
      const matrix = parseCsv(await bulkFile.text());
      if (!matrix.length) throw new Error("CSV is empty.");
      const headers = matrix[0].map(v => v.trim().toLowerCase().replace(/\s+/g, ""));
      const rows = matrix.slice(1).filter(r => r.some(Boolean)).map(r => { const raw = Object.fromEntries(headers.map((h, i) => [h, r[i] ?? ""])); const alias = (target:string, ...sources:string[]) => { if (raw[target] === undefined || raw[target] === "") for (const source of sources) if (raw[source] !== undefined && raw[source] !== "") { raw[target] = raw[source]; break; } }; alias("boardCode","boardcode","board","boardname","board_code"); alias("classCode","classcode","class","classname","class_code"); alias("subjectCode","subjectcode","subject","subjectname","subject_code"); alias("chapterName","chaptername","chapter","chapter_name"); alias("topicName","topicname","topic","topic_name"); alias("questionText","questiontext","question","question_text"); alias("correctOption","correctoption","correct","correct_option","correctanswer","correct_answer"); return raw; });
      if (rows.length > 5000) throw new Error("Maximum 5,000 questions per import.");
      const result = await callQuestion<{success:boolean;imported:number;errors?:Array<{row:number;message:string}>}>("bulkImportQuestions", { rows });
      if (!result.success) throw new Error((result.errors ?? []).slice(0, 5).map(x => `Row ${x.row}: ${x.message}`).join(" | ") || "Import failed.");
      setBulkFile(null); setNotice(`Imported ${result.imported} questions successfully.`); await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to import questions."); }
    finally { setSaving(false); }
  }

  async function save() {
    setSaving(true); setError(null); setNotice(null);
    try {
      if (editing) {
        await callQuestion("updateQuestion", { id: editing.id, data: form });
        setNotice("Question updated successfully.");
      } else {
        await callQuestion("createQuestion", { data: form });
        setNotice("Question created successfully.");
      }
      setOpen(false); setEditing(null); await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to save question."); }
    finally { setSaving(false); }
  }

  async function archive(q: Question) {
    if (!window.confirm(`Archive this question?\n\n${q.questionText}`)) return;
    setSaving(true); setError(null);
    try {
      await callQuestion("archiveQuestion", { id: q.id });
      setNotice("Question archived."); await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to archive question."); }
    finally { setSaving(false); }
  }

  const counts = useMemo(() => ({
    active: questions.filter(q => q.active).length,
    draft: questions.filter(q => q.status === "draft").length,
  }), [questions]);

  return (
    <main className="academic-manager">
      <header className="academic-header">
        <div><span className="academic-eyebrow">ASSESSMENT</span><h1>Question Bank</h1>
          <p>Server-authoritative question creation and review.</p></div>
        <div className="academic-status"><span className="status-dot" /> {counts.active} active • {counts.draft} draft</div>
      </header>

            <section className="academic-panel">
        <div className="academic-panel-header"><div><h2>Bulk Question Import</h2><p>CSV: questionText, option1, option2, option3, option4, correctOption, explanation, difficulty, marks, board, class, subject, chapter, topic, status.</p></div></div>
        <div className="row-actions"><input type="file" accept=".csv,.txt" onChange={e => setBulkFile(e.target.files?.[0] ?? null)} /><button className="secondary-button" disabled={!bulkFile || saving} onClick={() => void bulkImport()}>{saving ? "Importing…" : "Import Questions"}</button></div>
      </section>

<section className="academic-panel">
        <div className="academic-panel-header"><div><h2>Questions</h2><p>Start with a tiny test set before importing real content.</p></div>
          <button type="button" className="primary-button" onClick={openCreate}>+ Add Question</button></div>
        {error && <div className="academic-message error">{error}</div>}
        {notice && <div className="academic-message success">{notice}</div>}

        {loading ? <div className="academic-empty"><h3>Loading questions…</h3></div> :
          questions.length === 0 ? <div className="academic-empty"><div className="empty-icon">?</div><h3>No questions yet</h3><p>Create one test question to verify the complete Question Bank flow.</p><button className="secondary-button" onClick={openCreate}>Create test question</button></div> :
          <div className="academic-table-wrap"><table className="academic-table"><thead><tr><th>Question</th><th>Chapter</th><th>Subject</th><th>Difficulty</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>{questions.map(q => <tr key={q.id}><td><strong>{q.questionText}</strong></td><td>{chapterLabel(q.chapterId)}</td><td>{subjectLabel(q.subjectId)}</td><td>{q.difficulty}</td><td><span className={q.active ? "status-pill active" : "status-pill"}>{q.active ? q.status : "Archived"}</span></td><td><div className="row-actions"><button className="text-button" onClick={() => openEdit(q)}>Edit</button>{q.active && <button className="text-button danger" disabled={saving} onClick={() => void archive(q)}>Archive</button>}</div></td></tr>)}</tbody>
          </table></div>}
      </section>

      {open && <div className="modal-backdrop" role="presentation"><section className="academic-modal importer-modal" role="dialog" aria-modal="true">
        <div className="modal-header"><div><span className="academic-eyebrow">QUESTION</span><h2>{editing ? "Edit Question" : "Add Question"}</h2></div><button className="modal-close" onClick={() => setOpen(false)}>×</button></div>
        <div className="form-grid">
          <label className="full-width">Question text<textarea rows={3} value={form.questionText} onChange={e => setForm({...form, questionText:e.target.value})} placeholder="e.g. What is 2 + 2?" /></label>
          {form.options.map((option, i) => <label key={i}>Option {i + 1}<input value={option} onChange={e => { const options=[...form.options]; options[i]=e.target.value; setForm({...form, options}); }} /></label>)}
          <label>Correct answer<select value={form.correctOption} onChange={e => setForm({...form, correctOption:Number(e.target.value)})}>{form.options.map((_,i)=><option key={i} value={i}>Option {i+1}</option>)}</select></label>
          <label>Difficulty<select value={form.difficulty} onChange={e => setForm({...form, difficulty:e.target.value})}><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></label>
          <label>Marks<input type="number" min="0.5" step="0.5" value={form.marks} onChange={e => setForm({...form, marks:Number(e.target.value)})} /></label>
          <label>Status<select value={form.status} onChange={e => setForm({...form, status:e.target.value})}><option value="draft">Draft</option><option value="published">Published</option></select></label>
          <label>Board<select value={form.boardId} onChange={e => setForm({...form, boardId:e.target.value})}><option value="">Select</option>{active("boards").map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
          <label>Class<select value={form.classId} onChange={e => setForm({...form, classId:e.target.value})}><option value="">Select</option>{active("classes").map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
          <label>Subject<select value={form.subjectId} onChange={e => setForm({...form, subjectId:e.target.value})}><option value="">Select</option>{active("subjects").map(x=><option key={x.id} value={x.id}>{x.name} {x.code ? `(${x.code})` : ""}</option>)}</select></label>
          <label>Chapter<select value={form.chapterId} onChange={e => setForm({...form, chapterId:e.target.value})}><option value="">Select</option>{active("chapters").map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
          <label>Topic<select value={form.topicId} onChange={e => setForm({...form, topicId:e.target.value})}><option value="">Select</option>{active("topics").filter(x=>!form.chapterId||x.chapterId===form.chapterId).map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
          <label className="full-width">Explanation<textarea rows={3} value={form.explanation} onChange={e => setForm({...form, explanation:e.target.value})} placeholder="Explain the correct answer." /></label>
          <label className="checkbox-row"><input type="checkbox" checked={form.active} onChange={e => setForm({...form, active:e.target.checked})} /> Active</label>
        </div>
        {error && <div className="academic-message error">{error}</div>}
        <div className="modal-actions"><button className="secondary-button" onClick={() => setOpen(false)}>Cancel</button><button className="primary-button" disabled={saving} onClick={() => void save()}>{saving ? "Saving…" : editing ? "Save changes" : "Create"}</button></div>
      </section></div>}
    </main>
  );
}
