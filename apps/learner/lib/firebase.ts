import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";
import { getApps, initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { connectStorageEmulator } from "firebase/storage";
import { getFirebaseConfig } from "../../../shared/firebase/config";

const app = getApps().length ? getApps()[0] : initializeApp(getFirebaseConfig());
export const learnerAuth = getAuth(app);
export const learnerFirestore = getFirestore(app);
export const learnerStorage = getStorage(app);
export const learnerFunctions = getFunctions(app, process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_REGION ?? "us-central1");

const useFirebaseEmulators = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true";
if (useFirebaseEmulators) {
  const emulatorState = globalThis as typeof globalThis & {
    __skillSagaLearnerFirebaseEmulatorsConnected?: boolean;
  };
  if (!emulatorState.__skillSagaLearnerFirebaseEmulatorsConnected) {
    connectAuthEmulator(learnerAuth, "http://127.0.0.1:9099", { disableWarnings: true });
    connectFirestoreEmulator(learnerFirestore, "127.0.0.1", 8080);
    connectFunctionsEmulator(learnerFunctions, "127.0.0.1", 5001);
    connectStorageEmulator(learnerStorage, "127.0.0.1", 9199);
    emulatorState.__skillSagaLearnerFirebaseEmulatorsConnected = true;
  }
}
