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


async function learnerAcademicCollection(db: FirebaseFirestore.Firestore, collection: string) {
  const allowed = new Set(["boards","classes","subjects","chapters","topics","skillCategories","skills"]);
  if (!allowed.has(collection)) throw new HttpsError("invalid-argument", "Invalid academic collection.");
  const snap = await db.collection(collection).where("active","==",true).limit(1000).get();
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export const getLearnerAcademic = onCall(async (request) => {
  learner(request);
  const db = getFirestore();
  const collection = text((request.data as any)?.collection) || "boards";
  const parentId = text((request.data as any)?.parentId);
  const items = await learnerAcademicCollection(db, collection);
  let filtered = items;

  if (collection === "classes" && parentId) {
    filtered = items.filter((x:any) => Array.isArray(x.boardIds) && x.boardIds.includes(parentId));
  } else if (collection === "subjects") {
    const boardId = text((request.data as any)?.boardId);
    const classId = text((request.data as any)?.classId);
    filtered = items.filter((x:any) =>
      (!boardId || (Array.isArray(x.boardIds) && x.boardIds.includes(boardId))) &&
      (!classId || (Array.isArray(x.classIds) && x.classIds.includes(classId)))
    );
  } else if (collection === "chapters" && parentId) {
    filtered = items.filter((x:any) => x.subjectId === parentId);
  } else if (collection === "topics" && parentId) {
    filtered = items.filter((x:any) => x.chapterId === parentId);
  } else if (collection === "skills" && parentId) {
    filtered = items.filter((x:any) => x.categoryId === parentId);
  }

  filtered.sort((a:any,b:any) => (Number(a.sortOrder)||0)-(Number(b.sortOrder)||0) || String(a.name||"").localeCompare(String(b.name||"")));
  return { items: filtered };
});


export const getTopicPractice = onCall(async (request) => {
  learner(request);
  const topicId = text((request.data as any)?.topicId);
  if (!topicId) throw new HttpsError("invalid-argument", "topicId is required.");
  const db = getFirestore();
  const topicSnap = await db.collection("topics").doc(topicId).get();
  if (!topicSnap.exists || topicSnap.data()?.active !== true) throw new HttpsError("not-found", "Topic was not found.");

  const chapterId = text(topicSnap.data()?.chapterId);
  if (!chapterId) throw new HttpsError("failed-precondition", "Topic is not linked to a chapter.");

  const questionSnap = await db.collection("questions")
    .where("active", "==", true)
    .where("status", "==", "published")
    .where("chapterId", "==", chapterId)
    .limit(100)
    .get();

  const questions = questionSnap.docs.map(doc => {
    const d = doc.data();
    return {
      id: doc.id,
      questionText: text(d.questionText),
      options: Array.isArray(d.options) ? d.options.map(text) : [],
      marks: Number(d.marks) || 1,
      topicId: text(d.topicId),
    };
  }).filter(q => !q.topicId || q.topicId === topicId);

  return { topic: { id: topicId, name: text(topicSnap.data()?.name), chapterId }, questions };
});


export const submitTopicPractice = onCall(async (request) => {
  const uid = learner(request);
  const payload = request.data as any;
  const topicId = text(payload?.topicId);
  const answers = payload?.answers;
  if (!topicId || !Array.isArray(answers)) {
    throw new HttpsError("invalid-argument", "topicId and answers are required.");
  }

  const db = getFirestore();
  const topicSnap = await db.collection("topics").doc(topicId).get();
  if (!topicSnap.exists || topicSnap.data()?.active !== true) {
    throw new HttpsError("not-found", "Topic was not found.");
  }

  const chapterId = text(topicSnap.data()?.chapterId);
  const snap = await db.collection("questions")
    .where("active", "==", true)
    .where("status", "==", "published")
    .where("chapterId", "==", chapterId)
    .limit(100)
    .get();

  const questions = snap.docs
    .map(doc => ({ doc, topicId: text(doc.data().topicId) }))
    .filter(x => !x.topicId || x.topicId === topicId);

  if (!questions.length) throw new HttpsError("failed-precondition", "No published questions are available for this topic.");
  if (answers.length !== questions.length) throw new HttpsError("invalid-argument", "Every practice question must have an answer.");

  let correct = 0, marks = 0, totalMarks = 0;
  const answerResults = questions.map((x, index) => {
    const d = x.doc.data();
    const maxMarks = Number(d.marks) || 1;
    const selected = Number(answers[index]);
    const isCorrect = Number.isInteger(selected) && selected === Number(d.correctOption);
    if (isCorrect) { correct++; marks += maxMarks; }
    totalMarks += maxMarks;
    return { questionId: x.doc.id, selectedOption: selected, correct: isCorrect, marks: isCorrect ? maxMarks : 0, maxMarks };
  });

  const percentage = totalMarks ? Math.round((marks / totalMarks) * 10000) / 100 : 0;
  const xpEarned = correct * 10;
  const coinsEarned = correct * 2;
  const attemptRef = db.collection("quizAttempts").doc();
  await attemptRef.set({
    learnerId: uid, practiceType: "topic", topicId, correct, total: questions.length,
    marks, totalMarks, percentage, xpEarned, coinsEarned, answers: answerResults,
    createdAt: FieldValue.serverTimestamp(),
  });

  return { attemptId: attemptRef.id, result: { correct, total: questions.length, marks, totalMarks, percentage, xpEarned, coinsEarned } };
});


export const getLearnerProgress = onCall(async (request) => {
  const uid = learner(request);
  const db = getFirestore();

  const attemptSnap = await db.collection("quizAttempts")
    .where("learnerId", "==", uid)
    .limit(500)
    .get();

  const attempts = attemptSnap.docs.map(doc => doc.data());
  const questionIds = Array.from(new Set(
    attempts.flatMap(a => Array.isArray(a.answers) ? a.answers.map((x:any) => text(x?.questionId)).filter(Boolean) : [])
  ));

  const questionMap = new Map<string, any>();
  for (let i = 0; i < questionIds.length; i += 100) {
    const batch = questionIds.slice(i, i + 100);
    const docs = await db.getAll(...batch.map(id => db.collection("questions").doc(id)));
    for (const doc of docs) if (doc.exists) questionMap.set(doc.id, doc.data());
  }

  const chapterIds = Array.from(new Set(
    Array.from(questionMap.values()).map((q:any) => text(q.chapterId)).filter(Boolean)
  ));
  const chapterMap = new Map<string, any>();
  for (let i = 0; i < chapterIds.length; i += 100) {
    const batch = chapterIds.slice(i, i + 100);
    const docs = await db.getAll(...batch.map(id => db.collection("chapters").doc(id)));
    for (const doc of docs) if (doc.exists) chapterMap.set(doc.id, doc.data());
  }

  const topicIds = Array.from(new Set(
    Array.from(questionMap.values()).map((q:any) => text(q.topicId)).filter(Boolean)
  ));
  const topicMap = new Map<string, any>();
  for (let i = 0; i < topicIds.length; i += 100) {
    const batch = topicIds.slice(i, i + 100);
    const docs = await db.getAll(...batch.map(id => db.collection("topics").doc(id)));
    for (const doc of docs) if (doc.exists) topicMap.set(doc.id, doc.data());
  }

  type Bucket = {
    id:string; name:string; chapterId:string; chapterName:string; subjectId:string;
    questions:number; correct:number; marks:number; totalMarks:number; attempts:number;
  };
  const topicBuckets = new Map<string, Bucket>();
  const subjectBuckets = new Map<string, {id:string;name:string;questions:number;correct:number;marks:number;totalMarks:number}>();

  for (const attempt of attempts) {
    const seenTopics = new Set<string>();
    if (!Array.isArray(attempt.answers)) continue;

    for (const answer of attempt.answers) {
      const questionId = text(answer?.questionId);
      const question = questionMap.get(questionId);
      if (!questionId || !question) continue;

      const chapterId = text(question.chapterId);
      const chapter = chapterMap.get(chapterId);
      const topicId = text(question.topicId) || "__unassigned__";
      const topic = topicMap.get(topicId);
      const topicName = topicId === "__unassigned__" ? "Other / Unassigned" : (text(topic?.name) || "Topic");
      const chapterName = text(chapter?.name) || "Chapter";
      const subjectId = text(chapter?.subjectId) || "__unassigned__";
      const subjectName = text(chapter?.subjectName) || "Subject";

      let bucket = topicBuckets.get(topicId);
      if (!bucket) {
        bucket = {id:topicId,name:topicName,chapterId,chapterName,subjectId,questions:0,correct:0,marks:0,totalMarks:0,attempts:0};
        topicBuckets.set(topicId,bucket);
      }
      bucket.questions++;
      if (answer?.correct === true) bucket.correct++;
      bucket.marks += Number(answer?.marks) || 0;
      bucket.totalMarks += Number(answer?.maxMarks) || 0;
      seenTopics.add(topicId);

      let subject = subjectBuckets.get(subjectId);
      if (!subject) {
        subject = {id:subjectId,name:subjectName,questions:0,correct:0,marks:0,totalMarks:0};
        subjectBuckets.set(subjectId,subject);
      }
      subject.questions++;
      if (answer?.correct === true) subject.correct++;
      subject.marks += Number(answer?.marks) || 0;
      subject.totalMarks += Number(answer?.maxMarks) || 0;
    }

    for (const topicId of seenTopics) {
      const bucket = topicBuckets.get(topicId);
      if (bucket) bucket.attempts++;
    }
  }

  const toAccuracy = (correct:number, questions:number) =>
    questions ? Math.round((correct / questions) * 10000) / 100 : 0;

  const topics = Array.from(topicBuckets.values())
    .map(x => ({...x, accuracy:toAccuracy(x.correct,x.questions), marksPercentage:x.totalMarks ? Math.round((x.marks/x.totalMarks)*10000)/100 : 0}))
    .sort((a,b) => b.questions-a.questions || b.accuracy-a.accuracy);

  const subjects = Array.from(subjectBuckets.values())
    .map(x => ({...x, accuracy:toAccuracy(x.correct,x.questions), marksPercentage:x.totalMarks ? Math.round((x.marks/x.totalMarks)*10000)/100 : 0}))
    .sort((a,b) => b.questions-a.questions || b.accuracy-a.accuracy);

  const totalQuestions = topics.reduce((n,x)=>n+x.questions,0);
  const totalCorrect = topics.reduce((n,x)=>n+x.correct,0);
  const totalMarks = topics.reduce((n,x)=>n+x.totalMarks,0);
  const marks = topics.reduce((n,x)=>n+x.marks,0);

  return {
    summary: {
      attempts: attempts.length,
      questions: totalQuestions,
      correct: totalCorrect,
      accuracy: toAccuracy(totalCorrect,totalQuestions),
      marks,
      totalMarks,
      marksPercentage: totalMarks ? Math.round((marks/totalMarks)*10000)/100 : 0,
    },
    subjects,
    topics,
  };
});
