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


export const getLearnerStats = onCall(async (request) => {
  const uid = learner(request);
  const db = getFirestore();
  const snap = await db.collection("quizAttempts").where("learnerId", "==", uid).limit(500).get();
  let xp = 0, coins = 0, correct = 0, answered = 0, totalMarks = 0, earnedMarks = 0;
  const attempts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
  for (const a of attempts) {
    xp += Number(a.xpEarned) || 0;
    coins += Number(a.coinsEarned) || 0;
    correct += Number(a.correct) || 0;
    const total = Array.isArray(a.answers) ? a.answers.length : Number(a.total) || 0;
    answered += total;
    earnedMarks += Number(a.marks) || 0;
    totalMarks += Number(a.totalMarks) || 0;
  }
  attempts.sort((a,b) => String(b.createdAt?.toMillis?.() ?? "").localeCompare(String(a.createdAt?.toMillis?.() ?? "")));
  return {
    stats: {
      xp, coins, level: Math.max(1, Math.floor(xp / 100) + 1),
      streak: 0, attempts: attempts.length, correct, answered,
      accuracy: answered ? Math.round((correct / answered) * 10000) / 100 : 0,
      marks: earnedMarks, totalMarks,
    },
  };
});

export const listLearnerAttempts = onCall(async (request) => {
  const uid = learner(request);
  const snap = await getFirestore().collection("quizAttempts").where("learnerId", "==", uid).limit(100).get();
  const items = snap.docs.map(doc => {
    const d = doc.data();
    return {
      id: doc.id, quizId: text(d.quizId), correct: Number(d.correct) || 0,
      total: Number(d.total) || (Array.isArray(d.answers) ? d.answers.length : 0),
      percentage: Number(d.percentage) || 0, xpEarned: Number(d.xpEarned) || 0,
      coinsEarned: Number(d.coinsEarned) || 0, createdAt: d.createdAt ?? null,
    };
  });
  items.sort((a,b) => String(b.createdAt?.toMillis?.() ?? "").localeCompare(String(a.createdAt?.toMillis?.() ?? "")));
  return { items };
});


export const getLearnerHome = onCall(async (request) => {
  const uid = learner(request);
  const db = getFirestore();

  const [attemptSnap, quizSnap, settingsSnap] = await Promise.all([
    db.collection("quizAttempts").where("learnerId", "==", uid).limit(500).get(),
    db.collection("quizzes").where("active", "==", true).where("status", "==", "published").limit(100).get(),
    db.collection("systemSettings").doc("platform").get(),
  ]);

  let xp = 0, coins = 0, correct = 0, answered = 0;
  for (const doc of attemptSnap.docs) {
    const d = doc.data();
    xp += Number(d.xpEarned) || 0;
    coins += Number(d.coinsEarned) || 0;
    correct += Number(d.correct) || 0;
    answered += Array.isArray(d.answers) ? d.answers.length : Number(d.total) || 0;
  }

  const quizzes = quizSnap.docs.map(doc => {
    const d = doc.data();
    return {
      id: doc.id, title: text(d.title), description: text(d.description),
      questionCount: Array.isArray(d.questionIds) ? d.questionIds.length : 0,
      active: d.active === true, status: text(d.status),
    };
  }).sort((a,b) => a.title.localeCompare(b.title));

  const daily = quizzes.find(q => /daily/i.test(q.title)) ?? null;
  const weekly = quizzes.find(q => /weekly/i.test(q.title)) ?? null;

  const platform = settingsSnap.exists ? settingsSnap.data()! : {};
  return {
    settings: {
      appName: text(platform.appName) || "Skill Saga",
      tagline: text(platform.tagline) || "A smarter way to learn",
      competitions: platform.competitions !== false,
      community: platform.community !== false,
    },
    stats: {
      xp, coins, level: Math.max(1, Math.floor(xp / 100) + 1),
      streak: 0, accuracy: answered ? Math.round((correct / answered) * 10000) / 100 : 0,
    },
    dailyQuiz: daily,
    weeklyQuiz: weekly,
    featuredQuizzes: quizzes.filter(q => q.id !== daily?.id && q.id !== weekly?.id).slice(0, 4),
  };
});
