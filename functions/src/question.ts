import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { onCall, HttpsError, type CallableRequest } from "firebase-functions/v2/https";

type Question = {
  questionText?: unknown;
  options?: unknown;
  correctOption?: unknown;
  explanation?: unknown;
  difficulty?: unknown;
  marks?: unknown;
  boardId?: unknown;
  classId?: unknown;
  subjectId?: unknown;
  chapterId?: unknown;
  skillId?: unknown; topicId?: unknown;
  status?: unknown;
  active?: unknown;
};

const WRITE_ROLES = new Set(["super_admin", "admin", "content_manager"]);

function assertRole(request: CallableRequest<unknown>) {
  const uid = request.auth?.uid;
  const role = request.auth?.token.role;
  if (!uid) throw new HttpsError("unauthenticated", "Administrator authentication is required.");
  if (typeof role !== "string" || !WRITE_ROLES.has(role)) {
    throw new HttpsError("permission-denied", "You are not authorized to manage questions.");
  }
  return { uid, role };
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function academicNameKey(value: unknown) {
  return text(value).toLowerCase().replace(/(\\d+)\\s*to\\s*(\\d+)/g, "$1-$2").replace(/&/g, "and").replace(/[^a-z0-9]+/g, "");
}

function fuzzyAcademicMatch<T extends { name?: unknown }>(items: T[], value: unknown) {
  const target = academicNameKey(value);
  if (!target) return null;
  const exact = items.filter((item) => academicNameKey(item.name) === target);
  if (exact.length === 1) return exact[0];
  const targetTokens = new Set(target.match(/[a-z]+|\\d+/g) ?? []);
  let best: T | null = null;
  let bestScore = 0;
  let ties = 0;
  for (const item of items) {
    const candidate = academicNameKey(item.name);
    if (!candidate) continue;
    if (candidate.includes(target) || target.includes(candidate)) {
      const score = Math.min(target.length, candidate.length) / Math.max(target.length, candidate.length);
      if (score > bestScore) { best = item; bestScore = score; ties = 0; }
      else if (score === bestScore) ties++;
      continue;
    }
    const candidateTokens = new Set(candidate.match(/[a-z]+|\\d+/g) ?? []);
    const overlap = [...targetTokens].filter((token) => candidateTokens.has(token)).length;
    const score = targetTokens.size ? overlap / targetTokens.size : 0;
    if (score > bestScore) { best = item; bestScore = score; ties = 0; }
    else if (score === bestScore && score > 0) ties++;
  }
  return best && bestScore >= 0.6 && ties === 0 ? best : null;
}

function validate(raw: Question) {
  const questionText = text(raw.questionText);
  if (!questionText) throw new HttpsError("invalid-argument", "Question text is required.");

  if (!Array.isArray(raw.options) || raw.options.length !== 4 ||
      raw.options.some((v) => !text(v))) {
    throw new HttpsError("invalid-argument", "Exactly 4 non-empty options are required.");
  }

  const correctOption = Number(raw.correctOption);
  if (!Number.isInteger(correctOption) || correctOption < 0 || correctOption > 3) {
    throw new HttpsError("invalid-argument", "Correct option must be 0, 1, 2 or 3.");
  }

  const difficulty = text(raw.difficulty).toLowerCase();
  if (!["easy", "medium", "hard"].includes(difficulty)) {
    throw new HttpsError("invalid-argument", "Difficulty must be Easy, Medium or Hard.");
  }

  const marks = Number(raw.marks);
  if (!Number.isFinite(marks) || marks <= 0) {
    throw new HttpsError("invalid-argument", "Marks must be greater than 0.");
  }

  const ids = ["boardId","classId","subjectId","chapterId","topicId"] as const;
  for (const field of ids) {
    if (!text(raw[field])) throw new HttpsError("invalid-argument", field + " is required.");
  }

  const status = text(raw.status).toLowerCase() || "draft";
  if (!["draft", "published"].includes(status)) {
    throw new HttpsError("invalid-argument", "Status must be Draft or Published.");
  }

  return {
    questionText,
    options: (raw.options as unknown[]).map(text),
    correctOption,
    explanation: text(raw.explanation),
    difficulty,
    marks,
    boardId: text(raw.boardId),
    classId: text(raw.classId),
    subjectId: text(raw.subjectId),
    chapterId: text(raw.chapterId),
    topicId: text(raw.topicId), skillId: text(raw.skillId),
    status,
    active: raw.active === undefined ? true : Boolean(raw.active),
  };
}

async function ensureAcademicReferences(data: ReturnType<typeof validate>) {
  const db = getFirestore();
  const refs = [
    ["boards", data.boardId],
    ["classes", data.classId],
    ["subjects", data.subjectId],
    ["chapters", data.chapterId],
    ["topics", data.topicId],
  ] as const;
  const docs = await Promise.all(refs.map(([collection, id]) => db.collection(collection).doc(id).get()));
  for (let i = 0; i < docs.length; i++) {
    if (!docs[i].exists || docs[i].data()?.active !== true) {
      throw new HttpsError("failed-precondition", `Referenced ${refs[i][0]} record is missing or inactive.`);
    }
  }
}

function audit(uid: string, role: string, action: string, id: string) {
  return {
    actorUid: uid,
    actorRole: role,
    action,
    collection: "questions",
    documentId: id,
    createdAt: FieldValue.serverTimestamp(),
  };
}

export const listQuestions = onCall(async (request) => {
  assertRole(request);
  const snapshot = await getFirestore().collection("questions").limit(500).get();
  const items: Array<{ id: string; questionText?: unknown; [key: string]: unknown }> = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  items.sort((a, b) => String(a.questionText ?? "").localeCompare(String(b.questionText ?? "")));
  return { items };
});

export const createQuestion = onCall(async (request) => {
  const { uid, role } = assertRole(request);
  const data = validate((request.data as { data?: Question })?.data ?? {});

  const duplicate = await getFirestore().collection("questions")
    .where("questionText", "==", data.questionText)
    .where("chapterId", "==", data.chapterId)
    .limit(1).get();

  if (!duplicate.empty) {
    throw new HttpsError("already-exists", "An identical question already exists in this chapter.");
  }

  const db = getFirestore();
  const ref = db.collection("questions").doc();
  await ref.set({
    ...data,
    createdBy: uid,
    updatedBy: uid,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  await db.collection("auditLogs").doc().set(audit(uid, role, "CREATE", ref.id));
  return { id: ref.id };
});

export const updateQuestion = onCall(async (request) => {
  const { uid, role } = assertRole(request);
  const payload = request.data as { id?: unknown; data?: Question };
  const id = text(payload?.id);
  if (!id) throw new HttpsError("invalid-argument", "id is required.");
  const data = validate(payload?.data ?? {});
  const db = getFirestore();
  const ref = db.collection("questions").doc(id);
  if (!(await ref.get()).exists) throw new HttpsError("not-found", "Question was not found.");

  const duplicate = await db.collection("questions")
    .where("questionText", "==", data.questionText)
    .where("chapterId", "==", data.chapterId)
    .limit(5).get();
  if (duplicate.docs.some((doc) => doc.id !== id)) {
    throw new HttpsError("already-exists", "An identical question already exists in this chapter.");
  }

  await ref.update({ ...data, updatedBy: uid, updatedAt: FieldValue.serverTimestamp() });
  await db.collection("auditLogs").doc().set(audit(uid, role, "UPDATE", id));
  return { success: true };
});

export const archiveQuestion = onCall(async (request) => {
  const { uid, role } = assertRole(request);
  const id = text((request.data as { id?: unknown })?.id);
  if (!id) throw new HttpsError("invalid-argument", "id is required.");
  const db = getFirestore();
  const ref = db.collection("questions").doc(id);
  if (!(await ref.get()).exists) throw new HttpsError("not-found", "Question was not found.");
  await ref.update({ active: false, status: "draft", updatedBy: uid, updatedAt: FieldValue.serverTimestamp() });
  await db.collection("auditLogs").doc().set(audit(uid, role, "ARCHIVE", id));
  return { success: true };
});


type QuestionImportRow = {
  questionText?: unknown;
  option1?: unknown; option2?: unknown; option3?: unknown; option4?: unknown;
  options?: unknown;
  correctOption?: unknown; explanation?: unknown; difficulty?: unknown; marks?: unknown;
  boardId?: unknown; classId?: unknown; subjectId?: unknown; chapterId?: unknown; skillId?: unknown; topicId?: unknown;
  boardCode?: unknown; classCode?: unknown; subjectCode?: unknown;
  chapterName?: unknown; topicName?: unknown; skillName?: unknown;
  status?: unknown; active?: unknown;
};

export const bulkImportQuestions = onCall(async (request) => {
  const { uid, role } = assertRole(request);
  const rows = (request.data as { rows?: unknown } | undefined)?.rows;
  if (!Array.isArray(rows) || rows.length === 0) throw new HttpsError("invalid-argument", "Import must contain at least one row.");
  if (rows.length > 5000) throw new HttpsError("invalid-argument", "Import is limited to 5,000 rows per upload.");

  const db = getFirestore();
  const [boards, classes, subjects, chapters, existing] = await Promise.all([
    db.collection("boards").where("active","==",true).limit(5000).get(),
    db.collection("classes").where("active","==",true).limit(5000).get(),
    db.collection("subjects").where("active","==",true).limit(5000).get(),
    db.collection("chapters").where("active","==",true).limit(5000).get(),
    db.collection("questions").limit(5000).get(),
  ]);

  const boardMap = new Map<string,string>(), classMap = new Map<string,string>(), subjectMap = new Map<string,string>();
  const subjectRecords: Array<{id:string;name?:unknown;code?:unknown}> = [];
  const chapterMap = new Map<string,string>(), topicMap = new Map<string,string>();
  const chapterRecords: Array<{id:string;name?:unknown;subjectId?:unknown}> = [];
  const topicRecords: Array<{id:string;name?:unknown;chapterId?:unknown}> = [];
  boards.docs.forEach(d => { const x=d.data(); boardMap.set(d.id,d.id); if(text(x.code)) boardMap.set(text(x.code).toUpperCase(),d.id); });
  classes.docs.forEach(d => { const x=d.data(); classMap.set(d.id,d.id); if(text(x.code)) classMap.set(text(x.code).toUpperCase(),d.id); });
  subjects.docs.forEach(d => { const x=d.data(); subjectRecords.push({id:d.id,name:x.name,code:x.code}); subjectMap.set(d.id,d.id); if(text(x.code)) subjectMap.set(text(x.code).toUpperCase(),d.id); });
  chapters.docs.forEach(d => { const x=d.data(); chapterRecords.push({id:d.id,name:x.name,subjectId:x.subjectId}); const k=text(x.subjectId)+"|"+academicNameKey(x.name); if(k!=="|") chapterMap.set(k,d.id); chapterMap.set(d.id,d.id); });
  const topicSnap = await db.collection("topics").where("active","==",true).limit(10000).get(); topicSnap.docs.forEach(d => { const x=d.data(); topicRecords.push({id:d.id,name:x.name,chapterId:x.chapterId}); const k=text(x.chapterId)+"|"+academicNameKey(x.name); if(k!=="|") topicMap.set(k,d.id); topicMap.set(d.id,d.id); });

  const duplicateKeys = new Set<string>();
  existing.docs.forEach(d => {
    const x=d.data();
    duplicateKeys.add(text(x.chapterId)+"|"+text(x.questionText).toLowerCase());
  });

  const errors: Array<{row:number;message:string}> = [];
  const prepared: Array<{id:string;data:Record<string,unknown>}> = [];
  const resolve = (direct:unknown, code:unknown, map:Map<string,string>, label:string, row:number) => {
    const directId=text(direct), codeValue=text(code);
    const id=directId ? map.get(directId) : map.get(codeValue.toUpperCase());
    if(!id) { errors.push({row,message:`${label} was not found: "${directId||codeValue}".`}); return null; }
    return id;
  };

  for(let i=0;i<rows.length;i++){
    const row=rows[i] as QuestionImportRow, rowNo=i+2;
    try {
      const options=Array.isArray(row.options) ? row.options : [row.option1,row.option2,row.option3,row.option4];
      let correct=Number(row.correctOption);
      if(Number.isInteger(correct) && correct>=1 && correct<=4) correct-=1;
      const raw:any = {
        questionText:row.questionText, options, correctOption:correct,
        explanation:row.explanation, difficulty:row.difficulty||"easy", marks:row.marks??1,
        boardId:row.boardId, classId:row.classId, subjectId:row.subjectId,
        chapterId:row.chapterId, skillId:row.skillId, status:row.status||"draft",
        active:row.active,
      };
      const boardId=resolve(row.boardId,row.boardCode,boardMap,"Board",rowNo);
      const classId=resolve(row.classId,row.classCode,classMap,"Class",rowNo);
      const subjectId=resolve(row.subjectId,row.subjectCode,subjectMap,"Subject",rowNo);
      let chapterId=text(row.chapterId);
      if(!chapterId && text(row.chapterName)) { chapterId=chapterMap.get(subjectId+"|"+academicNameKey(row.chapterName))||""; if(!chapterId) chapterId=fuzzyAcademicMatch(chapterRecords.filter(x=>text(x.subjectId)===subjectId),row.chapterName)?.id||""; }
      if(!chapterId && text(row.chapterName)) { const matches = fuzzyAcademicMatch(chapterRecords.filter(x => { const sid=text(x.subjectId); return sid===subjectId || subjectRecords.some(s => s.id===sid && academicNameKey(s.name)===academicNameKey(subjectRecords.find(v=>v.id===subjectId)?.name)); }), row.chapterName); if(matches) chapterId=matches.id; }
      if(!chapterId) errors.push({row:rowNo,message:"Chapter ID or chapterName is required and must match the selected subject."});
      let topicId=text(row.topicId);
      if(!topicId && text(row.topicName)) { topicId=topicMap.get(chapterId+"|"+academicNameKey(row.topicName))||""; if(!topicId) topicId=fuzzyAcademicMatch(topicRecords.filter(x=>text(x.chapterId)===chapterId),row.topicName)?.id||""; }
      if(!topicId) errors.push({row:rowNo,message:"Topic ID or topicName is required and must match the selected chapter."});
      if(!boardId||!classId||!subjectId||!chapterId||!topicId) continue;
      raw.boardId=boardId; raw.classId=classId; raw.subjectId=subjectId; raw.chapterId=chapterId; raw.topicId=topicId;
      const data=validate(raw);
      await ensureAcademicReferences(data);
      const duplicateKey=chapterId+"|"+data.questionText.toLowerCase();
      if(duplicateKeys.has(duplicateKey)) throw new HttpsError("already-exists","Duplicate question already exists in this chapter.");
      duplicateKeys.add(duplicateKey);
      const ref=db.collection("questions").doc();
      prepared.push({id:ref.id,data:{...data,createdBy:uid,updatedBy:uid}});
    } catch(error) {
      errors.push({row:rowNo,message:error instanceof HttpsError?error.message:error instanceof Error?error.message:"Invalid question row."});
    }
  }

  if(errors.length) return {success:false,imported:0,errors:errors.slice(0,200),totalErrors:errors.length};

  let batch=db.batch(), ops=0;
  for(const item of prepared){
    batch.set(db.collection("questions").doc(item.id),{...item.data,createdAt:FieldValue.serverTimestamp(),updatedAt:FieldValue.serverTimestamp()});
    ops++; if(ops===450){await batch.commit();batch=db.batch();ops=0;}
  }
  if(ops) await batch.commit();

  batch=db.batch(); ops=0;
  for(const item of prepared){
    batch.set(db.collection("auditLogs").doc(),audit(uid,role,"BULK_IMPORT_CREATE",item.id));
    ops++; if(ops===450){await batch.commit();batch=db.batch();ops=0;}
  }
  if(ops) await batch.commit();

  return {success:true,imported:prepared.length,errors:[],totalErrors:0};
});
