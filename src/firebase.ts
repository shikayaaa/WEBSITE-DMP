// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAtSkLMC5eWa5WUjzWyu56RWuPeeBlD9gg",
  authDomain: "dmpdb-8f26e.firebaseapp.com",
  projectId: "dmpdb-8f26e",
  storageBucket: "dmpdb-8f26e.firebasestorage.app",
  messagingSenderId: "120810655315",
  appId: "1:120810655315:web:50ecffb2951d652bb7c0a6",
  measurementId: "G-5HC91PXP3S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics only in browser environment
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}
export { analytics };

export default app;