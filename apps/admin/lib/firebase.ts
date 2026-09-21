import { getApps, initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';
import { getFirebaseConfig } from '../../../shared/firebase/config';

const app = getApps().length ? getApps()[0] : initializeApp(getFirebaseConfig());

export const firebaseApp = app;
export const firebaseAuth = getAuth(app);
export const firestore = getFirestore(app);
export const firebaseStorage = getStorage(app);
export const firebaseFunctions = getFunctions(app);

const useFirebaseEmulators =
  process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true';

if (useFirebaseEmulators) {
  const emulatorState = globalThis as typeof globalThis & {
    __skillSagaFirebaseEmulatorsConnected?: boolean;
  };

  if (!emulatorState.__skillSagaFirebaseEmulatorsConnected) {
    connectAuthEmulator(firebaseAuth, 'http://127.0.0.1:9099', { disableWarnings: true });
    connectFirestoreEmulator(firestore, '127.0.0.1', 8080);
    connectFunctionsEmulator(firebaseFunctions, '127.0.0.1', 5001);
    emulatorState.__skillSagaFirebaseEmulatorsConnected = true;
  }
}
