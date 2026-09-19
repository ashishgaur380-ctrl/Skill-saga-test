"use client";

import { useRef, useState } from "react";
import { firebaseAuth } from "../../lib/firebase";

type ImportResult = { imported: number; errors: Array<{ row: number; message: string }>; totalErrors: number };

const HEADERS = [
  "entity","name","code","numericLevel","boardCodes","classCodes",
  "subjectName","subjectCode","chapterName","categoryName","description","sortOrder","active",
];

const TEMPLATE = [
  HEADERS.join(","),
  ["boards","CBSE","CBSE","","","","","","","","","1","true"].join(","),
  ["classes","Class 1","CLASS_1","1","","","","","","","","1","true"].join(","),
  ["subjects","Mathematics","MATH","","CBSE","CLASS_1","","","","","","1","true"].join(","),
  ["chapters","Chapter 1 - Shapes","","","CBSE","CLASS_1","Mathematics","MATH","","","","1","true"].join(","),
  ["topics","2D Shapes","","","","","","","Chapter 1 - Shapes","","","1","true"].join(","),
  ["skillCategories","Problem Solving","","","","","","","","","Core problem solving skills","1","true"].join(","),
  ["skills","Logical Reasoning","","","","","","","","Problem Solving","","1","true"].join(","),
].join("\n");

function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (char === '"' && quoted && next === '"') { cell += '"'; i += 1; continue; }
    if (char === '"') { quoted = !quoted; continue; }
    if (char === "," && !quoted) { row.push(cell); cell = ""; continue; }
    if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(cell); cell = "";
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      continue;
    }
    cell += char;
  }
  row.push(cell);
  if (row.some((value) => value.trim())) rows.push(row);
  if (rows.length < 2) throw new Error("CSV must contain a header and at least one data row.");

  const headers = rows[0].map((value) => value.trim());
  const missing = HEADERS.filter((header) => !headers.includes(header));
  if (missing.length) throw new Error("Missing required columns: " + missing.join(", "));

  return rows.slice(1).map((values) =>
    Object.fromEntries(headers.map((header, index) => [header, (values[index] ?? "").trim()])),
  );
}

async function callImport(rows: Record<string, string>[]) {
  const user = firebaseAuth.currentUser;
  if (!user) throw new Error("You are not authenticated. Please sign in again.");
  const token = await user.getIdToken();
  const response = await fetch("/api/academic", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
    body: JSON.stringify({ action: "bulkImportAcademic", data: { rows } }),
    cache: "no-store",
  });
  const payload = await response.json() as { data?: ImportResult; error?: { message?: string } };
  if (!response.ok) throw new Error(payload.error?.message || "Bulk import failed.");
  return payload.data as ImportResult;
}

export default function AcademicImporter({ onComplete }: { onComplete: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<ImportResult | null>(null);
  const [importing, setImporting] = useState(false);

  async function chooseFile(file?: File) {
    if (!file) return;
    setError(""); setResult(null); setFileName(file.name);
    try {
      setRows(parseCsv(await file.text()));
    } catch (err) {
      setRows([]);
      setError(err instanceof Error ? err.message : "Unable to read CSV.");
    }
  }

  function downloadTemplate() {
    const blob = new Blob([TEMPLATE], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url; anchor.download = "skill-saga-academic-template.csv";
    anchor.click(); URL.revokeObjectURL(url);
  }

  async function startImport() {
    if (!rows.length) return;
    setImporting(true); setError(""); setResult(null);
    try {
      const response = await callImport(rows);
      setResult(response);
      if (response.imported > 0 && response.totalErrors === 0) onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bulk import failed.");
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="importer">
      <div className="importer-head">
        <div>
          <h3>Bulk academic import</h3>
          <p>Upload one CSV containing boards, classes, subjects, chapters, topics, skill categories and skills.</p>
        </div>
        <button className="secondary-button" type="button" onClick={downloadTemplate}>Download template</button>
      </div>
      <div className="importer-drop">
        <input ref={inputRef} type="file" accept=".csv,text/csv" hidden onChange={(e) => void chooseFile(e.target.files?.[0])} />
        <button className="primary-button" type="button" onClick={() => inputRef.current?.click()}>
          {fileName ? "Choose another CSV" : "Choose CSV file"}
        </button>
        {fileName && <span>{fileName} · {rows.length} data row{rows.length === 1 ? "" : "s"}</span>}
      </div>
      {error && <div className="academic-message error">{error}</div>}
      {rows.length > 0 && !result && (
        <>
          <div className="importer-preview">
            <strong>Preview</strong>
            <span>First {Math.min(rows.length, 8)} of {rows.length} rows</span>
            <div className="importer-table-wrap">
              <table><thead><tr><th>Entity</th><th>Name</th><th>Code</th><th>Parent</th></tr></thead>
              <tbody>{rows.slice(0,8).map((row,index) => (
                <tr key={index}><td>{row.entity}</td><td>{row.name}</td><td>{row.code || "—"}</td><td>{row.subjectName || row.chapterName || row.categoryName || "—"}</td></tr>
              ))}</tbody></table>
            </div>
          </div>
          <div className="importer-note">Import is create-only. Existing records and duplicate rows are rejected; parent relationships are validated before any data is written.</div>
          <div className="modal-actions"><button className="primary-button" type="button" disabled={importing} onClick={() => void startImport()}>{importing ? "Validating & importing…" : `Import ${rows.length} rows`}</button></div>
        </>
      )}
      {result && (
        <div className={result.totalErrors ? "import-result error-result" : "import-result success-result"}>
          <strong>{result.success ? "Import completed" : "Import not applied"}</strong>
          <p>{result.imported} row{result.imported === 1 ? "" : "s"} imported. {result.totalErrors} error{result.totalErrors === 1 ? "" : "s"}.</p>
          {result.errors.length > 0 && <ul>{result.errors.slice(0,12).map((item) => <li key={item.row}>Row {item.row}: {item.message}</li>)}</ul>}
          <button className="secondary-button" type="button" onClick={() => { setRows([]); setResult(null); setFileName(""); onComplete(); }}>Close</button>
        </div>
      )}
    </div>
  );
}
