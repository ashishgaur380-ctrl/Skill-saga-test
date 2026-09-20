import { getFirebaseConfig } from "../../../shared/firebase/config";

export async function learnerFunction(action: string, data: unknown, token: string) {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "skill-saga-2";
  const region = process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_REGION ?? "us-central1";
  const base = process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_BASE_URL ?? `https://${region}-${projectId}.cloudfunctions.net`;
  const response = await fetch(`${base}/${action}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ data }),
  });
  const text = await response.text();
  let payload: any;
  try { payload = JSON.parse(text); } catch { payload = { error: { message: text || "Invalid Functions response." } }; }
  if (!response.ok) throw new Error(payload?.error?.message || "Learner request failed.");
  return payload?.data ?? payload;
}
