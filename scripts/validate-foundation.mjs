import fs from "node:fs";
import path from "node:path";

const required = [
  "firebase.json",
  "security/firestore.rules",
  "functions/src/index.ts",
  "functions/src/learner.ts",
  "functions/src/automation.ts",
  "apps/learner/app/page.tsx",
  "apps/admin/app/page.tsx",
];

const failures = [];
for (const file of required) {
  if (!fs.existsSync(path.resolve(file))) failures.push(`Missing required file: ${file}`);
}

const learner = fs.readFileSync("functions/src/learner.ts", "utf8");
const rules = fs.readFileSync("security/firestore.rules", "utf8");
const automation = fs.readFileSync("functions/src/automation.ts", "utf8");

if (!learner.includes("correctOption")) failures.push("Learner scoring does not validate correctOption.");
if (!learner.includes("submissionId")) failures.push("Quiz submission idempotency is missing.");
if (!learner.includes("xpEarned")) failures.push("Authoritative XP calculation is missing.");
if (!learner.includes("coinsEarned")) failures.push("Authoritative coin calculation is missing.");
if (!rules.includes("allow read, write: if false;")) failures.push("Default-deny Firestore rule is missing.");
if (!automation.includes("automationRuns")) failures.push("Automation run logging is missing.");
if (!automation.includes("automationLocks")) failures.push("Automation idempotency lock is missing.");

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Skill Saga foundation validation passed.");
