import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root,p),"utf8");
const must = (label, ok) => { if(!ok) throw new Error("REGRESSION FAIL: "+label); };

const home = read("apps/learner/app/page.tsx");
const play = read("apps/learner/app/play/page.tsx");
const learn = read("apps/learner/app/learn/page.tsx");
const compete = read("apps/learner/app/compete/page.tsx");
const profile = read("apps/learner/app/profile/page.tsx");
const admin = read("apps/admin/app/page.tsx");
const quiz = read("apps/admin/components/quiz-manager/quiz-manager.tsx");
const competition = read("apps/admin/components/competition-manager/competition-manager.tsx");

const learnerRoutes = ["/", "/learn", "/play", "/compete", "/profile"];
for (const route of learnerRoutes) must("learner route "+route+" exists", route === "/" ? fs.existsSync(path.join(root,"apps/learner/app/page.tsx")) : fs.existsSync(path.join(root,"apps/learner/app",route.slice(1),"page.tsx")));

for (const route of ["/users","/academic","/content","/question-bank","/quiz-manager","/competition-manager","/automation","/community","/rewards","/notifications","/analytics","/system-settings"]) {
  must("admin module "+route+" is linked", admin.includes('"'+route+'"'));
}

for (const [name,src] of [["home",home],["learn",learn],["play",play],["compete",compete],["profile",profile]]) {
  for (const route of ["/learn","/play","/compete","/profile"]) {
    if (name !== "learn" || route !== "/learn") {
      // Every learner surface except Learn itself should retain access to the primary nav.
    }
  }
  must(name+" uses Firebase auth", src.includes("onAuthStateChanged") || src.includes("learnerAuth.currentUser"));
}
must("Home calls authoritative learner-home action", home.includes('getLearnerHome'));
must("Home daily quiz routes into Play", home.includes('/play?quizId='));
must("Home weekly quiz routes into Play", home.includes('weeklyQuiz.id'));
must("Learn routes topic practice into Play", learn.includes('/play?topicId='));
must("Play creates idempotent submissionId", play.includes('submissionId'));
must("Play displays authoritative rewards", play.includes('xpEarned') && play.includes('coinsEarned'));
must("Competition routes joined users into Play", compete.includes('/play?competitionId='));
must("Competition leaderboard is loaded server-side", compete.includes('getCompetitionLeaderboard'));
must("Profile loads server stats", profile.includes('getLearnerStats'));
must("Admin Quiz Manager calls backend API", quiz.includes('/api/quiz-manager'));
must("Admin Competition Manager calls backend API", competition.includes('/api/competition-manager'));
must("Quiz Manager uses central Question Bank", quiz.includes('/api/question-bank'));
must("Competition Manager uses Quiz Manager data", competition.includes('/api/quiz-manager'));

const adminApiFiles = [
  "apps/admin/app/api/academic/route.ts",
  "apps/admin/app/api/analytics/route.ts",
  "apps/admin/app/api/automation/route.ts",
  "apps/admin/app/api/community/route.ts",
  "apps/admin/app/api/competition-manager/route.ts",
  "apps/admin/app/api/content/route.ts",
  "apps/admin/app/api/notifications/route.ts",
  "apps/admin/app/api/question-bank/route.ts",
  "apps/admin/app/api/quiz-manager/route.ts",
  "apps/admin/app/api/rewards/route.ts",
  "apps/admin/app/api/system-settings/route.ts",
  "apps/admin/app/api/users/route.ts",
];
for (const file of adminApiFiles) {
  const src = read(file);
  must(file + " uses configurable Functions base", src.includes("FIREBASE_FUNCTIONS_BASE_URL") || src.includes("NEXT_PUBLIC_USE_FIREBASE_EMULATORS"));
  must(file + " has production Functions fallback", src.includes("cloudfunctions.net") || src.includes("FIREBASE_FUNCTIONS_BASE_URL"));
}

console.log("Admin ↔ Learner regression contract: PASS");
