import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirebaseConfig } from "../../../shared/firebase/config";

const app = getApps().length ? getApps()[0] : initializeApp(getFirebaseConfig());
export const learnerAuth = getAuth(app);
