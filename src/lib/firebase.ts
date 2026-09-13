import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

export const firebaseConfig = {
  apiKey: "AIzaSyCEpDsEiJ76SI3oT-5DCtSTdYYJocYD1eU",
  authDomain: "rongila-rup.firebaseapp.com",
  projectId: "rongila-rup",
  storageBucket: "rongila-rup.firebasestorage.app",
  messagingSenderId: "760283785904",
  appId: "1:760283785904:web:b73048d3c70f5811ffe975",
  measurementId: "G-D302W4P24J"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
