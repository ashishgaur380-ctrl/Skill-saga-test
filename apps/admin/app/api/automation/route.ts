import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const allowed = new Set([
  "listAutomationRules",
  "createAutomationRule",
  "updateAutomationRule",
  "setAutomationEnabled",
]);

// Automation Manager uses the same explicit production routing pattern as
// Competition Manager. Keep the Firebase target fixed for production.
const projectId = "skill-saga-2";
const region = "us-central1";

const useEmulators =
  process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true" &&
  process.env.NEXT_PUBLIC_ALLOW_LOCAL_EMULATORS === "true";

const base = useEmulators
  ? `http://127.0.0.1:5001/${projectId}/${region}`
  : `https://${region}-${projectId}.cloudfunctions.net`;

export async function POST(req: NextRequest) {
  const authorization = req.headers.get("authorization");
  if (!authorization) {
    return NextResponse.json(
      { error: { message: "Authentication is required." } },
      { status: 401 }
    );
  }

  let body: { action?: unknown; data?: unknown };
  try {
    body = (await req.json()) as { action?: unknown; data?: unknown };
  } catch {
    return NextResponse.json(
      { error: { message: "Invalid request body." } },
      { status: 400 }
    );
  }

  const action = typeof body.action === "string" ? body.action : "";
  if (!allowed.has(action)) {
    return NextResponse.json(
      { error: { message: "Unsupported automation action." } },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(`${base}/${action}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authorization,
      },
      body: JSON.stringify({ data: body.data }),
      cache: "no-store",
    });

    const responseText = await response.text();

    let payload: any;
    try {
      payload = JSON.parse(responseText);
    } catch {
      payload = {
        error: {
          message:
            responseText || "Firebase Function returned an invalid response.",
        },
      };
    }

    if (!response.ok) {
      return NextResponse.json(payload, { status: response.status });
    }

    const value = payload?.data ?? payload?.result ?? payload;
    return NextResponse.json({ data: value }, { status: response.status });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to reach Automation Functions.";

    return NextResponse.json(
      { error: { message: `Automation Functions unavailable: ${message}` } },
      { status: 502 }
    );
  }
}
