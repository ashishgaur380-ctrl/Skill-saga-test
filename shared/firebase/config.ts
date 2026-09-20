export interface FirebaseClientConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export function getFirebaseConfig(): FirebaseClientConfig {
  const demo = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
  const env = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
  if (demo) {
    return {
      apiKey: env.apiKey || "demo-api-key",
      authDomain: env.authDomain || "skill-saga-2.firebaseapp.com",
      projectId: env.projectId || "skill-saga-2",
      storageBucket: env.storageBucket || "skill-saga-2.firebasestorage.app",
      messagingSenderId: env.messagingSenderId || "000000000000",
      appId: env.appId || "demo-app-id",
    };
  }
  if (Object.values(env).some((value) => !value)) throw new Error("Firebase client configuration is incomplete.");
  return env as FirebaseClientConfig;
}
