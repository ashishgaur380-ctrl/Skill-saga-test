import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { onCall, HttpsError, type CallableRequest } from "firebase-functions/v2/https";

type AcademicCollection =
  | "boards"
  | "classes"
  | "subjects"
  | "chapters"
  | "topics"
  | "skillCategories"
  | "skills";

const WRITE_ROLES = new Set(["super_admin", "admin", "content_manager"]);

function assertRole(request: CallableRequest<unknown>): { uid: string; role: string } {
  const uid = request.auth?.uid;
  const role = request.auth?.token.role;

  if (!uid) {
    throw new HttpsError("unauthenticated", "Administrator authentication is required.");
  }

  if (typeof role !== "string" || !WRITE_ROLES.has(role)) {
    throw new HttpsError("permission-denied", "You are not authorized to manage academic structure.");
  }

  return { uid, role };
}

function collectionName(value: unknown): AcademicCollection {
  const allowed: AcademicCollection[] = [
    "boards",
    "classes",
    "subjects",
    "chapters",
    "topics",
    "skillCategories",
    "skills",
  ];

  if (typeof value !== "string" || !allowed.includes(value as AcademicCollection)) {
    throw new HttpsError("invalid-argument", "Invalid academic collection.");
  }

  return value as AcademicCollection;
}

function requiredText(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new HttpsError("invalid-argument", field + " is required.");
  }
  return value.trim();
}

function nonNegativeOrder(value: unknown): number {
  if (!Number.isInteger(value) || (value as number) < 0) {
    throw new HttpsError("invalid-argument", "sortOrder must be a non-negative integer.");
  }
  return value as number;
}

function validateData(collection: AcademicCollection, raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new HttpsError("invalid-argument", "Academic data must be an object.");
  }

  const input = raw as Record<string, unknown>;
  const data: Record<string, unknown> = {
    name: requiredText(input.name, "name"),
    active: input.active === undefined ? true : Boolean(input.active),
    sortOrder: nonNegativeOrder(input.sortOrder ?? 0),
  };

  if (collection === "boards" || collection === "classes" || collection === "subjects") {
    data.code = requiredText(input.code, "code");
  }

  if (collection === "classes" && input.numericLevel !== undefined) {
    if (!Number.isInteger(input.numericLevel) || (input.numericLevel as number) < 0) {
      throw new HttpsError("invalid-argument", "numericLevel must be a non-negative integer.");
    }
    data.numericLevel = input.numericLevel;
  }

  if (collection === "subjects") {
    data.boardIds = Array.isArray(input.boardIds) ? input.boardIds : [];
    data.classIds = Array.isArray(input.classIds) ? input.classIds : [];
  }

  if (collection === "chapters") data.subjectId = requiredText(input.subjectId, "subjectId");
  if (collection === "topics") data.chapterId = requiredText(input.chapterId, "chapterId");
  if (collection === "skills") data.categoryId = requiredText(input.categoryId, "categoryId");
  if (collection === "skillCategories" && input.description !== undefined) {
    data.description = typeof input.description === "string" ? input.description.trim() : "";
  }

  return data;
}

function auditPayload(
  uid: string,
  role: string,
  action: string,
  collection: AcademicCollection,
  id: string,
) {
  return {
    actorUid: uid,
    actorRole: role,
    action,
    collection,
    documentId: id,
    createdAt: FieldValue.serverTimestamp(),
  };
}

export const listAcademic = onCall(async (request) => {
  const { role } = assertRole(request);
  void role;

  const collection = collectionName(
    (request.data as { collection?: unknown } | undefined)?.collection,
  );

  const snapshot = await getFirestore()
    .collection(collection)
    .orderBy("sortOrder", "asc")
    .limit(500)
    .get();

  type AcademicListItem = {
    id: string;
    name?: unknown;
    [key: string]: unknown;
  };

  const items: AcademicListItem[] = snapshot.docs.map((doc) => {
    const data = doc.data() as Record<string, unknown>;
    return { id: doc.id, ...data };
  });

  items.sort((a, b) =>
    String(a.name ?? "").localeCompare(String(b.name ?? "")),
  );

  return { items };
});

export const createAcademic = onCall(async (request) => {
  const { uid, role } = assertRole(request);
  const data = request.data as { collection?: unknown; data?: unknown } | undefined;
  const collection = collectionName(data?.collection);
  const validated = validateData(collection, data?.data);

  const db = getFirestore();
  const ref = db.collection(collection).doc();

  await ref.set({
    ...validated,
    createdBy: uid,
    updatedBy: uid,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  await db.collection("auditLogs").doc().set(
    auditPayload(uid, role, "CREATE", collection, ref.id),
  );

  return { id: ref.id };
});

export const updateAcademic = onCall(async (request) => {
  const { uid, role } = assertRole(request);
  const data = request.data as { collection?: unknown; id?: unknown; data?: unknown } | undefined;
  const collection = collectionName(data?.collection);

  if (typeof data?.id !== "string" || !data.id.trim()) {
    throw new HttpsError("invalid-argument", "id is required.");
  }

  const validated = validateData(collection, data?.data);
  const ref = getFirestore().collection(collection).doc(data.id);

  if (!(await ref.get()).exists) {
    throw new HttpsError("not-found", "Academic record was not found.");
  }

  await ref.update({
    ...validated,
    updatedBy: uid,
    updatedAt: FieldValue.serverTimestamp(),
  });

  await getFirestore().collection("auditLogs").doc().set(
    auditPayload(uid, role, "UPDATE", collection, data.id),
  );

  return { success: true };
});

export const archiveAcademic = onCall(async (request) => {
  const { uid, role } = assertRole(request);
  const data = request.data as { collection?: unknown; id?: unknown } | undefined;
  const collection = collectionName(data?.collection);

  if (typeof data?.id !== "string" || !data.id.trim()) {
    throw new HttpsError("invalid-argument", "id is required.");
  }

  const ref = getFirestore().collection(collection).doc(data.id);

  if (!(await ref.get()).exists) {
    throw new HttpsError("not-found", "Academic record was not found.");
  }

  await ref.update({
    active: false,
    updatedBy: uid,
    updatedAt: FieldValue.serverTimestamp(),
  });

  await getFirestore().collection("auditLogs").doc().set(
    auditPayload(uid, role, "ARCHIVE", collection, data.id),
  );

  return { success: true };
});
