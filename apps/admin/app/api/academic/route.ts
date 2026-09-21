import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const allowedActions = new Set([
  "listAcademic",
  "createAcademic",
  "updateAcademic",
  "archiveAcademic",
  "deleteAcademic",
  "bulkImportAcademic",
  "normalizeSubjectMappings",
  "repairLegacyClassMappings",
]);

const projectId = process.env.GCLOUD_PROJECT ?? "skill-saga-2";
const region = process.env.FIREBASE_FUNCTIONS_REGION ?? "us-central1";
const useEmulators = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true" || process.env.NODE_ENV !== "production";
const base = useEmulators
  ? `http://127.0.0.1:5001/${projectId}/${region}`
  : (process.env.FIREBASE_FUNCTIONS_BASE_URL ?? `https://${region}-${projectId}.cloudfunctions.net`);

export async function POST(request: NextRequest) {
  const authorization = request.headers.get("authorization");

  if (!authorization) {
    return NextResponse.json(
      { error: { message: "Authentication is required." } },
      { status: 401 }
    );
  }

  let body: { action?: unknown; data?: unknown };
  try {
    body = (await request.json()) as { action?: unknown; data?: unknown };
  } catch {
    return NextResponse.json(
      { error: { message: "Invalid request body." } },
      { status: 400 }
    );
  }

  const action = typeof body.action === "string" ? body.action : "";
  if (!allowedActions.has(action)) {
    return NextResponse.json(
      { error: { message: "Unsupported academic action." } },
      { status: 400 }
    );
  }

  const functionUrl = `${base}/${action}`;

  try {
    const response = await fetch(functionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authorization,
      },
      body: JSON.stringify({ data: body.data }),
      cache: "no-store",
    });

    const text = await response.text();
    let payload: unknown;
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { error: { message: text || "Emulator returned an invalid response." } };
    }

    if (!response.ok) {
      return NextResponse.json(payload, { status: response.status });
    }

    // Firebase callable responses are normally { data: ... }. The emulator
    // can expose the callable result in a slightly different envelope, so
    // normalize it here before returning it to the browser client.
    if (payload && typeof payload === "object") {
      const envelope = payload as { data?: unknown; result?: unknown };
      let value =
        envelope.result !== undefined
          ? envelope.result
          : envelope.data !== undefined
            ? envelope.data
            : payload;

      // Some emulator/runtime combinations add an extra callable envelope.
      if (
        value &&
        typeof value === "object" &&
        "data" in value &&
        Object.keys(value).length === 1
      ) {
        value = JSON.parse(JSON.stringify((value as { data: unknown }).data));
      }

      return NextResponse.json({ data: value }, { status: response.status });
    }

    return NextResponse.json({ data: payload }, { status: response.status });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to reach Firebase Functions.";
    return NextResponse.json(
      { error: { message: `Academic Functions unavailable: ${message}` } },
      { status: 502 }
    );
  }
}
