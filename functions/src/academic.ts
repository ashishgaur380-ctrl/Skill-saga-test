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


type ImportRow = {
  entity?: unknown; name?: unknown; code?: unknown; numericLevel?: unknown;
  boardCodes?: unknown; classCodes?: unknown; subjectName?: unknown; subjectCode?: unknown;
  chapterName?: unknown; categoryName?: unknown; description?: unknown;
  sortOrder?: unknown; active?: unknown;
};

const IMPORT_ORDER: AcademicCollection[] = [
  "boards","classes","subjects","chapters","topics","skillCategories","skills",
];

function textValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : value == null ? "" : String(value).trim();
}
function csvList(value: unknown): string[] {
  return textValue(value).split(/[|;,]/).map((item) => item.trim()).filter(Boolean);
}
function entityFromRow(value: unknown): AcademicCollection {
  const normalized = textValue(value).toLowerCase().replace(/[\s_-]+/g, "");
  const aliases: Record<string, AcademicCollection> = {
    board:"boards", boards:"boards", class:"classes", classes:"classes",
    subject:"subjects", subjects:"subjects", chapter:"chapters", chapters:"chapters",
    topic:"topics", topics:"topics", skillcategory:"skillCategories",
    skillcategories:"skillCategories", skill:"skills", skills:"skills",
  };
  const result = aliases[normalized];
  if (!result) throw new HttpsError("invalid-argument", "Each import row needs a valid entity.");
  return result;
}

