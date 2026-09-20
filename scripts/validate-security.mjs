import fs from "node:fs";
import assert from "node:assert/strict";

const read=(p)=>fs.readFileSync(p,"utf8");
const learner=read("functions/src/learner.ts");
const competition=read("functions/src/competition.ts");
const rules=read("security/firestore.rules");

assert.match(learner,/const uid = request\.auth\?\.uid/);
assert.match(learner,/role !== "learner"/);
assert.match(learner,/submitQuizAttempt/);
assert.match(learner,/quizIsLive\(quizSnap\.data\(\)\)/);
assert.match(learner,/Number\(d\.correctOption\)/);
assert.match(learner,/xpEarned = correct \* 10/);
assert.match(learner,/coinsEarned = correct \* 2/);
assert.match(learner,/submissionId/);
assert.match(learner,/attemptRef\.create/);

// Client-supplied score/reward fields must not be trusted by the server.
assert.doesNotMatch(learner,/payload\?\.(?:score|percentage|xpEarned|coinsEarned)\b/);
assert.doesNotMatch(learner,/data\.score\b/);

// Competition delivery/submission paths must enforce the configured live window.
assert.match(learner,/competitionIsLive/);
assert.match(learner,/start > now/);
assert.match(learner,/end <= now/);
assert.match(competition,/endAtMs\s*<=\s*startAtMs/);

// Firestore client writes are denied by default; authoritative mutations go through Functions/Admin SDK.
assert.match(rules,/match \/\{document=\*\*\} \{ allow read, write: if false; \}/);
assert.doesNotMatch(rules,/match \/quizAttempts\/\{[^}]+\}[^\n]*allow (?:create|write): if signedIn\(\)/);

console.log("Skill Saga security/abuse validation passed.");
