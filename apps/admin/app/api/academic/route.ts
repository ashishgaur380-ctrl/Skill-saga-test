import { NextRequest, NextResponse } from "next/server";

const allowedActions = new Set([
  "listAcademic",
  "createAcademic",
  "updateAcademic",
  "archiveAcademic",
]);

const projectId = process.env.GCLOUD_PROJECT ?? "skill-saga-2";

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

  const emulatorUrl =
    `http://127.0.0.1:5001/${projectId}/us-central1/${action}`;

  try {
    const response = await fetch(emulatorUrl, {
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

    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to reach the local Functions emulator.";
    return NextResponse.json(
      { error: { message: `Academic Functions emulator unavailable: ${message}` } },
      { status: 502 }
    );
  }
}