export const bulkImportAcademic = onCall(async (request) => {
  const { uid, role } = assertRole(request);
  const payload = request.data as { rows?: unknown } | undefined;
  if (!Array.isArray(payload?.rows) || payload.rows.length === 0)
    throw new HttpsError("invalid-argument", "Import must contain at least one row.");
  if (payload.rows.length > 5000)
    throw new HttpsError("invalid-argument", "Import is limited to 5,000 rows per upload.");

  const rows = payload.rows as ImportRow[];
  const db = getFirestore();
  const existing = new Map<AcademicCollection, Map<string,string>>();

  for (const collection of IMPORT_ORDER) {
    const snapshot = await db.collection(collection).limit(5000).get();
    const map = new Map<string,string>();
    for (const doc of snapshot.docs) {
      const data = doc.data() as Record<string,unknown>;
      const codeKey = textValue(data.code).toUpperCase();
      const nameKey = textValue(data.name).toLowerCase();
      if (collection === "subjects") {
        const mappingKey = codeKey + "|" + (Array.isArray(data.boardIds) ? (data.boardIds as unknown[]).map(String).sort().join(",") : "") + "|" + (Array.isArray(data.classIds) ? (data.classIds as unknown[]).map(String).sort().join(",") : "");
        if (mappingKey) map.set(mappingKey, doc.id);
        const scopedNameKey = "name:" + nameKey + "|" + (Array.isArray(data.boardIds) ? (data.boardIds as unknown[]).map(String).sort().join(",") : "") + "|" + (Array.isArray(data.classIds) ? (data.classIds as unknown[]).map(String).sort().join(",") : "");
        if (scopedNameKey) map.set(scopedNameKey, doc.id);
        if (codeKey) map.set("code:" + codeKey, doc.id);
        if (nameKey) map.set("name:" + nameKey, doc.id);
      } else {
        const key = ["boards","classes"].includes(collection) ? codeKey : nameKey;
        if (key) map.set(key, doc.id);
      }
    }
    existing.set(collection,map);
  }

  const planned = new Map<AcademicCollection,Map<string,string>>();
  for (const collection of IMPORT_ORDER) planned.set(collection,new Map());
  const prepared: Array<{collection:AcademicCollection;key:string;data:Record<string,unknown>}> = [];
  const errors: Array<{row:number;message:string}> = [];

  const resolve = (collection:AcademicCollection,value:string,label:string,row:number,mode:"name"|"code"="name") => {
    const key = collection === "subjects"
      ? (mode === "code" ? "code:" + value.toUpperCase() : "name:" + value.toLowerCase())
      : ["boards","classes"].includes(collection) ? value.toUpperCase() : value.toLowerCase();
    const id = planned.get(collection)?.get(key) ?? existing.get(collection)?.get(key);
    if (!id) { errors.push({row,message:`${label} "${value}" was not found.`}); return null; }
    return id;
  };

  const resolveSubjectMapping = (
    value:string,
    boardValues:string[],
    classValues:string[],
    label:string,
    row:number,
    mode:"name"|"code"="code",
  ) => {
    const boardIds = boardValues.map(v => resolve("boards", v, "Board", row)).filter((v):v is string => Boolean(v));
    const classIds = classValues.map(v => resolve("classes", v, "Class", row)).filter((v):v is string => Boolean(v));
    if (boardIds.length !== boardValues.length || classIds.length !== classValues.length) return null;

    const normalizedValue = mode === "code" ? value.toUpperCase() : value.toLowerCase();
    const boardKey = boardIds.slice().sort().join(",");
    const classKey = classIds.slice().sort().join(",");
    const exactKey = mode === "code"
      ? normalizedValue + "|" + boardKey + "|" + classKey
      : "name:" + normalizedValue + "|" + boardKey + "|" + classKey;

    let id = planned.get("subjects")?.get(exactKey) ?? existing.get("subjects")?.get(exactKey);

    // If a supplied subject code is stale/mismatched, safely fall back to the
    // subject name within the exact board+class mapping.
    if (!id && mode === "code" && textValue(row.subjectName)) {
      const fallbackKey = "name:" + textValue(row.subjectName).toLowerCase() + "|" + boardKey + "|" + classKey;
      id = planned.get("subjects")?.get(fallbackKey) ?? existing.get("subjects")?.get(fallbackKey);
    }

    if (!id) {
      errors.push({
        row,
        message:`Subject "${value}" was not found for board(s) [${boardValues.join(", ")}] and class(es) [${classValues.join(", ")}].`,
      });
      return null;
    }
    return id;
  };

  const orderedRows = rows.map((row, index) => ({ row, originalRow: index + 2 }))
    .sort((a,b) => IMPORT_ORDER.indexOf(entityFromRow(a.row.entity)) - IMPORT_ORDER.indexOf(entityFromRow(b.row.entity)));

  for (const entry of orderedRows) {
    const rowNumber=entry.originalRow, row=entry.row ?? {};
    try {
      const collection=entityFromRow(row.entity);
      const name=requiredText(row.name,"name");
      const sortOrder=row.sortOrder===undefined||textValue(row.sortOrder)===""?0:Number(row.sortOrder);
      if (!Number.isInteger(sortOrder)||sortOrder<0) throw new HttpsError("invalid-argument","sortOrder must be a non-negative integer.");
      const active=row.active===undefined||textValue(row.active)===""?true:["true","1","yes","active"].includes(textValue(row.active).toLowerCase());
      const data:Record<string,unknown>={name,active,sortOrder};

      if (["boards","classes","subjects"].includes(collection)) data.code=requiredText(row.code,"code").toUpperCase();
      if (collection==="classes") {
        const level=Number(row.numericLevel);
        if (!Number.isInteger(level)||level<1||level>12) throw new HttpsError("invalid-argument","numericLevel must be an integer from 1 to 12.");
        data.numericLevel=level;
      }
      if (collection==="subjects") {
        const boards=csvList(row.boardCodes), classes=csvList(row.classCodes);
        if (!boards.length||!classes.length) throw new HttpsError("invalid-argument","Subjects require boardCodes and classCodes.");
        data.boardIds=boards.map(v=>resolve("boards",v,"Board",rowNumber)).filter((v):v is string=>Boolean(v));
        data.classIds=classes.map(v=>resolve("classes",v,"Class",rowNumber)).filter((v):v is string=>Boolean(v));
      }
      if (collection==="chapters") {
        const boardValues=csvList(row.boardCodes);
        const classValues=csvList(row.classCodes);
        if (!boardValues.length || !classValues.length) {
          throw new HttpsError("invalid-argument","Chapters require boardCodes and classCodes so the subject mapping is unambiguous.");
        }
        const subjectCode=textValue(row.subjectCode);
        const subjectName=textValue(row.subjectName);
        if (!subjectCode && !subjectName) throw new HttpsError("invalid-argument","Chapters require subjectCode or subjectName.");
        const id=resolveSubjectMapping(
          subjectCode || subjectName,
          boardValues,
          classValues,
          "Subject",
          rowNumber,
          subjectCode ? "code" : "name",
        );
        if (id) data.subjectId=id;
      }
      if (collection==="topics") {
        const id=resolve("chapters",requiredText(row.chapterName,"chapterName"),"Chapter",rowNumber);
        if (id) data.chapterId=id;
      }
      if (collection==="skillCategories") data.description=textValue(row.description);
      if (collection==="skills") {
        const id=resolve("skillCategories",requiredText(row.categoryName,"categoryName"),"Skill category",rowNumber);
        if (id) data.categoryId=id;
      }

      const key=collection === "subjects"        ? textValue(data.code).toUpperCase() + "|" + (data.boardIds as string[]).slice().sort().join(",") + "|" + (data.classIds as string[]).slice().sort().join(",")        : ["boards","classes"].includes(collection) ? textValue(data.code).toUpperCase() : name.toLowerCase();
      if (existing.get(collection)?.has(key)) throw new HttpsError("already-exists",`"${name}" already exists.`);
      if (planned.get(collection)?.has(key)) throw new HttpsError("already-exists",`Duplicate row for "${name}".`);
      const ref=db.collection(collection).doc();
      planned.get(collection)!.set(key,ref.id);
      if (collection === "subjects") planned.get(collection)!.set("name:" + name.toLowerCase(), ref.id);
      prepared.push({collection,key,data:{...data,createdBy:uid,updatedBy:uid}});
    } catch (error) {
      errors.push({row:rowNumber,message:error instanceof HttpsError?error.message:error instanceof Error?error.message:"Invalid import row."});
    }
  }

  if (errors.length) return {success:false,imported:0,errors:errors.slice(0,200),totalErrors:errors.length};

  let batch=db.batch(), operations=0;
  const auditEntries:Array<{collection:AcademicCollection;id:string}>=[];

  for (const collection of IMPORT_ORDER) {
    for (const item of prepared.filter(entry=>entry.collection===collection)) {
      const id=planned.get(collection)!.get(item.key)!;
      const ref=db.collection(collection).doc(id);
      batch.set(ref,{...item.data,createdAt:FieldValue.serverTimestamp(),updatedAt:FieldValue.serverTimestamp()});
      auditEntries.push({collection,id});
      operations++;
      if (operations===450) { await batch.commit(); batch=db.batch(); operations=0; }
    }
  }
  if (operations) await batch.commit();

  batch=db.batch(); operations=0;
  for (const entry of auditEntries) {
    const ref=db.collection("auditLogs").doc();
    batch.set(ref,auditPayload(uid,role,"BULK_IMPORT_CREATE",entry.collection,entry.id));
    operations++;
    if (operations===450) { await batch.commit(); batch=db.batch(); operations=0; }
  }
  if (operations) await batch.commit();

  return {success:true,imported:prepared.length,errors:[],totalErrors:0};
});
