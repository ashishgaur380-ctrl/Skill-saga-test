import fs from "node:fs";
import assert from "node:assert/strict";

const read=(p)=>fs.readFileSync(p,"utf8");
const quiz=read("functions/src/quiz.ts");
const competition=read("functions/src/competition.ts");
const learner=read("functions/src/learner.ts");
const automation=read("functions/src/automation.ts");

assert.match(quiz,/publishAtMs/);
assert.match(quiz,/expireAtMs/);
assert.match(quiz,/expireAtMs\s*<=\s*publishAtMs/);
assert.match(competition,/startAtMs/);
assert.match(competition,/endAtMs/);
assert.match(competition,/endAtMs\s*<=\s*startAtMs/);
assert.match(learner,/function quizIsLive/);
assert.match(learner,/publishAt > now/);
assert.match(learner,/expireAt <= now/);
assert.match(learner,/!quizIsLive\(quizSnap\.data\(\)\)/);
assert.match(learner,/function competitionIsLive/);
assert.match(automation,/targetQuizId/);
assert.match(automation,/automationLocks/);
assert.match(automation,/automationRuns/);

const now=Date.now();
const live=(publish,expire)=>publish<=now && expire>now;
assert.equal(live(now-1000,now+1000),true);
assert.equal(live(now+1000,now+2000),false);
assert.equal(live(now-2000,now-1000),false);

console.log("Skill Saga scheduling validation passed.");
