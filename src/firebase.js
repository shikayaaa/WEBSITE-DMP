// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration
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
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Initialize Analytics (only in browser environment)
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

// Enable auth persistence (keeps user logged in)
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Error setting auth persistence:", error);
});

// Enable offline persistence for Firestore (optional but recommended)
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    // Multiple tabs open, persistence can only be enabled in one tab at a time.
    console.warn('Firestore persistence failed: Multiple tabs open');
  } else if (err.code === 'unimplemented') {
    // The current browser doesn't support persistence.
    console.warn('Firestore persistence not supported by browser');
  }
});

// Helper function to check if user is authenticated
export const isAuthenticated = () => {
  return auth.currentUser !== null;
};

// Helper function to get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Helper function to check user role (staff or admin)
export const getUserRole = async () => {
  const user = auth.currentUser;
  if (!user) return null;
  
  try {
    const userDoc = await db.collection('users').doc(user.uid).get();
    return userDoc.exists ? userDoc.data().role : null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};

// Export initialized services
export { auth, db, storage, analytics };
export default app;