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
  process.env.NODE_ENV === "development";

if (useFirebaseEmulators) {
  const emulatorState = globalThis as typeof globalThis & {
    __skillSagaLearnerEmulatorsConnected?: boolean;
  };

  if (!emulatorState.__skillSagaLearnerEmulatorsConnected) {
    let authUrl = "http://127.0.0.1:9099";

    if (typeof window !== "undefined") {
      const host = window.location.hostname;
      const match = host.match(/^(.*)-\d+(\.[^.]+(?:\.[^.]+)*)$/);
      if (match && host !== "localhost" && host !== "127.0.0.1") {
        authUrl = `https://${match[1]}-9099${match[2]}`;
      }
    }

    connectAuthEmulator(learnerAuth, authUrl, {
      disableWarnings: true,
    });
    connectFunctionsEmulator(learnerFunctions, "127.0.0.1", 5001);
    emulatorState.__skillSagaLearnerEmulatorsConnected = true;
  }
}
