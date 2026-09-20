import { NextRequest, NextResponse } from "next/server";

const allowed = new Set([
  "createLearnerLinkCode",
  "linkLearner",
  "listLinkedLearners",
  "getLinkedLearnerProgress",
]);

const projectId = process.env.GCLOUD_PROJECT ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "skill-saga-2";
const region = process.env.FIREBASE_FUNCTIONS_REGION ?? "us-central1";
const useEmulators = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true";
const baseUrl = useEmulators
  ? `http://127.0.0.1:5001/${projectId}/${region}`
  : (process.env.FIREBASE_FUNCTIONS_BASE_URL || `https://${region}-${projectId}.cloudfunctions.net`);

export async function POST(req: NextRequest) {
  const authorization = req.headers.get("authorization");
  if (!authorization) return NextResponse.json({ error: { message: "Authentication is required." } }, { status: 401 });

  try {
    const body = await req.json();
    if (!allowed.has(body.action)) {
      return NextResponse.json({ error: { message: "Unsupported action." } }, { status: 400 });
    }

    const response = await fetch(`${baseUrl}/${body.action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: authorization },
      body: JSON.stringify({ data: body.data ?? {} }),
      cache: "no-store",
    });
    const payload = await response.json();
    return NextResponse.json(payload, { status: response.status });
  } catch (e) {
    return NextResponse.json({
      error: { message: e instanceof Error ? e.message : "Unable to reach Functions." },
    }, { status: 502 });
  }
}
