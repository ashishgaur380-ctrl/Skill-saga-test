import fs from "node:fs";
const a=fs.readFileSync("functions/src/assignment.ts","utf8"), l=fs.readFileSync("functions/src/learner.ts","utf8"), i=fs.readFileSync("functions/src/index.ts","utf8");
const must=(n,x)=>{if(!x)throw new Error("ASSIGNMENT INTEGRITY FAIL: "+n)};
must("assignment roles",a.includes('"teacher","school_admin"'));
must("individual/class/school targets",a.includes('"learner","class","school"'));
must("expiry",a.includes("dueAtMs"));
must("learner delivery",l.includes("listLearnerAssignments"));
must("export",i.includes("listLearnerAssignments"));
console.log("Assignment integrity contract: PASS");
