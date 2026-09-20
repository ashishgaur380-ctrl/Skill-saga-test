import fs from "node:fs";

const learner = fs.readFileSync("apps/learner/app/page.tsx", "utf8");
const root = fs.readFileSync("index.html", "utf8");

const must = (label, condition) => {
  if (!condition) throw new Error("UI FREEZE REGRESSION FAIL: " + label);
};

must("learner source declares UI 2.0 frozen entry point", learner.includes("Skill Saga UI 2.0 is the single frozen learner frontend entry point"));
must("learner source contains Skill Saga 2.0 hero", learner.includes("Keep learning") && learner.includes("keep growing"));
must("root export contains Skill Saga branding", root.includes("Skill Saga") && root.includes("A smarter way to learn"));
must("root export contains new hero", root.includes("Keep learning") && root.includes("keep growing"));
must("root export does not contain known legacy shell markers", !root.includes("Legacy Skill Saga") && !root.includes("Old Skill Saga"));
must("root export contains new bottom navigation", root.includes("Home") && root.includes("Learn") && root.includes("Play") && root.includes("Compete") && root.includes("Profile"));

console.log("Skill Saga 2.0 UI freeze regression: PASS");
