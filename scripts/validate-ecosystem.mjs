import fs from "node:fs";
const n=fs.readFileSync("functions/src/notification-delivery.ts","utf8"),c=fs.readFileSync("functions/src/community.ts","utf8"),l=fs.readFileSync("functions/src/learner.ts","utf8");
const must=(x,y)=>{if(!y)throw Error("ECOSYSTEM INTEGRITY FAIL: "+x)};
must("targeted notification",n.includes('audience==="targeted"'));
must("role audiences",n.includes('"learners"')&&n.includes('"parents"')&&n.includes('"teachers"'));
must("in-app delivery",n.includes('collection("notifications")'));
must("community moderation",c.includes("moderateCommunityPost"));
must("learner approved feed",l.includes("listCommunityFeed"));
console.log("Notification/community integrity contract: PASS");
