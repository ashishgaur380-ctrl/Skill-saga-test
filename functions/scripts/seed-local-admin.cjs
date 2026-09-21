const admin = require("firebase-admin");

const email = process.env.LOCAL_ADMIN_EMAIL;
const password = process.env.LOCAL_ADMIN_PASSWORD;
const role = process.env.LOCAL_ADMIN_ROLE || "super_admin";

if (!email || !password) {
  console.error("Set LOCAL_ADMIN_EMAIL and LOCAL_ADMIN_PASSWORD before running this script.");
  process.exit(1);
}

if (!process.env.FIREBASE_AUTH_EMULATOR_HOST || !process.env.FIRESTORE_EMULATOR_HOST) {
  console.error("Run with FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099 and FIRESTORE_EMULATOR_HOST=127.0.0.1:8080.");
  process.exit(1);
}

admin.initializeApp({ projectId: "skill-saga-2" });

async function main() {
  const auth = admin.auth();
  const db = admin.firestore();

  let user;
  try {
    user = await auth.getUserByEmail(email);
    user = await auth.updateUser(user.uid, { password, disabled: false });
  } catch (error) {
    if (error.code !== "auth/user-not-found") throw error;
    user = await auth.createUser({ email, password, emailVerified: true, disabled: false });
  }

  await auth.setCustomUserClaims(user.uid, { role });

  await db.collection("users").doc(user.uid).set(
    {
      email,
      role,
      displayName: "Skill Saga Local Admin",
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  console.log("Local admin ready:", email, "role:", role);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
