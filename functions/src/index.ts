import { initializeApp } from "firebase-admin/app";

initializeApp();

export {
  listAcademic,
  createAcademic,
  updateAcademic,
  archiveAcademic,
  bulkImportAcademic,
} from "./academic";

export {
  listQuestions,
  createQuestion,
  updateQuestion,
  archiveQuestion,
} from "./question";

export {
  listQuizzes,
  createQuiz,
  updateQuiz,
  archiveQuiz,
} from "./quiz";

export {
  listCompetitions,
  createCompetition,
  updateCompetition,
  archiveCompetition,
} from "./competition";
