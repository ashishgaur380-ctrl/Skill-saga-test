import { NextRequest, NextResponse } from "next/server";

const projectId = process.env.GCLOUD_PROJECT ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "skill-saga-2";
const region = process.env.FIREBASE_FUNCTIONS_REGION ?? "us-central1";
const emulatorBase = `http://127.0.0.1:5001/${projectId}/${region}`;
const productionBase = process.env.FIREBASE_FUNCTIONS_BASE_URL ?? `https://${region}-${projectId}.cloudfunctions.net`;
const allowedActions = new Set(["listPublishedQuizzes", "getQuizForAttempt", "submitQuizAttempt", "getLearnerStats", "listLearnerAttempts", "getLearnerHome", "getLearnerAcademic", "getTopicPractice", "submitTopicPractice", "getLearnerProgress", "listPublishedCompetitions", "joinCompetition", "getCompetitionQuiz", "submitCompetitionAttempt", "getCompetitionLeaderboard", "getLearnerRewards", "redeemReward","createLearnerLinkCode"]);

export async function POST(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  if (!authorization) return NextResponse.json({ error: { message: "Authentication is required." } }, { status: 401 });

  let body: any;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: { message: "Invalid request body." } }, { status: 400 });
  }
  const action = typeof body.action === "string" ? body.action : "";
  if (!allowedActions.has(action)) {
    return NextResponse.json({ error: { message: "Unsupported learner quiz action." } }, { status: 400 });
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true" ? emulatorBase : productionBase}/${action}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: authorization },
        body: JSON.stringify({ data: body.data ?? {} }),
        cache: "no-store",
      },
    );
    const text = await response.text();
    let payload: any;
    try { payload = JSON.parse(text); } catch {
      payload = { error: { message: text || "Invalid Functions response." } };
    }
    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: { message: error instanceof Error ? error.message : "Unable to reach Functions." } },
      { status: 502 },
    );
  }
}
