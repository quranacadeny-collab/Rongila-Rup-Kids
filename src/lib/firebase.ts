import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

export const firebaseConfig = {
  apiKey: "AIzaSyDGYfgtYQasD3GWI24_UyUizJElkOPvNuo",
  authDomain: "rongila-rup-b847a.firebaseapp.com",
  projectId: "rongila-rup-b847a",
  storageBucket: "rongila-rup-b847a.firebasestorage.app",
  messagingSenderId: "908961632616",
  appId: "1:908961632616:web:87b8d37965b18672ab46dd",
  measurementId: "G-S86ZB8PVT5"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
