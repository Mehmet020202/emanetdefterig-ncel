import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, sendPasswordResetEmail, updateProfile, setPersistence, browserLocalPersistence, browserSessionPersistence } from "firebase/auth";
import { getDatabase, ref, set, onValue } from "firebase/database";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCec-d0hAeY3zAUox3U_Yl383SoYW9Quyk",
  authDomain: "emanetdefterpwa.firebaseapp.com",
  databaseURL: "https://emanetdefterpwa-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "emanetdefterpwa",
  storageBucket: "emanetdefterpwa.firebasestorage.app",
  messagingSenderId: "336422407195",
  appId: "1:336422407195:web:aefee9d05ef23324ddbcbe",
  measurementId: "G-WKHTE14647"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const database = getDatabase(app);
export const db = getFirestore(app);

let analytics = null;
if (typeof window !== 'undefined' && import.meta.env.PROD) {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.warn('Analytics initialization failed:', error);
  }
}
export { analytics };

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { signInWithPopup, onAuthStateChanged, sendPasswordResetEmail, updateProfile, setPersistence, browserLocalPersistence, browserSessionPersistence, ref, set, onValue };

export default app;


