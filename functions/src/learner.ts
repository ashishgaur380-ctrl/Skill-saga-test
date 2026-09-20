import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { onCall, HttpsError, type CallableRequest } from "firebase-functions/v2/https";

function learner(request: CallableRequest<unknown>) {
  const uid = request.auth?.uid;
  const role = request.auth?.token.role;
  if (!uid) throw new HttpsError("unauthenticated", "Learner authentication is required.");
  if (role !== "learner") throw new HttpsError("permission-denied", "Only learner accounts can use the learner quiz service.");
  return uid;
}

function text(value: unknown) { return typeof value === "string" ? value.trim() : ""; }

export const listPublishedQuizzes = onCall(async (request) => {
  learner(request);
  const db = getFirestore();
  const snap = await db.collection("quizzes")
    .where("active", "==", true)
    .where("status", "==", "published")
    .limit(100)
    .get();

  const items = snap.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      title: text(data.title),
      description: text(data.description),
      boardId: text(data.boardId),
      classId: text(data.classId),
      subjectId: text(data.subjectId),
      questionCount: Array.isArray(data.questionIds) ? data.questionIds.length : 0,
    };
  });
  items.sort((a,b) => a.title.localeCompare(b.title));
  return { items };
});

export const getQuizForAttempt = onCall(async (request) => {
  learner(request);
  const id = text((request.data as any)?.quizId);
  if (!id) throw new HttpsError("invalid-argument", "quizId is required.");

  const db = getFirestore();
  const quizSnap = await db.collection("quizzes").doc(id).get();
  if (!quizSnap.exists || quizSnap.data()?.active !== true || quizSnap.data()?.status !== "published") {
    throw new HttpsError("not-found", "Published quiz was not found.");
  }

  const quiz = quizSnap.data()!;
  const ids = Array.isArray(quiz.questionIds) ? quiz.questionIds.map(text).filter(Boolean) : [];
  if (!ids.length) throw new HttpsError("failed-precondition", "This quiz has no questions.");

  const refs = ids.map(questionId => db.collection("questions").doc(questionId));
  const docs = await db.getAll(...refs);
  const questions = docs
    .map((doc, index) => ({ doc, index }))
    .filter(x => x.doc.exists && x.doc.data()?.active === true && x.doc.data()?.status === "published")
    .map(x => {
      const d = x.doc.data()!;
      return {
        id: x.doc.id,
        order: x.index,
        questionText: text(d.questionText),
        options: Array.isArray(d.options) ? d.options.map(text) : [],
        marks: Number(d.marks) || 1,
      };
    });

  if (questions.length !== ids.length) {
    throw new HttpsError("failed-precondition", "This quiz contains unavailable questions.");
  }

  return { quiz: { id: quizSnap.id, title: text(quiz.title), description: text(quiz.description), questionCount: questions.length }, questions };
});

export const submitQuizAttempt = onCall(async (request) => {
  const uid = learner(request);
  const payload = request.data as any;
  const quizId = text(payload?.quizId);
  const answers = payload?.answers;

  if (!quizId || !Array.isArray(answers)) {
    throw new HttpsError("invalid-argument", "quizId and answers are required.");
  }

  const db = getFirestore();
  const quizSnap = await db.collection("quizzes").doc(quizId).get();
  if (!quizSnap.exists || quizSnap.data()?.active !== true || quizSnap.data()?.status !== "published") {
    throw new HttpsError("not-found", "Published quiz was not found.");
  }

  const ids = Array.isArray(quizSnap.data()?.questionIds) ? quizSnap.data()!.questionIds.map(text).filter(Boolean) : [];
  if (answers.length !== ids.length) {
    throw new HttpsError("invalid-argument", "Every quiz question must have an answer.");
  }

  const docs = await db.getAll(...ids.map((id:string) => db.collection("questions").doc(id)));
  if (docs.some(doc => !doc.exists || doc.data()?.active !== true || doc.data()?.status !== "published")) {
    throw new HttpsError("failed-precondition", "The quiz contains unavailable questions.");
  }

  let correct = 0;
  let marks = 0;
  let totalMarks = 0;
  const answerResults = docs.map((doc, index) => {
    const d = doc.data()!;
    const maxMarks = Number(d.marks) || 1;
    const selected = Number(answers[index]);
    const isCorrect = Number.isInteger(selected) && selected === Number(d.correctOption);
    if (isCorrect) { correct++; marks += maxMarks; }
    totalMarks += maxMarks;
    return { questionId: doc.id, selectedOption: selected, correct: isCorrect, marks: isCorrect ? maxMarks : 0, maxMarks };
  });

  const percentage = totalMarks > 0 ? Math.round((marks / totalMarks) * 10000) / 100 : 0;
  const xpEarned = correct * 10;
  const coinsEarned = correct * 2;

  const attemptRef = db.collection("quizAttempts").doc();
  await attemptRef.set({
    learnerId: uid, quizId, correct, marks, totalMarks, percentage,
    xpEarned, coinsEarned, answers: answerResults,
    createdAt: FieldValue.serverTimestamp(),
  });

  return { attemptId: attemptRef.id, result: { correct, total: ids.length, marks, totalMarks, percentage, xpEarned, coinsEarned } };
});
