import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy 
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Cloud Firestore using the configured database ID
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');

// Firestore Collections constants
export const COLLECTIONS = {
  PRODUCTS: 'products',
  ORDERS: 'orders',
  REVIEWS: 'reviews',
  SETTINGS: 'settings',
  CATEGORIES: 'categories'
} as const;

export default app;
