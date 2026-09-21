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

function codespacesProxyUrl(path: string): string | null {
  if (typeof window === "undefined") return null;
  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1") return null;

  // In GitHub Codespaces, the browser cannot reliably call the forwarded
  // Auth emulator directly. The dev proxy keeps emulator traffic same-origin.
  if (host.endsWith(".app.github.dev")) {
    return `${window.location.origin}${path}`;
  }
  return null;
}

if (useFirebaseEmulators) {
  const emulatorState = globalThis as typeof globalThis & {
    __skillSagaLearnerEmulatorsConnected?: boolean;
  };

  if (!emulatorState.__skillSagaLearnerEmulatorsConnected) {
    const authUrl =
      (typeof window !== "undefined" && window.location.hostname.endsWith(".app.github.dev")
        ? window.location.origin
        : null) ??
      "http://127.0.0.1:9099";

    connectAuthEmulator(learnerAuth, authUrl, {
      disableWarnings: true,
    });

    // localhost uses the normal Firebase emulator connection. In Codespaces,
    // learner-api.ts sends callable requests through the same-origin proxy.
    if (typeof window === "undefined" || !codespacesProxyUrl("/__skill_saga_auth")) {
      connectFunctionsEmulator(learnerFunctions, "127.0.0.1", 5001);
    }

    emulatorState.__skillSagaLearnerEmulatorsConnected = true;
  }
}
