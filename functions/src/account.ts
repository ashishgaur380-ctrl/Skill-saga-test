import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { onCall, HttpsError } from "firebase-functions/v2/https";

export const requestAccountDeletion = onCall(async request => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Authentication required.");
  const db = getFirestore();
  const userRef = db.collection("users").doc(uid);
  const snap = await userRef.get();
  if (!snap.exists) throw new HttpsError("not-found", "Account profile not found.");
  const batch = db.batch();
  batch.update(userRef, { accountStatus: "deletion_requested", deletionRequestedAt: FieldValue.serverTimestamp() });
  const links = await db.collection("learnerLinks").where("learnerId", "==", uid).limit(100).get();
  links.docs.forEach(d => batch.update(d.ref, { status: "revoked", revokedAt: FieldValue.serverTimestamp() }));
  const guardianLinks = await db.collection("learnerLinks").where("guardianId", "==", uid).limit(100).get();
  guardianLinks.docs.forEach(d => batch.update(d.ref, { status: "revoked", revokedAt: FieldValue.serverTimestamp() }));
  await batch.commit();
  await getAuth().updateUser(uid, { disabled: true });
  return { success: true, status: "deletion_requested" };
});
