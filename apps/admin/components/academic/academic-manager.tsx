"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { firebaseAuth } from "../../lib/firebase";
import AcademicImporter from "./academic-importer";

type AcademicItem = {
  id: string;
  name: string;
  code?: string;
  active: boolean;
  sortOrder: number;
  numericLevel?: number;
  boardIds?: string[];
  classIds?: string[];
  subjectId?: string;
  chapterId?: string;
  categoryId?: string;
  description?: string;
};

type Collection =
  | "boards"
  | "classes"
  | "subjects"
  | "chapters"
  | "topics"
  | "skillCategories"
  | "skills";

type Module = {
  key: Collection;
  name: string;
  description: string;
};

const modules: Module[] = [
  { key: "boards", name: "Boards", description: "Supported education boards and curricula." },
  { key: "classes", name: "Classes", description: "Class levels 1–12 and future levels." },
  { key: "subjects", name: "Subjects", description: "Map subjects to boards and classes." },
  { key: "chapters", name: "Chapters", description: "Organize subject content." },
  { key: "topics", name: "Topics", description: "Organize chapters into reusable topics." },
  { key: "skillCategories", name: "Skill Categories", description: "Group reusable skills by domain." },
  { key: "skills", name: "Skills", description: "Manage reusable learner skills." },
];

async function callAcademic<T>(
  action: string,
  data: Record<string, unknown>,
): Promise<{ data: T }> {
  const user = firebaseAuth.currentUser;
  if (!user) throw new Error("You are not authenticated. Please sign in again.");

  const token = await user.getIdToken();
  const response = await fetch("/api/academic", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ action, data }),
    cache: "no-store",
  });

  const payload = (await response.json()) as
    | { data: T }
    | { error?: { message?: string } };

  if (!response.ok) {
    throw new Error(
      "error" in payload && payload.error?.message
        ? payload.error.message
        : "Academic operation failed.",
    );
  }
  return payload as { data: T };
}

function emptyForm(collection: Collection, sortOrder = 0) {
  return {
    name: "",
    code: "",
    sortOrder,
    active: true,
    numericLevel: collection === "classes" ? 1 : 0,
    boardIds: [] as string[],
    classIds: [] as string[],
    subjectId: "",
    chapterId: "",
    categoryId: "",
    description: "",
  };
}

