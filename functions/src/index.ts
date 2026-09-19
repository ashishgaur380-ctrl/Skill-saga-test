import { initializeApp } from "firebase-admin/app";

initializeApp();

export {
  listAcademic,
  createAcademic,
  updateAcademic,
  archiveAcademic,
} from "./academic";
