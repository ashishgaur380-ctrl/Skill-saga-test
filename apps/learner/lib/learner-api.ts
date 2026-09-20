import { httpsCallable } from "firebase/functions";
import { learnerFunctions } from "./firebase";

export async function learnerFunction(
  action: string,
  data: unknown,
  _token?: string
): Promise<any> {
  try {
    const callable = httpsCallable<any, any>(learnerFunctions, action);
    const result = await callable(data);
    return result.data;
  } catch (error: any) {
    const code = String(error?.code || "");
    const message = String(error?.message || "Learner request failed.");
    if (code.includes("unauthenticated")) throw new Error("Please sign in again.");
    if (code.includes("permission-denied")) throw new Error("You do not have permission for this action.");
    if (code.includes("not-found")) throw new Error("This Skill Saga service is not deployed yet.");
    throw new Error(message.replace(/^FirebaseError:\s*/i, ""));
  }
}