export default function AcademicManager() {
  const [activeModule, setActiveModule] = useState<Collection>("boards");
  const [records, setRecords] = useState<Record<Collection, AcademicItem[]>>({
    boards: [], classes: [], subjects: [], chapters: [], topics: [], skillCategories: [], skills: [],
  });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [editing, setEditing] = useState<AcademicItem | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [normalizingSubjects, setNormalizingSubjects] = useState(false);
  const [form, setForm] = useState(emptyForm("boards"));

  const current = modules.find((item) => item.key === activeModule) ?? modules[0];
  const singularName =
    current.key === "skillCategories" ? "Skill Category" :
    current.key === "boards" ? "Board" :
    current.key === "classes" ? "Class" :
    current.key === "subjects" ? "Subject" :
    current.key === "chapters" ? "Chapter" :
    current.key === "topics" ? "Topic" : "Skill";
  const currentRecords = records[activeModule];

  const loadCollection = useCallback(async (collection: Collection) => {
    setLoading(true);
    setError(null);
    try {
      const result = await callAcademic<{ items: AcademicItem[] }>("listAcademic", { collection });
      setRecords((previous) => ({ ...previous, [collection]: result.data.items ?? [] }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load academic records.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const dependencies: Collection[] =
      activeModule === "subjects" ? ["boards", "classes"] :
      activeModule === "chapters" ? ["subjects"] :
      activeModule === "topics" ? ["chapters"] :
      activeModule === "skills" ? ["skillCategories"] : [];

    void Promise.all([loadCollection(activeModule), ...dependencies.map(loadCollection)]);
  }, [activeModule, loadCollection]);

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return currentRecords;
    return currentRecords.filter((item) =>
      [item.name, item.code, item.description]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [currentRecords, search]);

  const labelFor = (collection: Collection, id?: string) =>
    id ? records[collection].find((item) => item.id === id)?.name ?? id : "—";

  const relationText = (item: AcademicItem) => {
    if (activeModule === "subjects") {
      return [
        ...(item.boardIds ?? []).map((id) => labelFor("boards", id)),
        ...(item.classIds ?? []).map((id) => labelFor("classes", id)),
      ].join(" • ") || "Not mapped";
    }
    if (activeModule === "chapters") {
      const subject = labelFor("subjects", item.subjectId);
      const classes = (item.classIds ?? []).map((id) => labelFor("classes", id)).join(", ");
      return classes ? `${subject} • ${classes}` : subject;
    }
    if (activeModule === "topics") return labelFor("chapters", item.chapterId);
    if (activeModule === "skills") return labelFor("skillCategories", item.categoryId);
    return "";
  };

  async function repairLegacyClassMappings() {
    if (!window.confirm("Repair the legacy CBSE Class 1 mapping to the canonical CBSE-1 class? Only the known legacy Class 1 ID will be remapped; unrelated records will not be changed.")) return;
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const result = await callAcademic<{ success: boolean; subjectsRemapped: number; writes: number }>(
        "repairLegacyClassMappings",
        {},
      );
      setNotice(
        `Class 1 mapping repaired: ${result.data.subjectsRemapped} subject(s), ${result.data.writes} dependent mapping(s) updated.`,
      );
      await Promise.all([loadCollection("classes"), loadCollection("subjects"), loadCollection("chapters")]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to repair legacy Class 1 mappings.");
    } finally {
      setSaving(false);
    }
  }

  async function normalizeSubjects() {
    if (!window.confirm("Normalize duplicate subject records into one canonical subject per code/name? Existing chapters, questions, learning materials and quizzes will be remapped safely.")) return;
    setNormalizingSubjects(true);
    setError(null);
    setNotice(null);
    try {
      const result = await callAcademic<{ success: boolean; groupsNormalized: number; mergedSubjectRecords: number }>(
        "normalizeSubjectMappings",
        {},
      );
      setNotice(
        `Subject normalization complete: ${result.data.groupsNormalized} group(s), ${result.data.mergedSubjectRecords} duplicate record(s) merged.`,
      );
      await loadCollection("subjects");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to normalize subject mappings.");
    } finally {
      setNormalizingSubjects(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setForm(emptyForm(activeModule, currentRecords.length));
    setFormOpen(true);
    setError(null);
    setNotice(null);
  }

  function openEdit(item: AcademicItem) {
    setEditing(item);
    setForm({
      ...emptyForm(activeModule, item.sortOrder),
      name: item.name,
      code: item.code ?? "",
      active: item.active,
      numericLevel: item.numericLevel ?? 1,
      boardIds: item.boardIds ?? [],
      classIds: item.classIds ?? [],
      subjectId: item.subjectId ?? "",
      chapterId: item.chapterId ?? "",
      categoryId: item.categoryId ?? "",
      description: item.description ?? "",
    });
    setFormOpen(true);
    setError(null);
    setNotice(null);
  }

  function validateForm() {
    if (!form.name.trim()) return "Name is required.";
    if (["boards", "classes", "subjects"].includes(activeModule) && !form.code.trim()) {
      return "Code is required.";
    }
    if (activeModule === "chapters" && !form.subjectId) return "Select a subject.";
    if (activeModule === "topics" && !form.chapterId) return "Select a chapter.";
    if (activeModule === "skills" && !form.categoryId) return "Select a skill category.";
    return null;
  }

  async function saveRecord() {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError(null);
    setNotice(null);

    const data: Record<string, unknown> = {
      name: form.name.trim(),
      sortOrder: Number(form.sortOrder),
      active: form.active,
    };

    if (["boards", "classes", "subjects"].includes(activeModule)) {
      data.code = form.code.trim().toUpperCase();
    }
    if (activeModule === "classes") data.numericLevel = Number(form.numericLevel);
    if (activeModule === "subjects") {
      data.boardIds = form.boardIds;
      data.classIds = form.classIds;
    }
    if (activeModule === "chapters") data.subjectId = form.subjectId;
    if (activeModule === "topics") data.chapterId = form.chapterId;
    if (activeModule === "skillCategories") data.description = form.description.trim();
    if (activeModule === "skills") data.categoryId = form.categoryId;

    try {
      if (editing) {
        await callAcademic<{ success: boolean }>("updateAcademic", {
          collection: activeModule, id: editing.id, data,
        });
        setNotice(`${singularName} updated successfully.`);
      } else {
        await callAcademic<{ id: string }>("createAcademic", { collection: activeModule, data });
        setNotice(`${singularName} created successfully.`);
      }
      setFormOpen(false);
      setEditing(null);
      await loadCollection(activeModule);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save academic record.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteRecord(item: AcademicItem) {
    if (!window.confirm(
      `Permanently delete "${item.name}"? This cannot be undone. Dependent academic records linked directly to it may also be deleted. Use Archive if you want a reversible/non-destructive action.`,
    )) return;

    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const result = await callAcademic<{ success: boolean; deletedDocuments: number }>("deleteAcademic", {
        collection: activeModule,
        id: item.id,
      });
      setNotice(`${item.name} permanently deleted (${result.data.deletedDocuments} document(s)).`);
      await loadCollection(activeModule);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete record.");
    } finally {
      setSaving(false);
    }
  }

  async function archiveRecord(item: AcademicItem) {
    if (!window.confirm(`Archive "${item.name}"? It will remain available for historical relationships.`)) return;

    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      await callAcademic<{ success: boolean }>("archiveAcademic", {
        collection: activeModule, id: item.id,
      });
      setNotice(`${item.name} archived.`);
      await loadCollection(activeModule);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to archive record.");
    } finally {
      setSaving(false);
    }
  }

  function toggleArray(field: "boardIds" | "classIds", id: string) {
    setForm((previous) => ({
      ...previous,
      [field]: previous[field].includes(id)
        ? previous[field].filter((value) => value !== id)
        : [...previous[field], id],
    }));
  }

  const selectable = (collection: Collection) =>
    records[collection].filter((item) => item.active || editing?.id === item.id);

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
        {modules.map((module) => (
          <button
            key={module.key}
            type="button"
            className={activeModule === module.key ? "academic-tab active" : "academic-tab"}
            onClick={() => {
              setActiveModule(module.key);
              setSearch("");
              setError(null);
              setNotice(null);
            }}
          >
            {module.name}
          </button>
        ))}
      </nav>

      <section className="academic-panel">
        <div className="academic-panel-header">
          <div>
            <h2>{current.name}</h2>
            <p>{current.description}</p>
          </div>
          <div className="academic-header-actions">{activeModule === "subjects" && <><button type="button" className="secondary-button" disabled={saving} onClick={() => void repairLegacyClassMappings()}>Repair Class 1 mapping</button><button type="button" className="secondary-button" disabled={normalizingSubjects} onClick={() => void normalizeSubjects()}>{normalizingSubjects ? "Normalizing…" : "Normalize subjects"}</button></>}<button type="button" className="secondary-button" onClick={() => setImportOpen(true)}>Bulk import</button><button type="button" className="primary-button" onClick={openCreate}>+ Add {singularName}</button></div>
        </div>

        <div className="academic-toolbar">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={`Search ${current.name.toLowerCase()}...`}
            aria-label={`Search ${current.name}`}
          />
          <span className="record-count">{currentRecords.length} record{currentRecords.length === 1 ? "" : "s"}</span>
        </div>

        {error && <div className="academic-message error">{error}</div>}
        {notice && <div className="academic-message success">{notice}</div>}

        {loading ? (
          <div className="academic-empty"><h3>Loading {current.name.toLowerCase()}…</h3></div>
        ) : filteredRecords.length === 0 ? (
          <div className="academic-empty">
            <div className="empty-icon">◎</div>
            <h3>{search ? `No matching ${current.name.toLowerCase()}` : `No ${current.name.toLowerCase()} configured yet`}</h3>
            <p>{search ? "Try a different search term." : `Create the first record to build the central academic hierarchy.`}</p>
            {!search && <button type="button" className="secondary-button" onClick={openCreate}>Create first {singularName.toLowerCase()}</button>}
          </div>
        ) : (
          <div className="academic-table-wrap">
            <table className="academic-table">
              <thead>
                <tr>
                  <th>Name</th>
                  {["boards", "classes", "subjects"].includes(activeModule) && <th>Code</th>}
                  {activeModule === "classes" && <th>Level</th>}
                  {activeModule !== "boards" && activeModule !== "classes" && activeModule !== "skillCategories" && <th>Relationship</th>}
                  {activeModule === "skillCategories" && <th>Description</th>}
                  <th>Status</th><th>Order</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.name}</strong></td>
                    {["boards", "classes", "subjects"].includes(activeModule) && <td><code>{item.code}</code></td>}
                    {activeModule === "classes" && <td>{item.numericLevel}</td>}
                    {activeModule !== "boards" && activeModule !== "classes" && activeModule !== "skillCategories" && <td>{relationText(item)}</td>}
                    {activeModule === "skillCategories" && <td>{item.description || "—"}</td>}
                    <td><span className={item.active ? "status-pill active" : "status-pill"}>{item.active ? "Active" : "Archived"}</span></td>
                    <td>{item.sortOrder}</td>
                    <td>
                      <div className="row-actions">
                        <button type="button" className="text-button" onClick={() => openEdit(item)}>Edit</button>
                        {item.active && <button type="button" className="text-button danger" disabled={saving} onClick={() => void archiveRecord(item)}>Archive</button>}
                        <button type="button" className="text-button danger" disabled={saving} onClick={() => void deleteRecord(item)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {importOpen && (
        <div className="modal-backdrop" role="presentation">
          <section className="academic-modal importer-modal" role="dialog" aria-modal="true" aria-labelledby="import-title">
            <div className="modal-header">
              <div><span className="academic-eyebrow">ACADEMIC DATA</span><h2 id="import-title">Bulk import academic structure</h2></div>
              <button type="button" className="modal-close" onClick={() => setImportOpen(false)} aria-label="Close">×</button>
            </div>
            <AcademicImporter onComplete={() => { void loadCollection(activeModule); }} />
          </section>
        </div>
      )}

      {formOpen && (
        <div className="modal-backdrop" role="presentation">
          <section className="academic-modal" role="dialog" aria-modal="true" aria-labelledby="academic-form-title">
            <div className="modal-header">
              <div>
                <span className="academic-eyebrow">ACADEMIC STRUCTURE</span>
                <h2 id="academic-form-title">{editing ? `Edit ${singularName}` : `Add ${singularName}`}</h2>
              </div>
              <button type="button" className="modal-close" onClick={() => setFormOpen(false)} aria-label="Close">×</button>
            </div>

            <div className="form-grid">
              <label>Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={activeModule === "classes" ? "e.g. Class 1" : "Enter name"} /></label>

              {["boards", "classes", "subjects"].includes(activeModule) && (
                <label>Code<input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g. CBSE" /></label>
              )}

              {activeModule === "classes" && (
                <label>Numeric level<input type="number" min="1" max="12" value={form.numericLevel} onChange={(e) => setForm({ ...form, numericLevel: Number(e.target.value) })} /></label>
              )}

              {activeModule === "subjects" && (
                <>
                  <fieldset className="academic-fieldset">
                    <legend>Boards</legend>
                    <div className="multi-select-list">
                      {selectable("boards").map((item) => (
                        <label key={item.id} className="multi-option"><input type="checkbox" checked={form.boardIds.includes(item.id)} onChange={() => toggleArray("boardIds", item.id)} />{item.name}</label>
                      ))}
                    </div>
                  </fieldset>
                  <fieldset className="academic-fieldset">
                    <legend>Classes</legend>
                    <div className="multi-select-list">
                      {selectable("classes").map((item) => (
                        <label key={item.id} className="multi-option"><input type="checkbox" checked={form.classIds.includes(item.id)} onChange={() => toggleArray("classIds", item.id)} />{item.name}</label>
                      ))}
                    </div>
                  </fieldset>
                </>
              )}

              {activeModule === "chapters" && (
                <label>Subject
                  <select value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value })}>
                    <option value="">Select subject</option>
                    {selectable("subjects").map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                  </select>
                </label>
              )}

              {activeModule === "topics" && (
                <label>Chapter
                  <select value={form.chapterId} onChange={(e) => setForm({ ...form, chapterId: e.target.value })}>
                    <option value="">Select chapter</option>
                    {selectable("chapters").map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                  </select>
                </label>
              )}

              {activeModule === "skillCategories" && (
                <label>Description<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe this skill domain..." rows={3} /></label>
              )}

              {activeModule === "skills" && (
                <label>Skill category
                  <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                    <option value="">Select skill category</option>
                    {selectable("skillCategories").map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                  </select>
                </label>
              )}

              <label>Sort order<input type="number" min="0" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} /></label>
              <label className="checkbox-row"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Active</label>
            </div>

            {error && <div className="academic-message error">{error}</div>}
            <div className="modal-actions">
              <button type="button" className="secondary-button" onClick={() => setFormOpen(false)} disabled={saving}>Cancel</button>
              <button type="button" className="primary-button" onClick={() => void saveRecord()} disabled={saving}>{saving ? "Saving…" : editing ? "Save changes" : "Create"}</button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
