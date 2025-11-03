// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth"; // ✅ add this
import { getFirestore } from "firebase/firestore"; // ✅ optional (for database)

// Your web app's Firebase configuration
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
export const analytics = getAnalytics(app);
export const auth = getAuth(app); // ✅ export this so App.tsx can use it
export const db = getFirestore(app); // ✅ optional, for Firestore database

export default app;
