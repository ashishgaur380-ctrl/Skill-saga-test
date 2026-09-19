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
  skillId?: unknown;
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

  const ids = ["boardId","classId","subjectId","chapterId","skillId"] as const;
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
    skillId: text(raw.skillId),
    status,
    active: raw.active === undefined ? true : Boolean(raw.active),
  };
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
