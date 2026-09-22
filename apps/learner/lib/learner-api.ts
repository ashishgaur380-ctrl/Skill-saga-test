import { httpsCallable, httpsCallableFromURL } from "firebase/functions";
import { learnerFunctions } from "./firebase";

function emulatorFunctionUrl(action: string): string | null {
  if (typeof window === "undefined") return null;

  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1") return null;

  // GitHub Codespaces: keep callable traffic same-origin so the browser does
  // not need CORS access to the forwarded Functions emulator port.
  if (host.endsWith(".app.github.dev")) {
    return `${window.location.origin}/__skill_saga_functions/skill-saga-2/us-central1/${action}`;
  }

  return null;
}

export async function learnerFunction(
  action: string,
  data: unknown,
  _token?: string
): Promise<any> {
  try {
    const useEmulators =
      process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true" &&
      process.env.NEXT_PUBLIC_ALLOW_LOCAL_EMULATORS === "true";
    const forwardedUrl = useEmulators ? emulatorFunctionUrl(action) : null;
    const callable = forwardedUrl
      ? httpsCallableFromURL<any, any>(learnerFunctions, forwardedUrl)
      : httpsCallable<any, any>(learnerFunctions, action);
    const result = await callable(data);
    return result.data;
  } catch (error: any) {
    const code = String(error?.code || "");
    const message = String(error?.message || "Learner request failed.");
    if (code.includes("unauthenticated")) throw new Error("Please sign in again.");
    if (code.includes("permission-denied")) throw new Error("You do not have permission for this action.");
    if (code.includes("not-found")) throw new Error("This Skill Saga service is not deployed yet.");
    if (code.includes("internal")) {
      throw new Error(`Skill Saga backend error (INTERNAL). Check the Functions emulator log for ${action}.`);
    }
    throw new Error(message.replace(/^FirebaseError:\s*/i, ""));
  }
}
