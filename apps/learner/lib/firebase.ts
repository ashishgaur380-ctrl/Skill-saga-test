import { getApps, initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";
import { getFirebaseConfig } from "../../../shared/firebase/config";

const app = getApps().length ? getApps()[0] : initializeApp(getFirebaseConfig());

export const learnerAuth = getAuth(app);
export const learnerFunctions = getFunctions(
  app,
  process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_REGION ?? "us-central1"
);

const useFirebaseEmulators =
  process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true" ||
  process.env.NODE_ENV === "development";\n\nif (useFirebaseEmulators) {
  const emulatorState = globalThis as typeof globalThis & {
    __skillSagaLearnerEmulatorsConnected?: boolean;
  };

  if (!emulatorState.__skillSagaLearnerEmulatorsConnected) {
    connectAuthEmulator(learnerAuth, "http://127.0.0.1:9099", {
      disableWarnings: true,
    });
    connectFunctionsEmulator(learnerFunctions, "127.0.0.1", 5001);
    emulatorState.__skillSagaLearnerEmulatorsConnected = true;
  }
}
