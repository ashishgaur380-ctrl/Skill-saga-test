import { getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getFirebaseConfig } from '../../../shared/firebase/config';

const app = getApps().length ? getApps()[0] : initializeApp(getFirebaseConfig());

export const firebaseApp = app;
export const firebaseAuth = getAuth(app);
export const firestore = getFirestore(app);
export const firebaseFunctions = getFunctions(app);
