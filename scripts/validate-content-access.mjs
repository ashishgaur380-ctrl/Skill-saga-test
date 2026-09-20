import fs from "node:fs";
const learner=fs.readFileSync("functions/src/learner.ts","utf8");
const contentApi=fs.readFileSync("functions/src/content.ts","utf8");
const must=(n,x)=>{if(!x)throw new Error("CONTENT ACCESS INTEGRITY FAIL: "+n)};
must("premium entitlement gate",learner.includes("premiumUntilMs")&&learner.includes('x.accessType==="premium" && premiumActive'));
must("assigned content gate",learner.includes("assignedMaterialIds")&&learner.includes('x.accessType==="assigned" && assignedIds.has(x.id)'));
must("free content available",learner.includes('x.accessType==="free"'));
must("content manager supports access types",contentApi.includes('allowedAccess=new Set(["free","premium","assigned"])'));
console.log("Content access integrity contract: PASS");
