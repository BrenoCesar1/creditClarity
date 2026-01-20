import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getFirebaseConfig } from './config';

function initializeFirebase() {
  const apps = getApps();
  let app: FirebaseApp;

  if (apps.length > 0) {
    app = getApp();
  } else {
    const firebaseConfig = getFirebaseConfig();
    app = initializeApp(firebaseConfig);
  }

  const auth: Auth = getAuth(app);
  const firestore: Firestore = getFirestore(app);

  return { app, auth, firestore };
}

export {
  initializeFirebase,
};

export * from './provider';
